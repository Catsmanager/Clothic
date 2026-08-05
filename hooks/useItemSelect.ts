import { useEffect, useMemo, useState } from 'react'
import {
  ITEMS,
  type CatalogItem,
  CATEGORY_LABELS,
  SUB_CATEGORIES,
  isCategory,
} from '../constants/items'
import { buildOwnedCatalogItems, useItemStore } from '../stores/itemStore'

interface Params {
  category?: string
  mode?: string
}

export type ItemSourceMode = 'closet' | 'catalog'

export function useItemSelect(params: Params) {
  const userItems = useItemStore((s) => s.items)
  const fetchItems = useItemStore((s) => s.fetchItems)
  const loading = useItemStore((s) => s.loading)
  const loaded = useItemStore((s) => s.loaded)
  const error = useItemStore((s) => s.error)
  const category = isCategory(params.category) ? params.category : 'top'
  const initialMode: ItemSourceMode = params.mode === 'catalog' ? 'catalog' : 'closet'
  const [mode, setModeState] = useState<ItemSourceMode>(initialMode)
  const [activeSubCategory, setActiveSubCategory] = useState<string>('전체')

  const ownedItems = useMemo(() => buildOwnedCatalogItems(userItems), [userItems])
  const sourceItems = mode === 'catalog' ? ITEMS : ownedItems
  const subCategories = SUB_CATEGORIES[category] ?? ['전체']
  const categoryLabel = CATEGORY_LABELS[category] ?? ''

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const filteredItems: CatalogItem[] = useMemo(
    () =>
      sourceItems.filter(
        (item) =>
          item.category === category &&
          (activeSubCategory === '전체' || item.subCategory === activeSubCategory)
      ),
    [activeSubCategory, category, sourceItems]
  )

  const ownedCatalogItemIds = useMemo(
    () =>
      new Set(
        userItems.flatMap((item) => (item.catalogItemId == null ? [] : [item.catalogItemId]))
      ),
    [userItems]
  )

  const setMode = (nextMode: ItemSourceMode) => {
    setModeState(nextMode)
    setActiveSubCategory('전체')
  }

  return {
    activeSubCategory,
    categoryLabel,
    error,
    filteredItems,
    loaded,
    loading,
    mode,
    ownedCatalogItemIds,
    retry: fetchItems,
    setMode,
    setActiveSubCategory,
    subCategories,
  }
}
