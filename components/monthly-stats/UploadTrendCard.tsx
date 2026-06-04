import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { ItemInventoryData } from '../../lib/itemStats'
import StatsCard from './StatsCard'

interface Props {
  monthlyUploads: ItemInventoryData['monthlyUploads']
}

export default function UploadTrendCard({ monthlyUploads }: Props) {
  const maxCount = Math.max(...monthlyUploads.map((item) => item.count), 1)

  return (
    <StatsCard label="최근 6개월 등록 추이">
      <View style={styles.chart}>
        {monthlyUploads.map((item) => {
          const heightPercent = Math.max((item.count / maxCount) * 100, item.count > 0 ? 16 : 6)
          return (
            <View key={item.label} style={styles.column}>
              <View style={styles.barSlot}>
                <View style={[styles.bar, { height: `${heightPercent}%` }]} />
              </View>
              <Text style={styles.count}>{item.count}</Text>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          )
        })}
      </View>
    </StatsCard>
  )
}

const styles = StyleSheet.create({
  chart: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  barSlot: {
    height: 92,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: radius.sm,
    backgroundColor: '#6F8A7A',
  },
  count: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
  },
})
