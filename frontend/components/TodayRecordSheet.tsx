import { useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { colors } from '../constants/colors'
import { radius, spacing } from '../constants/spacing'
import { MOOD_LABELS, type Mood } from '../stores/outfitStore'

type RecordMode = 'mood' | 'memo'

interface Props {
  visible: boolean
  mode: RecordMode
  mood: Mood | null
  memo: string | null
  saving: boolean
  onClose: () => void
  onSaveMood: (mood: Mood | null) => void
  onSaveMemo: (memo: string | null) => void
}

const moods = Object.keys(MOOD_LABELS) as Mood[]

export default function TodayRecordSheet({
  visible,
  mode,
  mood,
  memo,
  saving,
  onClose,
  onSaveMood,
  onSaveMemo,
}: Props) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(mood)
  const [memoText, setMemoText] = useState(memo ?? '')
  const [wasVisible, setWasVisible] = useState(visible)
  if (visible !== wasVisible) {
    setWasVisible(visible)
    if (visible) {
      setSelectedMood(mood)
      setMemoText(memo ?? '')
    }
  }

  const isMood = mode === 'mood'
  const handleClose = () => {
    Keyboard.dismiss()
    onClose()
  }
  const handleSave = () => {
    Keyboard.dismiss()
    if (isMood) {
      onSaveMood(selectedMood)
      return
    }
    onSaveMemo(memoText.trim() || null)
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={styles.backdrop}
          onPress={saving ? undefined : handleClose}
          accessible={false}
        />
        <Pressable style={styles.sheet} onPress={Keyboard.dismiss}>
          <View style={styles.handle} />
          <Text style={styles.title}>{isMood ? '오늘 기분' : '오늘 한 줄'}</Text>
          {isMood ? (
            <View style={styles.chips}>
              {moods.map((option) => {
                const selected = selectedMood === option
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => setSelectedMood(selected ? null : option)}
                    accessibilityRole="button"
                    accessibilityLabel={`오늘 기분 ${MOOD_LABELS[option]}`}
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {MOOD_LABELS[option]}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          ) : (
            <TextInput
              style={styles.input}
              value={memoText}
              onChangeText={setMemoText}
              placeholder="오늘을 한 문장으로 남겨보세요."
              placeholderTextColor={colors.textMuted}
              maxLength={100}
              multiline
              textAlignVertical="top"
              autoFocus
            />
          )}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={saving}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>{saving ? '저장 중...' : '저장'}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  title: { fontSize: 19, fontWeight: '700', color: colors.text, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  chipSelected: { borderColor: colors.accent, backgroundColor: colors.secondary },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },
  chipTextSelected: { color: colors.text },
  input: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveText: { fontSize: 15, fontWeight: '700', color: colors.white },
})
