import { CATEGORY_LABELS, ITEM_CATEGORIES, type Category } from './items'

// 잠자는 옷장 분류 기준 (현재 계절 아이템의 미착용 일수). DATA_MODEL.md 계산 규칙.
// 현재 계절 코디 아이템 전체를 미착용 긴 순으로 보여주되, 10일 미만은 배지 없이('active'),
// 10~19일은 '관심 필요', 20일 이상은 '잠자는 옷'으로 강조한다.
export const SLEEPING_ATTENTION_DAYS = 10
export const SLEEPING_DAYS = 20

// 'active' = 최근 착용(10일 미만, 배지 없음), 'attention' = 관심 필요(10~19일), 'sleeping' = 잠자는 옷(20일+)
export type SleepingTier = 'active' | 'attention' | 'sleeping'

// 'active'는 배지를 표시하지 않는다.
export const SLEEPING_TIER_LABELS: Record<SleepingTier, string> = {
  active: '',
  attention: '관심 필요',
  sleeping: '잠자는 옷',
}

export type SleepingCategory = '전체' | Category
export type SortOrder = '오래된 순' | '최신 순'

export interface SleepingItem {
  id: string
  name: string
  tags: string[]
  lastWorn: string // YYYY.MM.DD
  color: string
  imagePath?: string
  category: Category
  tier: SleepingTier
}

export const SLEEPING_CATEGORIES: SleepingCategory[] = ['전체', ...ITEM_CATEGORIES]

export function sleepingCategoryLabel(category: SleepingCategory): string {
  return category === '전체' ? '전체' : CATEGORY_LABELS[category]
}
