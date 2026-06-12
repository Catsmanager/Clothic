import { useMemo, useState } from 'react'
import { buildCalendarCells } from '../lib/calendar'
import { getTodayDateKey } from '../lib/date'

export function useCalendarMonth(initialDate = new Date()) {
  const [year, setYear] = useState(() => initialDate.getFullYear())
  const [month, setMonth] = useState(() => initialDate.getMonth())
  const [todayKey] = useState(() => getTodayDateKey(initialDate))
  const [selectedKey, setSelectedKey] = useState<string>(() => getTodayDateKey(initialDate))

  const cells = useMemo(() => buildCalendarCells(year, month), [year, month])

  function prevMonth() {
    if (month === 0) {
      setYear((currentYear) => currentYear - 1)
      setMonth(11)
    } else {
      setMonth((currentMonth) => currentMonth - 1)
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear((currentYear) => currentYear + 1)
      setMonth(0)
    } else {
      setMonth((currentMonth) => currentMonth + 1)
    }
  }

  return {
    cells,
    month,
    nextMonth,
    prevMonth,
    selectedKey,
    setSelectedKey,
    todayKey,
    year,
  }
}
