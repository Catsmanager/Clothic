import { useCallback, useMemo, useState } from 'react'
import {
  SLEEPING_ITEMS,
  type SleepingCategory,
  type SortOrder,
} from '../constants/sleepingWardrobe'

export function useSleepingWardrobe() {
  const [selectedCategory, setSelectedCategory] = useState<SleepingCategory>('전체')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<SortOrder>('오래된 순')

  const categoryItems = useMemo(
    () =>
      selectedCategory === '전체'
        ? SLEEPING_ITEMS
        : SLEEPING_ITEMS.filter((item) => item.category === selectedCategory),
    [selectedCategory]
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
    items,
    selectedCategory,
    selectedTags,
    setSelectedCategory: selectCategory,
    sortOrder,
    toggleTag,
    toggleSort,
  }
}
