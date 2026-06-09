import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { Challenge } from '../../constants/challenges'

interface Props {
  challenge: Challenge | null
  visible: boolean
  onClose: () => void
}

const TIP_BY_ID: Record<string, string> = {
  'streak-7': '하루에 한 번 코디를 저장하면 연속 기록이 이어져요.',
  'wake-sleeping': '예전에 저장한 아이템을 30일 뒤 다시 입고 저장하면 완료돼요.',
  'new-combo': '이번 달에 같은 아이템 조합을 반복하지 않고 새 조합을 저장해보세요.',
  'rainy-day': '저장 시트에서 날씨를 비로 선택하고 저장하면 완료돼요.',
}

export default function ChallengeDetailSheet({ challenge, visible, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const ratio =
    challenge && challenge.goal > 0 ? Math.min(challenge.current / challenge.goal, 1) : 0
  const completed = challenge ? challenge.current >= challenge.goal : false

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{challenge?.title ?? '챌린지'}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>{challenge?.description}</Text>

          <View style={styles.progressBox}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>{completed ? '완료' : '진행 중'}</Text>
              <Text style={styles.progressCount}>
                {challenge?.current ?? 0} / {challenge?.goal ?? 0}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
            </View>
          </View>

          <View style={styles.tipBox}>
            <Feather name="info" size={16} color={colors.textMuted} />
            <Text style={styles.tipText}>{challenge ? TIP_BY_ID[challenge.id] : null}</Text>
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
    marginBottom: spacing.sm,
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
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  progressBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  progressCount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  tipBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
})
