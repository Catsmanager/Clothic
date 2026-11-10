import { useEffect, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { colors } from '../../constants/colors'
import CoreDataState from '../../components/CoreDataState'
import CalendarGrid from '../../components/calendar/CalendarGrid'
import CalendarHeader from '../../components/calendar/CalendarHeader'
import SelectedOutfitCard from '../../components/calendar/SelectedOutfitCard'
import { useCalendarMonth } from '../../hooks/useCalendarMonth'
import { indexPrimaryStyledOutfitsByDate } from '../../lib/outfitRecords'
import {
  buildResolvableCatalogItems,
  findCatalogItemById,
  useItemStore,
} from '../../stores/itemStore'
import { useOutfitStore } from '../../stores/outfitStore'

export default function CalendarScreen() {
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
  const { cells, month, nextMonth, prevMonth, selectedKey, setSelectedKey, todayKey, year } =
    useCalendarMonth()

  useEffect(() => {
    fetchOutfits()
    fetchItems()
  }, [fetchItems, fetchOutfits])

  const catalogItems = useMemo(() => buildResolvableCatalogItems(items), [items])

  const outfitsByDate = useMemo(() => {
    return indexPrimaryStyledOutfitsByDate(outfits)
  }, [outfits])
  const selectedOutfit = outfitsByDate.get(selectedKey) ?? null
  const selectedItems = useMemo(
    () =>
      selectedOutfit?.itemIds
        .map((id) => findCatalogItemById(catalogItems, id))
        .filter((item) => item != null) ?? [],
    [catalogItems, selectedOutfit]
  )

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <CalendarHeader month={month} year={year} onNextMonth={nextMonth} onPrevMonth={prevMonth} />
      <CoreDataState
        loading={outfitLoading || itemLoading}
        error={outfitError ?? itemError}
        ready={outfitLoaded && itemLoaded}
        onRetry={() => {
          void Promise.all([fetchOutfits(), fetchItems()])
        }}
      >
        <CalendarGrid
          cells={cells}
          catalogItems={catalogItems}
          outfitsByDate={outfitsByDate}
          selectedKey={selectedKey}
          todayKey={todayKey}
          onSelectDate={setSelectedKey}
        />
        {selectedOutfit && (
          <SelectedOutfitCard
            dateKey={selectedKey}
            items={selectedItems}
            outfit={selectedOutfit}
            onPress={() => router.push(`/outfit/${selectedOutfit.id}`)}
          />
        )}
      </CoreDataState>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
})
