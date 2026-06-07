import {
  CATEGORY_LABELS,
  ITEM_CATEGORIES,
  type Category,
} from '../constants/items'
import type { UserItem } from '../stores/itemStore'

export interface ItemInventoryData {
  totalItems: number
  categoryCounts: { category: Category; label: string; count: number; percent: number }[]
  monthlyUploads: { label: string; count: number }[]
}

function getUploadMonthLabel(date: Date): string {
  return `${date.getMonth() + 1}월`
}

export function buildItemInventoryData(items: UserItem[]): ItemInventoryData {
  const totalItems = items.length
  const counts = new Map<Category, number>()

  ITEM_CATEGORIES.forEach((category) => counts.set(category, 0))
  items.forEach((item) => counts.set(item.category, (counts.get(item.category) ?? 0) + 1))

  const categoryCounts = ITEM_CATEGORIES.map((category) => {
    const count = counts.get(category) ?? 0
    return {
      category,
      label: CATEGORY_LABELS[category],
      count,
      percent: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0,
    }
  }).filter((item) => item.count > 0)

  const today = new Date()
  const monthKeys = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1)
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: getUploadMonthLabel(date),
      count: 0,
    }
  })

  items.forEach((item) => {
    const createdAt = new Date(item.createdAt)
    if (Number.isNaN(createdAt.getTime())) return

    const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`
    const bucket = monthKeys.find((month) => month.key === key)
    if (bucket) bucket.count += 1
  })

  return {
    totalItems,
    categoryCounts,
    monthlyUploads: monthKeys.map(({ label, count }) => ({ label, count })),
  }
}
