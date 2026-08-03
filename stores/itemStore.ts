import { create } from 'zustand'
import { type CatalogItem, type StyleTag, isCategory, isStyleTag } from '../constants/items'
import type { Database } from '../lib/database.types'
import { supabase } from '../lib/supabase'
import {
  buildAnalyticsCatalogItems,
  buildOwnedCatalogItems,
  buildResolvableCatalogItems,
  userItemToCatalogItem,
  type UserItem,
} from '../lib/wardrobeCatalog'

type ItemRow = Database['public']['Tables']['items']['Row']
type ItemMutationResult = { item: UserItem | null; error: string | null }

export type { UserItem } from '../lib/wardrobeCatalog'
export {
  buildAnalyticsCatalogItems,
  buildOwnedCatalogItems,
  buildResolvableCatalogItems,
  userItemToCatalogItem,
} from '../lib/wardrobeCatalog'

interface ItemState {
  items: UserItem[]
  loading: boolean
  loaded: boolean
  error: string | null

  fetchItems: () => Promise<void>
  addCatalogItem: (item: CatalogItem) => Promise<ItemMutationResult>
  reset: () => void
}

function sanitizeStyleTags(tags: string[] | null): StyleTag[] {
  return (tags ?? []).filter(isStyleTag)
}

function mapRow(row: ItemRow): UserItem | null {
  if (!isCategory(row.category)) return null

  return {
    id: row.id,
    userId: row.user_id,
    // 마이그레이션 적용 전 응답에도 안전하게 null로 폴백한다.
    catalogItemId: row.catalog_item_id ?? null,
    name: row.name,
    category: row.category,
    imagePath: row.image_path,
    color: row.color,
    styleTags: sanitizeStyleTags(row.style_tags),
    createdAt: row.created_at,
  }
}

export function findCatalogItemById(items: CatalogItem[], id: string): CatalogItem | undefined {
  return items.find((item) => item.id === id)
}

let storeGeneration = 0
let fetchSequence = 0

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  error: null,

  reset: () => {
    storeGeneration += 1
    fetchSequence += 1
    set({ items: [], loading: false, loaded: false, error: null })
  },

  addCatalogItem: async (catalogItem) => {
    const existing = get().items.find((item) => item.catalogItemId === catalogItem.id)
    if (existing) return { item: existing, error: null }

    const generation = storeGeneration
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      return { item: null, error: authError?.message ?? '로그인이 필요해요.' }
    }

    const payload: Database['public']['Tables']['items']['Insert'] = {
      user_id: authData.user.id,
      catalog_item_id: catalogItem.id,
      name: catalogItem.name,
      category: catalogItem.category,
      image_path: catalogItem.imagePath,
      color: catalogItem.color,
      style_tags: catalogItem.styleTags,
    }
    const { data, error } = await supabase.from('items').insert(payload).select().single()

    if (generation !== storeGeneration) {
      return { item: null, error: '계정이 변경되어 옷 추가를 취소했어요.' }
    }

    if (error) {
      if (error.code === '23505') {
        await get().fetchItems()
        const duplicate = get().items.find((item) => item.catalogItemId === catalogItem.id)
        return duplicate
          ? { item: duplicate, error: null }
          : { item: null, error: '이미 추가된 옷을 불러오지 못했어요. 다시 시도해주세요.' }
      }
      return { item: null, error: error.message }
    }

    const item = mapRow(data)
    if (!item) return { item: null, error: '추가한 옷의 정보를 읽지 못했어요.' }

    set((state) => ({
      items: [item, ...state.items.filter((candidate) => candidate.id !== item.id)],
      loaded: true,
      error: null,
    }))
    return { item, error: null }
  },

  fetchItems: async () => {
    const generation = storeGeneration
    const requestSequence = (fetchSequence += 1)
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      if (generation !== storeGeneration || requestSequence !== fetchSequence) return
      set({ loading: false, error: error.message })
      return
    }

    if (generation !== storeGeneration || requestSequence !== fetchSequence) return
    set({
      items: (data ?? []).map(mapRow).filter((item): item is UserItem => item != null),
      loading: false,
      loaded: true,
      error: null,
    })
  },
}))
