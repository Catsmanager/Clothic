import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'
import { formatDateKey, formatFullDateWithWeekday } from '../lib/date'
import { useWeather } from '../hooks/useWeather'

export default function DateWeatherBar() {
  const today = new Date()
  const weather = useWeather()

  const weatherText =
    weather.status === 'success'
      ? `  |  ${weather.data.icon} ${weather.data.temperature}°C`
      : ''

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {formatFullDateWithWeekday(formatDateKey(today))}
        {weatherText}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontSize: 13,
    color: colors.textMuted,
  },
})
