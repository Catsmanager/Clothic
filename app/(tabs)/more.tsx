import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import SleepingBottomBanner from '../../components/sleeping-wardrobe/SleepingBottomBanner'
import SleepingCategoryTabs from '../../components/sleeping-wardrobe/SleepingCategoryTabs'
import SleepingItemList from '../../components/sleeping-wardrobe/SleepingItemList'
import SleepingSummaryBanner from '../../components/sleeping-wardrobe/SleepingSummaryBanner'
import SleepingToolbar from '../../components/sleeping-wardrobe/SleepingToolbar'
import WardrobeHeader from '../../components/sleeping-wardrobe/WardrobeHeader'
import { colors } from '../../constants/colors'
import { SLEEPING_CATEGORY_COUNT } from '../../constants/sleepingWardrobe'
import { spacing } from '../../constants/spacing'
import { useSleepingWardrobe } from '../../hooks/useSleepingWardrobe'

export default function WardrobeScreen() {
  const wardrobe = useSleepingWardrobe()

  return (
    <SafeAreaView style={styles.container}>
      <WardrobeHeader onAddPress={() => router.push('/item-new')} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <SleepingSummaryBanner totalCount={SLEEPING_CATEGORY_COUNT['전체']} />
        <SleepingCategoryTabs
          selectedCategory={wardrobe.selectedCategory}
          onCategoryPress={wardrobe.setSelectedCategory}
        />
        <SleepingToolbar sortOrder={wardrobe.sortOrder} onSortPress={wardrobe.toggleSort} />
        <SleepingItemList items={wardrobe.items} />
        <SleepingBottomBanner />
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
