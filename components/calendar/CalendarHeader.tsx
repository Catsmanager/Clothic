import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'

interface Props {
  month: number
  year: number
  onNextMonth: () => void
  onPrevMonth: () => void
}

export default function CalendarHeader({ month, year, onNextMonth, onPrevMonth }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.navBtn}
        onPress={onPrevMonth}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="이전 달 보기"
      >
        <Text style={styles.navArrow}>{'<'}</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {year}년 {month + 1}월
      </Text>
      <TouchableOpacity
        style={styles.navBtn}
        onPress={onNextMonth}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="다음 달 보기"
      >
        <Text style={styles.navArrow}>{'>'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    fontSize: 20,
    color: colors.text,
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
})
