// Open-Meteo 현재 날씨 조회 (무료, API 키 불필요)
// https://open-meteo.com/en/docs

export interface CurrentWeather {
  temperature: number
  icon: string
  label: string
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number
    weather_code?: number
  }
}

// WMO 날씨 코드 → 아이콘/설명 매핑
// https://open-meteo.com/en/docs (Weather variable documentation)
function describeWeatherCode(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: '☀️', label: '맑음' }
  if (code === 1 || code === 2) return { icon: '⛅', label: '구름 조금' }
  if (code === 3) return { icon: '☁️', label: '흐림' }
  if (code === 45 || code === 48) return { icon: '🌫️', label: '안개' }
  if (code >= 51 && code <= 57) return { icon: '🌦️', label: '이슬비' }
  if (code >= 61 && code <= 67) return { icon: '🌧️', label: '비' }
  if (code >= 71 && code <= 77) return { icon: '🌨️', label: '눈' }
  if (code >= 80 && code <= 82) return { icon: '🌦️', label: '소나기' }
  if (code === 85 || code === 86) return { icon: '🌨️', label: '눈' }
  if (code >= 95) return { icon: '⛈️', label: '뇌우' }
  return { icon: '⛅', label: '' }
}

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number
): Promise<CurrentWeather> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${latitude}&longitude=${longitude}` +
    '&current=temperature_2m,weather_code'

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`)
  }

  const data = (await response.json()) as OpenMeteoResponse
  const temperature = data.current?.temperature_2m
  const weatherCode = data.current?.weather_code

  if (typeof temperature !== 'number' || typeof weatherCode !== 'number') {
    throw new Error('Invalid weather response')
  }

  const { icon, label } = describeWeatherCode(weatherCode)
  return { temperature: Math.round(temperature), icon, label }
}
