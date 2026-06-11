import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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
  const insets = useSafeAreaInsets()
  const { buildInput, memo, mood, setMemo, toggleMood, toggleWeather, weather } = useSaveOutfitForm(
    { itemIds, visible }
  )

  function handleSave() {
    onSave(buildInput())
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={styles.backdrop}
          onPress={saving ? undefined : onClose}
          accessible={false}
        />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm },
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>코디 저장</Text>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
          </ScrollView>

          <SaveOutfitActions saving={saving} onCancel={onClose} onSave={handleSave} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    maxHeight: '86%',
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
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
  content: {
    flexGrow: 0,
  },
  contentContainer: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
})
