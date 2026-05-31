import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const day = DAY_LABELS[date.getDay()]
  return `${y}.${m}.${d} (${day})`
}

export default function DateWeatherBar() {
  const today = new Date()

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {formatDate(today)}
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
