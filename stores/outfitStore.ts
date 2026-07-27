import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

// DB(snake_case) Row를 앱(camelCase) 모델로 매핑한다. (DATA_MODEL.md 기준)
type OutfitRow = Database['public']['Tables']['outfits']['Row']
type OutfitInsert = Database['public']['Tables']['outfits']['Insert']
type OutfitUpdate = Database['public']['Tables']['outfits']['Update']

// 코디 저장 입력 (신규 저장 시 화면에서 받는 값)
export interface NewOutfit {
  date: string // YYYY-MM-DD
  mood: Mood | null
  weather: Weather | null
  memo: string | null
  itemIds: string[]
  // 코디 저장 시 사용자가 고른 아이템별 색상 (itemId → hex). 미선택 아이템은 키 없음.
  itemColors: Record<string, string>
}

export type Mood = 'happy' | 'confident' | 'cozy' | 'tired' | 'excited' | 'calm'
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'hot' | 'cold' | 'windy'

export interface Outfit {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  mood: Mood | null
  weather: Weather | null
  memo: string | null
  itemIds: string[]
  itemColors: Record<string, string>
  isFavorite: boolean
  createdAt: string
}

function mapRow(row: OutfitRow): Outfit {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    mood: (row.mood as Mood | null) ?? null,
    weather: (row.weather as Weather | null) ?? null,
    memo: row.memo,
    itemIds: row.item_ids ?? [],
    // item_colors 컬럼이 없거나 비어 있는 DB/과거 코디도 깨지지 않도록 방어한다(undefined → {}).
    itemColors: row.item_colors ?? {},
    // is_favorite 컬럼이 아직 없는 DB도 깨지지 않도록 방어한다(undefined → false).
    isFavorite: row.is_favorite ?? false,
    createdAt: row.created_at,
  }
}

type Result = { error: string | null }
type FetchOutfitResult = Result & { found: boolean }
type DiaryPatch = {
  mood?: Mood | null
  memo?: string | null
}

interface OutfitState {
  outfits: Outfit[]
  loading: boolean
  loaded: boolean
  error: string | null

  fetchOutfits: () => Promise<void>
  fetchOutfitById: (id: string) => Promise<FetchOutfitResult>
  addOutfit: (input: NewOutfit) => Promise<Result>
  updateDiary: (id: string, patch: DiaryPatch) => Promise<Result>
  toggleFavorite: (id: string, next: boolean) => Promise<Result>
  removeOutfit: (id: string) => Promise<Result>
  reset: () => void
}

let storeGeneration = 0
let fetchSequence = 0
let mutationSequence = 0
const mutationVersions = new Map<string, number>()
const mutationQueues = new Map<string, Promise<void>>()
const blockedOutfitIds = new Map<string, number>()
const pendingFavoriteValues = new Map<string, { version: number; value: boolean }>()
const confirmedFavoriteValues = new Map<string, boolean>()
const locallyAddedOutfits = new Map<string, Outfit>()
const deletedOutfitIds = new Set<string>()

function beginMutation(key: string): number {
  const version = (mutationSequence += 1)
  mutationVersions.set(key, version)
  return version
}

function isCurrentMutation(key: string, version: number): boolean {
  return mutationVersions.get(key) === version
}

async function enqueueMutation<T>(key: string, operation: () => Promise<T>): Promise<T> {
  const previous = mutationQueues.get(key) ?? Promise.resolve()
  const queued = previous.then(operation, operation)
  const completion = queued.then(
    () => undefined,
    () => undefined
  )
  mutationQueues.set(key, completion)

  try {
    return await queued
  } finally {
    if (mutationQueues.get(key) === completion) mutationQueues.delete(key)
  }
}

export const useOutfitStore = create<OutfitState>((set, get) => ({
  outfits: [],
  loading: false,
  loaded: false,
  error: null,

  reset: () => {
    storeGeneration += 1
    fetchSequence += 1
    mutationVersions.clear()
    mutationQueues.clear()
    blockedOutfitIds.clear()
    pendingFavoriteValues.clear()
    confirmedFavoriteValues.clear()
    locallyAddedOutfits.clear()
    deletedOutfitIds.clear()
    set({ outfits: [], loading: false, loaded: false, error: null })
  },

  // 로그인 사용자의 코디를 최신순으로 불러온다. (RLS가 본인 데이터만 반환)
  fetchOutfits: async () => {
    const generation = storeGeneration
    const requestSequence = (fetchSequence += 1)
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('outfits')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      if (generation !== storeGeneration || requestSequence !== fetchSequence) return
      set({ loading: false, error: error.message })
      return
    }
    if (generation !== storeGeneration || requestSequence !== fetchSequence) return
    const fetchedOutfits = (data ?? [])
      .map(mapRow)
      .filter((outfit) => !blockedOutfitIds.has(outfit.id))
      .map((outfit) => {
        locallyAddedOutfits.delete(outfit.id)
        const pendingFavorite = pendingFavoriteValues.get(outfit.id)
        if (pendingFavorite) {
          return { ...outfit, isFavorite: pendingFavorite.value }
        }
        confirmedFavoriteValues.set(outfit.id, outfit.isFavorite)
        return outfit
      })
    const fetchedIds = new Set(fetchedOutfits.map((outfit) => outfit.id))
    const currentById = new Map(get().outfits.map((outfit) => [outfit.id, outfit]))
    const localOnlyOutfits = [...locallyAddedOutfits.values()]
      .filter((outfit) => !fetchedIds.has(outfit.id) && !blockedOutfitIds.has(outfit.id))
      .map((outfit) => currentById.get(outfit.id) ?? outfit)

    set({
      outfits: [...localOnlyOutfits, ...fetchedOutfits],
      loading: false,
      loaded: true,
      error: null,
    })
  },

  // 상세 딥링크/새로고침처럼 메모리 목록이 비어 있어도 id 한 건을 복원한다.
  fetchOutfitById: async (id) => {
    const generation = storeGeneration
    if (blockedOutfitIds.has(id)) return { error: null, found: false }

    const { data, error } = await supabase.from('outfits').select('*').eq('id', id).maybeSingle()

    if (generation !== storeGeneration) return { error: null, found: false }
    if (blockedOutfitIds.has(id)) return { error: null, found: false }
    // 단건 조회를 기다리는 동안 full fetch나 mutation이 같은 row를 채웠다면 현재 store가
    // 더 최신인 사용자 상태다. 먼저 시작한 SELECT 결과로 다시 덮지 않는다.
    if (get().outfits.some((outfit) => outfit.id === id)) {
      return { error: null, found: true }
    }
    if (error) return { error: error.message, found: false }
    if (!data) return { error: null, found: false }

    const mappedOutfit = mapRow(data)
    const pendingFavorite = pendingFavoriteValues.get(id)
    if (!pendingFavorite) confirmedFavoriteValues.set(id, mappedOutfit.isFavorite)
    const outfit = pendingFavorite
      ? { ...mappedOutfit, isFavorite: pendingFavorite.value }
      : mappedOutfit
    set({ outfits: [outfit, ...get().outfits.filter((item) => item.id !== outfit.id)] })
    return { error: null, found: true }
  },

  // 코디 저장: 현재 로그인 사용자로 insert하고 목록 맨 앞에 반영한다.
  addOutfit: async (input) => {
    const generation = storeGeneration
    const { data: userData } = await supabase.auth.getUser()
    if (generation !== storeGeneration) {
      return { error: '계정이 변경되었습니다. 다시 시도해주세요.' }
    }
    const userId = userData.user?.id
    if (!userId) return { error: '로그인이 필요합니다.' }

    const payload: OutfitInsert = {
      user_id: userId,
      date: input.date,
      mood: input.mood,
      weather: input.weather,
      memo: input.memo,
      item_ids: input.itemIds,
      item_colors: input.itemColors,
    }

    const { data, error } = await supabase.from('outfits').insert(payload).select().single()
    if (generation !== storeGeneration) {
      return { error: '계정이 변경되었습니다. 저장 결과를 다시 확인해주세요.' }
    }
    if (error) return { error: error.message }
    if (data) {
      blockedOutfitIds.delete(data.id)
      deletedOutfitIds.delete(data.id)
      const outfit = mapRow(data)
      confirmedFavoriteValues.set(outfit.id, outfit.isFavorite)
      locallyAddedOutfits.set(outfit.id, outfit)
      set({
        outfits: [outfit, ...get().outfits.filter((current) => current.id !== outfit.id)],
      })
    }
    return { error: null }
  },

  updateDiary: async (id, patch) => {
    const generation = storeGeneration
    const mutationKey = `${id}:diary`
    const mutationVersion = beginMutation(mutationKey)
    fetchSequence += 1
    set({ loading: false })
    const update: OutfitUpdate = {}
    if (patch.mood !== undefined) update.mood = patch.mood
    if (patch.memo !== undefined) update.memo = patch.memo

    const errorMessage = await enqueueMutation(mutationKey, async () => {
      if (generation !== storeGeneration) return null
      const { error } = await supabase.from('outfits').update(update).eq('id', id)
      return error?.message ?? null
    })
    if (generation !== storeGeneration) return { error: null }
    if (!isCurrentMutation(mutationKey, mutationVersion)) return { error: null }
    fetchSequence += 1
    if (errorMessage) return { error: errorMessage }

    set({
      loading: false,
      outfits: get().outfits.map((outfit) => (outfit.id === id ? { ...outfit, ...patch } : outfit)),
    })
    return { error: null }
  },

  // 즐겨찾기 토글: 낙관적 업데이트 후 실패 시 롤백한다.
  toggleFavorite: async (id, next) => {
    const generation = storeGeneration
    const mutationKey = `${id}:favorite`
    const mutationVersion = beginMutation(mutationKey)
    const previousFavorite = get().outfits.find((outfit) => outfit.id === id)?.isFavorite
    if (previousFavorite !== undefined && !confirmedFavoriteValues.has(id)) {
      confirmedFavoriteValues.set(id, previousFavorite)
    }
    pendingFavoriteValues.set(id, { version: mutationVersion, value: next })
    fetchSequence += 1
    set({
      loading: false,
      outfits: get().outfits.map((o) => (o.id === id ? { ...o, isFavorite: next } : o)),
    })

    const patch: OutfitUpdate = { is_favorite: next }
    const errorMessage = await enqueueMutation(mutationKey, async () => {
      if (generation !== storeGeneration) return null
      const { error } = await supabase.from('outfits').update(patch).eq('id', id)
      if (!error && generation === storeGeneration && !deletedOutfitIds.has(id)) {
        confirmedFavoriteValues.set(id, next)
      }
      return error?.message ?? null
    })
    if (generation !== storeGeneration) return { error: errorMessage }
    if (!isCurrentMutation(mutationKey, mutationVersion)) return { error: null }
    fetchSequence += 1
    if (pendingFavoriteValues.get(id)?.version === mutationVersion) {
      pendingFavoriteValues.delete(id)
    }
    if (errorMessage) {
      const confirmedFavorite = confirmedFavoriteValues.get(id)
      if (confirmedFavorite !== undefined) {
        set({
          loading: false,
          outfits: get().outfits.map((outfit) =>
            outfit.id === id ? { ...outfit, isFavorite: confirmedFavorite } : outfit
          ),
        })
      }
      return { error: errorMessage }
    }
    set({ loading: false })
    return { error: null }
  },

  removeOutfit: async (id) => {
    const generation = storeGeneration
    const mutationKey = `${id}:delete`
    const mutationVersion = beginMutation(mutationKey)
    const previousOutfits = get().outfits
    const removedIndex = previousOutfits.findIndex((outfit) => outfit.id === id)
    const removedOutfit = removedIndex >= 0 ? previousOutfits[removedIndex] : undefined

    const wasLocallyAdded = locallyAddedOutfits.has(id)
    blockedOutfitIds.set(id, mutationVersion)
    locallyAddedOutfits.delete(id)
    fetchSequence += 1
    set({ outfits: previousOutfits.filter((o) => o.id !== id), loading: false })

    const { error } = await supabase.from('outfits').delete().eq('id', id)
    if (generation !== storeGeneration) return { error: error?.message ?? null }
    if (!isCurrentMutation(mutationKey, mutationVersion)) return { error: null }
    fetchSequence += 1
    if (error) {
      if (blockedOutfitIds.get(id) === mutationVersion) blockedOutfitIds.delete(id)
      if (removedOutfit) {
        const restoredFavorite =
          pendingFavoriteValues.get(id)?.value ??
          confirmedFavoriteValues.get(id) ??
          removedOutfit.isFavorite
        const restoredOutfit = { ...removedOutfit, isFavorite: restoredFavorite }
        if (wasLocallyAdded) locallyAddedOutfits.set(id, restoredOutfit)
        set({
          loading: false,
          outfits: (() => {
            const current = get().outfits
            if (current.some((outfit) => outfit.id === id)) return current
            const next = [...current]
            next.splice(Math.min(removedIndex, next.length), 0, restoredOutfit)
            return next
          })(),
        })
      }
      return { error: error.message }
    }
    deletedOutfitIds.add(id)
    confirmedFavoriteValues.delete(id)
    pendingFavoriteValues.delete(id)
    locallyAddedOutfits.delete(id)
    set({ loading: false })
    return { error: null }
  },
}))

// 화면 표시용 라벨 (DATA_MODEL Mood/Weather → 한글)
export const MOOD_LABELS: Record<Mood, string> = {
  happy: '😊 좋음',
  confident: '😎 자신감',
  cozy: '🧸 포근함',
  tired: '😪 피곤함',
  excited: '🤩 신남',
  calm: '🌿 차분함',
}

export const WEATHER_LABELS: Record<Weather, string> = {
  sunny: '☀️ 맑음',
  cloudy: '⛅ 흐림',
  rainy: '🌧️ 비',
  snowy: '❄️ 눈',
  hot: '🔥 더움',
  cold: '🥶 추움',
  windy: '💨 바람',
}
