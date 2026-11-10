import { useEffect } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SettingsHeader from '../../components/settings/SettingsHeader'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import { useNotificationPrefsStore } from '../../stores/notificationPrefsStore'

export default function NotificationSettingsScreen() {
  const dailyReminder = useNotificationPrefsStore((s) => s.dailyReminder)
  const sleepingWardrobe = useNotificationPrefsStore((s) => s.sleepingWardrobe)
  const loading = useNotificationPrefsStore((s) => s.loading)
  const fetchPrefs = useNotificationPrefsStore((s) => s.fetchPrefs)
  const updatePref = useNotificationPrefsStore((s) => s.updatePref)

  useEffect(() => {
    fetchPrefs()
  }, [fetchPrefs])

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SettingsHeader title="알림 설정" />
      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.notice} accessibilityLiveRegion="polite">
            <Text style={styles.noticeTitle}>알림 기능을 준비하고 있어요.</Text>
            <Text style={styles.noticeText}>
              현재 알림은 자동으로 발송되지 않아요. 앱 내 알림 생성 기능이 연결된 뒤 설정할 수
              있도록 안내할게요.
            </Text>
          </View>
          <SettingRow
            title="오늘의 코디 기록 알림"
            description="앱 안에서 오늘의 기록을 알려주는 기능을 준비 중이에요."
            value={dailyReminder}
            onValueChange={(v) => updatePref('dailyReminder', v)}
            disabled
          />
          <SettingRow
            title="잠자는 옷장 알림"
            description="오래 입지 않은 아이템의 앱 내 알림을 준비 중이에요."
            value={sleepingWardrobe}
            onValueChange={(v) => updatePref('sleepingWardrobe', v)}
            disabled
          />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

function SettingRow({
  description,
  disabled,
  onValueChange,
  title,
  value,
}: {
  description: string
  disabled?: boolean
  onValueChange: (value: boolean) => void
  title: string
  value: boolean
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <View style={styles.titleRow}>
          <Text style={styles.rowTitle}>{title}</Text>
          {disabled && (
            <View style={styles.soonBadge}>
              <Text style={styles.soonBadgeText}>준비 중</Text>
            </View>
          )}
        </View>
        <Text style={styles.rowDesc}>{description}</Text>
      </View>
      <Switch
        value={disabled ? false : value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityState={{ disabled }}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? colors.text : colors.white}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  loader: {
    marginTop: spacing.xl,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  notice: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  noticeText: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  rowDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 4,
  },
  soonBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
  },
  soonBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
})
