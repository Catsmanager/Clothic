import { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native'
import { colors } from '../constants/colors'
import { spacing, radius } from '../constants/spacing'
import {
  type Mood,
  type Weather,
  MOOD_LABELS,
  WEATHER_LABELS,
  type NewOutfit,
} from '../stores/outfitStore'

interface Props {
  visible: boolean
  itemIds: string[]
  saving: boolean
  onClose: () => void
  onSave: (input: NewOutfit) => void
}

const MOODS = Object.keys(MOOD_LABELS) as Mood[]
const WEATHERS = Object.keys(WEATHER_LABELS) as Weather[]

// 오늘 날짜 YYYY-MM-DD (로컬 기준)
function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

export default function SaveOutfitSheet({ visible, itemIds, saving, onClose, onSave }: Props) {
  const [mood, setMood] = useState<Mood | null>(null)
  const [weather, setWeather] = useState<Weather | null>(null)
  const [memo, setMemo] = useState('')

  function handleSave() {
    onSave({
      date: todayStr(),
      mood,
      weather,
      memo: memo.trim() === '' ? null : memo.trim(),
      itemIds,
    })
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={saving ? undefined : onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>코디 저장</Text>

        {/* 날씨 */}
        <Text style={styles.label}>날씨</Text>
        <View style={styles.chipRow}>
          {WEATHERS.map((w) => (
            <TouchableOpacity
              key={w}
              style={[styles.chip, weather === w && styles.chipActive]}
              onPress={() => setWeather(weather === w ? null : w)}
            >
              <Text style={[styles.chipText, weather === w && styles.chipTextActive]}>
                {WEATHER_LABELS[w]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 기분 */}
        <Text style={styles.label}>오늘 기분</Text>
        <View style={styles.chipRow}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, mood === m && styles.chipActive]}
              onPress={() => setMood(mood === m ? null : m)}
            >
              <Text style={[styles.chipText, mood === m && styles.chipTextActive]}>
                {MOOD_LABELS[m]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 메모 */}
        <Text style={styles.label}>오늘 한 줄</Text>
        <TextInput
          style={styles.input}
          value={memo}
          onChangeText={setMemo}
          placeholder="오늘의 코디를 기록해보세요"
          placeholderTextColor={colors.textMuted}
          maxLength={50}
        />

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.cancelBtn]}
            onPress={onClose}
            disabled={saving}
          >
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.saveBtn, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveText}>저장하기</Text>
            )}
          </TouchableOpacity>
        </View>
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
  label: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: colors.text,
  },
  chipText: {
    fontSize: 13,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    height: 48,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.secondary,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  saveBtn: {
    backgroundColor: colors.text,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
})
