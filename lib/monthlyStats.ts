import type { CatalogItem } from '../constants/items'
import type { Outfit } from '../stores/outfitStore'
import { getMonthKey } from './date'

export interface MonthData {
  totalOutfits: number
  diffFromLastMonth: number
  topColors: { label: string; color: string; percent: number }[]
  topItems: { label: string; color: string; count: number }[]
  topStyles: { tag: string; count: number }[]
}

export function buildMonthData(
  outfits: Outfit[],
  items: CatalogItem[],
  year: number,
  month: number
): MonthData | null {
  const currentKey = getMonthKey(year, month)
  const prevDate = new Date(year, month - 1, 1)
  const previousKey = getMonthKey(prevDate.getFullYear(), prevDate.getMonth())
  const currentOutfits = outfits.filter((outfit) => outfit.date.startsWith(currentKey))
  const previousCount = outfits.filter((outfit) => outfit.date.startsWith(previousKey)).length

  if (currentOutfits.length === 0) return null

  const itemCounts = new Map<string, { label: string; color: string; count: number }>()
  const colorCounts = new Map<string, { label: string; color: string; count: number }>()
  const styleCounts = new Map<string, { tag: string; count: number }>()

  currentOutfits.forEach((outfit) => {
    outfit.itemIds.forEach((itemId) => {
      const item = items.find((candidate) => candidate.id === itemId)
      if (!item) return

      const itemCount = itemCounts.get(item.id)
      itemCounts.set(item.id, {
        label: item.name,
        color: item.color,
        count: (itemCount?.count ?? 0) + 1,
      })

      const colorCount = colorCounts.get(item.color)
      colorCounts.set(item.color, {
        label: item.color,
        color: item.color,
        count: (colorCount?.count ?? 0) + 1,
      })

      item.styleTags.forEach((tag) => {
        const styleCount = styleCounts.get(tag)
        styleCounts.set(tag, { tag: `#${tag}`, count: (styleCount?.count ?? 0) + 1 })
      })
    })
  })

  const totalItemCount = [...colorCounts.values()].reduce((sum, item) => sum + item.count, 0)

  return {
    totalOutfits: currentOutfits.length,
    diffFromLastMonth: currentOutfits.length - previousCount,
    topColors: [...colorCounts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item) => ({
        label: item.label,
        color: item.color,
        percent: totalItemCount > 0 ? Math.round((item.count / totalItemCount) * 100) : 0,
      })),
    topItems: [...itemCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    topStyles: [...styleCounts.values()].sort((a, b) => b.count - a.count).slice(0, 3),
  }
}
