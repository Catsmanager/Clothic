import { useState, useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { spacing, radius } from '../../constants/spacing'

type SleepingCategory = '전체' | '상의' | '하의' | '원피스' | '아우터' | '신발/가방'
type SortOrder = '오래된 순' | '최신 순'

interface SleepingItem {
  id: string
  name: string
  tags: string[]
  lastWorn: string
  color: string
  category: Exclude<SleepingCategory, '전체'>
}

const SLEEPING_ITEMS: SleepingItem[] = [
  {
    id: '1',
    name: '크림 케이블 니트',
    tags: ['니트', '베이지', '루즈핏'],
    lastWorn: '2026.01.15',
    color: '#EDE0C8',
    category: '상의',
  },
  {
    id: '2',
    name: '연청 와이드 데님 팬츠',
    tags: ['데님', '연청', '와이드'],
    lastWorn: '2026.01.12',
    color: '#6B8CAE',
    category: '하의',
  },
  {
    id: '3',
    name: '블랙 롱 코트',
    tags: ['아우터', '블랙', '롱핏'],
    lastWorn: '2026.01.05',
    color: '#1C1C1C',
    category: '아우터',
  },
  {
    id: '4',
    name: '블랙 캔버스 스니커즈',
    tags: ['신발', '블랙', '캐주얼'],
    lastWorn: '2025.12.28',
    color: '#2A2A2A',
    category: '신발/가방',
  },
  {
    id: '5',
    name: '브라운 숄더백',
    tags: ['가방', '브라운', '데일리'],
    lastWorn: '2025.12.20',
    color: '#8A6A4A',
    category: '신발/가방',
  },
  {
    id: '6',
    name: '플라워 롱 원피스',
    tags: ['원피스', '플라워', '롱'],
    lastWorn: '2025.12.18',
    color: '#D4C4A8',
    category: '원피스',
  },
  {
    id: '7',
    name: '화이트 린넨 셔츠',
    tags: ['셔츠', '화이트', '린넨'],
    lastWorn: '2025.12.10',
    color: '#F5F5F5',
    category: '상의',
  },
  {
    id: '8',
    name: '베이지 슬랙스',
    tags: ['슬랙스', '베이지', '와이드'],
    lastWorn: '2025.12.05',
    color: '#C8B89A',
    category: '하의',
  },
  {
    id: '9',
    name: '머스타드 니트 조끼',
    tags: ['니트', '머스타드', '조끼'],
    lastWorn: '2025.11.28',
    color: '#C8A832',
    category: '상의',
  },
  {
    id: '10',
    name: '브라운 앵클부츠',
    tags: ['부츠', '브라운', '앵클'],
    lastWorn: '2025.11.20',
    color: '#7A5A3A',
    category: '신발/가방',
  },
  {
    id: '11',
    name: '플로럴 미디 스커트',
    tags: ['스커트', '플로럴', '미디'],
    lastWorn: '2025.11.15',
    color: '#D4A0A0',
    category: '하의',
  },
  {
    id: '12',
    name: '네이비 블레이저',
    tags: ['블레이저', '네이비', '포멀'],
    lastWorn: '2025.11.10',
    color: '#2C3E6B',
    category: '아우터',
  },
  {
    id: '13',
    name: '화이트 미니 원피스',
    tags: ['원피스', '화이트', '미니'],
    lastWorn: '2025.10.30',
    color: '#EFEFEF',
    category: '원피스',
  },
  {
    id: '14',
    name: '카키 트렌치코트',
    tags: ['코트', '카키', '트렌치'],
    lastWorn: '2025.10.20',
    color: '#7A8A5A',
    category: '아우터',
  },
  {
    id: '15',
    name: '블랙 크로스백',
    tags: ['가방', '블랙', '크로스'],
    lastWorn: '2025.10.15',
    color: '#1C1C1C',
    category: '신발/가방',
  },
  {
    id: '16',
    name: '스트라이프 긴팔티',
    tags: ['티셔츠', '스트라이프', '베이직'],
    lastWorn: '2025.10.08',
    color: '#C8C8C8',
    category: '상의',
  },
  {
    id: '17',
    name: '그레이 조거팬츠',
    tags: ['팬츠', '그레이', '조거'],
    lastWorn: '2025.09.25',
    color: '#8A8A8A',
    category: '하의',
  },
  {
    id: '18',
    name: '카멜 숄더백',
    tags: ['가방', '카멜', '숄더'],
    lastWorn: '2025.09.18',
    color: '#C8944A',
    category: '신발/가방',
  },
]

const CATEGORY_COUNT: Record<SleepingCategory, number> = {
  전체: 18,
  상의: 6,
  하의: 4,
  원피스: 2,
  아우터: 4,
  '신발/가방': 2,
}

const CATEGORIES: SleepingCategory[] = ['전체', '상의', '하의', '원피스', '아우터', '신발/가방']

export default function WardrobeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<SleepingCategory>('전체')
  const [sortOrder, setSortOrder] = useState<SortOrder>('오래된 순')

  const filteredItems = useMemo(() => {
    const items =
      selectedCategory === '전체'
        ? SLEEPING_ITEMS
        : SLEEPING_ITEMS.filter((item) => item.category === selectedCategory)

    return [...items].sort((a, b) => {
      const dateA = a.lastWorn.replace(/\./g, '')
      const dateB = b.lastWorn.replace(/\./g, '')
      return sortOrder === '오래된 순'
        ? Number(dateA) - Number(dateB)
        : Number(dateB) - Number(dateA)
    })
  }, [selectedCategory, sortOrder])

  const toggleSort = () => {
    setSortOrder((prev) => (prev === '오래된 순' ? '최신 순' : '오래된 순'))
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>잠자는 옷장</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Feather name="help-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Feather name="settings" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 정보 배너 */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerLeft}>
            <View style={styles.boxIllustration}>
              <Text style={styles.boxIllustrationEmoji}>📦</Text>
              <Text style={styles.boxZzz}>zzz</Text>
            </View>
            <View style={styles.infoBannerText}>
              <Text style={styles.infoBannerTitle}>잠자는 옷이 많아요 😴</Text>
              <Text style={styles.infoBannerDesc}>
                다시 꺼내 입으면 새로운 코디를{'\n'}완성할 수 있어요.
              </Text>
            </View>
          </View>
          <View style={styles.infoBannerCount}>
            <Text style={styles.infoBannerCountNum}>18</Text>
            <Text style={styles.infoBannerCountLabel}>개</Text>
            <Text style={styles.infoBannerCountSub}>전체 잠자는 옷</Text>
          </View>
        </View>

        {/* 카테고리 필터 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryTab, selectedCategory === cat && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              {cat === '전체' ? null : (
                <View style={styles.categoryIconWrapper}>
                  <CategoryIcon category={cat} active={selectedCategory === cat} />
                </View>
              )}
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategory === cat && styles.categoryTabTextActive,
                ]}
              >
                {cat === '전체' ? '전체' : `${cat} ${CATEGORY_COUNT[cat]}`}
              </Text>
              {cat === '전체' && (
                <Text
                  style={[
                    styles.categoryTabCount,
                    selectedCategory === cat && styles.categoryTabCountActive,
                  ]}
                >
                  {CATEGORY_COUNT['전체']}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 정렬 / 필터 바 */}
        <View style={styles.sortBar}>
          <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
            <Text style={styles.sortButtonText}>{sortOrder}</Text>
            <Feather name="chevron-down" size={14} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Feather name="filter" size={14} color={colors.text} />
            <Text style={styles.filterButtonText}>필터</Text>
          </TouchableOpacity>
        </View>

        {/* 아이템 리스트 */}
        <View style={styles.itemList}>
          {filteredItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.itemCard}>
              <View style={[styles.itemThumbnail, { backgroundColor: item.color }]} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemTags}>
                  {item.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemLastWornLabel}>마지막 착용</Text>
                <Text style={styles.itemLastWornDate}>{item.lastWorn}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* 하단 배너 */}
        <View style={styles.bottomBanner}>
          <View style={styles.bottomBannerLeft}>
            <Text style={styles.bottomBannerLeaf}>🌱</Text>
            <View>
              <Text style={styles.bottomBannerTitle}>옷장을 가볍게, 스타일은 더 풍성하게 🌱</Text>
              <Text style={styles.bottomBannerDesc}>잠자는 옷을 다시 활용해보세요!</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.recommendButton}>
            <Text style={styles.recommendButtonText}>코디 추천 받기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  )
}

function CategoryIcon({
  category,
  active,
}: {
  category: Exclude<SleepingCategory, '전체'>
  active: boolean
}) {
  const color = active ? colors.white : colors.text
  const iconMap: Record<Exclude<SleepingCategory, '전체'>, React.ReactNode> = {
    상의: <Ionicons name="shirt-outline" size={18} color={color} />,
    하의: <Feather name="align-justify" size={18} color={color} />,
    원피스: <Ionicons name="body-outline" size={18} color={color} />,
    아우터: <Ionicons name="layers-outline" size={18} color={color} />,
    '신발/가방': <Ionicons name="bag-outline" size={18} color={color} />,
  }
  return <>{iconMap[category]}</>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  helpButton: {
    padding: 2,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  boxIllustration: {
    width: 56,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxIllustrationEmoji: {
    fontSize: 24,
  },
  boxZzz: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '600',
  },
  infoBannerText: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoBannerDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  infoBannerCount: {
    alignItems: 'flex-end',
  },
  infoBannerCountNum: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 40,
  },
  infoBannerCountLabel: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: -4,
  },
  infoBannerCountSub: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
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
  itemList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  itemThumbnail: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
  },
  itemInfo: {
    flex: 1,
    gap: 6,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  itemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  itemLastWornLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  itemLastWornDate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  bottomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    marginRight: spacing.sm,
  },
  bottomBannerLeaf: {
    fontSize: 24,
  },
  bottomBannerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  bottomBannerDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },
  recommendButton: {
    backgroundColor: colors.text,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    flexShrink: 0,
  },
  recommendButtonText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
  },
  bottomPadding: {
    height: spacing.xl,
  },
})
