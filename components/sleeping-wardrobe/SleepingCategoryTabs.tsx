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
          {category === '전체' ? null : (
            <View style={styles.categoryIconWrapper}>
              <CategoryIcon category={category} active={selectedCategory === category} />
            </View>
          )}
          <Text
            style={[
              styles.categoryTabText,
              selectedCategory === category && styles.categoryTabTextActive,
            ]}
          >
            {category === '전체' ? '전체' : `${category} ${SLEEPING_CATEGORY_COUNT[category]}`}
          </Text>
          {category === '전체' && (
            <Text
              style={[
                styles.categoryTabCount,
                selectedCategory === category && styles.categoryTabCountActive,
              ]}
            >
              {SLEEPING_CATEGORY_COUNT['전체']}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

function CategoryIcon({
  active,
  category,
}: {
  active: boolean
  category: Exclude<SleepingCategory, '전체'>
}) {
  const color = active ? colors.white : colors.text
  const iconMap: Record<Exclude<SleepingCategory, '전체'>, ReactNode> = {
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
    marginBottom: spacing.sm,
  },
  categoryContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  categoryTab: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    gap: 4,
    minWidth: 56,
  },
  categoryTabActive: {},
  categoryIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTabText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '400',
    textAlign: 'center',
  },
  categoryTabTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  categoryTabCount: {
    fontSize: 11,
    color: colors.textMuted,
  },
  categoryTabCountActive: {
    color: colors.text,
    fontWeight: '600',
  },
})
