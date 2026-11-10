import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

export default function StatsTipCard() {
  return (
    <View style={styles.tipCard}>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>💡 잠자는 옷을 활용해보세요!</Text>
        <Text style={styles.tipBody}>
          안 입는 옷을 정리하면 새로운 스타일을{'\n'}발견할 수 있어요.
        </Text>
      </View>
      <Text style={styles.tipIllustration}>🧥</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  tipContent: {
    flex: 1,
    gap: spacing.xs,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tipBody: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  tipIllustration: {
    fontSize: 48,
    marginLeft: spacing.sm,
  },
})
