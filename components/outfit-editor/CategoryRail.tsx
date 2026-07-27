import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  type ImageSourcePropType,
} from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import { CATEGORY_LABELS, ITEM_CATEGORIES, type Category } from '../../constants/items'

const CATEGORY_ICONS: Record<Category, ImageSourcePropType> = {
  top: require('../../assets/category-icons/rail/top.png'),
  outer: require('../../assets/category-icons/rail/outer.png'),
  bottom: require('../../assets/category-icons/rail/bottom.png'),
  dress: require('../../assets/category-icons/rail/dress.png'),
  shoes: require('../../assets/category-icons/rail/shoes.png'),
  hair: require('../../assets/category-icons/rail/hair.png'),
  accessory: require('../../assets/category-icons/rail/accessory.png'),
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
          accessibilityRole="button"
          accessibilityLabel={`${CATEGORY_LABELS[category]} 카테고리`}
          accessibilityState={{ selected: activeCategory === category }}
        >
          <CategoryIcon source={CATEGORY_ICONS[category]} />
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
    </ScrollView>
  )
}

function CategoryIcon({ source }: { source: ImageSourcePropType }) {
  return (
    <Image
      source={source}
      style={styles.categoryIcon}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      accessible={false}
    />
  )
}

const styles = StyleSheet.create({
  categoryPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
    width: 64,
    backgroundColor: colors.secondary,
  },
  categoryContent: {
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  categoryItem: {
    width: 56,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    gap: 1,
  },
  categoryItemActive: {
    backgroundColor: colors.primary,
  },
  categoryIcon: {
    width: 30,
    height: 24,
  },
  categoryLabel: {
    fontSize: 10,
    lineHeight: 13,
    color: colors.textMuted,
    fontWeight: '400',
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: colors.text,
    fontWeight: '600',
  },
})
