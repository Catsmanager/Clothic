import assert from 'node:assert/strict'
import test from 'node:test'
import {
  fetchOwnedOutfitFromApi,
  fetchOwnedOutfitsFromApi,
  getOutfitsApiBaseUrl,
  parseOutfitsResponse,
  saveOwnedOutfitToApi,
} from '../lib/outfitsApi.ts'

const row = {
  id: 'a',
  userId: 'u',
  date: '2026-11-12',
  mood: 'historical-value',
  weather: null,
  memo: null,
  itemIds: ['top_001', '41111111-1111-4111-8111-111111111111'],
  itemColors: { top_001: '#123456' },
  isFavorite: true,
  createdAt: '2026-11-12T00:00:00Z',
}

test('응답 계약은 과거 ID와 기분 문자열을 보존하고 잘못된 형식은 거부한다', () => {
  assert.deepEqual(parseOutfitsResponse([row]), [row])
  assert.deepEqual(parseOutfitsResponse([]), [])
  for (const invalid of [
    { ...row, itemIds: [1] },
    { ...row, itemColors: [] },
    { ...row, itemColors: { top_001: 1 } },
    { ...row, isFavorite: 'true' },
    { ...row, memo: {} },
    { ...row, userId: undefined },
  ]) {
    assert.equal(parseOutfitsResponse([invalid]), null)
  }
  assert.equal(parseOutfitsResponse({ data: [] }), null)
  assert.equal(getOutfitsApiBaseUrl('  http://server.test/// '), 'http://server.test')
  assert.equal(getOutfitsApiBaseUrl(' '), null)
})

test('인증 실패와 서버 오류 응답은 내부 본문을 노출하지 않는다', async () => {
  for (const status of [401, 500]) {
    const result = await fetchOwnedOutfitsFromApi({
      baseUrl: 'http://server.test',
      accessToken: 'test',
      fetchImpl: async () => new Response('private SQL password', { status }),
    })
    assert.equal(result.outfits, null)
    assert.ok(result.error)
    assert.equal(result.error.includes('password'), false)
  }
})

test('본문 읽기 중에도 시간 제한을 유지한다', async () => {
  const result = await fetchOwnedOutfitsFromApi({
    baseUrl: 'http://server.test',
    accessToken: 'test',
    timeoutMs: 10,
    fetchImpl: async (_url, init) => ({
      status: 200,
      ok: true,
      json: () =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
        }),
    }),
  })
  assert.equal(result.outfits, null)
  assert.match(result.error, /시간을 초과/)
})

test('요청 중 시간 제한과 깨진 JSON도 실패로 반환한다', async () => {
  const result = await fetchOwnedOutfitsFromApi({
    baseUrl: 'http://server.test',
    accessToken: 'test',
    timeoutMs: 10,
    fetchImpl: async (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
      }),
  })
  assert.match(result.error, /시간을 초과/)
  const broken = await fetchOwnedOutfitsFromApi({
    baseUrl: 'http://server.test',
    accessToken: 'test',
    fetchImpl: async () => new Response('{broken'),
  })
  assert.ok(broken.error)
  assert.equal(broken.outfits, null)
})

test('단건 응답은 요청 ID를 확인하고 없는 기록과 실패를 구분한다', async () => {
  const options = { baseUrl: 'http://server.test', accessToken: 'test', outfitId: 'a' }
  assert.deepEqual(
    await fetchOwnedOutfitFromApi({
      ...options,
      fetchImpl: async () => new Response(JSON.stringify(row)),
    }),
    { outfit: row, error: null }
  )
  assert.deepEqual(
    await fetchOwnedOutfitFromApi({
      ...options,
      fetchImpl: async () => new Response('private detail', { status: 404 }),
    }),
    { outfit: null, error: null }
  )
  for (const [body, status] of [
    [row, 401],
    [row, 500],
    [{ ...row, id: 'wrong-id' }, 200],
    [[row], 200],
  ]) {
    const result = await fetchOwnedOutfitFromApi({
      ...options,
      fetchImpl: async () => new Response(JSON.stringify(body), { status }),
    })
    assert.equal(result.outfit, null)
    assert.ok(result.error)
  }
})

test('단건 경로 입력을 인코딩하고 본문 시간 제한을 유지한다', async () => {
  const result = await fetchOwnedOutfitFromApi({
    baseUrl: 'http://server.test',
    accessToken: 'test',
    outfitId: '../other?userId=b',
    timeoutMs: 10,
    fetchImpl: async (url, init) => {
      assert.equal(url, 'http://server.test/api/outfits/..%2Fother%3FuserId%3Db')
      return {
        status: 200,
        ok: true,
        json: () =>
          new Promise((_resolve, reject) => {
            init.signal.addEventListener('abort', () => reject(new Error('aborted')), {
              once: true,
            })
          }),
      }
    },
  })
  assert.equal(result.outfit, null)
  assert.match(result.error, /시간을 초과/)
})

test('저장 요청은 요청 ID와 허용 필드만 전송하고 생성·재시도 응답을 읽는다', async () => {
  const input = {
    requestId: 'a',
    date: row.date,
    mood: 'calm',
    weather: null,
    memo: null,
    itemIds: ['top_001'],
    itemColors: { top_001: '#123456' },
    userId: 'forged',
  }
  for (const status of [201, 200]) {
    const result = await saveOwnedOutfitToApi({
      baseUrl: 'http://server.test',
      accessToken: 'test',
      input,
      fetchImpl: async (url, init) => {
        assert.equal(url, 'http://server.test/api/outfits')
        assert.equal(init.method, 'POST')
        assert.equal(init.headers.Authorization, 'Bearer test')
        const payload = JSON.parse(init.body)
        assert.equal(payload.requestId, 'a')
        assert.equal(Object.hasOwn(payload, 'userId'), false)
        return new Response(JSON.stringify(row), { status })
      },
    })
    assert.equal(result.error, null)
    assert.deepEqual(result.outfit, row)
  }
})

test('저장 충돌·오류·다른 ID 응답은 성공으로 반영하지 않는다', async () => {
  const input = {
    requestId: 'a',
    date: row.date,
    mood: null,
    weather: null,
    memo: null,
    itemIds: ['top_001'],
    itemColors: {},
  }
  for (const [status, body] of [
    [409, { private: true }],
    [500, { private: true }],
    [201, { ...row, id: 'other' }],
  ]) {
    const result = await saveOwnedOutfitToApi({
      baseUrl: 'http://server.test',
      accessToken: 'test',
      input,
      fetchImpl: async () => new Response(JSON.stringify(body), { status }),
    })
    assert.equal(result.outfit, null)
    assert.ok(result.error)
    assert.equal(result.error.includes('private'), false)
  }
})

test('저장 본문 읽기도 시간 제한 안에 끝난다', async () => {
  const input = {
    requestId: 'a',
    date: row.date,
    mood: null,
    weather: null,
    memo: null,
    itemIds: ['top_001'],
    itemColors: {},
  }
  const result = await saveOwnedOutfitToApi({
    baseUrl: 'http://server.test',
    accessToken: 'test',
    input,
    timeoutMs: 10,
    fetchImpl: async (_url, init) => ({
      status: 201,
      ok: true,
      json: () =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
        }),
    }),
  })
  assert.equal(result.outfit, null)
  assert.match(result.error, /시간을 초과/)
})
