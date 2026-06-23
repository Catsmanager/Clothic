import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  SLEEPING_CATEGORIES,
  type SleepingCategory,
  type SortOrder,
} from '../constants/sleepingWardrobe'
import { buildSleepingItems } from '../lib/sleepingWardrobe'
import { buildCatalogItems, useItemStore } from '../stores/itemStore'
import { useOutfitStore } from '../stores/outfitStore'

export function useSleepingWardrobe() {
  const outfits = useOutfitStore((s) => s.outfits)
  const fetchOutfits = useOutfitStore((s) => s.fetchOutfits)
  const userItems = useItemStore((s) => s.items)
  const fetchItems = useItemStore((s) => s.fetchItems)

  const [selectedCategory, setSelectedCategory] = useState<SleepingCategory>('전체')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<SortOrder>('오래된 순')

  useEffect(() => {
    fetchOutfits()
    fetchItems()
  }, [fetchItems, fetchOutfits])

  const sleepingItems = useMemo(
    () => buildSleepingItems(outfits, buildCatalogItems(userItems)),
    [outfits, userItems]
  )

  // '잠자는 옷 N벌' 헤드라인: 현재 계절 아이템 중 30일+(tier === 'sleeping')만 센다.
  const sleepingCount = useMemo(
    () => sleepingItems.filter((item) => item.tier === 'sleeping').length,
    [sleepingItems]
  )

  const counts = useMemo(() => {
    const next = {} as Record<SleepingCategory, number>
    SLEEPING_CATEGORIES.forEach((category) => {
      next[category] =
        category === '전체'
          ? sleepingItems.length
          : sleepingItems.filter((item) => item.category === category).length
    })
    return next
  }, [sleepingItems])

  const categoryItems = useMemo(
    () =>
      selectedCategory === '전체'
        ? sleepingItems
        : sleepingItems.filter((item) => item.category === selectedCategory),
    [selectedCategory, sleepingItems]
  )

  const availableTags = useMemo(
    () => Array.from(new Set(categoryItems.flatMap((item) => item.tags))).sort(),
    [categoryItems]
  )

  const items = useMemo(() => {
    const filteredItems =
      selectedTags.length === 0
        ? categoryItems
        : categoryItems.filter((item) => selectedTags.every((tag) => item.tags.includes(tag)))

    return [...filteredItems].sort((a, b) => {
      const dateA = a.lastWorn.replace(/\./g, '')
      const dateB = b.lastWorn.replace(/\./g, '')
      return sortOrder === '오래된 순'
        ? Number(dateA) - Number(dateB)
        : Number(dateB) - Number(dateA)
    })
  }, [categoryItems, selectedTags, sortOrder])

  const selectCategory = useCallback((category: SleepingCategory) => {
    setSelectedCategory(category)
    setSelectedTags([])
  }, [])

  const toggleSort = () => {
    setSortOrder((prev) => (prev === '오래된 순' ? '최신 순' : '오래된 순'))
  }

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    )
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedCategory('전체')
    setSelectedTags([])
  }, [])

  return {
    activeFilterCount: selectedTags.length + (selectedCategory === '전체' ? 0 : 1),
    availableTags,
    clearFilters,
    counts,
    items,
    selectedCategory,
    selectedTags,
    setSelectedCategory: selectCategory,
    sortOrder,
    toggleTag,
    toggleSort,
    totalCount: sleepingItems.length,
    sleepingCount,
  }
}
