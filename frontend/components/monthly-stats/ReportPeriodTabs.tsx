import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

export type ReportPeriod = 'week' | 'month'

interface Props {
  value: ReportPeriod
  onChange: (value: ReportPeriod) => void
}

export default function ReportPeriodTabs({ value, onChange }: Props) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {(
        [
          ['week', '주간'],
          ['month', '월간'],
        ] as const
      ).map(([period, label]) => {
        const selected = value === period
        return (
          <TouchableOpacity
            key={period}
            style={[styles.tab, selected && styles.tabSelected]}
            onPress={() => onChange(period)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: 200,
    padding: 3,
    borderRadius: radius.md,
    backgroundColor: '#EEE5DE',
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radius.sm + 1,
  },
  tabSelected: {
    backgroundColor: '#3A302B',
  },
  tabText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextSelected: {
    color: colors.white,
  },
})
