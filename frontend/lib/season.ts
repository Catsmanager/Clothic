import type { Season } from '../constants/items'

export type CurrentSeason = Exclude<Season, 'all'>

// 현재 계절은 월 기준으로 판정한다. (3-5 봄 / 6-8 여름 / 9-11 가을 / 12-2 겨울)
export function getCurrentSeason(today: Date = new Date()): CurrentSeason {
  const month = today.getMonth() + 1 // 1~12
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

// 'all'이거나 현재 계절을 포함하면 현재 계절에 입을 수 있는 아이템이다.
export function isInSeason(seasons: Season[], current: CurrentSeason): boolean {
  return seasons.includes('all') || seasons.includes(current)
}
