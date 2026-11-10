import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { MonthData } from '../../lib/monthlyStats'
import ItemPreviewThumb from '../ItemPreviewThumb'
import StatsCard from './StatsCard'

interface Props {
  topItems: MonthData['topItems']
  label?: string
  showRank?: boolean
}

export default function TopItemsCard({
  topItems,
  label = '가장 많이 입은 아이템 TOP 5',
  showRank = false,
}: Props) {
  if (topItems.length === 0) {
    return (
      <StatsCard label={label}>
        <Text style={styles.emptyText}>아직 아이템 데이터가 없어요.</Text>
      </StatsCard>
    )
  }

  return (
    <StatsCard label={label}>
      <View style={styles.itemList}>
        {topItems.map((item, index) => (
          <View key={item.id} style={styles.itemRow}>
            {showRank && <Text style={styles.rank}>{index + 1}</Text>}
            <View style={styles.itemIcon}>
              <ItemPreviewThumb item={item} size={36} />
            </View>
            <Text style={styles.itemName}>{item.label}</Text>
            <Text style={styles.itemCount}>{item.count}회</Text>
          </View>
        ))}
      </View>
    </StatsCard>
  )
}

const styles = StyleSheet.create({
  itemList: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rank: { width: 12, fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  itemCount: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
})
