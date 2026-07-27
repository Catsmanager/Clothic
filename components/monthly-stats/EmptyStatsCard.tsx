import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

export default function EmptyStatsCard() {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>이 달의 코디 기록이 없어요</Text>
      <Text style={styles.emptyHint}>첫 코디를 저장하면 스타일 리포트가 시작돼요.</Text>
      <TouchableOpacity
        style={styles.recordButton}
        onPress={() => router.push('/(tabs)/create')}
        accessibilityRole="button"
        accessibilityLabel="첫 코디 기록하기"
      >
        <Feather name="plus" size={15} color={colors.white} />
        <Text style={styles.recordButtonText}>첫 코디 기록하기</Text>
      </TouchableOpacity>
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  emptyHint: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: colors.textMuted,
  },
  recordButton: {
    minHeight: 44,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.text,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  recordButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
})
