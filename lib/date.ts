export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayDateKey(date = new Date()): string {
  return formatDateKey(date)
}

export function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export function getWeekdayLabel(date: Date): string {
  return WEEKDAY_LABELS[date.getDay()]
}

export function parseDateKey(dateKey: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

export function formatKoreanDate(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${getWeekdayLabel(date)}요일`
}

export function formatShortDateWithWeekday(dateKey: string): string {
  const date = parseDateKey(dateKey)
  if (!date) return dateKey

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}.${day} (${getWeekdayLabel(date)})`
}

export function formatFullDateWithWeekday(dateKey: string): string {
  const date = parseDateKey(dateKey)
  if (!date) return dateKey

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}.${month}.${day} (${getWeekdayLabel(date)})`
}

export function formatKoreanMonthDayWithWeekday(dateKey: string): string {
  const date = parseDateKey(dateKey)
  if (!date) return dateKey

  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${getWeekdayLabel(date)})`
}
