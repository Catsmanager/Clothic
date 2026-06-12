import { CATEGORY_LABELS, ITEM_CATEGORIES, type Category } from './items'

// 잠자는 옷장 기준: 마지막 착용 후 이 일수 이상 지난 아이템 (DATA_MODEL.md 계산 규칙)
export const SLEEPING_THRESHOLD_DAYS = 30

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
}

export const SLEEPING_CATEGORIES: SleepingCategory[] = ['전체', ...ITEM_CATEGORIES]

export function sleepingCategoryLabel(category: SleepingCategory): string {
  return category === '전체' ? '전체' : CATEGORY_LABELS[category]
}
