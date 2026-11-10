import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'

interface Props {
  weekStart: Date
  nextDisabled?: boolean
  onNext: () => void
  onPrev: () => void
}

export default function WeekNavigator({ weekStart, nextDisabled = false, onNext, onPrev }: Props) {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const label = `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 – ${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일`

  return (
    <View style={styles.weekNav}>
      <TouchableOpacity
        onPress={onPrev}
        style={styles.navBtn}
        accessibilityRole="button"
        accessibilityLabel="이전 주"
      >
        <Text style={styles.navArrow}>{'<'}</Text>
      </TouchableOpacity>
      <Text style={styles.weekLabel}>{label}</Text>
      <TouchableOpacity
        onPress={onNext}
        style={styles.navBtn}
        disabled={nextDisabled}
        accessibilityRole="button"
        accessibilityLabel="다음 주"
        accessibilityState={{ disabled: nextDisabled }}
      >
        <Text style={[styles.navArrow, nextDisabled && styles.navArrowDisabled]}>{'>'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  navBtn: { padding: spacing.xs },
  navArrow: { fontSize: 18, color: colors.text },
  navArrowDisabled: { color: colors.border },
  weekLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    minWidth: 180,
    textAlign: 'center',
  },
})
