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
    <View style={styles.sortBar}>
      <TouchableOpacity style={styles.sortButton} onPress={onSortPress}>
        <Text style={styles.sortButtonText}>{sortOrder}</Text>
        <Feather name="chevron-down" size={14} color={colors.text} />
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
  )
}

const styles = StyleSheet.create({
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortButtonText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.white,
  },
  filterButtonActive: {
    borderColor: colors.text,
    backgroundColor: colors.text,
  },
  filterButtonText: {
    fontSize: 13,
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
})
