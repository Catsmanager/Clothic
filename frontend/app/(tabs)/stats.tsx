import { useEffect, useMemo, useState } from 'react'
import { Alert, ScrollView, Share, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import CoreDataState from '../../components/CoreDataState'
import EmptyStatsCard from '../../components/monthly-stats/EmptyStatsCard'
import ItemCategoryCard from '../../components/monthly-stats/ItemCategoryCard'
import MonthNavigator from '../../components/monthly-stats/MonthNavigator'
import ReportPeriodTabs, {
  type ReportPeriod,
} from '../../components/monthly-stats/ReportPeriodTabs'
import StatsHeader from '../../components/monthly-stats/StatsHeader'
import StatsTipCard from '../../components/monthly-stats/StatsTipCard'
import TopColorsCard from '../../components/monthly-stats/TopColorsCard'
import TopItemsCard from '../../components/monthly-stats/TopItemsCard'
import TopStylesCard from '../../components/monthly-stats/TopStylesCard'
import TotalOutfitsCard from '../../components/monthly-stats/TotalOutfitsCard'
import UploadTrendCard from '../../components/monthly-stats/UploadTrendCard'
import WeekNavigator from '../../components/monthly-stats/WeekNavigator'
import WeeklyReport from '../../components/monthly-stats/WeeklyReport'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import { useMonthNavigation } from '../../hooks/useMonthNavigation'
import { useCurrentDateKey } from '../../hooks/useCurrentDateKey'
import { useWeekNavigation } from '../../hooks/useWeekNavigation'
import { parseDateKey } from '../../lib/date'
import { buildItemInventoryData } from '../../lib/itemStats'
import { buildMonthData } from '../../lib/monthlyStats'
import { buildWeekData } from '../../lib/weeklyStats'
import { buildAnalyticsCatalogItems, useItemStore } from '../../stores/itemStore'
import { useOutfitStore } from '../../stores/outfitStore'

export default function StatsScreen() {
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
  const monthNav = useMonthNavigation(currentDate)
  const weekNav = useWeekNavigation(currentDate)
  const [period, setPeriod] = useState<ReportPeriod>('week')

  useEffect(() => {
    fetchOutfits()
    fetchItems()
  }, [fetchItems, fetchOutfits])

  const catalogItems = useMemo(() => buildAnalyticsCatalogItems(items), [items])

  const data = useMemo(
    () => buildMonthData(outfits, catalogItems, monthNav.year, monthNav.month),
    [catalogItems, monthNav.month, monthNav.year, outfits]
  )
  const inventoryData = useMemo(
    () => buildItemInventoryData(items, currentDate),
    [currentDate, items]
  )
  const weekData = useMemo(
    () => buildWeekData(outfits, catalogItems, weekNav.weekStart),
    [catalogItems, outfits, weekNav.weekStart]
  )

  const isCurrentMonth =
    monthNav.year === currentDate.getFullYear() && monthNav.month === currentDate.getMonth()
  const currentWeekStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() - currentDate.getDay()
  )
  const isCurrentWeek = weekNav.weekStart.getTime() === currentWeekStart.getTime()

  async function handleShare() {
    const monthLabel = `${monthNav.year}년 ${monthNav.month + 1}월`
    const weekEnd = new Date(weekNav.weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const weekLabel = `${weekNav.weekStart.getMonth() + 1}월 ${weekNav.weekStart.getDate()}일 – ${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일`
    const monthlySummary =
      data == null
        ? '이 달의 코디 기록이 없어요.'
        : [
            `총 코디 수: ${data.totalOutfits}회`,
            `지난 달 대비: ${data.diffFromLastMonth >= 0 ? '+' : '-'}${Math.abs(
              data.diffFromLastMonth
            )}회`,
            `많이 입은 색상: ${data.topColors.map((item) => item.label).join(', ') || '없음'}`,
          ].join('\n')
    const inventorySummary =
      inventoryData.totalItems > 0
        ? `등록 아이템: ${inventoryData.totalItems}개`
        : '등록 아이템 없음'

    try {
      await Share.share({
        message:
          period === 'week'
            ? `Clothic ${weekLabel} 주간 리포트\n총 코디 수: ${weekData.totalOutfits}회\n지난주 대비: ${weekData.diffFromLastWeek >= 0 ? '+' : '-'}${Math.abs(weekData.diffFromLastWeek)}회\n많이 입은 색상: ${weekData.topColors.map((item) => item.label).join(', ') || '없음'}`
            : `Clothic ${monthLabel} 월간 리포트\n${monthlySummary}\n${inventorySummary}`,
      })
    } catch {
      Alert.alert('공유 실패', '스타일 리포트를 공유하지 못했어요. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatsHeader onBackPress={() => router.push('/(tabs)')} onSharePress={handleShare} />
      <ReportPeriodTabs value={period} onChange={setPeriod} />
      {period === 'week' ? (
        <WeekNavigator
          weekStart={weekNav.weekStart}
          nextDisabled={isCurrentWeek}
          onNext={weekNav.nextWeek}
          onPrev={weekNav.prevWeek}
        />
      ) : (
        <MonthNavigator
          month={monthNav.month}
          year={monthNav.year}
          nextDisabled={isCurrentMonth}
          onNext={monthNav.nextMonth}
          onPrev={monthNav.prevMonth}
        />
      )}

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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {period === 'week' ? (
            <WeeklyReport data={weekData} weekStart={weekNav.weekStart} />
          ) : data == null ? (
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

          {period === 'month' && inventoryData.totalItems > 0 && (
            <>
              <ItemCategoryCard data={inventoryData} />
              <UploadTrendCard monthlyUploads={inventoryData.monthlyUploads} />
            </>
          )}
        </ScrollView>
      </CoreDataState>
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
