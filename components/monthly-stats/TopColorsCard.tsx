import { StyleSheet, Text, View } from 'react-native'
import DonutChart from '../DonutChart'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import type { MonthData } from '../../lib/monthlyStats'
import StatsCard from './StatsCard'

interface Props {
  topColors: MonthData['topColors']
}

export default function TopColorsCard({ topColors }: Props) {
  return (
    <StatsCard label="가장 많이 입은 색상">
      <View style={styles.colorRow}>
        <DonutChart
          segments={topColors.map((color) => ({ value: color.percent, color: color.color }))}
          size={130}
          strokeWidth={34}
        />
        <View style={styles.colorLegend}>
          {topColors.map((color) => (
            <View key={color.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color.color }]} />
              <Text style={styles.legendLabel}>{color.label}</Text>
              <Text style={styles.legendPercent}>{color.percent}%</Text>
            </View>
          ))}
        </View>
      </View>
    </StatsCard>
  )
}

const styles = StyleSheet.create({
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  colorLegend: {
    flex: 1,
    gap: spacing.xs + 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  legendPercent: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
})
