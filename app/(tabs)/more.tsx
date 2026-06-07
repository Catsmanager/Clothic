import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import SleepingBottomBanner from '../../components/sleeping-wardrobe/SleepingBottomBanner'
import SleepingCategoryTabs from '../../components/sleeping-wardrobe/SleepingCategoryTabs'
import SleepingFilterSheet from '../../components/sleeping-wardrobe/SleepingFilterSheet'
import SleepingItemList from '../../components/sleeping-wardrobe/SleepingItemList'
import SleepingHelpSheet from '../../components/sleeping-wardrobe/SleepingHelpSheet'
import SleepingSummaryBanner from '../../components/sleeping-wardrobe/SleepingSummaryBanner'
import SleepingToolbar from '../../components/sleeping-wardrobe/SleepingToolbar'
import WardrobeHeader from '../../components/sleeping-wardrobe/WardrobeHeader'
import { colors } from '../../constants/colors'
import { SLEEPING_CATEGORY_COUNT } from '../../constants/sleepingWardrobe'
import { spacing } from '../../constants/spacing'
import { useSleepingWardrobe } from '../../hooks/useSleepingWardrobe'

export default function WardrobeScreen() {
  const [filterVisible, setFilterVisible] = useState(false)
  const [helpVisible, setHelpVisible] = useState(false)
  const wardrobe = useSleepingWardrobe()

  return (
    <SafeAreaView style={styles.container}>
      <WardrobeHeader
        onAddPress={() => router.push('/item-new')}
        onHelpPress={() => setHelpVisible(true)}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <SleepingSummaryBanner totalCount={SLEEPING_CATEGORY_COUNT['전체']} />
        <SleepingCategoryTabs
          selectedCategory={wardrobe.selectedCategory}
          onCategoryPress={wardrobe.setSelectedCategory}
        />
        <SleepingToolbar
          activeFilterCount={wardrobe.activeFilterCount}
          sortOrder={wardrobe.sortOrder}
          onFilterPress={() => setFilterVisible(true)}
          onSortPress={wardrobe.toggleSort}
        />
        <SleepingItemList items={wardrobe.items} />
        <SleepingBottomBanner />
        <View style={styles.bottomPadding} />
      </ScrollView>
      <SleepingFilterSheet
        availableTags={wardrobe.availableTags}
        selectedCategory={wardrobe.selectedCategory}
        selectedTags={wardrobe.selectedTags}
        visible={filterVisible}
        onClear={wardrobe.clearFilters}
        onClose={() => setFilterVisible(false)}
        onSelectCategory={wardrobe.setSelectedCategory}
        onToggleTag={wardrobe.toggleTag}
      />
      <SleepingHelpSheet visible={helpVisible} onClose={() => setHelpVisible(false)} />
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
