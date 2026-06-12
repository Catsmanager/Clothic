import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { COLOR_PALETTE, resolvePaletteColor } from '../../constants/colorPalette'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { CatalogItem } from '../../constants/items'

interface Props {
  items: CatalogItem[]
  itemColors: Record<string, string>
  onSelectColor: (itemId: string, hex: string) => void
}

// 코디에 착용한 아이템별로 통계에 기록할 색상을 고른다.
// 기본은 현재 색만 접어서 보여주고, 탭한 아이템만 팔레트를 펼친다(강제 선택 없음, 마찰 최소화).
export default function ItemColorPicker({ items, itemColors, onSelectColor }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (items.length === 0) return null

  function handleSelect(itemId: string, hex: string) {
    onSelectColor(itemId, hex)
    setExpandedId(null) // 고르면 접는다.
  }

  return (
    <>
      <Text style={styles.label}>아이템 색상</Text>
      <View style={styles.list}>
        {items.map((item) => {
          const selected = itemColors[item.id] ?? item.color
          const selectedPalette = resolvePaletteColor(selected)
          const expanded = expandedId === item.id

          return (
            <View key={item.id}>
              <TouchableOpacity
                style={styles.summaryRow}
                onPress={() => setExpandedId(expanded ? null : item.id)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name} 색상 ${selectedPalette.name}, 변경하려면 누르세요`}
                accessibilityState={{ expanded }}
              >
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={[styles.currentDot, { backgroundColor: selected }]} />
                <Text style={styles.currentName}>{selectedPalette.name}</Text>
                <Feather
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              {expanded && (
                <View style={styles.swatchRow}>
                  {COLOR_PALETTE.map((palette) => {
                    const isActive = selectedPalette.hex.toLowerCase() === palette.hex.toLowerCase()

                    return (
                      <TouchableOpacity
                        key={palette.hex}
                        style={[
                          styles.swatch,
                          { backgroundColor: palette.hex },
                          isActive && styles.swatchActive,
                        ]}
                        onPress={() => handleSelect(item.id, palette.hex)}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.name} ${palette.name}`}
                        accessibilityState={{ selected: isActive }}
                      />
                    )
                  })}
                </View>
              )}
            </View>
          )
        })}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: spacing.sm,
  },
  list: {
    gap: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  currentDot: {
    width: 16,
    height: 16,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentName: {
    fontSize: 12,
    color: colors.textMuted,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: colors.text,
  },
})
