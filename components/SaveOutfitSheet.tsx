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
import { Feather } from '@expo/vector-icons'
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
import OutfitAvatar from './OutfitAvatar'

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
  const itemSummary =
    items.length === 0
      ? '선택한 아이템이 없어요'
      : items.length === 1
        ? items[0].name
        : `${items[0].name} 외 ${items.length - 1}개`

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
          <View style={[styles.sheetHeader, step === 2 && styles.sheetHeaderCentered]}>
            <Text style={[styles.title, step === 2 && styles.titleCentered]}>
              {step === 1 ? '코디 저장' : '오늘의 옷장 일기'}
            </Text>
          </View>

          <StepIndicator step={step} />

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {step === 1 ? (
              <>
                <Text style={styles.stepHint}>무엇을 저장할지 먼저 확인해요.</Text>
                <ItemColorPicker
                  items={colorItems}
                  itemColors={itemColors}
                  onSelectColor={setItemColor}
                />
                <View style={styles.helperBox}>
                  <Feather name="heart" size={17} color={colors.accent} />
                  <View style={styles.helperTextBox}>
                    <Text style={styles.helperTitle}>색상 선택은 선택사항이에요.</Text>
                    <Text style={styles.helperBody}>건너뛰어도 다음 단계로 이어져요.</Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.stepHintCentered}>날씨와 기분까지 함께 기록해요.</Text>
                <View style={styles.outfitSummaryCard}>
                  <View style={styles.outfitSummaryAvatar}>
                    <OutfitAvatar items={items} style={styles.outfitSummaryAvatarImage} />
                  </View>
                  <View style={styles.outfitSummaryText}>
                    <Text style={styles.outfitSummaryLabel}>오늘 저장할 코디</Text>
                    <Text style={styles.outfitSummaryName} numberOfLines={1}>
                      {itemSummary}
                    </Text>
                  </View>
                  <Feather name="edit-2" size={22} color={colors.accent} />
                </View>
                <OptionChipGroup
                  label="오늘 날씨"
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
              secondaryLabel="건너뛰기"
              primaryLabel="다음"
              onSecondary={() => setStep(2)}
              onPrimary={() => setStep(2)}
            />
          ) : (
            <SaveOutfitActions
              loading={saving}
              secondaryLabel="이전"
              primaryLabel="옷장에 저장하기"
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
  },
  titleCentered: {
    textAlign: 'center',
    fontSize: 20,
    color: '#6F3E2C',
  },
  sheetHeader: {
    marginBottom: spacing.sm,
  },
  sheetHeaderCentered: {
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#8A4F32',
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
  stepLineActive: {
    backgroundColor: '#CDAA94',
  },
  stepHint: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  stepHintCentered: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flexGrow: 0,
  },
  contentContainer: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  helperBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E0BFAE',
    backgroundColor: '#FFF9F4',
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  helperTextBox: {
    flex: 1,
    gap: 3,
  },
  helperTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7A4A36',
  },
  helperBody: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.text,
  },
  outfitSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#E0BFAE',
    backgroundColor: '#FFFDFB',
    padding: spacing.md,
  },
  outfitSummaryAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
    overflow: 'hidden',
  },
  outfitSummaryAvatarImage: {
    width: '100%',
    height: '100%',
  },
  outfitSummaryText: {
    flex: 1,
  },
  outfitSummaryLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  outfitSummaryName: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '700',
  },
})

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <View style={styles.steps}>
      <View style={[styles.stepDot, step === 1 && styles.stepDotActive]}>
        <Text style={[styles.stepNum, step === 1 && styles.stepNumActive]}>1</Text>
      </View>
      <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
      <View style={[styles.stepDot, step === 2 && styles.stepDotActive]}>
        <Text style={[styles.stepNum, step === 2 && styles.stepNumActive]}>2</Text>
      </View>
    </View>
  )
}
