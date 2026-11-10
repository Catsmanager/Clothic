import { useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { getTodayDateKey } from '../lib/date'

const MIDNIGHT_BUFFER_MS = 1000

export function getDelayUntilNextLocalDay(now: Date): number {
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return Math.max(MIDNIGHT_BUFFER_MS, nextDay.getTime() - now.getTime() + MIDNIGHT_BUFFER_MS)
}

export function useCurrentDateKey(): string {
  const [dateKey, setDateKey] = useState(() => getTodayDateKey())

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    function syncAndSchedule() {
      const now = new Date()
      setDateKey(getTodayDateKey(now))
      if (timer != null) clearTimeout(timer)
      timer = setTimeout(syncAndSchedule, getDelayUntilNextLocalDay(now))
    }

    syncAndSchedule()
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncAndSchedule()
    })

    return () => {
      subscription.remove()
      if (timer != null) clearTimeout(timer)
    }
  }, [])

  return dateKey
}
