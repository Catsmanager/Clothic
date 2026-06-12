import type { CatalogItem } from '../constants/items'
import { SLEEPING_THRESHOLD_DAYS, type SleepingItem } from '../constants/sleepingWardrobe'
import type { Outfit } from '../stores/outfitStore'

const MS_PER_DAY = 1000 * 60 * 60 * 24

// outfits에서 아이템별 마지막 착용일을 역산해, 30일 이상 지난 아이템만 반환한다.
// 착용 기록이 없는 아이템은 "잠자는" 판정 기준일이 없으므로 제외한다. (DATA_MODEL.md 계산 규칙)
export function buildSleepingItems(
  outfits: Outfit[],
  items: CatalogItem[],
  today: Date = new Date()
): SleepingItem[] {
  const lastWornByItemId = new Map<string, string>()
  outfits.forEach((outfit) => {
    outfit.itemIds.forEach((itemId) => {
      const prev = lastWornByItemId.get(itemId)
      // date는 YYYY-MM-DD라 문자열 비교로 최신값을 고를 수 있다.
      if (prev == null || outfit.date > prev) lastWornByItemId.set(itemId, outfit.date)
    })
  })

  const sleepingItems: SleepingItem[] = []
  items.forEach((item) => {
    const lastWorn = lastWornByItemId.get(item.id)
    if (lastWorn == null) return

    if (getSleepingDays(lastWorn, today) < SLEEPING_THRESHOLD_DAYS) return

    sleepingItems.push({
      id: item.id,
      name: item.name,
      tags: item.styleTags,
      lastWorn: lastWorn.replace(/-/g, '.'),
      color: item.color,
      imagePath: item.imagePath,
      category: item.category,
    })
  })
  return sleepingItems
}

// lastWorn: YYYY-MM-DD 또는 YYYY.MM.DD
export function getSleepingDays(lastWorn: string, today: Date = new Date()): number {
  const [year, month, day] = lastWorn.split(/[-.]/).map(Number)
  const lastWornDate = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
  return Math.max(0, Math.floor((today.getTime() - lastWornDate.getTime()) / MS_PER_DAY))
}
