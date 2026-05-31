import { useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { colors } from '../constants/colors'
import { spacing, radius } from '../constants/spacing'
import {
  type Category,
  type CatalogItem,
  ITEMS,
  SUB_CATEGORIES,
  CATEGORY_LABELS,
  isCategory,
} from '../constants/items'

const SCREEN_WIDTH = Dimensions.get('window').width
const COLUMN_COUNT = 3
const CARD_GAP = spacing.sm
const HORIZONTAL_PADDING = spacing.md
const CARD_SIZE =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT

export default function ItemSelectScreen() {
  const params = useLocalSearchParams<{ category?: string }>()
  const category: Category = isCategory(params.category) ? params.category : 'top'

  const [activeSubCategory, setActiveSubCategory] = useState<string>('전체')

  const subCategories = SUB_CATEGORIES[category] ?? ['전체']
  const categoryLabel = CATEGORY_LABELS[category] ?? ''

  const filteredItems: CatalogItem[] = ITEMS.filter(
    (item) =>
      item.category === category &&
      (activeSubCategory === '전체' || item.subCategory === activeSubCategory)
  )

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>아이템 선택 ({categoryLabel})</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* 서브카테고리 탭 */}
      <View style={styles.tabRow}>
        {subCategories.map((sub) => (
          <TouchableOpacity
            key={sub}
            style={[styles.tab, activeSubCategory === sub && styles.tabActive]}
            onPress={() => setActiveSubCategory(sub)}
          >
            <Text style={[styles.tabText, activeSubCategory === sub && styles.tabTextActive]}>
              {sub}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 아이템 그리드 */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemWrapper}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <View style={styles.itemCard}>
              <View style={[styles.itemColorBox, { backgroundColor: item.color }]} />
            </View>
            <Text style={styles.itemLabel} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },

  // 서브카테고리 탭
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

  // 아이템 그리드
  gridContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: spacing.xxl,
    gap: CARD_GAP,
  },
  itemWrapper: {
    width: CARD_SIZE,
    marginRight: CARD_GAP,
    marginBottom: spacing.xs,
    alignItems: 'center',
  },
  itemCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  itemColorBox: {
    width: '65%',
    height: '65%',
    borderRadius: radius.sm,
  },
  itemLabel: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '400',
  },
})
