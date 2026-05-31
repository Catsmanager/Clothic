import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'

interface Props {
  month: number
  year: number
  onNext: () => void
  onPrev: () => void
}

export default function MonthNavigator({ month, year, onNext, onPrev }: Props) {
  return (
    <View style={styles.monthNav}>
      <TouchableOpacity onPress={onPrev} style={styles.navBtn}>
        <Text style={styles.navArrow}>{'<'}</Text>
      </TouchableOpacity>
      <Text style={styles.monthLabel}>
        {year}년 {month + 1}월
      </Text>
      <TouchableOpacity onPress={onNext} style={styles.navBtn}>
        <Text style={styles.navArrow}>{'>'}</Text>
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
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    minWidth: 120,
    textAlign: 'center',
  },
})
