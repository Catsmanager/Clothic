import { useEffect } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import SettingsHeader from '../components/settings/SettingsHeader'
import NotificationItem from '../components/notifications/NotificationItem'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'
import { useNotificationStore } from '../stores/notificationStore'

export default function NotificationCenterScreen() {
  const notifications = useNotificationStore((s) => s.notifications)
  const loading = useNotificationStore((s) => s.loading)
  const error = useNotificationStore((s) => s.error)
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications)
  const markRead = useNotificationStore((s) => s.markRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const removeNotification = useNotificationStore((s) => s.removeNotification)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const hasUnread = notifications.some((item) => !item.read)

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SettingsHeader title="알림" />

      {hasUnread && (
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={markAllRead}
          accessibilityRole="button"
          accessibilityLabel="모든 알림 읽음 처리"
        >
          <Text style={styles.markAllText}>모두 읽음 처리</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.text} />
          <Text style={styles.emptyText}>알림을 불러오고 있어요</Text>
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Feather name="alert-circle" size={32} color={colors.textMuted} />
          <Text style={styles.emptyText}>알림을 불러오지 못했어요</Text>
          <Text style={styles.errorText}>연결을 확인하고 다시 시도해주세요.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchNotifications()}
            accessibilityRole="button"
            accessibilityLabel="알림 다시 불러오기"
          >
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="bell-off" size={32} color={colors.textMuted} />
          <Text style={styles.emptyText}>새로운 알림이 없어요</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {notifications.map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
              onDelete={removeNotification}
              onPress={markRead}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  markAllButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  errorText: {
    maxWidth: 280,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 44,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.text,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
})
