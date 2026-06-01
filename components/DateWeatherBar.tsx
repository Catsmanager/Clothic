import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'
import { formatDateKey, formatFullDateWithWeekday } from '../lib/date'

export default function DateWeatherBar() {
  const today = new Date()

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {formatFullDateWithWeekday(formatDateKey(today))}
        {'  |  '}
        {'⛅ 22°C'}
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
