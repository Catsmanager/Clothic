import { StyleSheet, Text, TouchableOpacity, View, type GestureResponderEvent } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { AppNotification } from '../../constants/notifications'

interface Props {
  notification: AppNotification
  onDelete: (id: string) => void
  onPress: (id: string) => void
}

export default function NotificationItem({ notification, onDelete, onPress }: Props) {
  const { id, icon, title, body, time, read } = notification
  const handleDelete = (event: GestureResponderEvent) => {
    event.stopPropagation()
    onDelete(id)
  }

  return (
    <TouchableOpacity
      style={[styles.row, !read && styles.rowUnread]}
      onPress={() => onPress(id)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${body}, ${time}`}
      accessibilityState={{ selected: !read }}
    >
      <View style={[styles.iconCircle, read && styles.iconCircleRead]}>
        <Feather name={icon} size={18} color={colors.text} />
      </View>
      <View style={styles.textBox}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, read && styles.titleRead]} numberOfLines={1}>
            {title}
          </Text>
          {!read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.body} numberOfLines={2}>
          {body}
        </Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      {read && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${title} 알림 삭제`}
        >
          <Feather name="x" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  rowUnread: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleRead: {
    backgroundColor: colors.white,
  },
  textBox: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  titleRead: {
    fontWeight: '600',
    color: colors.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    marginTop: 4,
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
