import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'

interface Props {
  disabled: boolean
  linkLabel: string
  onPress: () => void
  prompt: string
}

export default function AuthFooterLink({ disabled, linkLabel, onPress, prompt }: Props) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{prompt}</Text>
      <TouchableOpacity onPress={onPress} disabled={disabled}>
        <Text style={styles.footerLink}>{linkLabel}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
})
