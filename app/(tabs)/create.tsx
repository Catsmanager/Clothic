import { useState, useCallback } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { spacing, radius } from '../../constants/spacing'
import {
  type Category,
  type MockItem,
  MOCK_ITEMS,
  SUB_CATEGORIES,
  CATEGORY_LABELS,
} from '../../constants/mockItems'
import SaveOutfitSheet from '../../components/SaveOutfitSheet'
import { useOutfitStore, type NewOutfit } from '../../stores/outfitStore'

const BASE_AVATAR = require('../../assets/avatar/base/base_female_01.png')

const CATEGORIES: Category[] = ['hair', 'top', 'bottom', 'shoes', 'bag', 'accessory']
const SCREEN_WIDTH = Dimensions.get('window').width

const CATEGORY_ICONS: Record<Category, string> = {
  hair: '헤어',
  top: '상의',
  bottom: '하의',
  shoes: '신발',
  bag: '가방',
  accessory: '악세서리',
}

// 카테고리별 Feather 아이콘 대신 텍스트 이모지 사용
const CATEGORY_EMOJI: Record<Category, string> = {
  hair: '💆',
  top: '👕',
  bottom: '👖',
  shoes: '👟',
  bag: '👜',
  accessory: '⭐',
}

export default function CreateScreen() {
  const [activeCategory, setActiveCategory] = useState<Category>('top')
  const [activeSubCategory, setActiveSubCategory] = useState<string>('전체')
  const [equipped, setEquipped] = useState<Partial<Record<Category, string>>>({})
  const [history, setHistory] = useState<Partial<Record<Category, string>>[]>([{}])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [sheetVisible, setSheetVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const addOutfit = useOutfitStore((s) => s.addOutfit)

  const subCategories = SUB_CATEGORIES[activeCategory]

  const filteredItems = MOCK_ITEMS.filter(
    (item) =>
      item.category === activeCategory &&
      (activeSubCategory === '전체' || item.subCategory === activeSubCategory)
  )

  const handleCategoryPress = useCallback((cat: Category) => {
    setActiveCategory(cat)
    setActiveSubCategory('전체')
  }, [])

  const handleSubCategoryPress = useCallback((sub: string) => {
    setActiveSubCategory(sub)
  }, [])

  const handleItemPress = useCallback(
    (item: MockItem) => {
      const next = { ...equipped, [item.category]: item.id }
      const newHistory = history.slice(0, historyIndex + 1)
      setHistory([...newHistory, next])
      setHistoryIndex(newHistory.length)
      setEquipped(next)
    },
    [equipped, history, historyIndex]
  )

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return
    const prev = historyIndex - 1
    setHistoryIndex(prev)
    setEquipped(history[prev] ?? {})
  }, [history, historyIndex])

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    const next = historyIndex + 1
    setHistoryIndex(next)
    setEquipped(history[next] ?? {})
  }, [history, historyIndex])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  // 선택한 아이템 id 목록 (값이 있는 것만)
  const equippedItemIds = Object.values(equipped).filter((id): id is string => id != null)

  const handleSave = useCallback(
    async (input: NewOutfit) => {
      setSaving(true)
      const { error } = await addOutfit(input)
      setSaving(false)
      if (error) {
        Alert.alert('저장 실패', error)
        return
      }
      setSheetVisible(false)
      router.replace('/outfits')
    },
    [addOutfit]
  )

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>코디 만들기</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={() => setSheetVisible(true)}>
          <Text style={styles.saveBtnText}>저장</Text>
        </TouchableOpacity>
      </View>

      {/* 중단: 카테고리 패널 | 아바타 | 액션 버튼 */}
      <View style={styles.middle}>
        {/* 좌측 카테고리 패널 */}
        <ScrollView
          style={styles.categoryPanel}
          contentContainerStyle={styles.categoryContent}
          showsVerticalScrollIndicator={false}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryItem, activeCategory === cat && styles.categoryItemActive]}
              onPress={() => handleCategoryPress(cat)}
            >
              <Text style={styles.categoryEmoji}>{CATEGORY_EMOJI[cat]}</Text>
              <Text
                style={[styles.categoryLabel, activeCategory === cat && styles.categoryLabelActive]}
              >
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.categoryItem}>
            <Text style={styles.categoryEmoji}>🖼️</Text>
            <Text style={styles.categoryLabel}>배경</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 중앙 아바타 영역 */}
        <View style={styles.avatarArea}>
          <Image source={BASE_AVATAR} style={styles.avatarImage} resizeMode="contain" />
        </View>

        {/* 우측 액션 버튼 */}
        <View style={styles.actionPanel}>
          <TouchableOpacity
            style={[styles.actionBtn, !canUndo && styles.actionBtnDisabled]}
            onPress={handleUndo}
            disabled={!canUndo}
          >
            <Feather name="rotate-ccw" size={18} color={canUndo ? colors.text : colors.textMuted} />
          </TouchableOpacity>
          <Text style={[styles.actionLabel, !canUndo && styles.actionLabelDisabled]}>
            실행 취소
          </Text>

          <TouchableOpacity
            style={[styles.actionBtn, !canRedo && styles.actionBtnDisabled]}
            onPress={handleRedo}
            disabled={!canRedo}
          >
            <Feather name="rotate-cw" size={18} color={canRedo ? colors.text : colors.textMuted} />
          </TouchableOpacity>
          <Text style={[styles.actionLabel, !canRedo && styles.actionLabelDisabled]}>
            다시 실행
          </Text>

          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="refresh-cw" size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.actionLabel}>회전</Text>

          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="minimize-2" size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.actionLabel}>좌우 반전</Text>
        </View>
      </View>

      {/* 하단 아이템 패널 */}
      <View style={styles.bottomPanel}>
        {/* 서브카테고리 탭 */}
        <View style={styles.subTabHeader}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subTabRow}
          >
            {subCategories.map((sub) => (
              <TouchableOpacity
                key={sub}
                style={[styles.subTab, activeSubCategory === sub && styles.subTabActive]}
                onPress={() => handleSubCategoryPress(sub)}
              >
                <Text
                  style={[styles.subTabText, activeSubCategory === sub && styles.subTabTextActive]}
                >
                  {sub}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.fullViewBtn}
            onPress={() =>
              router.push({ pathname: '/item-select', params: { category: activeCategory } })
            }
          >
            <Feather name="grid" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 아이템 그리드 */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={4}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.itemCard,
                equipped[item.category] === item.id && styles.itemCardSelected,
              ]}
              onPress={() => handleItemPress(item)}
            >
              <View style={[styles.itemColorBox, { backgroundColor: item.color }]} />
            </TouchableOpacity>
          )}
        />
      </View>

      <SaveOutfitSheet
        visible={sheetVisible}
        itemIds={equippedItemIds}
        saving={saving}
        onClose={() => setSheetVisible(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  )
}

const ITEM_SIZE = (SCREEN_WIDTH - spacing.md * 2 - spacing.sm * 3) / 4

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
  saveBtn: {
    backgroundColor: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // 중단
  middle: {
    flexDirection: 'row',
    flex: 1,
    minHeight: 0,
  },

  // 좌측 카테고리
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

  // 중앙 아바타
  avatarArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
  },
  avatarImage: {
    width: '75%',
    height: '90%',
  },

  // 우측 액션
  actionPanel: {
    width: 72,
    paddingTop: spacing.sm,
    paddingRight: spacing.xs,
    gap: 2,
    alignItems: 'center',
  },
  actionBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  actionBtnDisabled: {
    backgroundColor: colors.secondary,
  },
  actionLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actionLabelDisabled: {
    color: colors.border,
  },

  // 하단 패널
  bottomPanel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.md,
    height: 280,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  subTabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  subTabRow: {
    flex: 1,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  fullViewBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  subTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
  },
  subTabActive: {
    backgroundColor: colors.text,
  },
  subTabText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  subTabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },

  // 아이템 그리드
  gridContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  gridRow: {
    gap: spacing.sm,
  },
  itemCard: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemCardSelected: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  itemColorBox: {
    width: '70%',
    height: '70%',
    borderRadius: 4,
  },
})
