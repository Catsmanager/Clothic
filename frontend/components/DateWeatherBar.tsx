import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'
import { formatFullDateWithWeekday } from '../lib/date'
import { useCurrentDateKey } from '../hooks/useCurrentDateKey'
import { useWeather } from '../hooks/useWeather'

export default function DateWeatherBar() {
  const currentDateKey = useCurrentDateKey()
  const weather = useWeather(currentDateKey)

  const weatherText =
    weather.status === 'success' ? `  |  ${weather.data.icon} ${weather.data.temperature}°C` : ''

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {formatFullDateWithWeekday(currentDateKey)}
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
