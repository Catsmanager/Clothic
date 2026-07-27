import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { CatalogItem } from '../../constants/items'
import ItemPreviewThumb from '../ItemPreviewThumb'

const COLUMN_COUNT = 3
const CARD_GAP = spacing.sm
const HORIZONTAL_PADDING = spacing.md

interface Props {
  items: CatalogItem[]
  onItemPress: (item: CatalogItem) => void
}

export default function ItemGrid({ items, onItemPress }: Props) {
  const { width } = useWindowDimensions()
  const cardSize = (width - HORIZONTAL_PADDING * 2 - CARD_GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={COLUMN_COUNT}
      contentContainerStyle={styles.gridContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            추후 업데이트될 예정입니다{'\n'}조금만 기다려주세요
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.itemWrapper, { width: cardSize }]}
          onPress={() => onItemPress(item)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`${item.name} 선택`}
        >
          <View style={[styles.itemCard, { width: cardSize, height: cardSize }]}>
            <ItemPreview item={item} itemSize={cardSize} />
          </View>
          <View style={styles.labelRow}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Text style={styles.itemLabel} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  )
}

function ItemPreview({ item, itemSize }: { item: CatalogItem; itemSize: number }) {
  return <ItemPreviewThumb item={item} size={itemSize} />
}

const styles = StyleSheet.create({
  gridContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: spacing.xxl,
    gap: CARD_GAP,
  },
  itemWrapper: {
    marginRight: CARD_GAP,
    marginBottom: spacing.xs,
    alignItems: 'center',
  },
  itemCard: {
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
  labelRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  itemLabel: {
    flexShrink: 1,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '400',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
  },
})
