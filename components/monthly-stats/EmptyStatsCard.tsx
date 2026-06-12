import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

export default function EmptyStatsCard() {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>이 달의 코디 기록이 없어요</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
})
