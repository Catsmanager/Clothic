import { useEffect, useMemo, useState } from 'react'
import { type CatalogItem, CATEGORY_LABELS, SUB_CATEGORIES, isCategory } from '../constants/items'
import { buildCatalogItems, useItemStore } from '../stores/itemStore'

interface Params {
  category?: string
}

export function useItemSelect(params: Params) {
  const userItems = useItemStore((s) => s.items)
  const fetchItems = useItemStore((s) => s.fetchItems)
  const category = isCategory(params.category) ? params.category : 'top'
  const [activeSubCategory, setActiveSubCategory] = useState<string>('전체')

  const catalogItems = useMemo(() => buildCatalogItems(userItems), [userItems])
  const hasUserItems = catalogItems.some(
    (item) => item.category === category && item.subCategory === '내 아이템'
  )
  const subCategories = hasUserItems
    ? [...(SUB_CATEGORIES[category] ?? ['전체']), '내 아이템']
    : (SUB_CATEGORIES[category] ?? ['전체'])
  const categoryLabel = CATEGORY_LABELS[category] ?? ''

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const filteredItems: CatalogItem[] = useMemo(
    () =>
      catalogItems.filter(
        (item) =>
          item.category === category &&
          (activeSubCategory === '전체' || item.subCategory === activeSubCategory)
      ),
    [activeSubCategory, catalogItems, category]
  )

  return {
    activeSubCategory,
    categoryLabel,
    filteredItems,
    setActiveSubCategory,
    subCategories,
  }
}
