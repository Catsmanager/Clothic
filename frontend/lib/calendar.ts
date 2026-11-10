import { formatDateKey, parseDateKey } from './date'

export interface CalendarCell {
  date: Date
  key: string
  isCurrentMonth: boolean
}

export interface CalendarViewState {
  month: number
  selectedKey: string
  year: number
}

export function syncCalendarViewToToday(
  current: CalendarViewState,
  previousTodayKey: string,
  todayKey: string
): CalendarViewState {
  const previousToday = parseDateKey(previousTodayKey)
  const today = parseDateKey(todayKey)
  if (previousToday == null || today == null) return current

  const wasViewingCurrentMonth =
    current.year === previousToday.getFullYear() && current.month === previousToday.getMonth()
  if (!wasViewingCurrentMonth) {
    return current.selectedKey === previousTodayKey
      ? { ...current, selectedKey: todayKey }
      : current
  }

  const year = today.getFullYear()
  const month = today.getMonth()
  const didMonthChange = year !== current.year || month !== current.month

  return {
    year,
    month,
    selectedKey:
      didMonthChange || current.selectedKey === previousTodayKey ? todayKey : current.selectedKey,
  }
}

export function buildCalendarCells(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const cells: CalendarCell[] = []

  for (let i = firstDay.getDay() - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    cells.push({ date, key: formatDateKey(date), isCurrentMonth: false })
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    cells.push({ date, key: formatDateKey(date), isCurrentMonth: true })
  }

  const remaining = 42 - cells.length
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month + 1, day)
    cells.push({ date, key: formatDateKey(date), isCurrentMonth: false })
  }

  return cells
}
