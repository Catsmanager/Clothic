import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { compileFunction } from 'node:vm'
import { createClient } from '@supabase/supabase-js'
import ts from 'typescript'
import { ITEMS } from '../constants/items.ts'
import { fetchOwnedItemsFromApi } from '../lib/itemsApi.ts'

// 실제 서비스 검증에는 이 runId에 속한 임시 계정만 사용한다.
// Never pass production users here: the script clears and seeds each verified test user's items.
const options = new Map()
for (let index = 2; index < process.argv.length; index += 2) {
  options.set(process.argv[index], process.argv[index + 1])
}
assert.equal(options.get('--allow-test-writes'), 'true', 'Explicit test-write opt-in is required')
assert.ok(options.get('--credentials'), 'A private test-credential file is required')
const config = JSON.parse(readFileSync(options.get('--credentials'), 'utf8'))
assert.match(config.runId, /^f05-[a-f0-9]{12}$/)
assert.equal(config.users.length, 2)
assert.notEqual(config.users[0].id, config.users[1].id)
const baseUrl = new URL(options.get('--api-url') ?? 'http://127.0.0.1:18080').origin
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseUrl).hostname))

const originalFetch = globalThis.fetch
const originalApiUrl = process.env.EXPO_PUBLIC_CLOTHIC_API_URL
const clients = []
const servers = []
const passed = []
const pass = (name) => {
  passed.push(name)
  process.stdout.write(`PASS ${name}\n`)
}

// Execute actual stores; replace only native platform integrations and use a real Auth/Data API client.
function loadStore(path, replacements) {
  const url = new URL(path, import.meta.url)
  const require = createRequire(url)
  const code = ts.transpileModule(readFileSync(url, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const module = { exports: {} }
  compileFunction(code, ['require', 'module', 'exports'], { filename: url.pathname })(
    (name) => (Object.hasOwn(replacements, name) ? replacements[name] : require(name)),
    module,
    module.exports
  )
  return module.exports
}

function createStores(client) {
  let directCalls = 0
  const supabase = new Proxy(client, {
    get(target, key) {
      if (key === 'from') {
        return (...args) => {
          directCalls += 1
          return target.from(...args)
        }
      }
      return Reflect.get(target, key)
    },
  })
  const items = loadStore('../stores/itemStore.ts', { '../lib/supabase': { supabase } })
  const emptyStore = { getState: () => ({ reset() {} }) }
  const auth = loadStore('../stores/authStore.ts', {
    '../lib/supabase': { supabase },
    'react-native': { Platform: { OS: 'web' } },
    'expo-web-browser': {},
    'expo-linking': {},
    'expo-apple-authentication': {},
    'expo-crypto': {},
    '../lib/onboarding': { isOnboardingDone: async () => true },
    './itemStore': { useItemStore: items.useItemStore },
    './outfitStore': { useOutfitStore: emptyStore },
    './notificationStore': { useNotificationStore: emptyStore },
    './notificationPrefsStore': { useNotificationPrefsStore: emptyStore },
  })
  return { ...items, ...auth, directCalls: () => directCalls }
}

async function signIn(client, user) {
  const { data, error } = await client.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  })
  assert.equal(error, null, error?.message)
  assert.equal(data.user.id, user.id)
  assert.equal(data.user.user_metadata.clothicVerificationRun, config.runId)
  const header = JSON.parse(Buffer.from(data.session.access_token.split('.')[0], 'base64url'))
  assert.equal(header.alg, 'ES256')
  return data.session
}

function canonical(items) {
  return items
    .map((item) => {
      // Preserve sub-millisecond precision while accepting UTC offset spelling differences.
      const match = item.createdAt.match(/^(.*T\d{2}:\d{2}:\d{2})(?:\.(\d+))?(?:Z|\+00:00)$/)
      assert.ok(match, 'Unexpected timestamp format')
      return { ...item, createdAt: `${match[1]}.${(match[2] ?? '').padEnd(9, '0')}Z` }
    })
    .sort((left, right) => left.id.localeCompare(right.id))
}

async function fetchItems(stores, expectedCount) {
  await stores.useItemStore.getState().fetchItems()
  const state = stores.useItemStore.getState()
  assert.equal(state.error, null, state.error)
  assert.equal(state.loading, false)
  assert.equal(state.loaded, true)
  assert.equal(state.items.length, expectedCount)
  return state.items
}

function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

async function holdNextResponse(action, whilePending) {
  const received = deferred()
  const release = deferred()
  let hold = true
  globalThis.fetch = async (...args) => {
    const response = await originalFetch(...args)
    if (hold && String(args[0]) === `${baseUrl}/api/items`) {
      hold = false
      received.resolve()
      await release.promise
    }
    return response
  }
  const pending = action()
  try {
    // If an earlier step rejects, fail instead of waiting indefinitely for a request that never began.
    await Promise.race([
      received.promise,
      pending.then(() => assert.fail('No API response to delay')),
    ])
    await whilePending()
  } finally {
    release.resolve()
    await pending
    globalThis.fetch = originalFetch
  }
}

async function startErrorServer() {
  const server = createServer((_request, response) => {
    response.writeHead(500, { 'content-type': 'application/json' })
    response.end('{"error":"injected verification failure"}')
  })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  servers.push(server)
  return `http://127.0.0.1:${server.address().port}`
}

async function main() {
  const health = await originalFetch(`${baseUrl}/api/health`)
  assert.equal(health.status, 200)
  assert.equal((await health.json()).status, 'ok')
  assert.equal((await originalFetch(`${baseUrl}/api/items`)).status, 401)
  pass('backend-health-and-unauthenticated-rejection')

  const origin = options.get('--web-origin') ?? 'http://localhost:8081'
  const preflight = await originalFetch(`${baseUrl}/api/items`, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'authorization',
    },
  })
  assert.equal(preflight.status, 200)
  assert.equal(preflight.headers.get('access-control-allow-origin'), origin)
  const untrusted = await originalFetch(`${baseUrl}/api/items`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://untrusted.example',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'authorization',
    },
  })
  assert.equal(untrusted.status, 403)
  pass('configured-browser-origin-preflight-and-untrusted-origin-rejection')

  const stores = []
  const sessions = []
  for (const user of config.users) {
    assert.equal(
      user.email,
      `clothic-${config.runId}-${stores.length === 0 ? 'a' : 'b'}@example.invalid`
    )
    const client = createClient(config.projectUrl, config.anonKey, {
      global: { fetch: originalFetch },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
    clients.push(client)
    const session = await signIn(client, user)
    sessions.push(session)
    const me = await originalFetch(`${baseUrl}/api/me`, {
      headers: { Authorization: `Bearer ${session.access_token}`, Origin: origin },
    })
    assert.equal(me.status, 200)
    assert.equal(me.headers.get('access-control-allow-origin'), origin)
    assert.equal((await me.json()).userId, user.id)
    const { error } = await client.from('items').delete().eq('user_id', user.id)
    assert.equal(error, null, error?.message)
    const scopedStores = createStores(client)
    await scopedStores.useAuthStore.getState().initialize()
    stores.push(scopedStores)
    process.env.EXPO_PUBLIC_CLOTHIC_API_URL = baseUrl
    await fetchItems(scopedStores, 0)
  }
  pass('real-es256-tokens-and-empty-lists-for-two-disposable-users')

  const top = ITEMS.find((item) => item.id === 'top_001')
  const shoes = ITEMS.find((item) => item.category === 'shoes' && item.imagePath)
  assert.ok(top && shoes)
  for (const [index, catalogItems] of [[top, shoes], [top]].entries()) {
    for (const catalogItem of catalogItems) {
      const result = await stores[index].useItemStore.getState().addCatalogItem(catalogItem)
      assert.equal(result.error, null, result.error)
      assert.equal(result.item.userId, config.users[index].id)
    }
  }
  pass('existing-app-write-path-seeds-owned-items-with-real-user-tokens')

  for (const [index, scopedStores] of stores.entries()) {
    delete process.env.EXPO_PUBLIC_CLOTHIC_API_URL
    const legacyItems = canonical(await fetchItems(scopedStores, index === 0 ? 2 : 1))
    scopedStores.useItemStore.getState().reset()
    process.env.EXPO_PUBLIC_CLOTHIC_API_URL = baseUrl
    const apiItems = await fetchItems(scopedStores, index === 0 ? 2 : 1)
    assert.deepEqual(canonical(apiItems), legacyItems)
    assert.ok(apiItems.every((item) => item.userId === config.users[index].id))
    assert.equal(scopedStores.buildOwnedCatalogItems(apiItems).length, apiItems.length)
    const resolvable = scopedStores.buildResolvableCatalogItems(apiItems)
    assert.ok(resolvable.some((item) => item.id === top.id))
    assert.ok(resolvable.some((item) => item.id === apiItems[0].id))
  }
  pass('legacy-and-spring-queries-match-for-both-users-with-catalog-compatibility')

  const denied = await originalFetch(`${baseUrl}/api/items?userId=${config.users[1].id}`, {
    headers: { Authorization: `Bearer ${sessions[0].access_token}` },
  })
  assert.equal(denied.status, 400)
  const [header, payload, signature] = sessions[0].access_token.split('.')
  const forgedPayload = {
    ...JSON.parse(Buffer.from(payload, 'base64url')),
    sub: config.users[1].id,
  }
  const forged = `${header}.${Buffer.from(JSON.stringify(forgedPayload)).toString('base64url')}.${signature}`
  const unauthorized = await fetchOwnedItemsFromApi({ baseUrl, accessToken: forged })
  assert.match(unauthorized.error, /로그인/)
  pass('query-user-override-and-tampered-real-token-are-rejected')

  const shared = stores[0]
  await holdNextResponse(
    () => shared.useItemStore.getState().fetchItems(),
    async () => {
      await signIn(clients[0], config.users[1])
      assert.deepEqual(shared.useItemStore.getState().items, [])
      await fetchItems(shared, 1)
    }
  )
  assert.ok(
    shared.useItemStore.getState().items.every((item) => item.userId === config.users[1].id)
  )
  pass('real-account-change-discards-delayed-previous-user-response')

  await holdNextResponse(
    () => shared.useItemStore.getState().fetchItems(),
    async () => {
      const result = await shared.useAuthStore.getState().signOut()
      assert.equal(result.error, null, result.error)
    }
  )
  assert.deepEqual(shared.useItemStore.getState().items, [])
  assert.equal(shared.useItemStore.getState().loaded, false)
  assert.equal(shared.useItemStore.getState().loading, false)
  pass('real-logout-discards-delayed-response-and-clears-user-data')

  await signIn(clients[0], config.users[1])
  const errorUrl = await startErrorServer()
  const beforeError = shared.directCalls()
  process.env.EXPO_PUBLIC_CLOTHIC_API_URL = errorUrl
  await shared.useItemStore.getState().fetchItems()
  assert.match(shared.useItemStore.getState().error, /500/)
  assert.deepEqual(shared.useItemStore.getState().items, [])
  assert.equal(shared.useItemStore.getState().loading, false)
  assert.equal(shared.directCalls(), beforeError)
  process.env.EXPO_PUBLIC_CLOTHIC_API_URL = baseUrl
  await fetchItems(shared, 1)
  pass('injected-http-500-keeps-account-isolation-and-retry-recovers-without-fallback')

  await new Promise((resolve) => servers[0].close(resolve))
  process.env.EXPO_PUBLIC_CLOTHIC_API_URL = errorUrl
  await shared.useItemStore.getState().fetchItems()
  assert.equal(shared.useItemStore.getState().loading, false)
  assert.equal(typeof shared.useItemStore.getState().error, 'string')
  assert.ok(
    shared.useItemStore.getState().items.every((item) => item.userId === config.users[1].id)
  )
  assert.equal(shared.directCalls(), beforeError)
  process.env.EXPO_PUBLIC_CLOTHIC_API_URL = baseUrl
  await fetchItems(shared, 1)
  pass('real-connection-failure-ends-loading-and-retry-restores-the-current-user')

  const report = {
    recordedAt: new Date().toISOString(),
    projectRef: new URL(config.projectUrl).hostname.split('.')[0],
    backendOrigin: baseUrl,
    authAlgorithm: 'ES256',
    testUsers: 2,
    fixtureItems: [2, 1],
    passed,
    limitations: [
      'Native UI, device rendering and store distribution are not tested.',
      'Real HTTP responses are delayed for stale-response cases; HTTP 500 is injected by a local test server.',
      'Only disposable verification accounts are seeded; existing-user preservation is checked separately.',
    ],
  }
  if (options.get('--report'))
    writeFileSync(options.get('--report'), `${JSON.stringify(report, null, 2)}\n`)
  process.stdout.write(`LIVE_ITEMS_CHECKS=${passed.length}\n`)
}

try {
  await main()
} finally {
  globalThis.fetch = originalFetch
  if (originalApiUrl === undefined) delete process.env.EXPO_PUBLIC_CLOTHIC_API_URL
  else process.env.EXPO_PUBLIC_CLOTHIC_API_URL = originalApiUrl
  await Promise.allSettled(clients.map((client) => client.auth.signOut({ scope: 'local' })))
  await Promise.all(
    servers
      .filter((server) => server.listening)
      .map((server) => new Promise((resolve) => server.close(resolve)))
  )
}
