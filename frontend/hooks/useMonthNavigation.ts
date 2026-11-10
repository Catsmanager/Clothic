import { useEffect, useRef, useState } from 'react'
import { getMonthKey } from '../lib/date'

interface MonthState {
  month: number
  year: number
}

export function useMonthNavigation(currentDate = new Date()) {
  const currentPeriod: MonthState = {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth(),
  }
  const currentPeriodKey = getMonthKey(currentPeriod.year, currentPeriod.month)
  const previousCurrentPeriod = useRef(currentPeriod)
  const [view, setView] = useState<MonthState>(currentPeriod)

  useEffect(() => {
    const previous = previousCurrentPeriod.current
    setView((selected) =>
      selected.year === previous.year && selected.month === previous.month
        ? currentPeriod
        : selected
    )
    previousCurrentPeriod.current = currentPeriod
    // currentPeriodKey only changes when the live calendar month changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPeriodKey])

  function moveMonth(offset: number) {
    setView((selected) => {
      const target = new Date(selected.year, selected.month + offset, 1)
      return { year: target.getFullYear(), month: target.getMonth() }
    })
  }

  return {
    month: view.month,
    nextMonth: () => moveMonth(1),
    prevMonth: () => moveMonth(-1),
    year: view.year,
  }
}
