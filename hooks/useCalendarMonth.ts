import { useEffect, useMemo, useRef, useState } from 'react'
import {
  buildCalendarCells,
  syncCalendarViewToToday,
  type CalendarViewState,
} from '../lib/calendar'
import { getMonthKey, parseDateKey } from '../lib/date'
import { useCurrentDateKey } from './useCurrentDateKey'

function selectKeyForMonth(year: number, month: number, todayKey: string): string {
  const monthKey = getMonthKey(year, month)
  return todayKey.startsWith(monthKey) ? todayKey : `${monthKey}-01`
}

export function useCalendarMonth() {
  const todayKey = useCurrentDateKey()
  const initialToday = parseDateKey(todayKey) ?? new Date()
  const previousTodayKey = useRef(todayKey)
  const [state, setState] = useState<CalendarViewState>(() => ({
    year: initialToday.getFullYear(),
    month: initialToday.getMonth(),
    selectedKey: todayKey,
  }))

  useEffect(() => {
    const previousKey = previousTodayKey.current
    setState((current) => syncCalendarViewToToday(current, previousKey, todayKey))
    previousTodayKey.current = todayKey
  }, [todayKey])

  const cells = useMemo(
    () => buildCalendarCells(state.year, state.month),
    [state.month, state.year]
  )

  function moveMonth(offset: number) {
    setState((current) => {
      const target = new Date(current.year, current.month + offset, 1)
      const year = target.getFullYear()
      const month = target.getMonth()
      return {
        year,
        month,
        selectedKey: selectKeyForMonth(year, month, todayKey),
      }
    })
  }

  return {
    cells,
    month: state.month,
    nextMonth: () => moveMonth(1),
    prevMonth: () => moveMonth(-1),
    selectedKey: state.selectedKey,
    setSelectedKey: (selectedKey: string) => setState((current) => ({ ...current, selectedKey })),
    todayKey,
    year: state.year,
  }
}
