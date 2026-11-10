import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { ItemSourceMode } from '../../hooks/useItemSelect'

const SOURCES: { label: string; value: ItemSourceMode }[] = [
  { label: '내 옷장', value: 'closet' },
  { label: '기본 옷 둘러보기', value: 'catalog' },
]

interface Props {
  mode: ItemSourceMode
  onChange: (mode: ItemSourceMode) => void
}

export default function ItemSourceTabs({ mode, onChange }: Props) {
  return (
    <View style={styles.container}>
      {SOURCES.map((source) => {
        const selected = source.value === mode
        return (
          <TouchableOpacity
            key={source.value}
            style={[styles.tab, selected && styles.tabSelected]}
            onPress={() => onChange(source.value)}
            accessibilityRole="tab"
            accessibilityLabel={source.label}
            accessibilityState={{ selected }}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{source.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: 3,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelected: {
    backgroundColor: colors.white,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  labelSelected: {
    fontWeight: '700',
    color: colors.text,
  },
})
