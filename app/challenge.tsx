import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ChallengeHeader from '../components/challenge/ChallengeHeader'
import ChallengeHeroCard from '../components/challenge/ChallengeHeroCard'
import ChallengeList from '../components/challenge/ChallengeList'
import BadgeShelf from '../components/challenge/BadgeShelf'
import ChallengeBottomBanner from '../components/challenge/ChallengeBottomBanner'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'
import { BADGES, CHALLENGES, CHALLENGE_SUMMARY } from '../constants/challenges'

export default function ChallengeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ChallengeHeader />

      <ScrollView showsVerticalScrollIndicator={false}>
        <ChallengeHeroCard
          activeCount={CHALLENGE_SUMMARY.activeCount}
          streakDays={CHALLENGE_SUMMARY.streakDays}
          weekRecorded={CHALLENGE_SUMMARY.weekRecorded}
          weekGoal={CHALLENGE_SUMMARY.weekGoal}
        />
        <ChallengeList challenges={CHALLENGES} />
        <BadgeShelf badges={BADGES} />
        <ChallengeBottomBanner />
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  bottomPadding: {
    height: spacing.xl,
  },
})
