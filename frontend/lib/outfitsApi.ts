import type { Mood, Outfit, Weather } from '../stores/outfitStore'

export const OUTFITS_API_TIMEOUT_MS = 10_000

export function getOutfitsApiBaseUrl(
  raw: string | undefined = process.env.EXPO_PUBLIC_CLOTHIC_API_URL
): string | null {
  return raw?.trim().replace(/\/+$/, '') || null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseOutfitsResponse(payload: unknown): Outfit[] | null {
  if (!Array.isArray(payload)) return null
  const outfits: Outfit[] = []
  for (const row of payload) {
    if (!isRecord(row)) return null
    const { id, userId, date, mood, weather, memo, itemIds, itemColors, isFavorite, createdAt } =
      row
    if (
      typeof id !== 'string' ||
      typeof userId !== 'string' ||
      typeof date !== 'string' ||
      !(mood === null || typeof mood === 'string') ||
      !(weather === null || typeof weather === 'string') ||
      !(memo === null || typeof memo === 'string') ||
      !Array.isArray(itemIds) ||
      !itemIds.every((value): value is string => typeof value === 'string') ||
      !isRecord(itemColors) ||
      !Object.values(itemColors).every((value) => typeof value === 'string') ||
      typeof isFavorite !== 'boolean' ||
      typeof createdAt !== 'string'
    ) {
      return null
    }
    outfits.push({
      id,
      userId,
      date,
      // 기존 mapRow와 같이 과거 기분·날씨 문자열도 보존한다.
      mood: mood as Mood | null,
      weather: weather as Weather | null,
      memo,
      itemIds,
      itemColors: itemColors as Record<string, string>,
      isFavorite,
      createdAt,
    })
  }
  return outfits
}

interface OutfitsApiOptions {
  baseUrl: string
  accessToken: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
}

type JsonResult =
  | { payload: unknown; error: null; notFound: false }
  | { payload: null; error: null; notFound: true }
  | { payload: null; error: string; notFound: false }

async function requestOutfitJson({
  baseUrl,
  accessToken,
  fetchImpl = fetch,
  timeoutMs = OUTFITS_API_TIMEOUT_MS,
  outfitId,
}: OutfitsApiOptions & { outfitId?: string }): Promise<JsonResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const label = outfitId === undefined ? '코디 목록' : '코디'
  const objectLabel = outfitId === undefined ? '코디 목록을' : '코디를'
  try {
    const path =
      outfitId === undefined ? '/api/outfits' : `/api/outfits/${encodeURIComponent(outfitId)}`
    const response = await fetchImpl(`${baseUrl}${path}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      signal: controller.signal,
    })
    if (response.status === 401) {
      return {
        payload: null,
        error: '로그인이 만료되었어요. 다시 로그인해주세요.',
        notFound: false,
      }
    }
    if (response.status === 404 && outfitId !== undefined) {
      return { payload: null, error: null, notFound: true }
    }
    if (!response.ok) {
      return {
        payload: null,
        error: `${objectLabel} 불러오지 못했어요. (${response.status})`,
        notFound: false,
      }
    }
    const payload: unknown = await response.json()
    return { payload, error: null, notFound: false }
  } catch {
    return {
      payload: null,
      error: controller.signal.aborted
        ? `${label} 요청이 시간을 초과했어요. 다시 시도해주세요.`
        : `${objectLabel} 불러오지 못했어요. 다시 시도해주세요.`,
      notFound: false,
    }
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchOwnedOutfitsFromApi(
  options: OutfitsApiOptions
): Promise<{ outfits: Outfit[]; error: null } | { outfits: null; error: string }> {
  const result = await requestOutfitJson(options)
  if (result.error !== null) return { outfits: null, error: result.error }
  const outfits = parseOutfitsResponse(result.payload)
  if (!outfits) return { outfits: null, error: '서버 응답 형식이 올바르지 않아요.' }
  return { outfits, error: null }
}

export async function fetchOwnedOutfitFromApi(
  options: OutfitsApiOptions & { outfitId: string }
): Promise<{ outfit: Outfit | null; error: string | null }> {
  const result = await requestOutfitJson(options)
  if (result.error !== null || result.notFound) return { outfit: null, error: result.error }
  const parsed = parseOutfitsResponse([result.payload])
  const outfit = parsed?.[0]
  if (!outfit || outfit.id.toLowerCase() !== options.outfitId.toLowerCase()) {
    return { outfit: null, error: '서버 응답 형식이 올바르지 않아요.' }
  }
  return { outfit, error: null }
}
