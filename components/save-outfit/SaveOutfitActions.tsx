import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  // primary 버튼이 로딩(저장 중)인지. 로딩 중엔 두 버튼 모두 비활성.
  loading: boolean
  secondaryLabel: string
  primaryLabel: string
  onSecondary: () => void
  onPrimary: () => void
}

// 시트 하단 2버튼 푸터. 단계별로 라벨/동작을 받아 재사용한다(취소·다음 / 이전·저장).
export default function SaveOutfitActions({
  loading,
  secondaryLabel,
  primaryLabel,
  onSecondary,
  onPrimary,
}: Props) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.btn, styles.cancelBtn]}
        onPress={onSecondary}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={secondaryLabel}
        accessibilityState={{ disabled: loading }}
      >
        <Text style={styles.cancelText}>{secondaryLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.saveBtn, loading && styles.btnDisabled]}
        onPress={onPrimary}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={loading ? '코디 저장 중' : primaryLabel}
        accessibilityState={{ disabled: loading }}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.saveText}>{primaryLabel}</Text>
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
