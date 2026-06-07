import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { Challenge, ChallengeIcon } from '../../constants/challenges'

const ICON_MAP: Record<ChallengeIcon, keyof typeof MaterialCommunityIcons.glyphMap> = {
  calendar: 'calendar-check-outline',
  wardrobe: 'wardrobe-outline',
  hanger: 'hanger',
  umbrella: 'umbrella-outline',
}

interface Props {
  challenge: Challenge
  onPress: () => void
}

export default function ChallengeListItem({ challenge, onPress }: Props) {
  const { icon, title, description, current, goal } = challenge
  const ratio = goal > 0 ? Math.min(current / goal, 1) : 0
  const completed = current >= goal

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name={ICON_MAP[icon]} size={28} color={colors.accent} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
        </View>
      </View>

      <View style={styles.right}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{completed ? '완료' : '진행 중'}</Text>
        </View>
        <Text style={styles.count}>
          {current} / {goal}
        </Text>
      </View>

      <Feather name="chevron-right" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  right: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text,
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
})
