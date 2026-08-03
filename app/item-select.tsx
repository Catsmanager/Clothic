import { useState } from 'react'
import { Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import CoreDataState from '../components/CoreDataState'
import ItemGrid from '../components/item-select/ItemGrid'
import ItemSelectHeader from '../components/item-select/ItemSelectHeader'
import ItemSourceTabs from '../components/item-select/ItemSourceTabs'
import ItemSubCategoryTabs from '../components/item-select/ItemSubCategoryTabs'
import { colors } from '../constants/colors'
import { useItemSelect } from '../hooks/useItemSelect'
import type { CatalogItem } from '../constants/items'
import { useItemStore } from '../stores/itemStore'

export default function ItemSelectScreen() {
  const params = useLocalSearchParams<{ category?: string; mode?: string }>()
  const itemSelect = useItemSelect(params)
  const addCatalogItem = useItemStore((s) => s.addCatalogItem)
  const [addingItemId, setAddingItemId] = useState<string | null>(null)

  const returnToEditor = (itemId: string) => {
    router.dismissTo({
      pathname: '/create',
      params: {
        selectedItemId: itemId,
        selectionToken: `${Date.now()}-${itemId}`,
      },
    })
  }

  const selectItem = async (item: CatalogItem) => {
    if (itemSelect.mode === 'closet') {
      returnToEditor(item.id)
      return
    }

    if (addingItemId) return
    setAddingItemId(item.id)
    try {
      const result = await addCatalogItem(item)
      if (result.error || !result.item) {
        Alert.alert('옷 추가 실패', result.error ?? '옷을 추가하지 못했어요.')
        return
      }
      returnToEditor(result.item.id)
    } catch {
      Alert.alert('옷 추가 실패', '옷을 추가하지 못했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setAddingItemId(null)
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ItemSelectHeader categoryLabel={itemSelect.categoryLabel} onBack={() => router.back()} />
      <CoreDataState
        loading={itemSelect.loading}
        error={itemSelect.error}
        ready={itemSelect.loaded}
        onRetry={() => {
          void itemSelect.retry()
        }}
      >
        <ItemSourceTabs mode={itemSelect.mode} onChange={itemSelect.setMode} />
        <ItemSubCategoryTabs
          activeSubCategory={itemSelect.activeSubCategory}
          subCategories={itemSelect.subCategories}
          onSubCategoryPress={itemSelect.setActiveSubCategory}
        />
        <ItemGrid
          disabledItemId={addingItemId}
          emptyActionLabel={itemSelect.mode === 'closet' ? '기본 옷 둘러보기' : undefined}
          emptyMessage={
            itemSelect.mode === 'closet'
              ? '내 옷장에 이 카테고리 옷이 없어요.'
              : '이 카테고리의 기본 옷이 아직 없어요.'
          }
          getItemActionLabel={
            itemSelect.mode === 'catalog'
              ? (item) =>
                  itemSelect.ownedCatalogItemIds.has(item.id) ? '내 옷장에 있음' : '내 옷장에 추가'
              : undefined
          }
          items={itemSelect.filteredItems}
          onEmptyActionPress={
            itemSelect.mode === 'closet' ? () => itemSelect.setMode('catalog') : undefined
          }
          onItemPress={(item) => {
            void selectItem(item)
          }}
        />
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
