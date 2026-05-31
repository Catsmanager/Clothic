import { useCallback, useMemo, useState } from 'react'
import { type CatalogItem, type Category, ITEMS, SUB_CATEGORIES } from '../constants/items'

type EquippedItems = Partial<Record<Category, string>>

export function useOutfitEditor() {
  const [activeCategory, setActiveCategory] = useState<Category>('top')
  const [activeSubCategory, setActiveSubCategory] = useState<string>('전체')
  const [equipped, setEquipped] = useState<EquippedItems>({})
  const [history, setHistory] = useState<EquippedItems[]>([{}])
  const [historyIndex, setHistoryIndex] = useState(0)

  const subCategories = SUB_CATEGORIES[activeCategory]

  const filteredItems = useMemo(
    () =>
      ITEMS.filter(
        (item) =>
          item.category === activeCategory &&
          (activeSubCategory === '전체' || item.subCategory === activeSubCategory)
      ),
    [activeCategory, activeSubCategory]
  )

  const selectCategory = useCallback((category: Category) => {
    setActiveCategory(category)
    setActiveSubCategory('전체')
  }, [])

  const selectSubCategory = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory)
  }, [])

  const equipItem = useCallback(
    (item: CatalogItem) => {
      const next = { ...equipped, [item.category]: item.id }
      const nextHistory = history.slice(0, historyIndex + 1)
      setHistory([...nextHistory, next])
      setHistoryIndex(nextHistory.length)
      setEquipped(next)
    },
    [equipped, history, historyIndex]
  )

  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const prev = historyIndex - 1
    setHistoryIndex(prev)
    setEquipped(history[prev] ?? {})
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    const next = historyIndex + 1
    setHistoryIndex(next)
    setEquipped(history[next] ?? {})
  }, [history, historyIndex])

  const equippedItemIds = useMemo(
    () => Object.values(equipped).filter((id): id is string => id != null),
    [equipped]
  )

  return {
    activeCategory,
    activeSubCategory,
    canRedo: historyIndex < history.length - 1,
    canUndo: historyIndex > 0,
    equipped,
    equippedItemIds,
    filteredItems,
    redo,
    selectCategory,
    selectSubCategory,
    subCategories,
    undo,
    equipItem,
  }
}
