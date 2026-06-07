import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import {
  SLEEPING_CATEGORIES,
  SLEEPING_CATEGORY_COUNT,
  type SleepingCategory,
} from '../../constants/sleepingWardrobe'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  selectedCategory: SleepingCategory
  onCategoryPress: (category: SleepingCategory) => void
}

export default function SleepingCategoryTabs({ selectedCategory, onCategoryPress }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContainer}
    >
      {SLEEPING_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category}
          style={[styles.categoryTab, selectedCategory === category && styles.categoryTabActive]}
          onPress={() => onCategoryPress(category)}
        >
          <CategoryIcon category={category} active={selectedCategory === category} />
          <Text
            style={[
              styles.categoryTabText,
              selectedCategory === category && styles.categoryTabTextActive,
            ]}
          >
            {category}
          </Text>
          <View
            style={[styles.countBadge, selectedCategory === category && styles.countBadgeActive]}
          >
            <Text
              style={[styles.countText, selectedCategory === category && styles.countTextActive]}
            >
              {SLEEPING_CATEGORY_COUNT[category]}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

function CategoryIcon({ active, category }: { active: boolean; category: SleepingCategory }) {
  const color = active ? colors.white : colors.textMuted
  const iconMap: Record<SleepingCategory, ReactNode> = {
    전체: <Feather name="grid" size={14} color={color} />,
    상의: <Ionicons name="shirt-outline" size={18} color={color} />,
    하의: <Feather name="align-justify" size={18} color={color} />,
    원피스: <Ionicons name="body-outline" size={18} color={color} />,
    아우터: <Ionicons name="layers-outline" size={18} color={color} />,
    '신발/가방': <Ionicons name="bag-outline" size={18} color={color} />,
  }
  return <>{iconMap[category]}</>
}

const styles = StyleSheet.create({
  categoryScroll: {
    marginBottom: spacing.xs,
  },
  categoryContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 5,
    minHeight: 36,
  },
  categoryTabActive: {
    borderColor: colors.text,
    backgroundColor: colors.text,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  categoryTabText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryTabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  countTextActive: {
    color: colors.white,
  },
})
