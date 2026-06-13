import type { Badge, Challenge, ChallengeSummary } from '../constants/challenges'
import type { CatalogItem } from '../constants/items'
import { getMonthKey, parseDateKey } from './date'
import type { Outfit } from '../stores/outfitStore'

const DAY_MS = 24 * 60 * 60 * 1000

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / DAY_MS)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatBadgeDate(dateKey: string | null): string | null {
  if (dateKey == null) return null
  const date = parseDateKey(dateKey)
  if (!date) return null

  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function getUniqueSortedDateKeys(outfits: Outfit[]): string[] {
  return Array.from(new Set(outfits.map((outfit) => outfit.date))).sort()
}

// 현재 연속 기록은 "오늘까지 이어진" 경우만 센다.
// 오늘 기록이 있으면 오늘부터, 없고 어제 기록이 있으면 어제부터(아직 살아있는 스트릭) 거꾸로 센다.
// 둘 다 없으면 연속이 끊긴 것이므로 0.
function getLatestStreak(dateKeys: string[], today: Date): number {
  if (dateKeys.length === 0) return 0

  const dateSet = new Set(dateKeys)
  let currentDate: Date
  if (dateSet.has(toDateKey(today))) {
    currentDate = today
  } else if (dateSet.has(toDateKey(addDays(today, -1)))) {
    currentDate = addDays(today, -1)
  } else {
    return 0
  }

  let streak = 0
  while (dateSet.has(toDateKey(currentDate))) {
    streak += 1
    currentDate = addDays(currentDate, -1)
  }

  return streak
}

function getBestStreak(dateKeys: string[]): { count: number; earnedAt: string | null } {
  let best = 0
  let current = 0
  let previousDate: Date | null = null
  let earnedAt: string | null = null

  for (const dateKey of dateKeys) {
    const date = parseDateKey(dateKey)
    if (!date) continue

    current = previousDate && diffDays(date, previousDate) === 1 ? current + 1 : 1
    previousDate = date

    if (current > best) best = current
    if (current >= 7 && earnedAt == null) earnedAt = dateKey
  }

  return { count: best, earnedAt }
}

function getWeekRecorded(dateKeys: string[], today: Date): number {
  const start = new Date(today)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay())

  const end = addDays(start, 7)
  return dateKeys.filter((dateKey) => {
    const date = parseDateKey(dateKey)
    return date != null && date >= start && date < end
  }).length
}

function getCurrentMonthOutfits(outfits: Outfit[], today: Date): Outfit[] {
  const monthKey = getMonthKey(today.getFullYear(), today.getMonth())
  return outfits.filter((outfit) => outfit.date.startsWith(monthKey))
}

function getComboKey(itemIds: string[]): string {
  return Array.from(new Set(itemIds)).sort().join('|')
}

function getAwakenedSleepingItems(
  outfits: Outfit[],
  today: Date
): { count: number; date: string | null } {
  const sortedOutfits = [...outfits].sort((a, b) => a.date.localeCompare(b.date))
  const currentMonthKey = getMonthKey(today.getFullYear(), today.getMonth())
  const lastSeenByItem = new Map<string, string>()
  const awakenedItemIds = new Set<string>()
  let firstAwakenedAt: string | null = null

  for (const outfit of sortedOutfits) {
    const wornDate = parseDateKey(outfit.date)
    if (!wornDate) continue

    for (const itemId of outfit.itemIds) {
      const lastSeenKey = lastSeenByItem.get(itemId)
      const lastSeenDate = lastSeenKey ? parseDateKey(lastSeenKey) : null

      if (
        lastSeenDate != null &&
        outfit.date.startsWith(currentMonthKey) &&
        diffDays(wornDate, lastSeenDate) >= 30
      ) {
        awakenedItemIds.add(itemId)
        if (firstAwakenedAt == null) firstAwakenedAt = outfit.date
      }

      lastSeenByItem.set(itemId, outfit.date)
    }
  }

  return { count: awakenedItemIds.size, date: firstAwakenedAt }
}

function getUsedStyleTagCount(outfits: Outfit[], catalogItems: CatalogItem[]): number {
  const itemMap = new Map(catalogItems.map((item) => [item.id, item]))
  const tags = new Set<string>()

  for (const outfit of outfits) {
    for (const itemId of outfit.itemIds) {
      const item = itemMap.get(itemId)
      item?.styleTags.forEach((tag) => tags.add(tag))
    }
  }

  return tags.size
}

export function buildChallengeData(
  outfits: Outfit[],
  catalogItems: CatalogItem[],
  today = new Date()
): { badges: Badge[]; challenges: Challenge[]; summary: ChallengeSummary } {
  const dateKeys = getUniqueSortedDateKeys(outfits)
  const currentMonthOutfits = getCurrentMonthOutfits(outfits, today)
  const latestStreak = getLatestStreak(dateKeys, today)
  const bestStreak = getBestStreak(dateKeys)
  const uniqueCombosThisMonth = new Set(
    currentMonthOutfits
      .map((outfit) => getComboKey(outfit.itemIds))
      .filter((comboKey) => comboKey.length > 0)
  )
  const awakened = getAwakenedSleepingItems(outfits, today)
  const firstRainyOutfit = outfits
    .filter((outfit) => outfit.weather === 'rainy')
    .sort((a, b) => a.date.localeCompare(b.date))[0]
  const usedStyleTagCount = getUsedStyleTagCount(outfits, catalogItems)

  const challenges: Challenge[] = [
    {
      id: 'streak-7',
      icon: 'calendar',
      title: '7일 연속 기록하기',
      description: '코디를 매일 저장하면 자동으로 진행돼요.',
      current: Math.min(latestStreak, 7),
      goal: 7,
    },
    {
      id: 'wake-sleeping',
      icon: 'wardrobe',
      title: '잠자는 옷 깨우기',
      description: '30일 이상 기록에 없던 아이템을 다시 입어보세요.',
      current: Math.min(awakened.count, 1),
      goal: 1,
    },
    {
      id: 'new-combo',
      icon: 'hanger',
      title: '새로운 조합 만들기',
      description: '이번 달 서로 다른 아이템 조합을 저장해보세요.',
      current: Math.min(uniqueCombosThisMonth.size, 3),
      goal: 3,
    },
    {
      id: 'rainy-day',
      icon: 'umbrella',
      title: '비 오는 날 코디 기록하기',
      description: '날씨를 비로 선택한 코디를 저장해보세요.',
      current: firstRainyOutfit ? 1 : 0,
      goal: 1,
    },
  ]

  const firstRecordDate = dateKeys[0] ?? null
  const activeCount = challenges.filter((challenge) => challenge.current < challenge.goal).length

  return {
    badges: [
      {
        id: 'first-record',
        icon: 'sprout',
        name: '첫 기록',
        earnedAt: formatBadgeDate(firstRecordDate),
      },
      {
        id: 'streak-7',
        icon: 'calendar',
        name: '7일 연속',
        earnedAt: formatBadgeDate(bestStreak.earnedAt),
      },
      {
        id: 'wake-sleeping',
        icon: 'wardrobe',
        name: '잠자는 옷 깨우기',
        earnedAt: formatBadgeDate(awakened.date),
      },
      {
        id: 'rainy-day',
        icon: 'umbrella',
        name: '비 오는 날',
        earnedAt: formatBadgeDate(firstRainyOutfit?.date ?? null),
      },
      {
        id: 'style-explorer',
        icon: 'compass',
        name: '스타일 탐험가',
        earnedAt:
          usedStyleTagCount >= 5 ? formatBadgeDate(dateKeys[dateKeys.length - 1] ?? null) : null,
      },
    ],
    challenges,
    summary: {
      activeCount,
      streakDays: latestStreak,
      weekRecorded: getWeekRecorded(dateKeys, today),
      weekGoal: 7,
    },
  }
}
