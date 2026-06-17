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

interface OutfitState {
  outfits: Outfit[]
  loading: boolean
  error: string | null

  fetchOutfits: () => Promise<void>
  addOutfit: (input: NewOutfit) => Promise<Result>
  toggleFavorite: (id: string, next: boolean) => Promise<Result>
  removeOutfit: (id: string) => Promise<Result>
}

export const useOutfitStore = create<OutfitState>((set, get) => ({
  outfits: [],
  loading: false,
  error: null,

  // 로그인 사용자의 코디를 최신순으로 불러온다. (RLS가 본인 데이터만 반환)
  fetchOutfits: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('outfits')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      set({ loading: false, error: error.message })
      return
    }
    set({ outfits: (data ?? []).map(mapRow), loading: false })
  },

  // 코디 저장: 현재 로그인 사용자로 insert하고 목록 맨 앞에 반영한다.
  addOutfit: async (input) => {
    const { data: userData } = await supabase.auth.getUser()
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
    if (error) return { error: error.message }
    if (data) set({ outfits: [mapRow(data), ...get().outfits] })
    return { error: null }
  },

  // 즐겨찾기 토글: 낙관적 업데이트 후 실패 시 롤백한다.
  toggleFavorite: async (id, next) => {
    const prev = get().outfits
    set({
      outfits: prev.map((o) => (o.id === id ? { ...o, isFavorite: next } : o)),
    })

    const patch: OutfitUpdate = { is_favorite: next }
    const { error } = await supabase.from('outfits').update(patch).eq('id', id)
    if (error) {
      set({ outfits: prev }) // 롤백
      return { error: error.message }
    }
    return { error: null }
  },

  removeOutfit: async (id) => {
    const prev = get().outfits
    set({ outfits: prev.filter((o) => o.id !== id) })

    const { error } = await supabase.from('outfits').delete().eq('id', id)
    if (error) {
      set({ outfits: prev }) // 롤백
      return { error: error.message }
    }
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
