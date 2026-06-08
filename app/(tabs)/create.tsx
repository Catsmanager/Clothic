import { useState, useCallback } from 'react'
import { View, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
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
  const [sheetVisible, setSheetVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const addOutfit = useOutfitStore((s) => s.addOutfit)
  const editor = useOutfitEditor()

  const handleSave = useCallback(
    async (input: NewOutfit) => {
      setSaving(true)
      const { error } = await addOutfit(input)
      setSaving(false)
      if (error) {
        Alert.alert('저장 실패', error)
        return
      }
      setSheetVisible(false)
      router.replace('/outfits')
    },
    [addOutfit]
  )

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <CreateHeader onBack={() => router.back()} onSave={() => setSheetVisible(true)} />

      <View style={styles.editorBody}>
        <CategoryRail
          activeCategory={editor.activeCategory}
          onCategoryPress={editor.selectCategory}
        />
        <View style={styles.previewSection}>
          <AvatarPreview items={editor.equippedItems} />
          <EditorActionPanel
            canUndo={editor.canUndo}
            onRandom={editor.randomizeActiveCategory}
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
          router.push({ pathname: '/item-select', params: { category: editor.activeCategory } })
        }
        onItemPress={editor.equipItem}
        onSubCategoryPress={editor.selectSubCategory}
      />

      <SaveOutfitSheet
        visible={sheetVisible}
        itemIds={editor.equippedItemIds}
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
