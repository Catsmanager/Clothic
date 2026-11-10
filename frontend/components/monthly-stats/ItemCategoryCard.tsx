import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { ItemInventoryData } from '../../lib/itemStats'
import StatsCard from './StatsCard'

interface Props {
  data: ItemInventoryData
}

const BAR_COLORS = ['#2B2B2B', '#A86F5F', '#6F8A7A', '#6B7EA8', '#B89674']

export default function ItemCategoryCard({ data }: Props) {
  return (
    <StatsCard label="등록 아이템 카테고리">
      <View style={styles.summaryRow}>
        <Text style={styles.totalCount}>{data.totalItems}</Text>
        <Text style={styles.totalLabel}>개</Text>
      </View>
      <View style={styles.list}>
        {data.categoryCounts.map((item, index) => (
          <View key={item.category} style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${item.percent}%`,
                    backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                  },
                ]}
              />
            </View>
            <Text style={styles.count}>{item.count}</Text>
          </View>
        ))}
      </View>
    </StatsCard>
  )
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  totalCount: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.text,
  },
  totalLabel: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
    fontWeight: '500',
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    width: 58,
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    minWidth: 4,
    borderRadius: radius.full,
  },
  count: {
    width: 24,
    textAlign: 'right',
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
})
