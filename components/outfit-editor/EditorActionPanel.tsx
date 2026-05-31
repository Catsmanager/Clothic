import { Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  canRedo: boolean
  canUndo: boolean
  onRedo: () => void
  onUndo: () => void
}

export default function EditorActionPanel({ canRedo, canUndo, onRedo, onUndo }: Props) {
  return (
    <View style={styles.actionPanel}>
      <TouchableOpacity
        style={[styles.actionBtn, !canUndo && styles.actionBtnDisabled]}
        onPress={onUndo}
        disabled={!canUndo}
      >
        <Feather name="rotate-ccw" size={18} color={canUndo ? colors.text : colors.textMuted} />
      </TouchableOpacity>
      <Text style={[styles.actionLabel, !canUndo && styles.actionLabelDisabled]}>실행 취소</Text>

      <TouchableOpacity
        style={[styles.actionBtn, !canRedo && styles.actionBtnDisabled]}
        onPress={onRedo}
        disabled={!canRedo}
      >
        <Feather name="rotate-cw" size={18} color={canRedo ? colors.text : colors.textMuted} />
      </TouchableOpacity>
      <Text style={[styles.actionLabel, !canRedo && styles.actionLabelDisabled]}>다시 실행</Text>

      <TouchableOpacity style={styles.actionBtn}>
        <Feather name="refresh-cw" size={18} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.actionLabel}>회전</Text>

      <TouchableOpacity style={styles.actionBtn}>
        <Feather name="minimize-2" size={18} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.actionLabel}>좌우 반전</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  actionPanel: {
    width: 72,
    paddingTop: spacing.sm,
    paddingRight: spacing.xs,
    gap: 2,
    alignItems: 'center',
  },
  actionBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
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
    color: colors.textMuted,
    textAlign: 'center',
  },
  actionLabelDisabled: {
    color: colors.border,
  },
})
