import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { colors } from '../../constants/colors'
import SaveOutfitSheet from '../../components/SaveOutfitSheet'
import AvatarPreview from '../../components/outfit-editor/AvatarPreview'
import CategoryRail from '../../components/outfit-editor/CategoryRail'
import CreateHeader from '../../components/outfit-editor/CreateHeader'
import EditorActionPanel from '../../components/outfit-editor/EditorActionPanel'
import ItemPickerPanel from '../../components/outfit-editor/ItemPickerPanel'
import { useOutfitEditor } from '../../hooks/useOutfitEditor'
import { useOutfitStore, type NewOutfit } from '../../stores/outfitStore'

export default function CreateScreen() {
  const { selectedItemId, selectionToken } = useLocalSearchParams<{
    selectedItemId?: string
    selectionToken?: string
  }>()
  const [sheetVisible, setSheetVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const handledSelectionToken = useRef<string | null>(null)
  const saveInFlight = useRef(false)
  const addOutfit = useOutfitStore((s) => s.addOutfit)
  const editor = useOutfitEditor()
  const { equipItemById } = editor

  // 전체 선택 화면의 결과를 기존 편집 초안에 한 번만 반영한다.
  useEffect(() => {
    if (!selectedItemId || !selectionToken || handledSelectionToken.current === selectionToken) {
      return
    }
    if (!equipItemById(selectedItemId)) return

    handledSelectionToken.current = selectionToken
    router.setParams({ selectedItemId: undefined, selectionToken: undefined })
  }, [equipItemById, selectedItemId, selectionToken])

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(tabs)')
  }, [])

  const handleSave = useCallback(
    async (input: NewOutfit) => {
      if (saveInFlight.current) return
      saveInFlight.current = true
      setSaving(true)
      let errorMessage: string | null = null

      try {
        const result = await addOutfit(input)
        errorMessage = result.error
      } catch {
        errorMessage = '코디를 저장하지 못했어요. 잠시 후 다시 시도해주세요.'
      } finally {
        saveInFlight.current = false
        setSaving(false)
      }

      if (errorMessage) {
        Alert.alert('저장 실패', errorMessage)
        return
      }
      setSheetVisible(false)
      router.replace({
        pathname: '/(tabs)',
        params: { savedOutfit: Date.now().toString() },
      })
    },
    [addOutfit]
  )

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <CreateHeader
        saveDisabled={editor.equippedItemIds.length === 0}
        onBack={handleBack}
        onSave={() => setSheetVisible(true)}
      />

      <View style={styles.editorBody}>
        <CategoryRail
          activeCategory={editor.activeCategory}
          onCategoryPress={editor.selectCategory}
        />
        <View style={styles.previewSection}>
          <AvatarPreview items={editor.equippedItems} />
          <EditorActionPanel
            canClear={editor.equippedItemIds.length > 0}
            canUndo={editor.canUndo}
            onClear={editor.clearOutfit}
            onRandom={editor.randomizeOutfit}
            onUndo={editor.undo}
          />
        </View>
      </View>

      <ItemPickerPanel
        activeSubCategory={editor.activeSubCategory}
        equipped={editor.equipped}
        items={editor.filteredItems}
        subCategories={editor.subCategories}
        onFullViewPress={() =>
          router.push({
            pathname: '/item-select',
            params: { category: editor.activeCategory },
          })
        }
        onItemPress={editor.equipItem}
        onSubCategoryPress={editor.selectSubCategory}
      />

      <SaveOutfitSheet
        visible={sheetVisible}
        items={editor.equippedItems}
        saving={saving}
        onClose={() => setSheetVisible(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  editorBody: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  previewSection: {
    flex: 1,
    paddingHorizontal: 0,
  },
})
