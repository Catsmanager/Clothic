import { isCategory, isStyleTag } from '../constants/items'
import type { UserItem } from './wardrobeCatalog'

// Spring Boot 서버의 내 옷 목록 API 호출. 서버 주소가 설정된 경우에만 itemStore가 이 경로를 사용한다.
// 응답은 실행 시점에 검사하며, 앱 mapRow()와 같은 규칙으로 허용하지 않은 카테고리 행은 제외하고 태그는 정리한다.

export const ITEMS_API_TIMEOUT_MS = 10_000

export type ItemsApiResult = { items: UserItem[]; error: null } | { items: null; error: string }

export function getItemsApiBaseUrl(
  raw: string | undefined = process.env.EXPO_PUBLIC_CLOTHIC_API_URL
): string | null {
  const trimmed = raw?.trim() ?? ''
  if (!trimmed) return null
  return trimmed.replace(/\/+$/, '')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}

// 한 행을 UserItem으로 바꾼다. 형식이 깨진 행은 undefined(응답 전체 거부), 허용하지 않은 카테고리는 null(행만 제외).
function parseItem(value: unknown): UserItem | null | undefined {
  if (!isRecord(value)) return undefined
  const { id, userId, catalogItemId, name, category, imagePath, color, styleTags, createdAt } =
    value

  if (
    typeof id !== 'string' ||
    typeof userId !== 'string' ||
    typeof name !== 'string' ||
    typeof category !== 'string' ||
    typeof imagePath !== 'string' ||
    typeof color !== 'string' ||
    typeof createdAt !== 'string' ||
    !isStringArray(styleTags) ||
    !(catalogItemId === null || catalogItemId === undefined || typeof catalogItemId === 'string')
  ) {
    return undefined
  }
  if (!isCategory(category)) return null

  return {
    id,
    userId,
    catalogItemId: catalogItemId ?? null,
    name,
    category,
    imagePath,
    color,
    styleTags: styleTags.filter(isStyleTag),
    createdAt,
  }
}

export function parseItemsResponse(payload: unknown): UserItem[] | null {
  if (!Array.isArray(payload)) return null
  const items: UserItem[] = []
  for (const entry of payload) {
    const item = parseItem(entry)
    if (item === undefined) return null
    if (item) items.push(item)
  }
  return items
}

interface ItemsApiOptions {
  baseUrl: string
  accessToken: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
}

type JsonResult = { payload: unknown; error: null } | { payload: null; error: string }

async function requestItemsJson({
  baseUrl,
  accessToken,
  fetchImpl = fetch,
  timeoutMs = ITEMS_API_TIMEOUT_MS,
  method,
  catalogItemId,
}: ItemsApiOptions & { method: 'GET' | 'POST'; catalogItemId?: string }): Promise<JsonResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const timeoutError =
    method === 'GET'
      ? '옷 목록 요청이 시간을 초과했어요. 다시 시도해주세요.'
      : '옷 추가 요청이 시간을 초과했어요. 다시 시도해주세요.'

  try {
    let response: Response
    try {
      response = await fetchImpl(`${baseUrl}/api/items`, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(method === 'POST' ? { body: JSON.stringify({ catalogItemId }) } : {}),
        signal: controller.signal,
      })
    } catch (error) {
      if (controller.signal.aborted) {
        return { payload: null, error: timeoutError }
      }
      return {
        payload: null,
        error: error instanceof Error && error.message ? error.message : '서버에 연결할 수 없어요.',
      }
    }

    if (response.status === 401) {
      return { payload: null, error: '로그인이 만료되었어요. 다시 로그인해주세요.' }
    }
    if (!response.ok) {
      return {
        payload: null,
        error:
          method === 'GET'
            ? `서버에서 옷 목록을 불러오지 못했어요. (${response.status})`
            : `옷을 추가하지 못했어요. (${response.status})`,
      }
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      if (controller.signal.aborted) {
        return { payload: null, error: timeoutError }
      }
      return { payload: null, error: '서버 응답을 읽지 못했어요.' }
    }
    return { payload, error: null }
  } finally {
    // fetch()는 헤더 수신 시 끝나므로 본문 읽기가 끝날 때까지 제한을 유지한다.
    clearTimeout(timer)
  }
}

export async function fetchOwnedItemsFromApi(options: ItemsApiOptions): Promise<ItemsApiResult> {
  const result = await requestItemsJson({ ...options, method: 'GET' })
  if (result.error !== null) return { items: null, error: result.error }
  const items = parseItemsResponse(result.payload)
  if (!items) return { items: null, error: '서버 응답 형식이 올바르지 않아요.' }
  return { items, error: null }
}

export async function addOwnedCatalogItemFromApi(
  options: ItemsApiOptions & { catalogItemId: string }
): Promise<{ item: UserItem | null; error: string | null }> {
  const result = await requestItemsJson({ ...options, method: 'POST' })
  if (result.error !== null) return { item: null, error: result.error }
  const item = parseItem(result.payload)
  if (!item) return { item: null, error: '서버 응답 형식이 올바르지 않아요.' }
  return { item, error: null }
}
