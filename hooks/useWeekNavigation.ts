import { useState } from 'react'

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  start.setDate(start.getDate() - start.getDay())
  return start
}

export function useWeekNavigation(initialDate = new Date()) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(initialDate))

  function prevWeek() {
    setWeekStart((current) => {
      const previous = new Date(current)
      previous.setDate(previous.getDate() - 7)
      return previous
    })
  }

  function nextWeek() {
    setWeekStart((current) => {
      const next = new Date(current)
      next.setDate(next.getDate() + 7)
      return next
    })
  }

  return { weekStart, prevWeek, nextWeek }
}
