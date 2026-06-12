import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLOR_PALETTE } from '../../constants/colorPalette'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { CatalogItem } from '../../constants/items'

interface Props {
  items: CatalogItem[]
  itemColors: Record<string, string>
  onSelectColor: (itemId: string, hex: string) => void
}

// 코디에 착용한 아이템별로 통계에 기록할 색상을 고른다. 기본값은 아이템 원래 색.
export default function ItemColorPicker({ items, itemColors, onSelectColor }: Props) {
  if (items.length === 0) return null

  return (
    <>
      <Text style={styles.label}>아이템 색상</Text>
      <View style={styles.list}>
        {items.map((item) => {
          const selected = itemColors[item.id] ?? item.color

          return (
            <View key={item.id} style={styles.row}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.swatchRow}>
                {COLOR_PALETTE.map((palette) => {
                  const isActive = selected.toLowerCase() === palette.hex.toLowerCase()

                  return (
                    <TouchableOpacity
                      key={palette.hex}
                      style={[
                        styles.swatch,
                        { backgroundColor: palette.hex },
                        isActive && styles.swatchActive,
                      ]}
                      onPress={() => onSelectColor(item.id, palette.hex)}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.name} ${palette.name}`}
                      accessibilityState={{ selected: isActive }}
                    />
                  )
                })}
              </View>
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
    gap: spacing.sm,
  },
  row: {
    gap: spacing.xs,
  },
  itemName: {
    fontSize: 13,
    color: colors.text,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
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
