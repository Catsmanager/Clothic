import { useState } from 'react'

export function useMonthNavigation(initialDate = new Date()) {
  const [year, setYear] = useState(initialDate.getFullYear())
  const [month, setMonth] = useState(initialDate.getMonth())

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
    month,
    nextMonth,
    prevMonth,
    year,
  }
}
