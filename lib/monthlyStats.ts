import { resolvePaletteColor } from '../constants/colorPalette'
import { isColorCategory, type CatalogItem } from '../constants/items'
import type { Outfit } from '../stores/outfitStore'
import { getMonthKey } from './date'
import { getPrimaryStyledOutfits } from './outfitRecords'

export interface MonthData {
  totalOutfits: number
  diffFromLastMonth: number
  topColors: { label: string; color: string; percent: number }[]
  topItems: { id: string; label: string; color: string; imagePath?: string; count: number }[]
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
  const styledOutfits = getPrimaryStyledOutfits(outfits)
  const currentOutfits = styledOutfits.filter((outfit) => outfit.date.startsWith(currentKey))
  const previousCount = styledOutfits.filter((outfit) => outfit.date.startsWith(previousKey)).length

  if (currentOutfits.length === 0) return null

  const itemCounts = new Map<
    string,
    { id: string; label: string; color: string; imagePath?: string; count: number }
  >()
  const colorCounts = new Map<string, { label: string; color: string; count: number }>()
  const styleCounts = new Map<string, { tag: string; count: number }>()

  currentOutfits.forEach((outfit) => {
    outfit.itemIds.forEach((itemId) => {
      const item = items.find((candidate) => candidate.id === itemId)
      if (!item) return

      if (item.category !== 'hair') {
        const itemCount = itemCounts.get(item.id)
        itemCounts.set(item.id, {
          id: item.id,
          label: item.name,
          color: item.color,
          imagePath: item.imagePath,
          count: (itemCount?.count ?? 0) + 1,
        })
      }

      // 색상 통계는 상의·하의만 집계한다(코디 색을 대표하는 카테고리). 신발·헤어·악세서리는 제외.
      // 코디 저장 시 사용자가 고른 색(itemColors)을 우선 쓰고, 없으면 아이템 원래 색으로 폴백한다.
      // 비슷한 hex(#1C1C1C, #2A2A2A 등)는 팔레트 색상명으로 묶는다.
      if (isColorCategory(item.category)) {
        const palette = resolvePaletteColor(outfit.itemColors[itemId] ?? item.color)
        const colorCount = colorCounts.get(palette.name)
        colorCounts.set(palette.name, {
          label: palette.name,
          color: palette.hex,
          count: (colorCount?.count ?? 0) + 1,
        })
      }

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
      }))
      .filter((item) => item.percent > 0),
    topItems: [...itemCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    topStyles: [...styleCounts.values()].sort((a, b) => b.count - a.count).slice(0, 3),
  }
}
