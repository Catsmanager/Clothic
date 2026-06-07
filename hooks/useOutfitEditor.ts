import { useCallback, useEffect, useMemo, useState } from 'react'
import { type CatalogItem, type Category, SUB_CATEGORIES } from '../constants/items'
import { buildCatalogItems, useItemStore } from '../stores/itemStore'

type EquippedItems = Partial<Record<Category, string>>

export function useOutfitEditor() {
  const userItems = useItemStore((s) => s.items)
  const fetchItems = useItemStore((s) => s.fetchItems)
  const [activeCategory, setActiveCategory] = useState<Category>('top')
  const [activeSubCategory, setActiveSubCategory] = useState<string>('전체')
  const [equipped, setEquipped] = useState<EquippedItems>({})
  const [history, setHistory] = useState<EquippedItems[]>([{}])
  const [historyIndex, setHistoryIndex] = useState(0)

  const catalogItems = useMemo(() => buildCatalogItems(userItems), [userItems])
  const hasUserItems = catalogItems.some(
    (item) => item.category === activeCategory && item.subCategory === '내 아이템'
  )
  const subCategories = hasUserItems
    ? [...SUB_CATEGORIES[activeCategory], '내 아이템']
    : SUB_CATEGORIES[activeCategory]

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const filteredItems = useMemo(
    () =>
      catalogItems.filter(
        (item) =>
          item.category === activeCategory &&
          (activeSubCategory === '전체' || item.subCategory === activeSubCategory)
      ),
    [activeCategory, activeSubCategory, catalogItems]
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

  const randomizeActiveCategory = useCallback(() => {
    if (filteredItems.length === 0) return
    const randomItem = filteredItems[Math.floor(Math.random() * filteredItems.length)]
    if (randomItem == null) return

    const next = { ...equipped, [randomItem.category]: randomItem.id }
    const nextHistory = history.slice(0, historyIndex + 1)
    setHistory([...nextHistory, next])
    setHistoryIndex(nextHistory.length)
    setEquipped(next)
  }, [equipped, filteredItems, history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const prev = historyIndex - 1
    setHistoryIndex(prev)
    setEquipped(history[prev] ?? {})
  }, [history, historyIndex])

  const equippedItemIds = useMemo(
    () => Object.values(equipped).filter((id): id is string => id != null),
    [equipped]
  )

  return {
    activeCategory,
    activeSubCategory,
    canUndo: historyIndex > 0,
    equipped,
    equippedItemIds,
    filteredItems,
    randomizeActiveCategory,
    selectCategory,
    selectSubCategory,
    subCategories,
    undo,
    equipItem,
  }
}
