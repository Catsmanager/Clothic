import type { CatalogItem } from '../constants/items'
import {
  SLEEPING_ATTENTION_DAYS,
  SLEEPING_DAYS,
  type SleepingItem,
} from '../constants/sleepingWardrobe'
import { getCurrentSeason, isInSeason } from './season'
import type { Outfit } from '../stores/outfitStore'

const MS_PER_DAY = 1000 * 60 * 60 * 24

// outfits에서 아이템별 마지막 착용일을 역산해, 현재 계절 아이템 중 미착용 일수로 분류해 반환한다.
// - 착용 기록이 없는 아이템: 미착용 일수 기준이 없으므로 제외
// - 현재 계절이 아닌 아이템(계절 보관 중): 메인 리스트에서 제외(숨김)
// - 14일 미만: 미표시 / 14~29일: 관심 필요 / 30일+: 잠자는 옷
// (DATA_MODEL.md 계산 규칙)
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

  const currentSeason = getCurrentSeason(today)
  const sleepingItems: SleepingItem[] = []
  items.forEach((item) => {
    const lastWorn = lastWornByItemId.get(item.id)
    if (lastWorn == null) return
    if (!isInSeason(item.seasons, currentSeason)) return

    const days = getSleepingDays(lastWorn, today)
    if (days < SLEEPING_ATTENTION_DAYS) return

    sleepingItems.push({
      id: item.id,
      name: item.name,
      tags: item.styleTags,
      lastWorn: lastWorn.replace(/-/g, '.'),
      color: item.color,
      imagePath: item.imagePath,
      category: item.category,
      tier: days >= SLEEPING_DAYS ? 'sleeping' : 'attention',
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
