import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { SLEEPING_CATEGORIES, type SleepingCategory } from '../../constants/sleepingWardrobe'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  availableTags: string[]
  selectedCategory: SleepingCategory
  selectedTags: string[]
  visible: boolean
  onClear: () => void
  onClose: () => void
  onSelectCategory: (category: SleepingCategory) => void
  onToggleTag: (tag: string) => void
}

export default function SleepingFilterSheet({
  availableTags,
  selectedCategory,
  selectedTags,
  visible,
  onClear,
  onClose,
  onSelectCategory,
  onToggleTag,
}: Props) {
  const insets = useSafeAreaInsets()
  const hasActiveFilter = selectedCategory !== '전체' || selectedTags.length > 0

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessible={false} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>필터</Text>
              <Text style={styles.subtitle}>분류를 고른 뒤 세부 조건을 선택하세요.</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="필터 닫기"
            >
              <Feather name="x" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>분류</Text>
            <View style={styles.chipRow}>
              {SLEEPING_CATEGORIES.map((category) => {
                const active = selectedCategory === category

                return (
                  <TouchableOpacity
                    key={category}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => onSelectCategory(category)}
                    accessibilityRole="button"
                    accessibilityLabel={`${category} 분류 필터`}
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <Text style={styles.sectionLabel}>세부 필터</Text>
            <View style={styles.chipRow}>
              {availableTags.map((tag) => {
                const active = selectedTags.includes(tag)

                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => onToggleTag(tag)}
                    accessibilityRole="button"
                    accessibilityLabel={`${tag} 세부 필터`}
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{tag}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.clearButton, !hasActiveFilter && styles.clearButtonDisabled]}
              onPress={onClear}
              disabled={!hasActiveFilter}
              accessibilityRole="button"
              accessibilityLabel="필터 초기화"
              accessibilityState={{ disabled: !hasActiveFilter }}
            >
              <Text style={[styles.clearText, !hasActiveFilter && styles.clearTextDisabled]}>
                초기화
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="필터 적용하기"
            >
              <Text style={styles.applyText}>적용하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    maxHeight: '78%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.text,
  },
  chipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  clearButton: {
    flex: 0.9,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
  },
  clearButtonDisabled: {
    opacity: 0.45,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  clearTextDisabled: {
    color: colors.textMuted,
  },
  applyButton: {
    flex: 1.2,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text,
  },
  applyText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
})
