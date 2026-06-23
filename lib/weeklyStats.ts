import { resolvePaletteColor } from '../constants/colorPalette'
import { isColorCategory, type CatalogItem } from '../constants/items'
import { formatDateKey } from './date'
import type { Outfit } from '../stores/outfitStore'

export interface WeekData {
  totalOutfits: number
  diffFromLastWeek: number
  recordedDates: string[]
  topColors: { label: string; color: string; percent: number }[]
  topItems: { id: string; label: string; color: string; imagePath?: string; count: number }[]
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function getWeekDates(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}

export function buildWeekData(outfits: Outfit[], items: CatalogItem[], weekStart: Date): WeekData {
  const weekDates = getWeekDates(weekStart)
  const dateKeys = weekDates.map(formatDateKey)
  const dateSet = new Set(dateKeys)
  const previousDateSet = new Set(getWeekDates(addDays(weekStart, -7)).map(formatDateKey))
  const currentOutfits = outfits.filter((outfit) => dateSet.has(outfit.date))
  const previousCount = outfits.filter((outfit) => previousDateSet.has(outfit.date)).length
  const itemCounts = new Map<
    string,
    { id: string; label: string; color: string; imagePath?: string; count: number }
  >()
  const colorCounts = new Map<string, { label: string; color: string; count: number }>()

  currentOutfits.forEach((outfit) => {
    outfit.itemIds.forEach((itemId) => {
      const item = items.find((candidate) => candidate.id === itemId)
      if (!item) return

      if (item.category !== 'hair') {
        const current = itemCounts.get(item.id)
        itemCounts.set(item.id, {
          id: item.id,
          label: item.name,
          color: item.color,
          imagePath: item.imagePath,
          count: (current?.count ?? 0) + 1,
        })
      }

      if (isColorCategory(item.category)) {
        const palette = resolvePaletteColor(outfit.itemColors[itemId] ?? item.color)
        const current = colorCounts.get(palette.name)
        colorCounts.set(palette.name, {
          label: palette.name,
          color: palette.hex,
          count: (current?.count ?? 0) + 1,
        })
      }
    })
  })

  const totalColorCount = [...colorCounts.values()].reduce((sum, color) => sum + color.count, 0)

  return {
    totalOutfits: currentOutfits.length,
    diffFromLastWeek: currentOutfits.length - previousCount,
    recordedDates: [...new Set(currentOutfits.map((outfit) => outfit.date))],
    topColors: [...colorCounts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((color) => ({
        label: color.label,
        color: color.color,
        percent: Math.round((color.count / totalColorCount) * 100),
      })),
    topItems: [...itemCounts.values()].sort((a, b) => b.count - a.count).slice(0, 3),
  }
}
