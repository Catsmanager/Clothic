import { useEffect, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../constants/colors'
import CalendarGrid from '../../components/calendar/CalendarGrid'
import CalendarHeader from '../../components/calendar/CalendarHeader'
import SelectedOutfitCard from '../../components/calendar/SelectedOutfitCard'
import { useCalendarMonth } from '../../hooks/useCalendarMonth'
import { buildCatalogItems, findCatalogItemById, useItemStore } from '../../stores/itemStore'
import { useOutfitStore } from '../../stores/outfitStore'

export default function CalendarScreen() {
  const outfits = useOutfitStore((s) => s.outfits)
  const fetchOutfits = useOutfitStore((s) => s.fetchOutfits)
  const items = useItemStore((s) => s.items)
  const fetchItems = useItemStore((s) => s.fetchItems)
  const { cells, month, nextMonth, prevMonth, selectedKey, setSelectedKey, todayKey, year } =
    useCalendarMonth()

  useEffect(() => {
    fetchOutfits()
    fetchItems()
  }, [fetchItems, fetchOutfits])

  const catalogItems = useMemo(() => buildCatalogItems(items), [items])

  const outfitsByDate = useMemo(
    () => new Map(outfits.map((outfit) => [outfit.date, outfit])),
    [outfits]
  )
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
      <CalendarGrid
        cells={cells}
        outfitsByDate={outfitsByDate}
        selectedKey={selectedKey}
        todayKey={todayKey}
        onSelectDate={setSelectedKey}
      />
      {selectedOutfit && (
        <SelectedOutfitCard dateKey={selectedKey} items={selectedItems} outfit={selectedOutfit} />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
})
