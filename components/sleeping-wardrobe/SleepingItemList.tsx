import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import type { SleepingItem } from '../../constants/sleepingWardrobe'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  items: SleepingItem[]
}

export default function SleepingItemList({ items }: Props) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Feather name="search" size={22} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>조건에 맞는 옷이 없어요</Text>
        <Text style={styles.emptyDesc}>필터를 줄이거나 다른 카테고리를 선택해보세요.</Text>
      </View>
    )
  }

  return (
    <View style={styles.itemList}>
      {items.map((item) => (
        <TouchableOpacity key={item.id} style={styles.itemCard} activeOpacity={0.85}>
          <View style={styles.thumbnailWrap}>
            <View style={[styles.itemThumbnail, { backgroundColor: item.color }]} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.metaRow}>
              <Feather name="calendar" size={12} color={colors.textMuted} />
              <Text style={styles.itemLastWornDate}>마지막 착용 {item.lastWorn}</Text>
            </View>
          </View>
          <Text style={styles.sleepDays}>{getSleepingDaysLabel(item.lastWorn)}</Text>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  )
}

function getSleepingDaysLabel(lastWorn: string) {
  const [year, month, day] = lastWorn.split('.').map(Number)
  const lastWornDate = new Date(year, month - 1, day)
  const today = new Date()
  const diffTime = today.getTime() - lastWornDate.getTime()
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)))

  return `${diffDays}일`
}

const styles = StyleSheet.create({
  itemList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 10,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  thumbnailWrap: {
    width: 58,
    height: 58,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemThumbnail: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
  },
  itemInfo: {
    flex: 1,
    gap: 6,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemLastWornDate: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sleepDays: {
    minWidth: 44,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  emptyCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyTitle: {
    marginTop: spacing.xs,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  emptyDesc: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
})
