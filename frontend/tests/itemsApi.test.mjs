import assert from 'node:assert/strict'
import test from 'node:test'
import {
  addOwnedCatalogItemFromApi,
  fetchOwnedItemsFromApi,
  getItemsApiBaseUrl,
  parseItemsResponse,
} from '../lib/itemsApi.ts'

const validRow = {
  id: '4aaaaaaa-0000-4000-8000-000000000002',
  userId: '41111111-1111-4111-8111-111111111111',
  catalogItemId: 'shoes_002_white',
  name: '흰 운동화',
  category: 'shoes',
  imagePath: '',
  color: '#FFFFFF',
  styleTags: ['sporty', 'not-a-tag'],
  createdAt: '2026-07-02T00:00:00Z',
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

test('서버 주소 설정이 비어 있으면 새 경로를 쓰지 않는다', () => {
  assert.equal(getItemsApiBaseUrl(undefined), null)
  assert.equal(getItemsApiBaseUrl('   '), null)
  assert.equal(getItemsApiBaseUrl('http://10.0.0.5:8080/'), 'http://10.0.0.5:8080')
})

test('응답 행은 UserItem으로 바뀌고 비허용 태그는 제거된다', () => {
  const items = parseItemsResponse([validRow])
  assert.equal(items?.length, 1)
  assert.deepEqual(items?.[0], { ...validRow, styleTags: ['sporty'] })
})

test('비허용 카테고리 행은 제외하고 catalogItemId 누락은 null로 본다', () => {
  const items = parseItemsResponse([
    { ...validRow, id: 'x1', category: 'hat' },
    { ...validRow, id: 'x2', catalogItemId: undefined },
  ])
  assert.deepEqual(
    items?.map((item) => [item.id, item.catalogItemId]),
    [['x2', null]]
  )
})

test('형식이 깨진 응답은 전체를 거부한다', () => {
  assert.equal(parseItemsResponse({ items: [] }), null)
  assert.equal(parseItemsResponse([{ ...validRow, styleTags: 'sporty' }]), null)
  assert.equal(parseItemsResponse([{ ...validRow, createdAt: 123 }]), null)
  assert.deepEqual(parseItemsResponse([]), [])
})

test('토큰과 함께 /api/items 를 호출하고 결과를 돌려준다', async () => {
  let seen = null
  const result = await fetchOwnedItemsFromApi({
    baseUrl: 'http://server.test',
    accessToken: 'token-123',
    fetchImpl: async (url, init) => {
      seen = { url, headers: init.headers }
      return jsonResponse([validRow])
    },
  })
  assert.equal(seen.url, 'http://server.test/api/items')
  assert.equal(seen.headers.Authorization, 'Bearer token-123')
  assert.equal(result.error, null)
  assert.equal(result.items?.length, 1)
})

test('401·5xx·형식 오류·연결 실패는 사용자에게 보일 오류 메시지로 끝난다', async () => {
  const unauthorized = await fetchOwnedItemsFromApi({
    baseUrl: 'http://s',
    accessToken: 't',
    fetchImpl: async () => jsonResponse({}, 401),
  })
  assert.equal(unauthorized.items, null)
  assert.match(unauthorized.error, /로그인/)

  const serverError = await fetchOwnedItemsFromApi({
    baseUrl: 'http://s',
    accessToken: 't',
    fetchImpl: async () => jsonResponse({ error: 'select * from items' }, 500),
  })
  assert.equal(serverError.items, null)
  assert.match(serverError.error, /500/)
  assert.doesNotMatch(serverError.error, /select/)

  const malformed = await fetchOwnedItemsFromApi({
    baseUrl: 'http://s',
    accessToken: 't',
    fetchImpl: async () => jsonResponse({ items: [] }),
  })
  assert.match(malformed.error, /형식/)

  const offline = await fetchOwnedItemsFromApi({
    baseUrl: 'http://s',
    accessToken: 't',
    fetchImpl: async () => {
      throw new TypeError('Network request failed')
    },
  })
  assert.equal(offline.items, null)
  assert.equal(offline.error, 'Network request failed')
})

test('시간 제한을 넘기면 요청을 중단하고 오류를 돌려준다', async () => {
  const result = await fetchOwnedItemsFromApi({
    baseUrl: 'http://s',
    accessToken: 't',
    timeoutMs: 10,
    fetchImpl: (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () => reject(new Error('aborted')))
      }),
  })
  assert.equal(result.items, null)
  assert.match(result.error, /시간을 초과/)
})

test('헤더를 받은 뒤 본문 수신이 멈춰도 시간 제한 안에 종료한다', async () => {
  let rejectBody
  let watchdog
  const pending = fetchOwnedItemsFromApi({
    baseUrl: 'http://s',
    accessToken: 't',
    timeoutMs: 10,
    fetchImpl: async (_url, init) => ({
      ok: true,
      status: 200,
      json: () =>
        new Promise((_resolve, reject) => {
          rejectBody = reject
          init.signal.addEventListener('abort', () => reject(new Error('aborted')))
        }),
    }),
  })
  try {
    const result = await Promise.race([
      pending,
      new Promise((resolve) => {
        watchdog = setTimeout(() => resolve({ error: 'body timeout was not enforced' }), 500)
      }),
    ])
    assert.match(result.error, /시간을 초과/)
  } finally {
    clearTimeout(watchdog)
    rejectBody?.(new Error('test cleanup'))
    await pending
  }
})

test('추가 요청은 메타데이터 대신 카탈로그 ID와 토큰만 보내고 생성·중복 응답을 읽는다', async () => {
  for (const status of [201, 200]) {
    const result = await addOwnedCatalogItemFromApi({
      baseUrl: 'http://server.test',
      accessToken: 'test-token',
      catalogItemId: 'shoes_002_white',
      fetchImpl: async (url, init) => {
        assert.equal(url, 'http://server.test/api/items')
        assert.equal(init.method, 'POST')
        assert.equal(init.headers.Authorization, 'Bearer test-token')
        assert.equal(init.headers['Content-Type'], 'application/json')
        assert.deepEqual(JSON.parse(init.body), { catalogItemId: 'shoes_002_white' })
        return jsonResponse(validRow, status)
      },
    })
    assert.equal(result.error, null)
    assert.equal(result.item.id, validRow.id)
    assert.deepEqual(result.item.styleTags, ['sporty'])
  }
})

test('추가 응답의 잘못된 형식과 서버 실패는 성공으로 반영하지 않는다', async () => {
  for (const payload of [[], { ...validRow, category: 'hat' }, { ...validRow, id: null }]) {
    const result = await addOwnedCatalogItemFromApi({
      baseUrl: 'http://server.test',
      accessToken: 'test-token',
      catalogItemId: 'shoes_002_white',
      fetchImpl: async () => jsonResponse(payload, 201),
    })
    assert.equal(result.item, null)
    assert.match(result.error, /형식/)
  }
  const failure = await addOwnedCatalogItemFromApi({
    baseUrl: 'http://server.test',
    accessToken: 'test-token',
    catalogItemId: 'shoes_002_white',
    fetchImpl: async () => jsonResponse({ error: 'insert into items' }, 500),
  })
  assert.equal(failure.item, null)
  assert.match(failure.error, /500/)
  assert.doesNotMatch(failure.error, /insert/)
})
