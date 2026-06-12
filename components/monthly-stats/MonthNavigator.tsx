import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'

interface Props {
  month: number
  year: number
  nextDisabled?: boolean
  onNext: () => void
  onPrev: () => void
}

export default function MonthNavigator({
  month,
  year,
  nextDisabled = false,
  onNext,
  onPrev,
}: Props) {
  return (
    <View style={styles.monthNav}>
      <TouchableOpacity
        onPress={onPrev}
        style={styles.navBtn}
        accessibilityRole="button"
        accessibilityLabel="이전 달"
      >
        <Text style={styles.navArrow}>{'<'}</Text>
      </TouchableOpacity>
      <Text style={styles.monthLabel}>
        {year}년 {month + 1}월
      </Text>
      <TouchableOpacity
        onPress={onNext}
        style={styles.navBtn}
        disabled={nextDisabled}
        accessibilityRole="button"
        accessibilityLabel="다음 달"
        accessibilityState={{ disabled: nextDisabled }}
      >
        <Text style={[styles.navArrow, nextDisabled && styles.navArrowDisabled]}>{'>'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  navBtn: {
    padding: spacing.xs,
  },
  navArrow: {
    fontSize: 18,
    color: colors.text,
  },
  navArrowDisabled: {
    color: colors.border,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    minWidth: 120,
    textAlign: 'center',
  },
})
