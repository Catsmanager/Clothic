import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import type { SortOrder } from '../../constants/sleepingWardrobe'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  sortOrder: SortOrder
  onSortPress: () => void
}

export default function SleepingToolbar({ sortOrder, onSortPress }: Props) {
  return (
    <View style={styles.sortBar}>
      <TouchableOpacity style={styles.sortButton} onPress={onSortPress}>
        <Text style={styles.sortButtonText}>{sortOrder}</Text>
        <Feather name="chevron-down" size={14} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterButton}>
        <Feather name="filter" size={14} color={colors.text} />
        <Text style={styles.filterButtonText}>필터</Text>
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
  filterButtonText: {
    fontSize: 13,
    color: colors.text,
  },
})
