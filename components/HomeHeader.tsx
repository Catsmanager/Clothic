import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { colors } from '../constants/colors'
import { radius, spacing } from '../constants/spacing'
import { MOCK_NOTIFICATIONS } from '../constants/notifications'

interface Props {
  onMenuPress: () => void
}

export default function HomeHeader({ onMenuPress }: Props) {
  const hasUnread = MOCK_NOTIFICATIONS.some((item) => !item.read)

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.iconButton, styles.menuButton]}
        onPress={onMenuPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="메뉴 열기"
      >
        <Feather name="menu" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>오늘의 코디</Text>
      <View style={styles.rightGroup}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push('/notifications')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={hasUnread ? '알림 보기, 읽지 않은 알림 있음' : '알림 보기'}
        >
          <Feather name="bell" size={20} color={colors.text} />
          {hasUnread && <View style={styles.unreadDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.challengeButton}
          onPress={() => router.push('/challenge')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="챌린지 보기"
        >
          <Feather name="award" size={16} color={colors.text} />
          <Text style={styles.challengeText}>챌린지</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightGroup: {
    position: 'absolute',
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  menuButton: {
    position: 'absolute',
    left: spacing.md,
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  challengeButton: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm + 2,
  },
  challengeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
})
