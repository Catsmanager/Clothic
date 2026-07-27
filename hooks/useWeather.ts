import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import * as Location from 'expo-location'
import { fetchCurrentWeather, type CurrentWeather } from '../lib/weather'
import { getTodayDateKey } from '../lib/date'

export type WeatherState =
  | { status: 'loading' }
  | { status: 'success'; data: CurrentWeather }
  | { status: 'error' }

// 위치 권한 → 현재 위치 → Open-Meteo 날씨 조회
// 권한 거부 또는 조회 실패 시 'error' (날씨 표시를 숨긴다)
export function useWeather(dateKey: string): WeatherState {
  const [state, setState] = useState<WeatherState>({ status: 'loading' })
  const mounted = useRef(false)
  const requestSequence = useRef(0)
  const inFlightRequest = useRef<{ dateKey: string; sequence: number } | null>(null)
  const lastSuccessfulDateKey = useRef<string | null>(null)

  const load = useCallback(async (requestedDateKey: string) => {
    if (!mounted.current || inFlightRequest.current?.dateKey === requestedDateKey) return

    const sequence = (requestSequence.current += 1)
    inFlightRequest.current = { dateKey: requestedDateKey, sequence }
    setState((current) =>
      current.status === 'success' && lastSuccessfulDateKey.current === requestedDateKey
        ? current
        : { status: 'loading' }
    )

    const isCurrentRequest = () => mounted.current && requestSequence.current === sequence

    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (!isCurrentRequest()) return
      if (status !== 'granted') {
        setState({ status: 'error' })
        return
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      })
      if (!isCurrentRequest()) return

      const data = await fetchCurrentWeather(position.coords.latitude, position.coords.longitude)
      if (!isCurrentRequest()) return

      lastSuccessfulDateKey.current = requestedDateKey
      setState({ status: 'success', data })
    } catch {
      if (isCurrentRequest()) setState({ status: 'error' })
    } finally {
      if (inFlightRequest.current?.sequence === sequence) inFlightRequest.current = null
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void load(getTodayDateKey())
    })

    return () => {
      mounted.current = false
      requestSequence.current += 1
      inFlightRequest.current = null
      subscription.remove()
    }
  }, [load])

  useEffect(() => {
    void load(dateKey)
  }, [dateKey, load])

  return state
}
