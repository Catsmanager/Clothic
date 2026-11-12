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
function setup(t, { fetchImpl, getSession, read, detailRead, mutate } = {}) {
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
        eq: () => query,
        maybeSingle: async () => {
          directReads += 1
          return detailRead?.() ?? { data: null, error: null }
        },
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

test('상세 조회는 토큰과 ID를 보내고 빈 store에 한 건을 복원한다', { timeout: 1000 }, async (t) => {
  const value = outfit(a, 'owned-detail')
  let calls = 0
  const fixture = setup(t, {
    fetchImpl: async (url, init) => {
      calls += 1
      assert.equal(url, 'http://server.test/api/outfits/owned-detail')
      assert.equal(init.headers.Authorization, `Bearer token-${a}`)
      return response(value)
    },
  })
  assert.deepEqual(await fixture.store.getState().fetchOutfitById(value.id), {
    error: null,
    found: true,
  })
  assert.deepEqual(fixture.store.getState().outfits, [value])
  assert.equal(fixture.store.getState().loaded, false, '한 건 복원은 전체 목록 완료가 아니다')
  assert.equal(calls, 1)
  assert.equal(fixture.directReads(), 0)
})

test(
  '타인·없는 상세는 404로 구분하고 직접 조회로 우회하지 않는다',
  { timeout: 1000 },
  async (t) => {
    let calls = 0
    const fixture = setup(t, {
      fetchImpl: async () => {
        calls += 1
        return response({ private: true }, 404)
      },
    })
    assert.deepEqual(await fixture.store.getState().fetchOutfitById('missing'), {
      error: null,
      found: false,
    })
    assert.deepEqual(fixture.store.getState().outfits, [])
    assert.equal(calls, 1)
    assert.equal(fixture.directReads(), 0)
  }
)

test(
  '상세 서버 오류·연결 오류는 오류로 종료하고 재시도할 수 있다',
  { timeout: 1000 },
  async (t) => {
    let next = response({}, 500)
    const fixture = setup(t, {
      fetchImpl: async () => {
        if (next instanceof Error) throw next
        return next
      },
    })
    for (next of [response({}, 500), new Error('offline'), response({ invalid: true })]) {
      const result = await fixture.store.getState().fetchOutfitById('detail')
      assert.equal(result.found, false)
      assert.ok(result.error)
    }
    next = response(outfit(a, 'detail'))
    assert.deepEqual(await fixture.store.getState().fetchOutfitById('detail'), {
      error: null,
      found: true,
    })
    assert.equal(fixture.directReads(), 0)
  }
)

test(
  '계정 전환 후 늦은 상세 응답은 다른 계정 store에 들어가지 않는다',
  { timeout: 1000 },
  async (t) => {
    const held = deferred()
    const started = deferred()
    const fixture = setup(t, {
      fetchImpl: async () => {
        started.resolve()
        return held.promise
      },
    })
    await fixture.auth.getState().initialize()
    const pending = fixture.store.getState().fetchOutfitById('detail')
    await Promise.race([
      started.promise,
      pending.then(() => assert.fail('상세 서버 요청이 시작되지 않았다')),
    ])
    fixture.changeSession(session(b))
    held.resolve(response(outfit(a, 'detail')))
    assert.deepEqual(await pending, { error: null, found: false })
    assert.deepEqual(fixture.store.getState().outfits, [])
  }
)

test(
  '늦은 상세는 먼저 완료된 전체 목록과 즐겨찾기 값을 덮지 않는다',
  { timeout: 1000 },
  async (t) => {
    const held = deferred()
    const started = deferred()
    const latest = { ...outfit(a, 'detail'), memo: '새 메모', isFavorite: true }
    const fixture = setup(t, {
      fetchImpl: async (url) => {
        if (url.endsWith('/detail')) {
          started.resolve()
          return held.promise
        }
        return response([latest])
      },
    })
    const pending = fixture.store.getState().fetchOutfitById('detail')
    await Promise.race([
      started.promise,
      pending.then(() => assert.fail('상세 서버 요청이 시작되지 않았다')),
    ])
    await fixture.store.getState().fetchOutfits()
    held.resolve(response(outfit(a, 'detail')))
    assert.equal((await pending).found, true)
    assert.deepEqual(fixture.store.getState().outfits, [latest])
  }
)

test('상세 응답 대기 중 삭제된 코디는 복원되지 않는다', { timeout: 1000 }, async (t) => {
  const held = deferred()
  const started = deferred()
  const fixture = setup(t, {
    fetchImpl: async () => {
      started.resolve()
      return held.promise
    },
  })
  const pending = fixture.store.getState().fetchOutfitById('detail')
  await Promise.race([
    started.promise,
    pending.then(() => assert.fail('상세 서버 요청이 시작되지 않았다')),
  ])
  await fixture.store.getState().removeOutfit('detail')
  held.resolve(response(outfit(a, 'detail')))
  assert.deepEqual(await pending, { error: null, found: false })
  assert.deepEqual(fixture.store.getState().outfits, [])
})

test('상세의 기존 직접 조회와 예외·세션 없음도 결과를 반환한다', { timeout: 1000 }, async (t) => {
  let state = 'row'
  const fixture = setup(t, {
    getSession: async () => ({ data: { session: null } }),
    detailRead: async () => {
      if (state === 'throws') throw new Error('legacy unavailable')
      return { data: toRow(outfit(a, 'detail')), error: null }
    },
  })
  delete process.env.EXPO_PUBLIC_CLOTHIC_API_URL
  assert.equal((await fixture.store.getState().fetchOutfitById('detail')).found, true)
  assert.deepEqual(fixture.store.getState().outfits, [outfit(a, 'detail')])
  fixture.store.getState().reset()
  state = 'throws'
  assert.ok((await fixture.store.getState().fetchOutfitById('detail')).error)
  process.env.EXPO_PUBLIC_CLOTHIC_API_URL = 'http://server.test'
  assert.ok((await fixture.store.getState().fetchOutfitById('detail')).error)
})
