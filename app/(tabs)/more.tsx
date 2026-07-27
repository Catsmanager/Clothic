import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import CoreDataState from '../../components/CoreDataState'
import SleepingBottomBanner from '../../components/sleeping-wardrobe/SleepingBottomBanner'
import SleepingCategoryTabs from '../../components/sleeping-wardrobe/SleepingCategoryTabs'
import SleepingFilterSheet from '../../components/sleeping-wardrobe/SleepingFilterSheet'
import SleepingItemList from '../../components/sleeping-wardrobe/SleepingItemList'
import SleepingHelpSheet from '../../components/sleeping-wardrobe/SleepingHelpSheet'
import SleepingSummaryBanner from '../../components/sleeping-wardrobe/SleepingSummaryBanner'
import SleepingToolbar from '../../components/sleeping-wardrobe/SleepingToolbar'
import WardrobeHeader from '../../components/sleeping-wardrobe/WardrobeHeader'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import { useSleepingWardrobe } from '../../hooks/useSleepingWardrobe'

export default function WardrobeScreen() {
  const [filterVisible, setFilterVisible] = useState(false)
  const [helpVisible, setHelpVisible] = useState(false)
  const wardrobe = useSleepingWardrobe()

  return (
    <SafeAreaView style={styles.container}>
      <WardrobeHeader onHelpPress={() => setHelpVisible(true)} />

      <CoreDataState
        loading={wardrobe.loading}
        error={wardrobe.error}
        onRetry={wardrobe.retry}
        ready={wardrobe.ready}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Pressable
            style={({ pressed }) => [styles.savedOutfitsCard, pressed && styles.pressedCard]}
            onPress={() => router.push('/outfits')}
            accessibilityRole="button"
            accessibilityLabel="저장한 코디 보기"
            accessibilityHint="기록해둔 코디 목록 화면으로 이동합니다."
          >
            <View style={styles.savedOutfitsIcon}>
              <Feather name="image" size={20} color={colors.text} />
            </View>
            <View style={styles.savedOutfitsText}>
              <Text style={styles.savedOutfitsTitle}>저장한 코디</Text>
              <Text style={styles.savedOutfitsSubtitle}>기록해둔 코디를 한눈에 모아봐요.</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
          <SleepingSummaryBanner totalCount={wardrobe.sleepingCount} />
          <SleepingCategoryTabs
            counts={wardrobe.counts}
            selectedCategory={wardrobe.selectedCategory}
            onCategoryPress={wardrobe.setSelectedCategory}
          />
          <SleepingToolbar
            activeFilterCount={wardrobe.activeFilterCount}
            sortOrder={wardrobe.sortOrder}
            onFilterPress={() => setFilterVisible(true)}
            onSortPress={wardrobe.toggleSort}
          />
          <SleepingItemList
            items={wardrobe.items}
            hasActiveFilter={wardrobe.activeFilterCount > 0}
            onClearFilters={wardrobe.clearFilters}
          />
          <SleepingBottomBanner suggestedItem={wardrobe.items[0]} />
        </ScrollView>
      </CoreDataState>
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
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  savedOutfitsCard: {
    minHeight: 72,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressedCard: {
    opacity: 0.85,
  },
  savedOutfitsIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedOutfitsText: {
    flex: 1,
  },
  savedOutfitsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  savedOutfitsSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },
})
