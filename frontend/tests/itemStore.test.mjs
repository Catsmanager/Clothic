import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import ts from 'typescript'

// 네이티브 SDK 경계만 대체하고 실제 store 소스와 Zustand를 실행한다.
function loadStore(path, replacements) {
  const url = new URL(path, import.meta.url)
  const require = createRequire(url)
  const source = ts.transpileModule(readFileSync(url, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const module = { exports: {} }
  compileFunction(source, ['require', 'module', 'exports'], { filename: url.pathname })(
    (name) => (Object.hasOwn(replacements, name) ? replacements[name] : require(name)),
    module,
    module.exports
  )
  return module.exports
}

const userA = '41111111-1111-4111-8111-111111111111'
const userB = '42222222-2222-4222-8222-222222222222'
const session = (id) => ({ access_token: `test-token-${id}`, user: { id } })
const item = (userId) => ({
  id: `item-${userId}`,
  userId,
  catalogItemId: 'top_001',
  name: '기본 상의',
  category: 'top',
  imagePath: '',
  color: '#FFFFFF',
  styleTags: ['casual'],
  createdAt: '2026-11-10T00:00:00Z',
})
const response = (items, status = 200) =>
  new Response(JSON.stringify(items), {
    status,
    headers: { 'content-type': 'application/json' },
  })

function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function setup(t, { fetchImpl, getSession, legacyRows = [] } = {}) {
  const previousUrl = process.env.EXPO_PUBLIC_CLOTHIC_API_URL
  const previousFetch = globalThis.fetch
  process.env.EXPO_PUBLIC_CLOTHIC_API_URL = 'http://server.test'
  globalThis.fetch = fetchImpl ?? (async () => response([item(userA)]))
  t.after(() => {
    globalThis.fetch = previousFetch
    if (previousUrl === undefined) delete process.env.EXPO_PUBLIC_CLOTHIC_API_URL
    else process.env.EXPO_PUBLIC_CLOTHIC_API_URL = previousUrl
  })

  let currentSession = session(userA)
  let onAuthStateChange
  let directReads = 0
  const supabase = {
    auth: {
      getSession: getSession ?? (async () => ({ data: { session: currentSession } })),
      onAuthStateChange: (callback) => {
        onAuthStateChange = callback
        return { data: { subscription: { unsubscribe() {} } } }
      },
    },
    from: (table) => {
      assert.equal(table, 'items')
      directReads += 1
      return { select: () => ({ order: async () => ({ data: legacyRows, error: null }) }) }
    },
  }
  const { useItemStore } = loadStore('../stores/itemStore.ts', {
    '../lib/supabase': { supabase },
  })
  const emptyStore = { getState: () => ({ reset() {} }) }
  const { useAuthStore } = loadStore('../stores/authStore.ts', {
    '../lib/supabase': { supabase },
    'react-native': { Platform: { OS: 'web' } },
    'expo-web-browser': {},
    'expo-linking': {},
    'expo-apple-authentication': {},
    'expo-crypto': {},
    '../lib/onboarding': { isOnboardingDone: async () => true },
    './itemStore': { useItemStore },
    './outfitStore': { useOutfitStore: emptyStore },
    './notificationStore': { useNotificationStore: emptyStore },
    './notificationPrefsStore': { useNotificationPrefsStore: emptyStore },
  })
  return {
    store: useItemStore,
    auth: useAuthStore,
    directReads: () => directReads,
    changeSession: (next) => {
      currentSession = next
      onAuthStateChange(next ? 'SIGNED_IN' : 'SIGNED_OUT', next)
    },
  }
}

test('서버 경로와 기존 직접 조회는 같은 옷 목록으로 해석된다', async (t) => {
  const owned = item(userA)
  const row = {
    id: owned.id,
    user_id: owned.userId,
    catalog_item_id: owned.catalogItemId,
    name: owned.name,
    category: owned.category,
    image_path: owned.imagePath,
    color: owned.color,
    style_tags: ['casual', 'unknown-tag'],
    created_at: owned.createdAt,
  }
  const fixture = setup(t, {
    legacyRows: [row, { ...row, category: 'hat' }],
    fetchImpl: async (_url, init) => {
      assert.equal(init.headers.Authorization, `Bearer test-token-${userA}`)
      return response([
        { ...owned, styleTags: row.style_tags },
        { ...owned, category: 'hat' },
      ])
    },
  })
  delete process.env.EXPO_PUBLIC_CLOTHIC_API_URL
  await fixture.store.getState().fetchItems()
  const legacyItems = fixture.store.getState().items
  fixture.store.getState().reset()
  process.env.EXPO_PUBLIC_CLOTHIC_API_URL = 'http://server.test'
  await fixture.store.getState().fetchItems()
  assert.deepEqual(fixture.store.getState().items, legacyItems)
  assert.equal(fixture.directReads(), 1)
  assert.equal(fixture.store.getState().loaded, true)
  assert.equal(fixture.store.getState().loading, false)
})

test('계정 전환 후 먼저 시작한 계정의 늦은 응답은 새 목록을 덮지 않는다', async (t) => {
  const started = deferred()
  const oldResponse = deferred()
  let requests = 0
  const fixture = setup(t, {
    fetchImpl: async () => {
      requests += 1
      if (requests === 1) {
        started.resolve()
        return oldResponse.promise
      }
      return response([item(userB)])
    },
  })
  await fixture.auth.getState().initialize()
  const pending = fixture.store.getState().fetchItems()
  await started.promise
  fixture.changeSession(session(userB))
  assert.deepEqual(fixture.store.getState().items, [])
  await fixture.store.getState().fetchItems()
  oldResponse.resolve(response([item(userA)]))
  await pending
  assert.deepEqual(fixture.store.getState().items, [item(userB)])
  assert.equal(fixture.store.getState().loading, false)
})

test('로그아웃 후 도착한 응답은 옷 목록과 로딩 상태를 복원하지 않는다', async (t) => {
  const started = deferred()
  const oldResponse = deferred()
  const fixture = setup(t, {
    fetchImpl: async () => {
      started.resolve()
      return oldResponse.promise
    },
  })
  await fixture.auth.getState().initialize()
  const pending = fixture.store.getState().fetchItems()
  await started.promise
  fixture.changeSession(null)
  oldResponse.resolve(response([item(userA)]))
  await pending
  assert.deepEqual(fixture.store.getState().items, [])
  assert.equal(fixture.store.getState().loaded, false)
  assert.equal(fixture.store.getState().loading, false)
  assert.equal(fixture.store.getState().error, null)
})

test('계정 전환 후 서버 오류가 나면 빈 목록을 유지하고 재시도로 복구한다', async (t) => {
  let fail = false
  const fixture = setup(t, {
    fetchImpl: async () => (fail ? response({}, 500) : response([item(userB)])),
  })
  await fixture.auth.getState().initialize()
  fixture.store.setState({ items: [item(userA)], loaded: true })
  fixture.changeSession(session(userB))
  fail = true
  await fixture.store.getState().fetchItems()
  assert.deepEqual(fixture.store.getState().items, [])
  assert.equal(fixture.store.getState().loading, false)
  assert.equal(fixture.store.getState().loaded, false)
  assert.match(fixture.store.getState().error, /500/)
  assert.equal(fixture.directReads(), 0)
  fail = false
  await fixture.store.getState().fetchItems()
  assert.deepEqual(fixture.store.getState().items, [item(userB)])
  assert.equal(fixture.store.getState().loaded, true)
  assert.equal(fixture.store.getState().error, null)
})

test('세션이 없으면 요청하지 않고 로딩을 끝낸다', async (t) => {
  const fixture = setup(t, {
    getSession: async () => ({ data: { session: null } }),
    fetchImpl: async () => assert.fail('로그인 없이 API를 호출하면 안 된다'),
  })
  await fixture.store.getState().fetchItems()
  assert.equal(fixture.store.getState().loading, false)
  assert.match(fixture.store.getState().error, /로그인/)
  assert.equal(fixture.directReads(), 0)
})

test('세션 복원에서 예외가 발생해도 로딩을 끝내고 재시도할 수 있다', async (t) => {
  let fail = true
  const fixture = setup(t, {
    getSession: async () => {
      if (fail) throw new Error('session storage unavailable')
      return { data: { session: session(userA) } }
    },
  })
  await assert.doesNotReject(fixture.store.getState().fetchItems())
  assert.equal(fixture.store.getState().loading, false)
  assert.equal(typeof fixture.store.getState().error, 'string')
  fail = false
  await fixture.store.getState().fetchItems()
  assert.deepEqual(fixture.store.getState().items, [item(userA)])
  assert.equal(fixture.store.getState().error, null)
})

test('서버 추가 경로의 성공 결과는 한 번 반영하고 기존 직접 쓰기로 우회하지 않는다', async (t) => {
  let requests = 0
  const fixture = setup(t, {
    fetchImpl: async (_url, init) => {
      requests += 1
      assert.equal(init.method, 'POST')
      assert.deepEqual(JSON.parse(init.body), { catalogItemId: 'top_001' })
      return response(item(userA), 201)
    },
  })
  const result = await fixture.store.getState().addCatalogItem({ id: 'top_001' })
  assert.equal(result.error, null)
  await fixture.store.getState().addCatalogItem({ id: 'top_001' })
  assert.equal(requests, 1)
  assert.deepEqual(fixture.store.getState().items, [item(userA)])
  assert.equal(fixture.directReads(), 0)
})

test('계정이 바뀐 뒤 도착한 추가 결과는 새 계정에 반영하지 않는다', async (t) => {
  const started = deferred()
  const oldResponse = deferred()
  const fixture = setup(t, {
    fetchImpl: async () => {
      started.resolve()
      return oldResponse.promise
    },
  })
  await fixture.auth.getState().initialize()
  const pending = fixture.store.getState().addCatalogItem({ id: 'top_001' })
  await started.promise
  fixture.changeSession(session(userB))
  oldResponse.resolve(response(item(userA), 201))
  const result = await pending
  assert.equal(result.item, null)
  assert.match(result.error, /반영하지/)
  assert.deepEqual(fixture.store.getState().items, [])
})

test('추가 실패 뒤 재시도는 복구되고 실패 시 기존 쓰기로 자동 우회하지 않는다', async (t) => {
  let fail = true
  const fixture = setup(t, {
    fetchImpl: async () => (fail ? response({}, 500) : response(item(userA), 201)),
  })
  const failed = await fixture.store.getState().addCatalogItem({ id: 'top_001' })
  assert.match(failed.error, /500/)
  assert.deepEqual(fixture.store.getState().items, [])
  assert.equal(fixture.directReads(), 0)
  fail = false
  const recovered = await fixture.store.getState().addCatalogItem({ id: 'top_001' })
  assert.equal(recovered.error, null)
  assert.deepEqual(fixture.store.getState().items, [item(userA)])
})

test('추가가 끝난 뒤 늦게 온 이전 목록은 새 소유 아이템을 지우지 않는다', async (t) => {
  const started = deferred()
  const oldList = deferred()
  const fixture = setup(t, {
    fetchImpl: async (_url, init) => {
      if (init.method === 'GET') {
        started.resolve()
        return oldList.promise
      }
      return response(item(userA), 201)
    },
  })
  const pending = fixture.store.getState().fetchItems()
  await started.promise
  await fixture.store.getState().addCatalogItem({ id: 'top_001' })
  oldList.resolve(response([]))
  await pending
  assert.deepEqual(fixture.store.getState().items, [item(userA)])
  assert.equal(fixture.store.getState().loading, false)
})
