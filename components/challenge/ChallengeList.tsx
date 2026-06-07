import { StyleSheet, Text, View } from 'react-native'
import ChallengeListItem from './ChallengeListItem'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import type { Challenge } from '../../constants/challenges'

interface Props {
  challenges: Challenge[]
  onChallengePress: (challenge: Challenge) => void
}

export default function ChallengeList({ challenges, onChallengePress }: Props) {
  const activeCount = challenges.filter((c) => c.current < c.goal).length

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>진행 중인 챌린지</Text>
        <Text style={styles.sectionMeta}>
          {activeCount} / {challenges.length} 진행 중
        </Text>
      </View>

      {challenges.map((challenge) => (
        <ChallengeListItem
          key={challenge.id}
          challenge={challenge}
          onPress={() => onChallengePress(challenge)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
})
