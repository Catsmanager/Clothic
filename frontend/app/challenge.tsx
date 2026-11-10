import { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CoreDataState from '../components/CoreDataState'
import BadgeListSheet from '../components/challenge/BadgeListSheet'
import ChallengeHeader from '../components/challenge/ChallengeHeader'
import ChallengeHelpSheet from '../components/challenge/ChallengeHelpSheet'
import ChallengeDetailSheet from '../components/challenge/ChallengeDetailSheet'
import ChallengeHeroCard from '../components/challenge/ChallengeHeroCard'
import ChallengeList from '../components/challenge/ChallengeList'
import BadgeShelf from '../components/challenge/BadgeShelf'
import ChallengeBottomBanner from '../components/challenge/ChallengeBottomBanner'
import type { Challenge } from '../constants/challenges'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'
import { useCurrentDateKey } from '../hooks/useCurrentDateKey'
import { buildChallengeData } from '../lib/challenges'
import { parseDateKey } from '../lib/date'
import { buildAnalyticsCatalogItems, useItemStore } from '../stores/itemStore'
import { useOutfitStore } from '../stores/outfitStore'

export default function ChallengeScreen() {
  const [badgeListVisible, setBadgeListVisible] = useState(false)
  const [helpVisible, setHelpVisible] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const outfits = useOutfitStore((s) => s.outfits)
  const outfitLoading = useOutfitStore((s) => s.loading)
  const outfitLoaded = useOutfitStore((s) => s.loaded)
  const outfitError = useOutfitStore((s) => s.error)
  const fetchOutfits = useOutfitStore((s) => s.fetchOutfits)
  const items = useItemStore((s) => s.items)
  const itemLoading = useItemStore((s) => s.loading)
  const itemLoaded = useItemStore((s) => s.loaded)
  const itemError = useItemStore((s) => s.error)
  const fetchItems = useItemStore((s) => s.fetchItems)
  const currentDateKey = useCurrentDateKey()
  const currentDate = useMemo(() => parseDateKey(currentDateKey) ?? new Date(), [currentDateKey])

  useEffect(() => {
    fetchOutfits()
    fetchItems()
  }, [fetchItems, fetchOutfits])

  const catalogItems = useMemo(() => buildAnalyticsCatalogItems(items), [items])
  const challengeData = useMemo(
    () => buildChallengeData(outfits, catalogItems, currentDate),
    [catalogItems, currentDate, outfits]
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ChallengeHeader onHelpPress={() => setHelpVisible(true)} />

      <CoreDataState
        loading={outfitLoading || itemLoading}
        error={outfitError ?? itemError}
        ready={outfitLoaded && itemLoaded}
        onRetry={() => {
          void Promise.all([fetchOutfits(), fetchItems()])
        }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ChallengeHeroCard
            activeCount={challengeData.summary.activeCount}
            streakDays={challengeData.summary.streakDays}
            weekRecorded={challengeData.summary.weekRecorded}
            weekGoal={challengeData.summary.weekGoal}
          />
          <ChallengeList
            challenges={challengeData.challenges}
            onChallengePress={setSelectedChallenge}
          />
          <BadgeShelf
            badges={challengeData.badges}
            onViewAllPress={() => setBadgeListVisible(true)}
          />
          <ChallengeBottomBanner />
        </ScrollView>
      </CoreDataState>
      <ChallengeDetailSheet
        challenge={selectedChallenge}
        visible={selectedChallenge != null}
        onClose={() => setSelectedChallenge(null)}
      />
      <BadgeListSheet
        badges={challengeData.badges}
        visible={badgeListVisible}
        onClose={() => setBadgeListVisible(false)}
      />
      <ChallengeHelpSheet visible={helpVisible} onClose={() => setHelpVisible(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
})
