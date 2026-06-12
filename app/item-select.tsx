import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import ItemGrid from '../components/item-select/ItemGrid'
import ItemSelectHeader from '../components/item-select/ItemSelectHeader'
import ItemSubCategoryTabs from '../components/item-select/ItemSubCategoryTabs'
import { colors } from '../constants/colors'
import { useItemSelect } from '../hooks/useItemSelect'

export default function ItemSelectScreen() {
  const params = useLocalSearchParams<{ category?: string }>()
  const itemSelect = useItemSelect(params)

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ItemSelectHeader categoryLabel={itemSelect.categoryLabel} onBack={() => router.back()} />
      <ItemSubCategoryTabs
        activeSubCategory={itemSelect.activeSubCategory}
        subCategories={itemSelect.subCategories}
        onSubCategoryPress={itemSelect.setActiveSubCategory}
      />
      <ItemGrid items={itemSelect.filteredItems} onItemPress={() => router.back()} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
})
