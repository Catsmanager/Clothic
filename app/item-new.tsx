import { useMemo, useState } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import {
  CATEGORY_LABELS,
  ITEM_CATEGORIES,
  STYLE_TAGS,
  type Category,
  type StyleTag,
} from '../constants/items'
import { COLOR_PALETTE } from '../constants/colorPalette'
import { colors } from '../constants/colors'
import { radius, spacing } from '../constants/spacing'
import { useItemStore } from '../stores/itemStore'

const COLOR_OPTIONS = COLOR_PALETTE.map((palette) => palette.hex)

const COLOR_LABELS: Record<string, string> = Object.fromEntries(
  COLOR_PALETTE.map((palette) => [palette.hex, palette.name])
)

const STYLE_LABELS: Record<StyleTag, string> = {
  casual: '캐주얼',
  formal: '포멀',
  street: '스트릿',
  feminine: '페미닌',
  minimal: '미니멀',
  sporty: '스포티',
  vintage: '빈티지',
  chic: '시크',
  bohemian: '보헤미안',
  preppy: '프레피',
}

export default function NewItemScreen() {
  const addItem = useItemStore((s) => s.addItem)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('top')
  const [color, setColor] = useState(COLOR_OPTIONS[0])
  const [styleTags, setStyleTags] = useState<StyleTag[]>(['casual'])
  const [saving, setSaving] = useState(false)

  const canSave = useMemo(() => name.trim().length > 0 && !saving, [name, saving])

  const toggleStyleTag = (tag: StyleTag) => {
    setStyleTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    )
  }

  const handleSave = async () => {
    if (!canSave) return

    setSaving(true)
    const { error } = await addItem({ name, category, color, styleTags })
    setSaving(false)

    if (error) {
      Alert.alert('등록 실패', error)
      return
    }

    router.back()
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>아이템 등록</Text>
        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityLabel={saving ? '아이템 저장 중' : '아이템 저장'}
          accessibilityState={{ disabled: !canSave }}
        >
          <Text style={styles.saveButtonText}>{saving ? '저장중' : '저장'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.previewCard}>
          <View style={[styles.previewSwatch, { backgroundColor: color }]} />
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="아이템 이름"
            placeholderTextColor={colors.textMuted}
            returnKeyType="done"
            accessibilityLabel="아이템 이름"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>카테고리</Text>
          <View style={styles.chipGrid}>
            {ITEM_CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, category === item && styles.chipActive]}
                onPress={() => setCategory(item)}
                accessibilityRole="button"
                accessibilityLabel={`${CATEGORY_LABELS[item]} 카테고리`}
                accessibilityState={{ selected: category === item }}
              >
                <Text style={[styles.chipText, category === item && styles.chipTextActive]}>
                  {CATEGORY_LABELS[item]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>색상</Text>
          <View style={styles.colorGrid}>
            {COLOR_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.colorButton, color === item && styles.colorButtonActive]}
                onPress={() => setColor(item)}
                accessibilityRole="button"
                accessibilityLabel={`${COLOR_LABELS[item]} 색상`}
                accessibilityState={{ selected: color === item }}
              >
                <View style={[styles.colorSwatch, { backgroundColor: item }]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>스타일</Text>
          <View style={styles.chipGrid}>
            {STYLE_TAGS.map((tag) => {
              const selected = styleTags.includes(tag)
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => toggleStyleTag(tag)}
                  accessibilityRole="button"
                  accessibilityLabel={`${STYLE_LABELS[tag]} 스타일`}
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {STYLE_LABELS[tag]}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  saveButton: {
    minWidth: 56,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text,
  },
  saveButtonDisabled: {
    opacity: 0.35,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  previewCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  previewSwatch: {
    width: 132,
    height: 132,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nameInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 34,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  chipActive: {
    borderColor: colors.text,
    backgroundColor: colors.text,
  },
  chipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.white,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorButton: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  colorButtonActive: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
})
