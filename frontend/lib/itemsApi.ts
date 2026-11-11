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

interface FetchOwnedItemsOptions {
  baseUrl: string
  accessToken: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
}

export async function fetchOwnedItemsFromApi({
  baseUrl,
  accessToken,
  fetchImpl = fetch,
  timeoutMs = ITEMS_API_TIMEOUT_MS,
}: FetchOwnedItemsOptions): Promise<ItemsApiResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    let response: Response
    try {
      response = await fetchImpl(`${baseUrl}/api/items`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
        signal: controller.signal,
      })
    } catch (error) {
      if (controller.signal.aborted) {
        return { items: null, error: '옷 목록 요청이 시간을 초과했어요. 다시 시도해주세요.' }
      }
      return {
        items: null,
        error: error instanceof Error && error.message ? error.message : '서버에 연결할 수 없어요.',
      }
    }

    if (response.status === 401) {
      return { items: null, error: '로그인이 만료되었어요. 다시 로그인해주세요.' }
    }
    if (!response.ok) {
      return { items: null, error: `서버에서 옷 목록을 불러오지 못했어요. (${response.status})` }
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      if (controller.signal.aborted) {
        return { items: null, error: '옷 목록 요청이 시간을 초과했어요. 다시 시도해주세요.' }
      }
      return { items: null, error: '서버 응답을 읽지 못했어요.' }
    }
    const items = parseItemsResponse(payload)
    if (!items) return { items: null, error: '서버 응답 형식이 올바르지 않아요.' }
    return { items, error: null }
  } finally {
    // fetch()는 헤더 수신 시 끝나므로 본문 읽기가 끝날 때까지 제한을 유지한다.
    clearTimeout(timer)
  }
}
