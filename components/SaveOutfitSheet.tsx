import { useState } from 'react'
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
import { isColorCategory, type CatalogItem } from '../constants/items'
import ItemColorPicker from './save-outfit/ItemColorPicker'
import OptionChipGroup from './save-outfit/OptionChipGroup'
import SaveOutfitActions from './save-outfit/SaveOutfitActions'
import SaveOutfitMemoField from './save-outfit/SaveOutfitMemoField'

interface Props {
  visible: boolean
  items: CatalogItem[]
  saving: boolean
  onClose: () => void
  onSave: (input: NewOutfit) => void
}

const MOODS = Object.keys(MOOD_LABELS) as Mood[]
const WEATHERS = Object.keys(WEATHER_LABELS) as Weather[]

export default function SaveOutfitSheet({ visible, items, saving, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets()
  const {
    buildInput,
    itemColors,
    memo,
    mood,
    setItemColor,
    setMemo,
    toggleMood,
    toggleWeather,
    weather,
  } = useSaveOutfitForm({ items, visible })

  // 1: 아이템 색상, 2: 날씨/기분/메모. 시트가 열릴 때 1단계로 초기화한다.
  // (effect 대신 prop 변화 시 렌더 중 보정 — React 권장 패턴)
  const [step, setStep] = useState<1 | 2>(1)
  const [wasVisible, setWasVisible] = useState(visible)
  if (visible !== wasVisible) {
    setWasVisible(visible)
    if (visible) setStep(1)
  }

  // 색상 선택은 상의·하의로 한정한다(코디 색을 대표하는 카테고리만).
  const colorItems = items.filter((item) => isColorCategory(item.category))

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

          <View style={styles.steps}>
            <View style={[styles.stepDot, step === 1 && styles.stepDotActive]}>
              <Text style={[styles.stepNum, step === 1 && styles.stepNumActive]}>1</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step === 2 && styles.stepDotActive]}>
              <Text style={[styles.stepNum, step === 2 && styles.stepNumActive]}>2</Text>
            </View>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {step === 1 ? (
              <>
                <Text style={styles.stepHint}>입은 색을 골라주세요 (안 바꿔도 돼요)</Text>
                <ItemColorPicker
                  items={colorItems}
                  itemColors={itemColors}
                  onSelectColor={setItemColor}
                />
              </>
            ) : (
              <>
                <Text style={styles.stepHint}>날씨와 기분을 기록해요</Text>
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
              </>
            )}
          </ScrollView>

          {step === 1 ? (
            <SaveOutfitActions
              loading={false}
              secondaryLabel="취소"
              primaryLabel="다음"
              onSecondary={onClose}
              onPrimary={() => setStep(2)}
            />
          ) : (
            <SaveOutfitActions
              loading={saving}
              secondaryLabel="이전"
              primaryLabel="저장하기"
              onSecondary={() => setStep(1)}
              onPrimary={handleSave}
            />
          )}
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
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.text,
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  stepNumActive: {
    color: colors.white,
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: colors.border,
  },
  stepHint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  content: {
    flexGrow: 0,
  },
  contentContainer: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
})
