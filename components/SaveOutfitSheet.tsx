import { Modal, View, Text, Pressable, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'
import { spacing, radius } from '../constants/spacing'
import {
  type Mood,
  type Weather,
  MOOD_LABELS,
  WEATHER_LABELS,
  type NewOutfit,
} from '../stores/outfitStore'
import { useSaveOutfitForm } from '../hooks/useSaveOutfitForm'
import OptionChipGroup from './save-outfit/OptionChipGroup'
import SaveOutfitActions from './save-outfit/SaveOutfitActions'
import SaveOutfitMemoField from './save-outfit/SaveOutfitMemoField'

interface Props {
  visible: boolean
  itemIds: string[]
  saving: boolean
  onClose: () => void
  onSave: (input: NewOutfit) => void
}

const MOODS = Object.keys(MOOD_LABELS) as Mood[]
const WEATHERS = Object.keys(WEATHER_LABELS) as Weather[]

export default function SaveOutfitSheet({ visible, itemIds, saving, onClose, onSave }: Props) {
  const { buildInput, memo, mood, setMemo, toggleMood, toggleWeather, weather } = useSaveOutfitForm(
    { itemIds }
  )

  function handleSave() {
    onSave(buildInput())
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={saving ? undefined : onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>코디 저장</Text>

        <OptionChipGroup
          label="날씨"
          labels={WEATHER_LABELS}
          options={WEATHERS}
          selected={weather}
          onSelect={toggleWeather}
        />
        <OptionChipGroup
          label="오늘 기분"
          labels={MOOD_LABELS}
          options={MOODS}
          selected={mood}
          onSelect={toggleMood}
        />
        <SaveOutfitMemoField value={memo} onChangeText={setMemo} />
        <SaveOutfitActions saving={saving} onCancel={onClose} onSave={handleSave} />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
})
