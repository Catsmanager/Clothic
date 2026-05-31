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
      <View style={styles.styleGrid}>
        <View style={styles.styleTags}>
          {topStyles.map((style) => (
            <View key={style.tag} style={styles.styleTag}>
              <Text style={styles.styleTagText}>{style.tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.styleCounts}>
          {topStyles.map((style) => (
            <Text key={style.tag} style={styles.styleCount}>
              {style.count}회
            </Text>
          ))}
        </View>
      </View>
    </StatsCard>
  )
}

const styles = StyleSheet.create({
  styleGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  styleTags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignContent: 'flex-start',
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
  styleCounts: {
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: spacing.sm,
  },
  styleCount: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
})
