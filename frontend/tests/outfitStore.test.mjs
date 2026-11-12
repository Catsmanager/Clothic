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

const a = '81111111-1111-4111-8111-111111111111'
const b = '82222222-2222-4222-8222-222222222222'
const session = (id) => ({ access_token: `token-${id}`, user: { id } })
const outfit = (userId, id = `outfit-${userId}`) => ({
  id,
  userId,
  date: '2026-11-12',
  mood: 'calm',
  weather: null,
  memo: '기록',
  itemIds: ['top_001', '41111111-1111-4111-8111-111111111111'],
  itemColors: { top_001: '#ABCDEF' },
  isFavorite: false,
  createdAt: '2026-11-12T00:00:00Z',
})
const toRow = (value) => ({
  id: value.id,
  user_id: value.userId,
  date: value.date,
  mood: value.mood,
  weather: value.weather,
  memo: value.memo,
  item_ids: value.itemIds,
  item_colors: value.itemColors,
  is_favorite: value.isFavorite,
  created_at: value.createdAt,
})
const response = (value, status = 200) =>
  new Response(JSON.stringify(value), {
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
function setup(t, { fetchImpl, getSession, read, mutate } = {}) {
  const oldUrl = process.env.EXPO_PUBLIC_CLOTHIC_API_URL
  const oldFetch = globalThis.fetch
  process.env.EXPO_PUBLIC_CLOTHIC_API_URL = 'http://server.test'
  globalThis.fetch = fetchImpl ?? (async () => response([outfit(a)]))
  t.after(() => {
    globalThis.fetch = oldFetch
    if (oldUrl === undefined) delete process.env.EXPO_PUBLIC_CLOTHIC_API_URL
    else process.env.EXPO_PUBLIC_CLOTHIC_API_URL = oldUrl
  })
  let current = session(a)
  let callback
  let directReads = 0
  const orders = []
  const supabase = {
    auth: {
      getSession: getSession ?? (async () => ({ data: { session: current }, error: null })),
      getUser: async () => ({ data: { user: current?.user } }),
      onAuthStateChange: (cb) => {
        callback = cb
        return { data: { subscription: { unsubscribe() {} } } }
      },
    },
    from: (table) => {
      assert.equal(table, 'outfits')
      const query = {
        select: () => query,
        order: (key, value) => {
          orders.push([key, value])
          return query
        },
        then: (yes, no) => {
          directReads += 1
          return (read?.() ?? Promise.resolve({ data: [toRow(outfit(a))], error: null })).then(
            yes,
            no
          )
        },
        update: (patch) => ({ eq: async () => mutate?.('update', patch) ?? { error: null } }),
        delete: () => ({ eq: async () => mutate?.('delete') ?? { error: null } }),
        insert: () => ({
          select: () => ({
            single: async () =>
              mutate?.('insert') ?? { data: toRow(outfit(a, 'new')), error: null },
          }),
        }),
      }
      return query
    },
  }
  const { useOutfitStore: store } = loadStore('../stores/outfitStore.ts', {
    '../lib/supabase': { supabase },
  })
  const empty = { getState: () => ({ reset() {} }) }
  const { useAuthStore: auth } = loadStore('../stores/authStore.ts', {
    '../lib/supabase': { supabase },
    'react-native': { Platform: { OS: 'web' } },
    'expo-web-browser': {},
    'expo-linking': {},
    'expo-apple-authentication': {},
    'expo-crypto': {},
    '../lib/onboarding': { isOnboardingDone: async () => true },
    './itemStore': { useItemStore: empty },
    './outfitStore': { useOutfitStore: store },
    './notificationStore': { useNotificationStore: empty },
    './notificationPrefsStore': { useNotificationPrefsStore: empty },
  })
  return {
    store,
    auth,
    orders,
    directReads: () => directReads,
    changeSession: (next) => {
      current = next
      callback(next ? 'SIGNED_IN' : 'SIGNED_OUT', next)
    },
  }
}

test('코디 조회는 Bearer 토큰을 전송하고 기존 필드·정렬 결과를 유지한다', async (t) => {
  const values = [outfit(a), outfit(a, 'older')]
  const fixture = setup(t, {
    read: async () => ({ data: values.map(toRow), error: null }),
    fetchImpl: async (url, init) => {
      assert.equal(url, 'http://server.test/api/outfits')
      assert.equal(init.headers.Authorization, `Bearer token-${a}`)
      return response(values)
    },
  })
  delete process.env.EXPO_PUBLIC_CLOTHIC_API_URL
  await fixture.store.getState().fetchOutfits()
  const legacy = fixture.store.getState().outfits
  assert.deepEqual(fixture.orders, [
    ['date', { ascending: false }],
    ['created_at', { ascending: false }],
  ])
  fixture.store.getState().reset()
  process.env.EXPO_PUBLIC_CLOTHIC_API_URL = 'http://server.test'
  await fixture.store.getState().fetchOutfits()
  assert.deepEqual(fixture.store.getState().outfits, legacy)
  assert.equal(fixture.directReads(), 1)
  assert.equal(fixture.store.getState().loaded, true)
  assert.equal(fixture.store.getState().loading, false)
})

test('빈 코디 목록은 오류 없이 최초 조회 완료로 처리한다', async (t) => {
  const { store } = setup(t, { fetchImpl: async () => response([]) })
  await store.getState().fetchOutfits()
  assert.deepEqual(store.getState().outfits, [])
  assert.equal(store.getState().loaded, true)
  assert.equal(store.getState().error, null)
})

test('계정 변경과 로그아웃은 이전 사용자의 늦은 목록을 차단한다', async (t) => {
  const held = deferred()
  const received = deferred()
  let count = 0
  const fixture = setup(t, {
    fetchImpl: async () => {
      if (count++ === 0) {
        received.resolve()
        return held.promise
      }
      return response([outfit(b)])
    },
  })
  await fixture.auth.getState().initialize()
  const pending = fixture.store.getState().fetchOutfits()
  await received.promise
  fixture.changeSession(session(b))
  await fixture.store.getState().fetchOutfits()
  held.resolve(response([outfit(a)]))
  await pending
  assert.deepEqual(fixture.store.getState().outfits, [outfit(b)])
  fixture.changeSession(null)
  assert.deepEqual(fixture.store.getState().outfits, [])
  assert.equal(fixture.store.getState().loaded, false)
})

test('로그아웃 중 대기하던 세션 복원은 서버 요청을 보내지 않는다', async (t) => {
  const held = deferred()
  let calls = 0
  let initial = true
  const fixture = setup(t, {
    getSession: async () => {
      if (initial) {
        initial = false
        return { data: { session: session(a) } }
      }
      return held.promise
    },
    fetchImpl: async () => {
      calls += 1
      return response([outfit(a)])
    },
  })
  await fixture.auth.getState().initialize()
  const pending = fixture.store.getState().fetchOutfits()
  fixture.changeSession(null)
  held.resolve({ data: { session: session(a) } })
  await pending
  assert.equal(calls, 0)
  assert.equal(fixture.store.getState().loading, false)
  assert.deepEqual(fixture.store.getState().outfits, [])
})

test('중첩 목록 요청에서는 마지막 요청의 결과만 반영한다', async (t) => {
  const held = deferred()
  const started = deferred()
  let count = 0
  const { store } = setup(t, {
    fetchImpl: async () => {
      if (count++ === 0) {
        started.resolve()
        return held.promise
      }
      return response([outfit(a, 'latest')])
    },
  })
  const first = store.getState().fetchOutfits()
  await started.promise
  await store.getState().fetchOutfits()
  held.resolve(response([outfit(a, 'stale')]))
  await first
  assert.equal(store.getState().outfits[0].id, 'latest')
})

test('서버 오류·깨진 응답·연결 오류는 기존 목록을 유지하고 재시도한다', async (t) => {
  let next = response([outfit(a)])
  const fixture = setup(t, {
    fetchImpl: async () => {
      if (next instanceof Error) throw next
      return next
    },
  })
  await fixture.store.getState().fetchOutfits()
  for (const failure of [
    response({ sql: 'private' }, 500),
    response([{ invalid: true }]),
    new Error('offline'),
  ]) {
    next = failure
    await fixture.store.getState().fetchOutfits()
    assert.ok(fixture.store.getState().error)
    assert.equal(fixture.store.getState().loading, false)
    assert.deepEqual(fixture.store.getState().outfits, [outfit(a)])
  }
  next = response([])
  await fixture.store.getState().fetchOutfits()
  assert.equal(fixture.store.getState().error, null)
  assert.equal(fixture.directReads(), 0)
})

test('세션 없음·세션 예외·기존 조회 예외도 로딩을 종료한다', async (t) => {
  let state = 'missing'
  const fixture = setup(t, {
    getSession: async () => {
      if (state === 'throws') throw new Error('storage failed')
      return { data: { session: null } }
    },
    read: async () => {
      throw new Error('legacy failed')
    },
  })
  for (state of ['missing', 'throws', 'legacy']) {
    if (state === 'legacy') delete process.env.EXPO_PUBLIC_CLOTHIC_API_URL
    await fixture.store.getState().fetchOutfits()
    assert.equal(fixture.store.getState().loading, false)
    assert.equal(fixture.store.getState().loaded, false)
    assert.ok(fixture.store.getState().error)
  }
})

test('늦은 목록도 저장 직후 로컬 코디와 진행 중인 즐겨찾기를 보존한다', async (t) => {
  const held = deferred()
  const started = deferred()
  const favorite = deferred()
  let reads = 0
  const fixture = setup(t, {
    fetchImpl: async () => {
      if (reads++ === 0) {
        started.resolve()
        return held.promise
      }
      return response([outfit(a)])
    },
    mutate: async (kind) =>
      kind === 'update' ? favorite.promise : { data: toRow(outfit(a, 'new')), error: null },
  })
  const pending = fixture.store.getState().fetchOutfits()
  await started.promise
  await fixture.store.getState().addOutfit({
    date: '2026-11-12',
    itemIds: [],
    itemColors: {},
    mood: null,
    weather: null,
    memo: null,
  })
  held.resolve(response([outfit(a)]))
  await pending
  assert.deepEqual(
    fixture.store.getState().outfits.map((value) => value.id),
    ['new', `outfit-${a}`]
  )
  const toggle = fixture.store.getState().toggleFavorite(`outfit-${a}`, true)
  await fixture.store.getState().fetchOutfits()
  assert.equal(
    fixture.store.getState().outfits.find((value) => value.id === `outfit-${a}`).isFavorite,
    true
  )
  favorite.resolve({ error: null })
  await toggle
})

test('삭제 대기 중 재조회는 삭제 코디를 부활시키지 않고 실패 시 복원한다', async (t) => {
  const deletion = deferred()
  const fixture = setup(t, { mutate: async () => deletion.promise })
  await fixture.store.getState().fetchOutfits()
  const pending = fixture.store.getState().removeOutfit(`outfit-${a}`)
  await fixture.store.getState().fetchOutfits()
  assert.deepEqual(fixture.store.getState().outfits, [])
  deletion.resolve({ error: { message: 'delete failed' } })
  assert.equal((await pending).error, 'delete failed')
  assert.deepEqual(fixture.store.getState().outfits, [outfit(a)])
})
