import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { compileFunction } from 'node:vm'
import { createClient } from '@supabase/supabase-js'
import ts from 'typescript'

// 실제 서비스 검증에는 이 runId에 속한 임시 계정만 사용한다.
// Never pass production users here: the script seeds only the verified disposable accounts.
const options = new Map()
for (let index = 2; index < process.argv.length; index += 2) {
  options.set(process.argv[index], process.argv[index + 1])
}
assert.equal(options.get('--allow-test-writes'), 'true', 'Explicit test-write opt-in is required')
assert.ok(options.get('--credentials'), 'A private test-credential file is required')
const config = JSON.parse(readFileSync(options.get('--credentials'), 'utf8'))
const fixtureCounts = [3, 1]
const includeDetail = options.get('--include-detail') === 'true'
const includeSave = options.get('--include-save') === 'true'
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
  const outfits = loadStore('../stores/outfitStore.ts', { '../lib/supabase': { supabase } })
  const emptyStore = { getState: () => ({ reset() {} }) }
  const auth = loadStore('../stores/authStore.ts', {
    '../lib/supabase': { supabase },
    'react-native': { Platform: { OS: 'web' } },
    'expo-web-browser': {},
    'expo-linking': {},
    'expo-apple-authentication': {},
    'expo-crypto': {},
    '../lib/onboarding': { isOnboardingDone: async () => true },
    './itemStore': { useItemStore: emptyStore },
    './outfitStore': { useOutfitStore: outfits.useOutfitStore },
    './notificationStore': { useNotificationStore: emptyStore },
    './notificationPrefsStore': { useNotificationPrefsStore: emptyStore },
  })
  return { ...outfits, ...auth, directCalls: () => directCalls }
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

function canonical(outfits) {
  return outfits.map((item) => {
    // Preserve sub-millisecond precision while accepting UTC offset spelling differences.
    const match = item.createdAt.match(/^(.*T\d{2}:\d{2}:\d{2})(?:\.(\d+))?(?:Z|\+00:00)$/)
    assert.ok(match, 'Unexpected timestamp format')
    return { ...item, createdAt: `${match[1]}.${(match[2] ?? '').padEnd(9, '0')}Z` }
  })
}

async function fetchOutfits(stores, expectedCount) {
  await stores.useOutfitStore.getState().fetchOutfits()
  const state = stores.useOutfitStore.getState()
  assert.equal(state.error, null, state.error)
  assert.equal(state.loading, false)
  assert.equal(state.loaded, true)
  assert.equal(state.outfits.length, expectedCount)
  return state.outfits
}

function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

async function holdNextResponse(action, whilePending, path = '/api/outfits') {
  const received = deferred()
  const release = deferred()
  let hold = true
  globalThis.fetch = async (...args) => {
    const response = await originalFetch(...args)
    if (hold && String(args[0]) === `${baseUrl}${path}`) {
      hold = false
      received.resolve()
      await release.promise
    }
    return response
  }
  const pending = action()
  let result
  try {
    // If an earlier step rejects, fail instead of waiting indefinitely for a request that never began.
    await Promise.race([
      received.promise,
      pending.then(() => assert.fail('No API response to delay')),
    ])
    await whilePending()
  } finally {
    release.resolve()
    result = await pending
    globalThis.fetch = originalFetch
  }
  return result
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
  assert.equal((await originalFetch(`${baseUrl}/api/health`)).status, 200)
  assert.equal((await originalFetch(`${baseUrl}/api/outfits`)).status, 401)
  const preflight = await originalFetch(`${baseUrl}/api/outfits`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:8081',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'authorization',
    },
  })
  assert.equal(preflight.status, 200)
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'http://localhost:8081')
  pass('health-unauthenticated-rejection-and-browser-preflight')
  const stores = []
  const sessions = []
  for (const [index, user] of config.users.entries()) {
    assert.equal(user.email, `clothic-${config.runId}-${index === 0 ? 'a' : 'b'}@example.invalid`)
    const client = createClient(config.projectUrl, config.anonKey, {
      global: { fetch: originalFetch },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
    clients.push(client)
    sessions.push(await signIn(client, user))
    const scoped = createStores(client)
    await scoped.useAuthStore.getState().initialize()
    stores.push(scoped)
    process.env.EXPO_PUBLIC_CLOTHIC_API_URL = baseUrl
    await fetchOutfits(scoped, 0)
  }
  pass('real-es256-tokens-and-empty-lists-for-two-disposable-users')
  const ownedResponse = await originalFetch(`${baseUrl}/api/items`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sessions[0].access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ catalogItemId: 'top_001' }),
  })
  assert.equal(ownedResponse.status, 201)
  const owned = await ownedResponse.json()
  const seed = {
    date: '2026-11-12',
    mood: 'calm',
    weather: 'sunny',
    memo: '코디 조회 검증\n다음 줄',
    itemIds: ['top_001', owned.id, ...(includeSave ? [] : ['deleted-legacy-id'])],
    itemColors: { top_001: '#ABCDEF', [owned.id]: '#000000' },
  }
  // Explicitly choose legacy or server save; each new operation has one stable request id.
  if (includeSave) process.env.EXPO_PUBLIC_CLOTHIC_API_URL = baseUrl
  else delete process.env.EXPO_PUBLIC_CLOTHIC_API_URL
  for (const input of [
    seed,
    {
      ...seed,
      date: '2026-11-11',
      mood: null,
      weather: null,
      memo: null,
      itemIds: includeSave ? ['top_002'] : [],
      itemColors: {},
    },
    { ...seed, memo: '같은 날짜 최신 기록' },
  ]) {
    assert.equal(
      (await stores[0].useOutfitStore.getState().addOutfit({ ...input, requestId: randomUUID() }))
        .error,
      null
    )
  }
  assert.equal(
    (
      await stores[1].useOutfitStore
        .getState()
        .addOutfit({
          ...seed,
          requestId: randomUUID(),
          itemIds: ['top_002'],
          itemColors: {},
          memo: 'B only',
        })
    ).error,
    null
  )
  pass(
    includeSave
      ? 'server-app-save-path-seeds-static-and-owned-ids-with-colors'
      : 'existing-app-save-path-seeds-static-owned-and-legacy-ids-with-colors'
  )
  const expected = []
  for (const [index, count] of fixtureCounts.entries()) {
    stores[index].useOutfitStore.getState().reset()
    delete process.env.EXPO_PUBLIC_CLOTHIC_API_URL
    const legacy = canonical(await fetchOutfits(stores[index], count))
    const directBefore = stores[index].directCalls()
    stores[index].useOutfitStore.getState().reset()
    process.env.EXPO_PUBLIC_CLOTHIC_API_URL = baseUrl
    const migrated = canonical(await fetchOutfits(stores[index], count))
    assert.deepEqual(migrated, legacy)
    assert.equal(stores[index].directCalls(), directBefore)
    assert.ok(migrated.every((row) => row.userId === config.users[index].id))
    expected.push(migrated)
  }
  assert.deepEqual(
    expected[0].map((row) => row.date),
    ['2026-11-12', '2026-11-12', '2026-11-11']
  )
  assert.equal(expected[0][0].memo, '같은 날짜 최신 기록')
  assert.deepEqual(expected[0][1].itemIds, seed.itemIds)
  assert.deepEqual(expected[0][1].itemColors, seed.itemColors)
  assert.equal(expected[0][2].memo, null)
  assert.deepEqual(expected[0][2].itemIds, includeSave ? ['top_002'] : [])
  pass('legacy-and-server-lists-match-in-date-time-order-with-all-fields')
  if (includeSave) {
    const input = {
      requestId: randomUUID(),
      date: '2026-11-13',
      mood: 'happy',
      weather: 'sunny',
      memo: '동시 요청 검증',
      itemIds: ['top_001'],
      itemColors: { top_001: '#ABCDEF' },
    }
    const submit = async (payload, index = 0) =>
      originalFetch(`${baseUrl}/api/outfits`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessions[index].access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    const responses = await Promise.all(Array.from({ length: 4 }, () => submit(input)))
    assert.equal(responses.filter((value) => value.status === 201).length, 1)
    const rows = []
    for (const response of responses) {
      assert.ok(response.status === 201 || response.status === 200)
      rows.push(await response.json())
    }
    assert.ok(rows.every((row) => row.id === input.requestId && row.userId === config.users[0].id))
    assert.ok(rows.every((row) => row.createdAt === rows[0].createdAt))
    fixtureCounts[0] += 1
    pass('real-concurrent-server-saves-create-one-row-and-preserve-the-original-timestamp')
    const before = stores[0].directCalls()
    assert.equal((await stores[0].useOutfitStore.getState().addOutfit(input)).error, null)
    assert.equal(stores[0].directCalls(), before)
    assert.equal((await submit({ ...input, memo: '달라진 내용' })).status, 409)
    assert.equal((await submit(input, 1)).status, 409)
    pass('real-app-retry-reuses-request-id-and-conflicting-replays-never-overwrite')
    for (const payload of [
      { ...input, requestId: randomUUID(), userId: config.users[1].id },
      { ...input, requestId: randomUUID(), date: '2026-02-29' },
      { ...input, requestId: randomUUID(), itemColors: { top_001: 'invalid' } },
      { ...input, requestId: randomUUID(), itemIds: ['unknown-template'], itemColors: {} },
    ]) {
      assert.equal((await submit(payload)).status, 400)
    }
    assert.equal(
      (await submit({ ...input, requestId: randomUUID(), itemIds: [owned.id], itemColors: {} }, 1))
        .status,
      400
    )
    pass('real-save-rejects-owner-overrides-invalid-fields-and-another-users-owned-item')
    const delayedInput = {
      ...input,
      requestId: randomUUID(),
      date: '2026-11-14',
      memo: '저장 응답 지연',
    }
    const delayed = await holdNextResponse(
      () => stores[0].useOutfitStore.getState().addOutfit(delayedInput),
      async () => {
        await signIn(clients[0], config.users[1])
        await fetchOutfits(stores[0], 1)
      }
    )
    assert.match(delayed.error, /반영하지/)
    assert.ok(
      stores[0].useOutfitStore.getState().outfits.every((row) => row.userId === config.users[1].id)
    )
    await signIn(clients[0], config.users[0])
    fixtureCounts[0] += 1
    expected[0] = canonical(await fetchOutfits(stores[0], fixtureCounts[0]))
    assert.ok(expected[0].some((row) => row.id === delayedInput.requestId))
    pass('account-switch-discards-delayed-save-result-without-claiming-server-rollback')
  }
  if (includeDetail) {
    for (const [index, scoped] of stores.entries()) {
      scoped.useOutfitStore.getState().reset()
      const id = expected[index][0].id
      const before = scoped.directCalls()
      assert.deepEqual(await scoped.useOutfitStore.getState().fetchOutfitById(id.toUpperCase()), {
        error: null,
        found: true,
      })
      assert.deepEqual(canonical(scoped.useOutfitStore.getState().outfits), [expected[index][0]])
      assert.equal(scoped.useOutfitStore.getState().loaded, false)
      assert.equal(scoped.directCalls(), before)
      await fetchOutfits(scoped, fixtureCounts[index])
    }
    pass('real-detail-restores-empty-store-and-matches-list-fields-for-each-owner')
    const otherId = expected[1][0].id
    for (const id of [otherId, 'ffffffff-ffff-4fff-8fff-ffffffffffff']) {
      assert.deepEqual(await stores[0].useOutfitStore.getState().fetchOutfitById(id), {
        error: null,
        found: false,
      })
      const response = await originalFetch(`${baseUrl}/api/outfits/${id}`, {
        headers: { Authorization: `Bearer ${sessions[0].access_token}` },
      })
      assert.equal(response.status, 404)
      assert.equal((await response.text()).includes('B only'), false)
    }
    assert.ok((await stores[0].useOutfitStore.getState().fetchOutfitById('not-a-uuid')).error)
    for (const key of ['userId', 'user_id']) {
      assert.equal(
        (
          await originalFetch(`${baseUrl}/api/outfits/${otherId}?${key}=${config.users[1].id}`, {
            headers: { Authorization: `Bearer ${sessions[0].access_token}` },
          })
        ).status,
        400
      )
    }
    assert.equal((await originalFetch(`${baseUrl}/api/outfits/${expected[0][0].id}`)).status, 401)
    pass('real-detail-rejects-other-owner-missing-invalid-and-user-override-requests')
    const id = expected[0][0].id
    stores[0].useOutfitStore.getState().reset()
    const stale = await holdNextResponse(
      () => stores[0].useOutfitStore.getState().fetchOutfitById(id),
      async () => {
        await signIn(clients[0], config.users[1])
        assert.deepEqual(canonical(await fetchOutfits(stores[0], 1)), expected[1])
      },
      `/api/outfits/${id}`
    )
    assert.deepEqual(stale, { error: null, found: false })
    assert.deepEqual(canonical(stores[0].useOutfitStore.getState().outfits), expected[1])
    await signIn(clients[0], config.users[0])
    pass('real-account-switch-discards-delayed-detail-response')
    const loggedOut = await holdNextResponse(
      () => stores[0].useOutfitStore.getState().fetchOutfitById(id),
      async () => {
        assert.equal((await clients[0].auth.signOut()).error, null)
      },
      `/api/outfits/${id}`
    )
    assert.deepEqual(loggedOut, { error: null, found: false })
    assert.deepEqual(stores[0].useOutfitStore.getState().outfits, [])
    await signIn(clients[0], config.users[0])
    await fetchOutfits(stores[0], fixtureCounts[0])
    pass('real-logout-discards-delayed-detail-response')
  }
  for (const key of ['userId', 'user_id']) {
    assert.equal(
      (
        await originalFetch(`${baseUrl}/api/outfits?${key}=${config.users[1].id}`, {
          headers: { Authorization: `Bearer ${sessions[0].access_token}` },
        })
      ).status,
      400
    )
  }
  const parts = sessions[0].access_token.split('.')
  const signature = Buffer.from(parts[2], 'base64url')
  signature[0] ^= 1
  parts[2] = signature.toString('base64url')
  assert.equal(
    (
      await originalFetch(`${baseUrl}/api/outfits`, {
        headers: { Authorization: `Bearer ${parts.join('.')}` },
      })
    ).status,
    401
  )
  pass('user-overrides-and-tampered-real-token-are-rejected')
  await holdNextResponse(
    () => stores[0].useOutfitStore.getState().fetchOutfits(),
    async () => {
      await signIn(clients[0], config.users[1])
      assert.equal(stores[0].useAuthStore.getState().user.id, config.users[1].id)
      assert.deepEqual(stores[0].useOutfitStore.getState().outfits, [])
      assert.deepEqual(canonical(await fetchOutfits(stores[0], 1)), expected[1])
    }
  )
  assert.deepEqual(canonical(stores[0].useOutfitStore.getState().outfits), expected[1])
  pass('real-account-switch-discards-delayed-previous-user-list')
  await holdNextResponse(
    () => stores[0].useOutfitStore.getState().fetchOutfits(),
    async () => {
      assert.equal((await clients[0].auth.signOut()).error, null)
      assert.equal(stores[0].useAuthStore.getState().user, null)
    }
  )
  assert.deepEqual(stores[0].useOutfitStore.getState().outfits, [])
  assert.equal(stores[0].useOutfitStore.getState().loading, false)
  assert.equal(stores[0].useOutfitStore.getState().loaded, false)
  pass('real-logout-clears-data-and-discards-delayed-list')
  await signIn(clients[0], config.users[0])
  await fetchOutfits(stores[0], fixtureCounts[0])
  const directBefore = stores[0].directCalls()
  const errorOrigin = await startErrorServer()
  process.env.EXPO_PUBLIC_CLOTHIC_API_URL = errorOrigin
  await stores[0].useOutfitStore.getState().fetchOutfits()
  assert.ok(stores[0].useOutfitStore.getState().error)
  assert.equal(stores[0].useOutfitStore.getState().loading, false)
  assert.deepEqual(canonical(stores[0].useOutfitStore.getState().outfits), expected[0])
  assert.equal(stores[0].directCalls(), directBefore)
  process.env.EXPO_PUBLIC_CLOTHIC_API_URL = baseUrl
  assert.deepEqual(canonical(await fetchOutfits(stores[0], fixtureCounts[0])), expected[0])
  pass('injected-http-500-retains-data-without-fallback-and-retry-recovers')
  if (includeDetail) {
    stores[0].useOutfitStore.getState().reset()
    const before = stores[0].directCalls()
    process.env.EXPO_PUBLIC_CLOTHIC_API_URL = errorOrigin
    const failed = await stores[0].useOutfitStore.getState().fetchOutfitById(expected[0][0].id)
    assert.equal(failed.found, false)
    assert.ok(failed.error)
    assert.equal(stores[0].directCalls(), before)
    process.env.EXPO_PUBLIC_CLOTHIC_API_URL = baseUrl
    assert.deepEqual(await stores[0].useOutfitStore.getState().fetchOutfitById(expected[0][0].id), {
      error: null,
      found: true,
    })
    assert.deepEqual(canonical(stores[0].useOutfitStore.getState().outfits), [expected[0][0]])
    await fetchOutfits(stores[0], fixtureCounts[0])
    pass('injected-detail-http-500-is-an-error-without-fallback-and-retry-recovers')
  }
  await new Promise((resolve) => servers[0].close(resolve))
  process.env.EXPO_PUBLIC_CLOTHIC_API_URL = errorOrigin
  await stores[0].useOutfitStore.getState().fetchOutfits()
  assert.ok(stores[0].useOutfitStore.getState().error)
  assert.equal(stores[0].useOutfitStore.getState().loading, false)
  process.env.EXPO_PUBLIC_CLOTHIC_API_URL = baseUrl
  assert.deepEqual(canonical(await fetchOutfits(stores[0], fixtureCounts[0])), expected[0])
  pass('real-connection-failure-ends-loading-and-retry-recovers')
  const report = {
    recordedAt: new Date().toISOString(),
    projectRef: new URL(config.projectUrl).hostname.split('.')[0],
    backendOrigin: baseUrl,
    authAlgorithm: 'ES256',
    testUsers: 2,
    fixtureOutfits: fixtureCounts,
    detailIncluded: includeDetail,
    saveIncluded: includeSave,
    passed,
    limitations: [
      'Native UI, device rendering and production deployment are not tested.',
      'Real HTTP responses are deliberately delayed; HTTP 500 is injected by a local test server.',
      'Only verified disposable accounts are seeded; existing data preservation is checked after cleanup.',
    ],
  }
  assert.ok(options.get('--report'))
  writeFileSync(options.get('--report'), JSON.stringify(report, null, 2) + '\n')
}
try {
  await main()
} finally {
  globalThis.fetch = originalFetch
  if (originalApiUrl === undefined) delete process.env.EXPO_PUBLIC_CLOTHIC_API_URL
  else process.env.EXPO_PUBLIC_CLOTHIC_API_URL = originalApiUrl
  for (const client of clients) await client.auth.signOut()
  for (const server of servers)
    if (server.listening) await new Promise((resolve) => server.close(resolve))
}
