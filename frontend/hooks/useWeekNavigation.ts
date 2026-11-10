import { useEffect, useRef, useState } from 'react'
import { formatDateKey } from '../lib/date'

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  start.setDate(start.getDate() - start.getDay())
  return start
}

export function useWeekNavigation(currentDate = new Date()) {
  const currentWeekStart = startOfWeek(currentDate)
  const currentWeekKey = formatDateKey(currentWeekStart)
  const previousCurrentWeek = useRef(currentWeekStart)
  const [weekStart, setWeekStart] = useState(currentWeekStart)

  useEffect(() => {
    const previousKey = formatDateKey(previousCurrentWeek.current)
    setWeekStart((selected) =>
      formatDateKey(selected) === previousKey ? currentWeekStart : selected
    )
    previousCurrentWeek.current = currentWeekStart
    // currentWeekKey only changes when the live calendar week changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeekKey])

  function moveWeek(days: number) {
    setWeekStart((selected) => {
      const next = new Date(selected)
      next.setDate(next.getDate() + days)
      return next
    })
  }

  return {
    weekStart,
    prevWeek: () => moveWeek(-7),
    nextWeek: () => moveWeek(7),
  }
}
