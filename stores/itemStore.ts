import { create } from 'zustand'
import {
  ITEMS,
  type CatalogItem,
  type Category,
  type StyleTag,
  isCategory,
  isStyleTag,
} from '../constants/items'
import type { Database } from '../lib/database.types'
import { supabase } from '../lib/supabase'

type ItemRow = Database['public']['Tables']['items']['Row']

export interface UserItem {
  id: string
  userId: string
  name: string
  category: Category
  imagePath: string
  color: string
  styleTags: StyleTag[]
  createdAt: string
}

interface ItemState {
  items: UserItem[]
  loading: boolean
  loaded: boolean
  error: string | null

  fetchItems: () => Promise<void>
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
    name: row.name,
    category: row.category,
    imagePath: row.image_path,
    color: row.color,
    styleTags: sanitizeStyleTags(row.style_tags),
    createdAt: row.created_at,
  }
}

export function userItemToCatalogItem(item: UserItem): CatalogItem {
  return {
    id: item.id,
    category: item.category,
    subCategory: '내 아이템',
    name: item.name,
    color: item.color,
    imagePath: item.imagePath,
    styleTags: item.styleTags,
    // 사용자 등록 아이템은 계절 메타데이터가 없으므로 사철(all)로 둔다.
    seasons: ['all'],
  }
}

export function buildCatalogItems(userItems: UserItem[]): CatalogItem[] {
  return [...ITEMS, ...userItems.map(userItemToCatalogItem)]
}

export function findCatalogItemById(items: CatalogItem[], id: string): CatalogItem | undefined {
  return items.find((item) => item.id === id)
}

let storeGeneration = 0
let fetchSequence = 0

export const useItemStore = create<ItemState>((set) => ({
  items: [],
  loading: false,
  loaded: false,
  error: null,

  reset: () => {
    storeGeneration += 1
    fetchSequence += 1
    set({ items: [], loading: false, loaded: false, error: null })
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
