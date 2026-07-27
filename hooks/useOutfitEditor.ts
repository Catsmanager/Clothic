import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ITEM_CATEGORIES,
  type CatalogItem,
  type Category,
  SUB_CATEGORIES,
} from '../constants/items'
import { buildCatalogItems, useItemStore } from '../stores/itemStore'

type SingleEquipCategory = Exclude<Category, 'accessory'>

export type EquippedItems = Partial<Record<SingleEquipCategory, string>> & {
  accessory?: string[]
}

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
      const next = { ...equipped }
      if (item.category === 'accessory') {
        const current = next.accessory ?? []
        next.accessory = current.includes(item.id)
          ? current.filter((id) => id !== item.id)
          : [...current, item.id]

        if (next.accessory.length === 0) {
          delete next.accessory
        }
      } else if (next[item.category] === item.id) {
        delete next[item.category]
      } else {
        next[item.category] = item.id

        if (isDress(item)) {
          delete next.top
          delete next.bottom
        } else if (item.category === 'top' || item.category === 'bottom') {
          delete next.dress
        }
      }

      const nextHistory = history.slice(0, historyIndex + 1)
      setHistory([...nextHistory, next])
      setHistoryIndex(nextHistory.length)
      setEquipped(next)
    },
    [equipped, history, historyIndex]
  )

  const equipItemById = useCallback(
    (itemId: string): boolean => {
      const item = catalogItems.find((candidate) => candidate.id === itemId)
      if (!item) return false

      setActiveCategory(item.category)
      setActiveSubCategory('전체')
      const alreadyEquipped =
        item.category === 'accessory'
          ? (equipped.accessory ?? []).includes(item.id)
          : equipped[item.category] === item.id
      if (!alreadyEquipped) equipItem(item)
      return true
    },
    [catalogItems, equipItem, equipped]
  )

  const randomizeOutfit = useCallback(() => {
    const next: EquippedItems = {}

    ITEM_CATEGORIES.forEach((category) => {
      if (category === 'dress') return

      const candidates = catalogItems.filter((item) => item.category === category)
      const randomItem = candidates[Math.floor(Math.random() * candidates.length)]
      if (randomItem == null) return

      if (category === 'accessory') {
        next.accessory = [randomItem.id]
        return
      }

      next[category] = randomItem.id
    })

    if (Math.random() < 0.35) {
      const dressItems = catalogItems.filter((item) => item.category === 'dress')
      const randomDress = dressItems[Math.floor(Math.random() * dressItems.length)]
      if (randomDress != null) {
        next.dress = randomDress.id
        delete next.top
        delete next.bottom
      }
    }

    if (next.dress != null) {
      delete next.top
      delete next.bottom
    }

    if (Object.keys(next).length === 0) return

    const nextHistory = history.slice(0, historyIndex + 1)
    setHistory([...nextHistory, next])
    setHistoryIndex(nextHistory.length)
    setEquipped(next)
  }, [catalogItems, history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const prev = historyIndex - 1
    setHistoryIndex(prev)
    setEquipped(history[prev] ?? {})
  }, [history, historyIndex])

  const clearOutfit = useCallback(() => {
    if (Object.keys(equipped).length === 0) return

    const nextHistory = history.slice(0, historyIndex + 1)
    setHistory([...nextHistory, {}])
    setHistoryIndex(nextHistory.length)
    setEquipped({})
  }, [equipped, history, historyIndex])

  const equippedItemIds = useMemo(
    () =>
      Object.values(equipped).flatMap((value) => {
        if (value == null) return []
        return Array.isArray(value) ? value : [value]
      }),
    [equipped]
  )
  const equippedItems = useMemo(
    () =>
      equippedItemIds
        .map((id) => catalogItems.find((item) => item.id === id))
        .filter((item): item is CatalogItem => item != null),
    [catalogItems, equippedItemIds]
  )

  return {
    activeCategory,
    activeSubCategory,
    canUndo: historyIndex > 0,
    clearOutfit,
    equipped,
    equippedItemIds,
    equippedItems,
    filteredItems,
    randomizeOutfit,
    selectCategory,
    selectSubCategory,
    subCategories,
    undo,
    equipItem,
    equipItemById,
  }
}

function isDress(item: CatalogItem): boolean {
  return item.category === 'dress'
}
