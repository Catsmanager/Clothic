import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { COLOR_PALETTE, resolvePaletteColor } from '../../constants/colorPalette'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { CatalogItem } from '../../constants/items'
import ItemPreviewThumb from '../ItemPreviewThumb'

interface Props {
  items: CatalogItem[]
  itemColors: Record<string, string>
  onSelectColor: (itemId: string, hex: string) => void
}

export default function ItemColorPicker({ items, itemColors, onSelectColor }: Props) {
  const [activeItemId, setActiveItemId] = useState<string | null>(items[0]?.id ?? null)

  if (items.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Feather name="heart" size={17} color={colors.accent} />
        <Text style={styles.emptyText}>
          색상을 고를 상의나 하의가 없어요. 다음 단계로 넘어가도 돼요.
        </Text>
      </View>
    )
  }

  const activeItem = items.find((item) => item.id === activeItemId) ?? items[0]
  const activeColor = itemColors[activeItem.id] ?? activeItem.color
  const activePalette = resolvePaletteColor(activeColor)
  const previewItem = { ...activeItem, color: activeColor }

  return (
    <>
      <View style={styles.summaryCard}>
        <View style={styles.previewBox}>
          <ItemPreviewThumb item={previewItem} size={54} />
        </View>
        <View style={styles.summaryText}>
          <Text style={styles.summaryLabel}>선택 아이템</Text>
          <Text style={styles.itemName} numberOfLines={1}>
            {activeItem.name}
          </Text>
        </View>
        <View style={styles.currentColor}>
          <Text style={styles.summaryLabel}>실제 색상</Text>
          <View style={styles.currentColorRow}>
            <View style={[styles.currentDot, { backgroundColor: activeColor }]} />
            <Text style={styles.currentName}>{activePalette.name}</Text>
          </View>
        </View>
      </View>

      {items.length > 1 && (
        <View style={styles.itemTabs}>
          {items.map((item) => {
            const active = item.id === activeItem.id

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemTab, active && styles.itemTabActive]}
                onPress={() => setActiveItemId(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name} 색상 선택`}
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[styles.itemTabText, active && styles.itemTabTextActive]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}

      <View style={styles.sectionTitleRow}>
        <Text style={styles.label}>색상 선택</Text>
        <Text style={styles.optionalText}>(선택사항)</Text>
      </View>
      <View style={styles.swatchRow}>
        {COLOR_PALETTE.map((palette) => {
          const isActive = activePalette.hex.toLowerCase() === palette.hex.toLowerCase()

          return (
            <TouchableOpacity
              key={palette.hex}
              style={styles.swatchButton}
              onPress={() => onSelectColor(activeItem.id, palette.hex)}
              accessibilityRole="button"
              accessibilityLabel={`${activeItem.name} ${palette.name}`}
              accessibilityState={{ selected: isActive }}
            >
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: palette.hex },
                  palette.hex === '#F5F5F5' && styles.lightSwatch,
                  isActive && styles.swatchActive,
                ]}
              >
                {isActive && (
                  <View style={styles.checkBadge}>
                    <Feather name="check" size={10} color={colors.white} />
                  </View>
                )}
              </View>
              <Text style={styles.swatchLabel}>{palette.name}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  previewBox: {
    width: 54,
    height: 54,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 3,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  currentColor: {
    minWidth: 76,
  },
  currentColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  currentDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  itemTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  itemTab: {
    maxWidth: 140,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  itemTabActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  itemTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  itemTabTextActive: {
    color: colors.white,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
  },
  optionalText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatchButton: {
    width: 48,
    alignItems: 'center',
    gap: 5,
  },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  lightSwatch: {
    borderColor: '#D8C8BE',
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: '#8A4F32',
  },
  checkBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#8A4F32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  emptyBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: '#FFF9F4',
    padding: spacing.md,
  },
  emptyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text,
  },
})
