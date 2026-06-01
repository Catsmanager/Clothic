import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'

interface Props {
  title: string
  subtitle: string
}

export default function AuthHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
})
