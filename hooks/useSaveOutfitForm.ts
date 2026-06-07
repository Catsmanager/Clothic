import { useEffect, useState } from 'react'
import { getTodayDateKey } from '../lib/date'
import type { Mood, NewOutfit, Weather } from '../stores/outfitStore'

interface Params {
  itemIds: string[]
  visible: boolean
}

export function useSaveOutfitForm({ itemIds, visible }: Params) {
  const [mood, setMood] = useState<Mood | null>(null)
  const [weather, setWeather] = useState<Weather | null>(null)
  const [memo, setMemo] = useState('')

  useEffect(() => {
    if (!visible) return

    setMood(null)
    setWeather(null)
    setMemo('')
  }, [itemIds, visible])

  function toggleMood(nextMood: Mood) {
    setMood((currentMood) => (currentMood === nextMood ? null : nextMood))
  }

  function toggleWeather(nextWeather: Weather) {
    setWeather((currentWeather) => (currentWeather === nextWeather ? null : nextWeather))
  }

  function buildInput(): NewOutfit {
    const trimmedMemo = memo.trim()

    return {
      date: getTodayDateKey(),
      mood,
      weather,
      memo: trimmedMemo === '' ? null : trimmedMemo,
      itemIds,
    }
  }

  return {
    buildInput,
    memo,
    mood,
    setMemo,
    toggleMood,
    toggleWeather,
    weather,
  }
}
