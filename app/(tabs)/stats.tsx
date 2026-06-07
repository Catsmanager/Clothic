import { useEffect, useMemo } from 'react'
import { Alert, ScrollView, Share, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import EmptyStatsCard from '../../components/monthly-stats/EmptyStatsCard'
import ItemCategoryCard from '../../components/monthly-stats/ItemCategoryCard'
import MonthNavigator from '../../components/monthly-stats/MonthNavigator'
import StatsHeader from '../../components/monthly-stats/StatsHeader'
import StatsTipCard from '../../components/monthly-stats/StatsTipCard'
import TopColorsCard from '../../components/monthly-stats/TopColorsCard'
import TopItemsCard from '../../components/monthly-stats/TopItemsCard'
import TopStylesCard from '../../components/monthly-stats/TopStylesCard'
import TotalOutfitsCard from '../../components/monthly-stats/TotalOutfitsCard'
import UploadTrendCard from '../../components/monthly-stats/UploadTrendCard'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import { useMonthNavigation } from '../../hooks/useMonthNavigation'
import { buildItemInventoryData } from '../../lib/itemStats'
import { buildMonthData } from '../../lib/monthlyStats'
import { buildCatalogItems, useItemStore } from '../../stores/itemStore'
import { useOutfitStore } from '../../stores/outfitStore'

export default function StatsScreen() {
  const outfits = useOutfitStore((s) => s.outfits)
  const fetchOutfits = useOutfitStore((s) => s.fetchOutfits)
  const items = useItemStore((s) => s.items)
  const fetchItems = useItemStore((s) => s.fetchItems)
  const monthNav = useMonthNavigation()

  useEffect(() => {
    fetchOutfits()
    fetchItems()
  }, [fetchItems, fetchOutfits])

  const catalogItems = useMemo(() => buildCatalogItems(items), [items])

  const data = useMemo(
    () => buildMonthData(outfits, catalogItems, monthNav.year, monthNav.month),
    [catalogItems, monthNav.month, monthNav.year, outfits]
  )
  const inventoryData = useMemo(() => buildItemInventoryData(items), [items])

  async function handleShare() {
    const monthLabel = `${monthNav.year}년 ${monthNav.month + 1}월`
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
        message: `Clothic ${monthLabel} 월간 리포트\n${monthlySummary}\n${inventorySummary}`,
      })
    } catch {
      Alert.alert('공유 실패', '월간 리포트를 공유하지 못했어요. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatsHeader onBackPress={() => router.push('/(tabs)')} onSharePress={handleShare} />
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
        {inventoryData.totalItems > 0 && (
          <>
            <ItemCategoryCard data={inventoryData} />
            <UploadTrendCard monthlyUploads={inventoryData.monthlyUploads} />
          </>
        )}

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
