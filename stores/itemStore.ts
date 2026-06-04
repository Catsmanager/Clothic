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
type ItemInsert = Database['public']['Tables']['items']['Insert']

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

export interface NewItem {
  name: string
  category: Category
  color: string
  styleTags: StyleTag[]
  imagePath?: string
}

type Result = { error: string | null }

interface ItemState {
  items: UserItem[]
  loading: boolean
  error: string | null

  fetchItems: () => Promise<void>
  addItem: (input: NewItem) => Promise<Result>
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
  }
}

export function buildCatalogItems(userItems: UserItem[]): CatalogItem[] {
  return [...ITEMS, ...userItems.map(userItemToCatalogItem)]
}

export function findCatalogItemById(items: CatalogItem[], id: string): CatalogItem | undefined {
  return items.find((item) => item.id === id)
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      set({ loading: false, error: error.message })
      return
    }

    set({
      items: (data ?? []).map(mapRow).filter((item): item is UserItem => item != null),
      loading: false,
    })
  },

  addItem: async (input) => {
    const name = input.name.trim()
    if (name.length === 0) return { error: '아이템 이름을 입력하세요.' }

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return { error: '로그인이 필요합니다.' }

    const payload: ItemInsert = {
      user_id: userId,
      name,
      category: input.category,
      image_path: input.imagePath ?? '',
      color: input.color,
      style_tags: input.styleTags,
    }

    const { data, error } = await supabase.from('items').insert(payload).select().single()
    if (error) return { error: error.message }

    const item = data ? mapRow(data) : null
    if (item) set({ items: [item, ...get().items] })
    return { error: null }
  },
}))
