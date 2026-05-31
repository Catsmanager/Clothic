import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  disabled: boolean
  label: string
  loading: boolean
  onPress: () => void
}

export default function AuthSubmitButton({ disabled, label, loading, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.submitBtn, disabled && styles.submitBtnDisabled]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  submitBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.text,
    borderRadius: radius.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})
