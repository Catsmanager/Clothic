import { StyleSheet, Text, TextInput } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  value: string
  onChangeText: (value: string) => void
}

export default function SaveOutfitMemoField({ value, onChangeText }: Props) {
  return (
    <>
      <Text style={styles.label}>오늘 한 줄</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="오늘의 코디를 기록해보세요"
        placeholderTextColor={colors.textMuted}
        maxLength={50}
      />
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
  input: {
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    height: 48,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
})
