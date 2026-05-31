import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import { CATEGORY_LABELS, ITEM_CATEGORIES, type Category } from '../../constants/items'

const CATEGORY_EMOJI: Record<Category, string> = {
  top: '👕',
  bottom: '👖',
  shoes: '👟',
  bag: '👜',
  accessory: '⭐',
}

interface Props {
  activeCategory: Category
  onCategoryPress: (category: Category) => void
}

export default function CategoryRail({ activeCategory, onCategoryPress }: Props) {
  return (
    <ScrollView
      style={styles.categoryPanel}
      contentContainerStyle={styles.categoryContent}
      showsVerticalScrollIndicator={false}
    >
      {ITEM_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category}
          style={[styles.categoryItem, activeCategory === category && styles.categoryItemActive]}
          onPress={() => onCategoryPress(category)}
        >
          <Text style={styles.categoryEmoji}>{CATEGORY_EMOJI[category]}</Text>
          <Text
            style={[
              styles.categoryLabel,
              activeCategory === category && styles.categoryLabelActive,
            ]}
          >
            {CATEGORY_LABELS[category]}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.categoryItem}>
        <Text style={styles.categoryEmoji}>🖼️</Text>
        <Text style={styles.categoryLabel}>배경</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  categoryPanel: {
    width: 80,
    backgroundColor: colors.secondary,
  },
  categoryContent: {
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    gap: 2,
  },
  categoryItemActive: {
    backgroundColor: colors.primary,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '400',
  },
  categoryLabelActive: {
    color: colors.text,
    fontWeight: '600',
  },
})
