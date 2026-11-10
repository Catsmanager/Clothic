import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props<OptionValue extends string> {
  label: string
  labels: Record<OptionValue, string>
  options: readonly OptionValue[]
  selected: OptionValue | null
  onSelect: (value: OptionValue) => void
}

export default function OptionChipGroup<OptionValue extends string>({
  label,
  labels,
  options,
  selected,
  onSelect,
}: Props<OptionValue>) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((option) => {
          const isActive = selected === option

          return (
            <TouchableOpacity
              key={option}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(option)}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${labels[option]}`}
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {labels[option]}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: '#7A4A36',
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 9,
    paddingHorizontal: 11,
  },
  chipActive: {
    backgroundColor: '#FFF5ED',
    borderColor: '#8A4F32',
  },
  chipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#8A4F32',
    fontWeight: '600',
  },
})
