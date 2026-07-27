import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
  type GestureResponderEvent,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Feather, Ionicons } from '@expo/vector-icons'
import { colors } from '../constants/colors'
import { spacing, radius } from '../constants/spacing'
import OutfitAvatar from '../components/OutfitAvatar'
import { formatShortDateWithWeekday } from '../lib/date'
import { isStyledOutfit } from '../lib/outfitRecords'
import type { CatalogItem } from '../constants/items'
import { buildCatalogItems, findCatalogItemById, useItemStore } from '../stores/itemStore'
import { useOutfitStore, type Outfit } from '../stores/outfitStore'

const SCREEN_WIDTH = Dimensions.get('window').width
const CARD_GAP = spacing.sm
const H_PADDING = spacing.md
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP * 2) / 3

type Tab = '전체 코디' | '즐겨찾기'

export default function OutfitsScreen() {
  const outfits = useOutfitStore((s) => s.outfits)
  const loading = useOutfitStore((s) => s.loading)
  const error = useOutfitStore((s) => s.error)
  const fetchOutfits = useOutfitStore((s) => s.fetchOutfits)
  const toggleFavorite = useOutfitStore((s) => s.toggleFavorite)
  const userItems = useItemStore((s) => s.items)
  const fetchItems = useItemStore((s) => s.fetchItems)

  const [tab, setTab] = useState<Tab>('전체 코디')

  useEffect(() => {
    fetchOutfits()
    fetchItems()
  }, [fetchItems, fetchOutfits])

  const catalogItems = useMemo(() => buildCatalogItems(userItems), [userItems])

  const visible = useMemo(() => {
    const styledOutfits = outfits.filter(isStyledOutfit)
    return tab === '즐겨찾기' ? styledOutfits.filter((outfit) => outfit.isFavorite) : styledOutfits
  }, [tab, outfits])

  const onToggleFav = useCallback(
    async (o: Outfit) => {
      const { error } = await toggleFavorite(o.id, !o.isFavorite)
      if (error) {
        Alert.alert('즐겨찾기 실패', error)
      }
    },
    [toggleFavorite]
  )

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(tabs)/more')
  }, [])

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={handleBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>코디 저장</Text>
        <View style={styles.headerBtn} accessible={false} />
      </View>

      {/* 탭 */}
      <View style={styles.tabBar}>
        {(['전체 코디', '즐겨찾기'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={styles.tabItem}
            onPress={() => setTab(t)}
            accessibilityRole="button"
            accessibilityLabel={`${t} 보기`}
            accessibilityState={{ selected: tab === t }}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            {tab === t && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>코디를 불러오지 못했어요.</Text>
          <Text style={styles.emptySub}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchOutfits()}
            accessibilityRole="button"
            accessibilityLabel="코디 다시 불러오기"
          >
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(o) => o.id}
          numColumns={3}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="shirt-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                {tab === '즐겨찾기' ? '즐겨찾기한 코디가 없어요.' : '저장된 코디가 없어요.'}
              </Text>
              <Text style={styles.emptySub}>코디를 만들어 저장해보세요.</Text>
            </View>
          }
          ListFooterComponent={
            <TouchableOpacity
              style={styles.newBtn}
              onPress={() => router.push('/(tabs)/create')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="새 코디 저장하기"
            >
              <Feather name="plus" size={18} color={colors.text} />
              <Text style={styles.newBtnText}>새 코디 저장하기</Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <OutfitCard
              catalogItems={catalogItems}
              outfit={item}
              onToggleFav={() => onToggleFav(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  )
}

function OutfitCard({
  catalogItems,
  outfit,
  onToggleFav,
}: {
  catalogItems: CatalogItem[]
  outfit: Outfit
  onToggleFav: () => void
}) {
  const items = outfit.itemIds
    .map((id) => findCatalogItemById(catalogItems, id))
    .filter((item): item is CatalogItem => item != null)
  const dateLabel = formatShortDateWithWeekday(outfit.date)
  const memoLabel = outfit.memo ?? '메모 없음'
  const handleToggleFav = (event: GestureResponderEvent) => {
    event.stopPropagation()
    onToggleFav()
  }

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/outfit/${outfit.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${dateLabel} 코디 상세 보기, ${memoLabel}`}
    >
      <View style={styles.thumb}>
        <OutfitAvatar items={items} style={styles.thumbAvatar} />
        <TouchableOpacity
          style={styles.starBtn}
          onPress={handleToggleFav}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={outfit.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          accessibilityState={{ selected: outfit.isFavorite }}
        >
          <Ionicons
            name={outfit.isFavorite ? 'star' : 'star-outline'}
            size={18}
            color={outfit.isFavorite ? '#F2B705' : colors.textMuted}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDate}>{dateLabel}</Text>
      <Text style={styles.cardMemo} numberOfLines={1}>
        {memoLabel}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: {
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

  // 탭
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    left: 0,
    right: 0,
    backgroundColor: colors.text,
  },

  // 그리드
  gridContent: {
    padding: H_PADDING,
    paddingBottom: spacing.xl,
  },
  gridRow: {
    gap: CARD_GAP,
    marginBottom: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
  },
  thumb: {
    width: '100%',
    aspectRatio: 0.78,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbAvatar: {
    width: '78%',
    height: '92%',
  },
  starBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  cardDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  cardMemo: {
    fontSize: 13,
    color: colors.text,
    marginTop: 2,
  },

  // 새 코디 버튼
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 56,
    marginTop: spacing.sm,
  },
  newBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },

  // 상태
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  retryBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.text,
  },
  retryText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
})
