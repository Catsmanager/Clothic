import { Image, StyleSheet, Text, View } from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

const CHALLENGE_FACE = require('../../assets/challenge/challenge_face.png')

interface Props {
  activeCount: number
  streakDays: number
  weekRecorded: number
  weekGoal: number
}

export default function ChallengeHeroCard({
  activeCount,
  streakDays,
  weekRecorded,
  weekGoal,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.textCol}>
          <Text style={styles.title}>오늘도 멋진 기록이에요! ✨</Text>
          <Text style={styles.subtitle}>{activeCount}개의 챌린지가 진행 중이에요.</Text>
        </View>

        <View style={styles.avatarWrap}>
          <View style={styles.bubble}>
            <Ionicons name="heart" size={14} color={colors.danger} />
          </View>
          <View style={styles.avatarCircle}>
            <Image
              source={CHALLENGE_FACE}
              style={styles.avatar}
              resizeMode="contain"
              accessible={false}
            />
          </View>
        </View>
      </View>

      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Feather name="zap" size={18} color={colors.accent} />
          <View>
            <Text style={styles.statLabel}>연속 기록</Text>
            <Text style={styles.statValue}>{streakDays}일째</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <Feather name="calendar" size={18} color={colors.accent} />
          <View>
            <Text style={styles.statLabel}>이번 주 기록</Text>
            <Text style={styles.statValue}>
              {weekRecorded} / {weekGoal}일
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  avatarWrap: {
    width: 96,
    alignItems: 'center',
  },
  bubble: {
    position: 'absolute',
    top: -2,
    left: 0,
    zIndex: 1,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 64,
    height: 64,
    marginTop: -8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
})
