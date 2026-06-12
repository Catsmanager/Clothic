import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import { CATEGORY_LABELS, type CatalogItem } from '../../constants/items'
import { formatKoreanMonthDayWithWeekday } from '../../lib/date'
import { getAvatarItemAsset, getAvatarItemPreviewStyle } from '../../lib/avatarAssets'
import { MOOD_LABELS, WEATHER_LABELS, type Outfit } from '../../stores/outfitStore'

interface Props {
  dateKey: string
  items: CatalogItem[]
  outfit: Outfit
  onPress: () => void
}

export default function SelectedOutfitCard({ dateKey, items, outfit, onPress }: Props) {
  return (
    <Pressable style={styles.detailCard} onPress={onPress}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailDate}>{formatKoreanMonthDayWithWeekday(dateKey)}</Text>
        <View style={styles.headerMeta}>
          <Text style={styles.detailWeather}>
            {outfit.weather ? WEATHER_LABELS[outfit.weather] : '-'}
          </Text>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemRow}
      >
        {items.length > 0 ? (
          items.map((item) => <SelectedItemThumb key={item.id} item={item} />)
        ) : (
          <View style={styles.emptyItems}>
            <Text style={styles.emptyItemsText}>
              {outfit.itemIds.length > 0
                ? '아이템 정보를 불러오는 중입니다'
                : '저장된 아이템이 없습니다'}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.memoRow}>
        <Text style={styles.mood}>{outfit.mood ? MOOD_LABELS[outfit.mood] : '-'}</Text>
        <View style={styles.memoDivider} />
        <Text style={styles.detailMemo} numberOfLines={2}>
          {outfit.memo ?? '메모 없음'}
        </Text>
      </View>
    </Pressable>
  )
}

function SelectedItemThumb({ item }: { item: CatalogItem }) {
  const asset = getAvatarItemAsset(item.id)

  return (
    <View style={styles.itemThumb}>
      <View style={styles.itemPreview}>
        {asset ? (
          <Image
            source={asset.source}
            style={[styles.itemAssetImage, getAvatarItemPreviewStyle(item.id, 56)]}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.itemColor, { backgroundColor: item.color }]} />
        )}
      </View>
      <Text style={styles.itemCategory} numberOfLines={1}>
        {CATEGORY_LABELS[item.category]}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  detailCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailDate: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  detailWeather: {
    fontSize: 13,
    color: colors.textMuted,
  },
  itemRow: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  itemThumb: {
    width: 66,
    height: 66,
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  itemPreview: {
    width: 56,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemAssetImage: {
    position: 'absolute',
    alignSelf: 'center',
  },
  itemColor: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemCategory: {
    maxWidth: 58,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  emptyItems: {
    minHeight: 66,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  emptyItemsText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  memoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  mood: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  memoDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.textMuted,
  },
  detailMemo: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
})
