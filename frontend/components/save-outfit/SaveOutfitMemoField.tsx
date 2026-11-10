import { StyleSheet, Text, TextInput, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  value: string
  onChangeText: (value: string) => void
}

export default function SaveOutfitMemoField({ value, onChangeText }: Props) {
  return (
    <>
      <View style={styles.labelRow}>
        <Text style={styles.label}>오늘의 한 줄</Text>
        <Text style={styles.count}>{value.length}/100</Text>
      </View>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="오늘 이 룩은 어땠나요?"
          placeholderTextColor={colors.textMuted}
          maxLength={100}
          multiline
          textAlignVertical="top"
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  count: {
    fontSize: 12,
    color: colors.textMuted,
  },
  inputWrap: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  input: {
    minHeight: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
})
