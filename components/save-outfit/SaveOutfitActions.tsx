import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  saving: boolean
  onCancel: () => void
  onSave: () => void
}

export default function SaveOutfitActions({ saving, onCancel, onSave }: Props) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.btn, styles.cancelBtn]}
        onPress={onCancel}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel="코디 저장 취소"
      >
        <Text style={styles.cancelText}>취소</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.saveBtn, saving && styles.btnDisabled]}
        onPress={onSave}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel={saving ? '코디 저장 중' : '코디 저장하기'}
      >
        {saving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.saveText}>저장하기</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
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
