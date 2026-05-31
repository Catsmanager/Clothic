import { useMemo, useState } from 'react'
import {
  SLEEPING_ITEMS,
  type SleepingCategory,
  type SortOrder,
} from '../constants/sleepingWardrobe'

export function useSleepingWardrobe() {
  const [selectedCategory, setSelectedCategory] = useState<SleepingCategory>('전체')
  const [sortOrder, setSortOrder] = useState<SortOrder>('오래된 순')

  const items = useMemo(() => {
    const filteredItems =
      selectedCategory === '전체'
        ? SLEEPING_ITEMS
        : SLEEPING_ITEMS.filter((item) => item.category === selectedCategory)

    return [...filteredItems].sort((a, b) => {
      const dateA = a.lastWorn.replace(/\./g, '')
      const dateB = b.lastWorn.replace(/\./g, '')
      return sortOrder === '오래된 순'
        ? Number(dateA) - Number(dateB)
        : Number(dateB) - Number(dateA)
    })
  }, [selectedCategory, sortOrder])

  const toggleSort = () => {
    setSortOrder((prev) => (prev === '오래된 순' ? '최신 순' : '오래된 순'))
  }

  return {
    items,
    selectedCategory,
    setSelectedCategory,
    sortOrder,
    toggleSort,
  }
}
