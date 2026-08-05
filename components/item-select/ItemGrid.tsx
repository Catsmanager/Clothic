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
  disabledItemId?: string | null
  emptyActionLabel?: string
  emptyMessage: string
  getItemActionLabel?: (item: CatalogItem) => string | null
  items: CatalogItem[]
  onEmptyActionPress?: () => void
  onItemPress: (item: CatalogItem) => void
}

export default function ItemGrid({
  disabledItemId,
  emptyActionLabel,
  emptyMessage,
  getItemActionLabel,
  items,
  onEmptyActionPress,
  onItemPress,
}: Props) {
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
          <Text style={styles.emptyStateText}>{emptyMessage}</Text>
          {emptyActionLabel && onEmptyActionPress && (
            <TouchableOpacity
              style={styles.emptyAction}
              onPress={onEmptyActionPress}
              accessibilityRole="button"
              accessibilityLabel={emptyActionLabel}
            >
              <Text style={styles.emptyActionText}>{emptyActionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      }
      renderItem={({ item }) => {
        const actionLabel = getItemActionLabel?.(item) ?? null
        const disabled = disabledItemId === item.id
        return (
          <TouchableOpacity
            style={[styles.itemWrapper, { width: cardSize }, disabled && styles.itemDisabled]}
            onPress={() => onItemPress(item)}
            disabled={disabled}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${item.name} ${actionLabel ?? '선택'}`}
            accessibilityState={{ disabled }}
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
            {actionLabel && <Text style={styles.actionLabel}>{actionLabel}</Text>}
          </TouchableOpacity>
        )
      }}
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
  itemDisabled: {
    opacity: 0.5,
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
  actionLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
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
  emptyAction: {
    minHeight: 44,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
})
