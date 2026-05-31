import { useEffect, useMemo } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import EmptyStatsCard from '../../components/monthly-stats/EmptyStatsCard'
import MonthNavigator from '../../components/monthly-stats/MonthNavigator'
import StatsHeader from '../../components/monthly-stats/StatsHeader'
import StatsTipCard from '../../components/monthly-stats/StatsTipCard'
import TopColorsCard from '../../components/monthly-stats/TopColorsCard'
import TopItemsCard from '../../components/monthly-stats/TopItemsCard'
import TopStylesCard from '../../components/monthly-stats/TopStylesCard'
import TotalOutfitsCard from '../../components/monthly-stats/TotalOutfitsCard'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import { useMonthNavigation } from '../../hooks/useMonthNavigation'
import { buildMonthData } from '../../lib/monthlyStats'
import { useOutfitStore } from '../../stores/outfitStore'

export default function StatsScreen() {
  const outfits = useOutfitStore((s) => s.outfits)
  const fetchOutfits = useOutfitStore((s) => s.fetchOutfits)
  const monthNav = useMonthNavigation()

  useEffect(() => {
    fetchOutfits()
  }, [fetchOutfits])

  const data = useMemo(
    () => buildMonthData(outfits, monthNav.year, monthNav.month),
    [monthNav.month, monthNav.year, outfits]
  )

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatsHeader />
      <MonthNavigator
        month={monthNav.month}
        year={monthNav.year}
        onNext={monthNav.nextMonth}
        onPrev={monthNav.prevMonth}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {data == null ? (
          <EmptyStatsCard />
        ) : (
          <>
            <TotalOutfitsCard
              diffFromLastMonth={data.diffFromLastMonth}
              totalOutfits={data.totalOutfits}
            />
            <TopColorsCard topColors={data.topColors} />
            <TopItemsCard topItems={data.topItems} />
            <TopStylesCard topStyles={data.topStyles} />
            <StatsTipCard />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
})
