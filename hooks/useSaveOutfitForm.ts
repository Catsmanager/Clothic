import { useEffect, useState } from 'react'
import { getTodayDateKey } from '../lib/date'
import type { CatalogItem } from '../constants/items'
import type { Mood, NewOutfit, Weather } from '../stores/outfitStore'

interface Params {
  items: CatalogItem[]
  visible: boolean
}

// 착용 아이템들의 기본 색상 맵을 만든다 (itemId → 아이템 원래 색).
function buildDefaultColors(items: CatalogItem[]): Record<string, string> {
  return items.reduce<Record<string, string>>((acc, item) => {
    acc[item.id] = item.color
    return acc
  }, {})
}

export function useSaveOutfitForm({ items, visible }: Params) {
  const [mood, setMood] = useState<Mood | null>(null)
  const [weather, setWeather] = useState<Weather | null>(null)
  const [memo, setMemo] = useState('')
  const [itemColors, setItemColors] = useState<Record<string, string>>(() =>
    buildDefaultColors(items)
  )

  // 시트가 열릴 때마다 입력값을 초기화하고, 색상은 아이템 원래 색을 기본값으로 채운다.
  const itemsKey = items.map((item) => item.id).join(',')
  useEffect(() => {
    if (!visible) return

    setMood(null)
    setWeather(null)
    setMemo('')
    setItemColors(buildDefaultColors(items))
    // itemsKey로 착용 구성 변화를 감지한다(배열 참조 변경에 따른 불필요한 초기화 방지).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, visible])

  function toggleMood(nextMood: Mood) {
    setMood((currentMood) => (currentMood === nextMood ? null : nextMood))
  }

  function toggleWeather(nextWeather: Weather) {
    setWeather((currentWeather) => (currentWeather === nextWeather ? null : nextWeather))
  }

  function setItemColor(itemId: string, hex: string) {
    setItemColors((current) => ({ ...current, [itemId]: hex }))
  }

  function buildInput(): NewOutfit {
    const trimmedMemo = memo.trim()

    return {
      date: getTodayDateKey(),
      mood,
      weather,
      memo: trimmedMemo === '' ? null : trimmedMemo,
      itemIds: items.map((item) => item.id),
      itemColors,
    }
  }

  return {
    buildInput,
    itemColors,
    memo,
    mood,
    setItemColor,
    setMemo,
    toggleMood,
    toggleWeather,
    weather,
  }
}
