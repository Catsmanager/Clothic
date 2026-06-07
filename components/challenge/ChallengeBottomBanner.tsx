import { StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

export default function ChallengeBottomBanner() {
  return (
    <View style={styles.banner}>
      <Feather name="star" size={18} color={colors.accent} style={styles.icon} />
      <View style={styles.textCol}>
        <Text style={styles.title}>챌린지는 코디를 저장하면 자동으로 진행돼요!</Text>
        <Text style={styles.desc}>기록할수록 더 다양한 배지를 모을 수 있어요.</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  icon: {
    marginTop: 1,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  desc: {
    fontSize: 12,
    color: colors.textMuted,
  },
})
