import { useEffect, useState } from 'react'
import * as Location from 'expo-location'
import { fetchCurrentWeather, type CurrentWeather } from '../lib/weather'

export type WeatherState =
  | { status: 'loading' }
  | { status: 'success'; data: CurrentWeather }
  | { status: 'error' }

// 위치 권한 → 현재 위치 → Open-Meteo 날씨 조회
// 권한 거부 또는 조회 실패 시 'error' (날씨 표시를 숨긴다)
export function useWeather(): WeatherState {
  const [state, setState] = useState<WeatherState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          if (!cancelled) setState({ status: 'error' })
          return
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        })
        const data = await fetchCurrentWeather(position.coords.latitude, position.coords.longitude)
        if (!cancelled) setState({ status: 'success', data })
      } catch {
        if (!cancelled) setState({ status: 'error' })
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
