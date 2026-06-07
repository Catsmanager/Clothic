import { useEffect, useMemo, useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Feather, Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { spacing, radius } from '../../constants/spacing'
import { useOutfitStore, MOOD_LABELS, WEATHER_LABELS } from '../../stores/outfitStore'
import { buildCatalogItems, findCatalogItemById, useItemStore } from '../../stores/itemStore'
import OutfitAvatar from '../../components/OutfitAvatar'
import { formatFullDateWithWeekday } from '../../lib/date'

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const outfit = useOutfitStore((s) => s.outfits.find((o) => o.id === id))
  const toggleFavorite = useOutfitStore((s) => s.toggleFavorite)
  const removeOutfit = useOutfitStore((s) => s.removeOutfit)
  const userItems = useItemStore((s) => s.items)
  const fetchItems = useItemStore((s) => s.fetchItems)
  const [busy, setBusy] = useState(false)
  const catalogItems = useMemo(() => buildCatalogItems(userItems), [userItems])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const items = useMemo(
    () =>
      outfit
        ? outfit.itemIds
            .map((iid) => findCatalogItemById(catalogItems, iid))
            .filter((it) => it != null)
        : [],
    [catalogItems, outfit]
  )

  const onDelete = useCallback(() => {
    if (!outfit) return
    Alert.alert('코디 삭제', '이 코디를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          setBusy(true)
          const { error } = await removeOutfit(outfit.id)
          setBusy(false)
          if (error) {
            Alert.alert('삭제 실패', error)
            return
          }
          router.back()
        },
      },
    ])
  }, [outfit, removeOutfit])

  // 목록에서 진입하지 않았거나 데이터가 비어있는 경우(예: 새로고침)
  if (!outfit) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <Header onDelete={undefined} />
        <View style={styles.center}>
          <Text style={styles.emptyText}>코디를 찾을 수 없어요.</Text>
          <Text style={styles.emptySub}>목록에서 다시 열어주세요.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header onDelete={busy ? undefined : onDelete} />

      <View style={styles.body}>
        {/* 아바타 카드 */}
        <View style={styles.avatarCard}>
          <OutfitAvatar style={styles.avatar} />
          <TouchableOpacity
            style={styles.starBtn}
            onPress={() => toggleFavorite(outfit.id, !outfit.isFavorite)}
            hitSlop={8}
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
                  <View style={[styles.itemSwatch, { backgroundColor: it.color }]} />
                  <Text style={styles.itemName}>{it.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

function Header({ onDelete }: { onDelete: (() => void) | undefined }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} hitSlop={8}>
        <Feather name="arrow-left" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>코디 상세</Text>
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={onDelete}
        disabled={onDelete == null}
        hitSlop={8}
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
    flex: 1,
    padding: spacing.md,
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
  },
})
