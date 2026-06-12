import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  visible: boolean
  onClose: () => void
}

const HELP_ITEMS = [
  '코디를 저장하면 챌린지 진행도가 자동으로 올라가요.',
  '연속 기록, 이번 주 기록, 비 오는 날 기록은 저장한 코디의 날짜와 날씨를 기준으로 계산해요.',
  '잠자는 옷 깨우기는 30일 이상 기록에 없던 아이템을 다시 저장하면 완료돼요.',
  '조건을 달성하면 배지가 자동으로 열리고 획득일이 표시돼요.',
]

export default function ChallengeHelpSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessible={false} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>챌린지는 어떻게 진행되나요?</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="챌린지 도움말 닫기"
            >
              <Feather name="x" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {HELP_ITEMS.map((item) => (
              <View key={item} style={styles.row}>
                <View style={styles.dot} />
                <Text style={styles.desc}>{item}</Text>
              </View>
            ))}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 7,
  },
  desc: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
})
