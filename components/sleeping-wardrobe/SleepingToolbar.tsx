import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import type { SortOrder } from '../../constants/sleepingWardrobe'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  activeFilterCount: number
  onFilterPress: () => void
  sortOrder: SortOrder
  onSortPress: () => void
}

export default function SleepingToolbar({
  activeFilterCount,
  onFilterPress,
  sortOrder,
  onSortPress,
}: Props) {
  const hasActiveFilter = activeFilterCount > 0

  return (
    <View style={styles.toolbar}>
      <View style={styles.copy}>
        <Text style={styles.label}>정렬 및 필터</Text>
        <Text style={styles.caption}>오래 안 입은 옷부터 확인해보세요</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.sortButton} onPress={onSortPress}>
          <Feather name="clock" size={14} color={colors.text} />
          <Text style={styles.sortButtonText}>{sortOrder}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilter && styles.filterButtonActive]}
          onPress={onFilterPress}
        >
          <Feather name="filter" size={14} color={hasActiveFilter ? colors.white : colors.text} />
          <Text style={[styles.filterButtonText, hasActiveFilter && styles.filterButtonTextActive]}>
            {hasActiveFilter ? `필터 ${activeFilterCount}` : '필터'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  copy: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  caption: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.white,
  },
  sortButtonText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.white,
  },
  filterButtonActive: {
    borderColor: colors.text,
    backgroundColor: colors.text,
  },
  filterButtonText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
})
