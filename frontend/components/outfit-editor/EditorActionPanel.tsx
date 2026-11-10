import { Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  canClear: boolean
  canUndo: boolean
  onClear: () => void
  onRandom: () => void
  onUndo: () => void
}

export default function EditorActionPanel({ canClear, canUndo, onClear, onRandom, onUndo }: Props) {
  return (
    <View style={styles.actionPanel}>
      <View style={styles.actionItem}>
        <TouchableOpacity
          style={[styles.actionBtn, !canUndo && styles.actionBtnDisabled]}
          onPress={onUndo}
          disabled={!canUndo}
          accessibilityRole="button"
          accessibilityLabel="실행 취소"
        >
          <Feather name="rotate-ccw" size={17} color={canUndo ? colors.text : colors.textMuted} />
        </TouchableOpacity>
        <Text style={[styles.actionLabel, !canUndo && styles.actionLabelDisabled]}>실행 취소</Text>
      </View>

      <View style={styles.actionItem}>
        <TouchableOpacity
          style={[styles.actionBtn, !canClear && styles.actionBtnDisabled]}
          onPress={onClear}
          disabled={!canClear}
          accessibilityRole="button"
          accessibilityLabel="모두 벗기"
          accessibilityHint="현재 착용한 모든 아이템을 해제합니다"
          accessibilityState={{ disabled: !canClear }}
        >
          <Feather name="trash-2" size={17} color={canClear ? colors.text : colors.textMuted} />
        </TouchableOpacity>
        <Text style={[styles.actionLabel, !canClear && styles.actionLabelDisabled]}>모두 벗기</Text>
      </View>

      <View style={styles.actionItem}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onRandom}
          accessibilityRole="button"
          accessibilityLabel="랜덤"
        >
          <Feather name="shuffle" size={17} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.actionLabel}>랜덤</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  actionPanel: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  actionItem: {
    width: 58,
    alignItems: 'center',
    gap: 2,
  },
  actionBtn: {
    width: 34,
    height: 34,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  actionBtnDisabled: {
    backgroundColor: colors.secondary,
  },
  actionLabel: {
    fontSize: 10,
    lineHeight: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actionLabelDisabled: {
    color: colors.border,
  },
})
