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
    fetchImpl: async (_url, init) => {
      if (init.method === 'POST')
        return response(outfit(a, '91111111-1111-4111-8111-111111111111'), 201)
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
    requestId: '91111111-1111-4111-8111-111111111111',
    date: '2026-11-12',
    itemIds: ['top_001'],
    itemColors: {},
    mood: null,
    weather: null,
    memo: null,
  })
  held.resolve(response([outfit(a)]))
  await pending
  assert.deepEqual(
    fixture.store.getState().outfits.map((value) => value.id),
    [fixture.store.getState().outfits[0].id, `outfit-${a}`]
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

const saveInput = (requestId = '91111111-1111-4111-8111-111111111111') => ({
  requestId,
  date: '2026-11-12',
  mood: 'calm',
  weather: 'sunny',
  memo: '저장',
  itemIds: ['top_001'],
  itemColors: { top_001: '#ABCDEF' },
})
const saved = (input = saveInput()) => ({ ...outfit(a, input.requestId), ...input })

test(
  '저장은 요청 ID와 입력 필드만 서버로 보내고 한 행을 반영한다',
  { timeout: 1000 },
  async (t) => {
    const input = saveInput()
    let calls = 0
    const fixture = setup(t, {
      fetchImpl: async (url, init) => {
        calls += 1
        assert.equal(url, 'http://server.test/api/outfits')
        assert.equal(init.method, 'POST')
        assert.equal(init.headers.Authorization, `Bearer token-${a}`)
        assert.deepEqual(JSON.parse(init.body), input)
        return response(saved(input), 201)
      },
      mutate: async () => assert.fail('서버 경로는 기존 직접 쓰기를 사용하지 않는다'),
    })
    assert.equal((await fixture.store.getState().addOutfit(input)).error, null)
    assert.equal(fixture.store.getState().outfits[0].id, input.requestId)
    assert.equal(calls, 1)
  }
)

test(
  '저장 실패 후 같은 요청 ID로 재시도하고 서버 중복 응답도 한 행만 유지한다',
  { timeout: 1000 },
  async (t) => {
    const input = saveInput()
    let count = 0
    const fixture = setup(t, {
      fetchImpl: async (_url, init) => {
        assert.equal(JSON.parse(init.body).requestId, input.requestId)
        return count++ === 0 ? response({}, 500) : response(saved(input), 200)
      },
      mutate: async () => assert.fail('직접 쓰기 우회 없음'),
    })
    assert.ok((await fixture.store.getState().addOutfit(input)).error)
    assert.deepEqual(fixture.store.getState().outfits, [])
    assert.equal((await fixture.store.getState().addOutfit(input)).error, null)
    assert.equal((await fixture.store.getState().addOutfit(input)).error, null)
    assert.equal(fixture.store.getState().outfits.length, 1)
  }
)

test('동시 저장 응답은 같은 ID를 중복 삽입하지 않는다', { timeout: 1000 }, async (t) => {
  const input = saveInput()
  let calls = 0
  const fixture = setup(t, {
    fetchImpl: async () => {
      calls += 1
      return response(saved(input), calls === 1 ? 201 : 200)
    },
    mutate: async () => assert.fail('직접 쓰기 우회 없음'),
  })
  const results = await Promise.all([
    fixture.store.getState().addOutfit(input),
    fixture.store.getState().addOutfit(input),
  ])
  assert.ok(results.every((r) => r.error === null))
  assert.equal(fixture.store.getState().outfits.length, 1)
  assert.equal(calls, 2)
})

test(
  '계정 변경 뒤 늦은 저장 결과를 반영하지 않고 서버 취소를 주장하지 않는다',
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
    const pending = fixture.store.getState().addOutfit(saveInput())
    await Promise.race([
      started.promise,
      pending.then(() => assert.fail('저장 서버 요청이 시작되지 않았다')),
    ])
    fixture.changeSession(session(b))
    held.resolve(response(saved(), 201))
    assert.match((await pending).error, /반영하지/)
    assert.deepEqual(fixture.store.getState().outfits, [])
  }
)

test(
  '늦은 중복 저장 응답은 그 사이 삭제된 코디를 복원하지 않는다',
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
    const input = saveInput()
    const pending = fixture.store.getState().addOutfit(input)
    await Promise.race([
      started.promise,
      pending.then(() => assert.fail('저장 서버 요청이 시작되지 않았다')),
    ])
    await fixture.store.getState().removeOutfit(input.requestId)
    held.resolve(response(saved(input), 200))
    assert.ok((await pending).error)
    assert.deepEqual(fixture.store.getState().outfits, [])
  }
)

test(
  '저장 요청 중 세션 없음·세션 예외·요청 ID 누락은 오류로 종료한다',
  { timeout: 1000 },
  async (t) => {
    let state = 'missing'
    let calls = 0
    const fixture = setup(t, {
      getSession: async () => {
        if (state === 'throws') throw new Error('secure storage unavailable')
        return { data: { session: state === 'valid' ? session(a) : null } }
      },
      fetchImpl: async () => {
        calls += 1
        return response(saved())
      },
    })
    assert.ok((await fixture.store.getState().addOutfit(saveInput())).error)
    state = 'throws'
    assert.ok((await fixture.store.getState().addOutfit(saveInput())).error)
    state = 'valid'
    const input = saveInput()
    delete input.requestId
    assert.ok((await fixture.store.getState().addOutfit(input)).error)
    assert.equal(calls, 0)
  }
)

test(
  '늦은 중복 저장은 그 사이 수정한 현재 store 값을 덮지 않는다',
  { timeout: 1000 },
  async (t) => {
    const held = deferred()
    const started = deferred()
    const input = saveInput()
    const fixture = setup(t, {
      fetchImpl: async () => {
        started.resolve()
        return held.promise
      },
    })
    fixture.store.setState({
      outfits: [{ ...saved(input), memo: '수정된 기록', isFavorite: true }],
    })
    const pending = fixture.store.getState().addOutfit(input)
    await Promise.race([
      started.promise,
      pending.then(() => assert.fail('저장 서버 요청이 시작되지 않았다')),
    ])
    held.resolve(response(saved(input), 200))
    assert.equal((await pending).error, null)
    assert.equal(fixture.store.getState().outfits[0].memo, '수정된 기록')
    assert.equal(fixture.store.getState().outfits[0].isFavorite, true)
  }
)

test('서버 저장 연결이 실패해도 이미 조회한 코디는 보존한다', { timeout: 1000 }, async (t) => {
  const fixture = setup(t, {
    fetchImpl: async () => {
      throw new Error('offline')
    },
    mutate: async () => assert.fail('직접 쓰기 우회 없음'),
  })
  fixture.store.setState({ outfits: [outfit(a)] })
  assert.ok((await fixture.store.getState().addOutfit(saveInput())).error)
  assert.deepEqual(fixture.store.getState().outfits, [outfit(a)])
})

test(
  '기분·메모 수정은 본인 상세 경로로 PATCH하고 다른 필드는 보존한다',
  { timeout: 1000 },
  async (t) => {
    const value = outfit(a, 'detail')
    let calls = 0
    const fixture = setup(t, {
      fetchImpl: async (url, init) => {
        calls++
        assert.equal(url, 'http://server.test/api/outfits/detail')
        assert.equal(init.method, 'PATCH')
        assert.equal(init.headers.Authorization, `Bearer token-${a}`)
        assert.deepEqual(JSON.parse(init.body), { mood: 'happy', memo: null })
        return response({ ...value, mood: 'happy', memo: null, isFavorite: true })
      },
      mutate: async () => assert.fail('서버 설정 시 직접 수정 우회 없음'),
    })
    fixture.store.setState({ outfits: [value] })
    assert.equal(
      (await fixture.store.getState().updateDiary('detail', { mood: 'happy', memo: null })).error,
      null
    )
    assert.deepEqual(fixture.store.getState().outfits, [{ ...value, mood: 'happy', memo: null }])
    assert.equal(calls, 1)
  }
)

test(
  '수정 실패·연결 오류는 기존 상태를 유지하고 재시도할 수 있다',
  { timeout: 1000 },
  async (t) => {
    const value = outfit(a, 'detail')
    let next = response({}, 500)
    const fixture = setup(t, {
      fetchImpl: async () => {
        if (next instanceof Error) throw next
        return next
      },
      mutate: async () => assert.fail('직접 수정 없음'),
    })
    fixture.store.setState({ outfits: [value] })
    for (next of [response({}, 500), new Error('offline'), response({}, 404)]) {
      assert.ok((await fixture.store.getState().updateDiary('detail', { memo: '수정' })).error)
      assert.deepEqual(fixture.store.getState().outfits, [value])
    }
    next = response({ ...value, memo: '수정' })
    assert.equal(
      (await fixture.store.getState().updateDiary('detail', { memo: '수정' })).error,
      null
    )
    assert.equal(fixture.store.getState().outfits[0].memo, '수정')
  }
)

test(
  '연속 부분 수정은 순서대로 전송하고 앞선 성공 필드도 유지한다',
  { timeout: 1000 },
  async (t) => {
    const first = deferred()
    const started = deferred()
    const value = outfit(a, 'detail')
    let calls = 0
    const fixture = setup(t, {
      fetchImpl: async (_url, init) => {
        calls++
        if (calls === 1) {
          assert.deepEqual(JSON.parse(init.body), { mood: 'happy' })
          started.resolve()
          return first.promise
        }
        assert.deepEqual(JSON.parse(init.body), { memo: '다음 수정' })
        return response({ ...value, mood: 'happy', memo: '다음 수정' })
      },
    })
    fixture.store.setState({ outfits: [value] })
    const p1 = fixture.store.getState().updateDiary('detail', { mood: 'happy' })
    await Promise.race([
      started.promise,
      p1.then(() => assert.fail('수정 서버 요청이 시작되지 않았다')),
    ])
    const p2 = fixture.store.getState().updateDiary('detail', { memo: '다음 수정' })
    assert.equal(calls, 1)
    first.resolve(response({ ...value, mood: 'happy' }))
    await Promise.all([p1, p2])
    assert.deepEqual(fixture.store.getState().outfits, [
      { ...value, mood: 'happy', memo: '다음 수정' },
    ])
  }
)

test(
  '앞선 부분 수정 성공 뒤 최신 요청이 실패하면 확인된 서버 값으로 복구한다',
  { timeout: 1000 },
  async (t) => {
    const first = deferred()
    const started = deferred()
    const value = outfit(a, 'detail')
    let calls = 0
    const fixture = setup(t, {
      fetchImpl: async () => {
        if (calls++ === 0) {
          started.resolve()
          return first.promise
        }
        return response({}, 500)
      },
    })
    fixture.store.setState({ outfits: [value] })
    const p1 = fixture.store.getState().updateDiary('detail', { mood: 'happy' })
    await Promise.race([
      started.promise,
      p1.then(() => assert.fail('수정 서버 요청이 시작되지 않았다')),
    ])
    const p2 = fixture.store.getState().updateDiary('detail', { memo: '실패할 수정' })
    first.resolve(response({ ...value, mood: 'happy' }))
    await p1
    assert.ok((await p2).error)
    assert.deepEqual(fixture.store.getState().outfits, [{ ...value, mood: 'happy' }])
  }
)

test(
  '계정 변경은 늦은 수정 응답과 대기 중인 다음 수정을 차단한다',
  { timeout: 1000 },
  async (t) => {
    const first = deferred()
    const started = deferred()
    const value = outfit(a, 'detail')
    let calls = 0
    const fixture = setup(t, {
      fetchImpl: async () => {
        calls++
        started.resolve()
        return first.promise
      },
    })
    await fixture.auth.getState().initialize()
    fixture.store.setState({ outfits: [value] })
    const p1 = fixture.store.getState().updateDiary('detail', { mood: 'happy' })
    await Promise.race([
      started.promise,
      p1.then(() => assert.fail('수정 서버 요청이 시작되지 않았다')),
    ])
    const p2 = fixture.store.getState().updateDiary('detail', { memo: '대기' })
    fixture.changeSession(session(b))
    first.resolve(response({ ...value, mood: 'happy' }))
    await Promise.all([p1, p2])
    assert.equal(calls, 1)
    assert.deepEqual(fixture.store.getState().outfits, [])
  }
)

test('수정 완료 뒤 늦은 목록은 수정 값을 덮지 않는다', { timeout: 1000 }, async (t) => {
  const held = deferred()
  const started = deferred()
  const value = outfit(a, 'detail')
  const fixture = setup(t, {
    fetchImpl: async (_url, init) => {
      if (init.method === 'GET') {
        started.resolve()
        return held.promise
      }
      return response({ ...value, mood: 'happy' })
    },
  })
  fixture.store.setState({ outfits: [value] })
  const list = fixture.store.getState().fetchOutfits()
  await Promise.race([started.promise, list.then(() => assert.fail('목록 요청이 시작되지 않았다'))])
  assert.equal(
    (await fixture.store.getState().updateDiary('detail', { mood: 'happy' })).error,
    null
  )
  held.resolve(response([value]))
  await list
  assert.equal(fixture.store.getState().outfits[0].mood, 'happy')
  assert.equal(fixture.store.getState().loading, false)
})

test('수정 중 삭제가 실패하면 확인된 기분·메모를 반영해 복원한다', { timeout: 1000 }, async (t) => {
  const patch = deferred()
  const started = deferred()
  const deletion = deferred()
  const value = outfit(a, 'detail')
  const fixture = setup(t, {
    fetchImpl: async () => {
      started.resolve()
      return patch.promise
    },
    mutate: async (kind) => (kind === 'delete' ? deletion.promise : { error: null }),
  })
  fixture.store.setState({ outfits: [value] })
  const pending = fixture.store.getState().updateDiary('detail', { mood: 'happy' })
  await Promise.race([
    started.promise,
    pending.then(() => assert.fail('수정 서버 요청이 시작되지 않았다')),
  ])
  const removing = fixture.store.getState().removeOutfit('detail')
  patch.resolve(response({ ...value, mood: 'happy' }))
  await pending
  assert.deepEqual(fixture.store.getState().outfits, [])
  deletion.resolve({ error: { message: 'delete failed' } })
  await removing
  assert.deepEqual(fixture.store.getState().outfits, [{ ...value, mood: 'happy' }])
})

test(
  '기존 직접 수정의 예외도 반환하고 세션 없는 서버 수정은 전송하지 않는다',
  { timeout: 1000 },
  async (t) => {
    let calls = 0
    const fixture = setup(t, {
      getSession: async () => ({ data: { session: null } }),
      fetchImpl: async () => {
        calls++
        return response(outfit(a, 'detail'))
      },
      mutate: async () => {
        throw new Error('legacy unavailable')
      },
    })
    delete process.env.EXPO_PUBLIC_CLOTHIC_API_URL
    assert.ok((await fixture.store.getState().updateDiary('detail', { memo: null })).error)
    process.env.EXPO_PUBLIC_CLOTHIC_API_URL = 'http://server.test'
    assert.ok((await fixture.store.getState().updateDiary('detail', { memo: null })).error)
    assert.equal(calls, 0)
  }
)
