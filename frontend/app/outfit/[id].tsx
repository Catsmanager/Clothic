import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Feather, Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { spacing, radius } from '../../constants/spacing'
import { useOutfitStore, MOOD_LABELS, WEATHER_LABELS } from '../../stores/outfitStore'
import {
  buildResolvableCatalogItems,
  findCatalogItemById,
  useItemStore,
} from '../../stores/itemStore'
import OutfitAvatar from '../../components/OutfitAvatar'
import { formatFullDateWithWeekday } from '../../lib/date'

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const outfit = useOutfitStore((s) => s.outfits.find((o) => o.id === id))
  const fetchOutfitById = useOutfitStore((s) => s.fetchOutfitById)
  const toggleFavorite = useOutfitStore((s) => s.toggleFavorite)
  const removeOutfit = useOutfitStore((s) => s.removeOutfit)
  const userItems = useItemStore((s) => s.items)
  const fetchItems = useItemStore((s) => s.fetchItems)
  const [busy, setBusy] = useState(false)
  const deleteInFlight = useRef(false)
  const [lookupAttempt, setLookupAttempt] = useState(0)
  const [lookup, setLookup] = useState<{
    id: string | undefined
    state: 'loading' | 'ready'
    error: string | null
  }>({ id, state: outfit ? 'ready' : 'loading', error: null })
  const catalogItems = useMemo(() => buildResolvableCatalogItems(userItems), [userItems])
  const lookupState = lookup.id === id ? lookup.state : 'loading'
  const lookupError = lookup.id === id ? lookup.error : null
  const leaveDetail = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/outfits')
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  useEffect(() => {
    if (deleteInFlight.current || outfit || !id) return

    let active = true
    void fetchOutfitById(id).then(({ error }) => {
      if (!active) return
      setLookup({ id, state: 'ready', error })
    })

    return () => {
      active = false
    }
  }, [fetchOutfitById, id, lookupAttempt, outfit])

  const items = useMemo(
    () =>
      outfit
        ? outfit.itemIds
            .map((iid) => findCatalogItemById(catalogItems, iid))
            .filter((it) => it != null)
        : [],
    [catalogItems, outfit]
  )

  const onToggleFav = useCallback(async () => {
    if (!outfit) return
    const { error } = await toggleFavorite(outfit.id, !outfit.isFavorite)
    if (error) {
      Alert.alert('즐겨찾기 실패', error)
    }
  }, [outfit, toggleFavorite])

  const onDelete = useCallback(() => {
    if (!outfit) return
    Alert.alert('코디 삭제', '이 코디를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          deleteInFlight.current = true
          setBusy(true)
          const { error } = await removeOutfit(outfit.id)
          setBusy(false)
          if (error) {
            deleteInFlight.current = false
            Alert.alert('삭제 실패', error)
            return
          }
          leaveDetail()
        },
      },
    ])
  }, [leaveDetail, outfit, removeOutfit])

  if (id && lookupState === 'loading' && !outfit) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <Header onBack={leaveDetail} onDelete={undefined} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.text} />
          <Text style={styles.emptySub}>코디를 불러오고 있어요.</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!outfit) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <Header onBack={leaveDetail} onDelete={undefined} />
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {lookupError ? '코디를 불러오지 못했어요.' : '코디를 찾을 수 없어요.'}
          </Text>
          <Text style={styles.emptySub}>
            {lookupError ?? '삭제되었거나 접근할 수 없는 기록이에요.'}
          </Text>
          {lookupError ? (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setLookup({ id, state: 'loading', error: null })
                setLookupAttempt((attempt) => attempt + 1)
              }}
              accessibilityRole="button"
              accessibilityLabel="코디 다시 불러오기"
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Header onBack={leaveDetail} onDelete={busy ? undefined : onDelete} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* 아바타 카드 */}
        <View style={styles.avatarCard}>
          <OutfitAvatar items={items} style={styles.avatar} />
          <TouchableOpacity
            style={styles.starBtn}
            onPress={onToggleFav}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={outfit.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            accessibilityState={{ selected: outfit.isFavorite }}
          >
            <Ionicons
              name={outfit.isFavorite ? 'star' : 'star-outline'}
              size={24}
              color={outfit.isFavorite ? '#F2B705' : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* 메타 정보 */}
        <View style={styles.infoCard}>
          <Text style={styles.date}>{formatFullDateWithWeekday(outfit.date)}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>날씨</Text>
            <Text style={styles.metaValue}>
              {outfit.weather ? WEATHER_LABELS[outfit.weather] : '-'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>기분</Text>
            <Text style={styles.metaValue}>{outfit.mood ? MOOD_LABELS[outfit.mood] : '-'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>메모</Text>
            <Text style={styles.metaValue}>{outfit.memo ?? '-'}</Text>
          </View>
        </View>

        {/* 착용 아이템 */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>착용 아이템 {items.length}개</Text>
          {items.length === 0 ? (
            <Text style={styles.emptySub}>등록된 아이템 정보가 없어요.</Text>
          ) : (
            <View style={styles.itemRow}>
              {items.map((it) => (
                <View key={it.id} style={styles.itemChip}>
                  <View
                    style={[
                      styles.itemSwatch,
                      { backgroundColor: outfit.itemColors[it.id] ?? it.color },
                    ]}
                  />
                  <Text style={styles.itemName}>{it.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function Header({ onBack, onDelete }: { onBack: () => void; onDelete: (() => void) | undefined }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={onBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
      >
        <Feather name="arrow-left" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>코디 상세</Text>
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={onDelete}
        disabled={onDelete == null}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="코디 삭제하기"
        accessibilityState={{ disabled: onDelete == null }}
      >
        <Feather name="trash-2" size={20} color={onDelete ? colors.danger : colors.border} />
      </TouchableOpacity>
    </View>
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
  body: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  avatarCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    height: 280,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  avatar: {
    width: '46%',
    height: '92%',
  },
  starBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  metaLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  itemSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemName: {
    fontSize: 12,
    color: colors.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  retryButton: {
    minHeight: 44,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.text,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
})
