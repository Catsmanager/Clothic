import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  activeSubCategory: string
  onSubCategoryPress: (subCategory: string) => void
  subCategories: string[]
}

export default function ItemSubCategoryTabs({
  activeSubCategory,
  onSubCategoryPress,
  subCategories,
}: Props) {
  return (
    <View style={styles.tabRow}>
      {subCategories.map((subCategory) => (
        <TouchableOpacity
          key={subCategory}
          style={[styles.tab, activeSubCategory === subCategory && styles.tabActive]}
          onPress={() => onSubCategoryPress(subCategory)}
          accessibilityRole="button"
          accessibilityLabel={`${subCategory} 하위 분류`}
          accessibilityState={{ selected: activeSubCategory === subCategory }}
        >
          <Text style={[styles.tabText, activeSubCategory === subCategory && styles.tabTextActive]}>
            {subCategory}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
    flexWrap: 'nowrap',
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.white,
  },
  tabActive: {
    backgroundColor: colors.text,
  },
  tabText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
})
