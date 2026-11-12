import assert from 'node:assert/strict'
import test from 'node:test'
import {
  fetchOwnedOutfitsFromApi,
  getOutfitsApiBaseUrl,
  parseOutfitsResponse,
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
