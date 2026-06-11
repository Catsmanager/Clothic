import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import SettingsHeader from '../components/settings/SettingsHeader'
import NotificationItem from '../components/notifications/NotificationItem'
import { MOCK_NOTIFICATIONS, type AppNotification } from '../constants/notifications'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'

export default function NotificationCenterScreen() {
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS)

  const hasUnread = notifications.some((item) => !item.read)

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    )
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }

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

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="bell-off" size={32} color={colors.textMuted} />
          <Text style={styles.emptyText}>새로운 알림이 없어요</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {notifications.map((item) => (
            <NotificationItem key={item.id} notification={item} onPress={markRead} />
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
})
