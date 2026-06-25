import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { SLEEPING_TIER_LABELS, type SleepingItem } from '../../constants/sleepingWardrobe'
import { radius, spacing } from '../../constants/spacing'
import { getSleepingDays } from '../../lib/sleepingWardrobe'
import ItemPreviewThumb from '../ItemPreviewThumb'

interface Props {
  items: SleepingItem[]
  hasActiveFilter?: boolean
  onClearFilters?: () => void
}

export default function SleepingItemList({
  items,
  hasActiveFilter = false,
  onClearFilters,
}: Props) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Feather name={hasActiveFilter ? 'search' : 'moon'} size={22} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>
          {hasActiveFilter ? '조건에 맞는 옷이 없어요' : '아직 잠자는 옷이 없어요'}
        </Text>
        <Text style={styles.emptyDesc}>
          {hasActiveFilter
            ? '필터를 줄이거나 다른 카테고리를 선택해보세요.'
            : '코디를 기록하면, 현재 계절에 입은 옷을 미착용 기간 순으로 여기서 확인할 수 있어요.'}
        </Text>
        {hasActiveFilter && onClearFilters != null && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClearFilters}
            accessibilityRole="button"
            accessibilityLabel="필터 초기화"
          >
            <Feather name="rotate-ccw" size={13} color={colors.text} />
            <Text style={styles.clearButtonText}>필터 초기화</Text>
          </TouchableOpacity>
        )}
        {!hasActiveFilter && (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={() => router.push('/create')}
            accessibilityRole="button"
            accessibilityLabel="오늘 코디 기록하기"
            accessibilityHint="코디를 기록하는 화면으로 이동합니다."
          >
            <Feather name="plus" size={14} color={colors.white} />
            <Text style={styles.recordButtonText}>오늘 코디 기록하기</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <View style={styles.itemList}>
      {items.map((item) => {
        const sleepDays = getSleepingDays(item.lastWorn)
        const isSleeping = item.tier === 'sleeping'

        return (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.thumbnailWrap}>
              <ItemPreviewThumb item={item} size={58} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.metaRow}>
                <Feather name="calendar" size={12} color={colors.textMuted} />
                <Text style={styles.itemLastWornDate}>
                  마지막 착용 {item.lastWorn} · {sleepDays}일째
                </Text>
              </View>
            </View>
            {item.tier !== 'active' && (
              <View style={[styles.sleepBadge, isSleeping && styles.sleepBadgeLong]}>
                <Text style={[styles.sleepBadgeText, isSleeping && styles.sleepBadgeTextLong]}>
                  {SLEEPING_TIER_LABELS[item.tier]}
                </Text>
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
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
  sleepBadge: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sleepBadgeLong: {
    backgroundColor: 'rgba(192, 97, 107, 0.12)',
  },
  sleepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  sleepBadgeTextLong: {
    color: colors.danger,
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    backgroundColor: colors.text,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  recordButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
})
