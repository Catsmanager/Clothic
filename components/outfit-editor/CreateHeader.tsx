import { Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  onBack: () => void
  onSave: () => void
}

export default function CreateHeader({ onBack, onSave }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={onBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
      >
        <Feather name="arrow-left" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>코디 만들기</Text>
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={onSave}
        accessibilityRole="button"
        accessibilityLabel="코디 저장하기"
      >
        <Text style={styles.saveBtnText}>저장</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  saveBtn: {
    backgroundColor: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
})
