import { useMemo, useState } from 'react'
import {
  type CatalogItem,
  CATEGORY_LABELS,
  ITEMS,
  SUB_CATEGORIES,
  isCategory,
} from '../constants/items'

interface Params {
  category?: string
}

export function useItemSelect(params: Params) {
  const category = isCategory(params.category) ? params.category : 'top'
  const [activeSubCategory, setActiveSubCategory] = useState<string>('전체')

  const subCategories = SUB_CATEGORIES[category] ?? ['전체']
  const categoryLabel = CATEGORY_LABELS[category] ?? ''

  const filteredItems: CatalogItem[] = useMemo(
    () =>
      ITEMS.filter(
        (item) =>
          item.category === category &&
          (activeSubCategory === '전체' || item.subCategory === activeSubCategory)
      ),
    [activeSubCategory, category]
  )

  return {
    activeSubCategory,
    categoryLabel,
    filteredItems,
    setActiveSubCategory,
    subCategories,
  }
}
