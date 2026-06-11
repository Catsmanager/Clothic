import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { MonthData } from '../../lib/monthlyStats'
import StatsCard from './StatsCard'

interface Props {
  topItems: MonthData['topItems']
}

export default function TopItemsCard({ topItems }: Props) {
  return (
    <StatsCard label="가장 많이 입은 아이템 TOP 5">
      <View style={styles.itemList}>
        {topItems.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={[styles.itemIcon, { backgroundColor: item.color }]} />
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
  },
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
})
