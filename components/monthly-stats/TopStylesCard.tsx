import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { MonthData } from '../../lib/monthlyStats'
import StatsCard from './StatsCard'

interface Props {
  topStyles: MonthData['topStyles']
}

export default function TopStylesCard({ topStyles }: Props) {
  return (
    <StatsCard label="많이 입은 스타일">
      <View style={styles.styleList}>
        {topStyles.map((style) => (
          <View key={style.tag} style={styles.styleRow}>
            <View style={styles.styleTag}>
              <Text style={styles.styleTagText}>{style.tag}</Text>
            </View>
            <Text style={styles.styleCount}>{style.count}회</Text>
          </View>
        ))}
      </View>
    </StatsCard>
  )
}

const styles = StyleSheet.create({
  styleList: {
    gap: spacing.sm,
  },
  styleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  styleTag: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  styleTagText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  styleCount: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
})
