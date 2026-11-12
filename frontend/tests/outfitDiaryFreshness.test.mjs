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

const value = {
  id: 'detail',
  userId: 'user-a',
  date: '2026-11-12',
  mood: 'calm',
  weather: null,
  memo: '이전 메모',
  itemIds: ['top_001'],
  itemColors: {},
  isFavorite: false,
  createdAt: '2026-11-12T00:00:00Z',
}
const response = (body, status = 200) => new Response(JSON.stringify(body), { status })
function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
function setup(t, handler) {
  const url = process.env.EXPO_PUBLIC_CLOTHIC_API_URL
  const fetch = globalThis.fetch
  process.env.EXPO_PUBLIC_CLOTHIC_API_URL = 'http://server.test'
  globalThis.fetch = handler
  t.after(() => {
    globalThis.fetch = fetch
    if (url === undefined) delete process.env.EXPO_PUBLIC_CLOTHIC_API_URL
    else process.env.EXPO_PUBLIC_CLOTHIC_API_URL = url
  })
  const supabase = {
    auth: { getSession: async () => ({ data: { session: { access_token: 'test' } } }) },
    from: () => ({ delete: () => ({ eq: async () => ({ error: { message: 'delete failed' } }) }) }),
  }
  return loadStore('../stores/outfitStore.ts', { '../lib/supabase': { supabase } }).useOutfitStore
}

test(
  '재조회 뒤 수정이 실패해도 재조회한 최신 메모를 오래된 확인 값으로 덮지 않는다',
  { timeout: 1000 },
  async (t) => {
    let call = 0
    const latest = { ...value, mood: 'happy', memo: '다른 기기에서 바뀐 메모' }
    const store = setup(
      t,
      async () =>
        [response({ ...value, mood: 'happy' }), response([latest]), response({}, 500)][call++]
    )
    store.setState({ outfits: [value] })
    await store.getState().updateDiary('detail', { mood: 'happy' })
    await store.getState().fetchOutfits()
    assert.ok((await store.getState().updateDiary('detail', { memo: '실패할 변경' })).error)
    assert.deepEqual(store.getState().outfits, [latest])
  }
)

test(
  '먼저 시작한 상세 응답은 그 뒤 성공한 수정 값을 빈 store에서도 덮지 않는다',
  { timeout: 1000 },
  async (t) => {
    const held = deferred()
    const started = deferred()
    const store = setup(t, async (_url, init) => {
      if (init.method === 'GET') {
        started.resolve()
        return held.promise
      }
      return response({ ...value, mood: 'happy' })
    })
    const pending = store.getState().fetchOutfitById('detail')
    await started.promise
    assert.equal((await store.getState().updateDiary('detail', { mood: 'happy' })).error, null)
    held.resolve(response(value))
    assert.equal((await pending).found, true)
    assert.equal(store.getState().outfits[0].mood, 'happy')
  }
)

test('재조회 뒤 삭제가 실패하면 최근 메모를 그대로 복원한다', { timeout: 1000 }, async (t) => {
  const latest = { ...value, mood: 'happy', memo: '재조회한 메모' }
  let call = 0
  const store = setup(t, async () =>
    call++ === 0 ? response({ ...value, mood: 'happy' }) : response([latest])
  )
  store.setState({ outfits: [value] })
  await store.getState().updateDiary('detail', { mood: 'happy' })
  await store.getState().fetchOutfits()
  assert.ok((await store.getState().removeOutfit('detail')).error)
  assert.deepEqual(store.getState().outfits, [latest])
})
