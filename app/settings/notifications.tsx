import { useState } from 'react'
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SettingsHeader from '../../components/settings/SettingsHeader'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

export default function NotificationSettingsScreen() {
  const [dailyReminder, setDailyReminder] = useState(true)
  const [challengeUpdates, setChallengeUpdates] = useState(true)
  const [sleepingWardrobe, setSleepingWardrobe] = useState(false)

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SettingsHeader title="알림 설정" />
      <ScrollView contentContainerStyle={styles.content}>
        <SettingRow
          title="오늘의 코디 기록 알림"
          description="매일 저녁 코디 기록을 잊지 않게 알려줘요."
          value={dailyReminder}
          onValueChange={setDailyReminder}
        />
        <SettingRow
          title="챌린지 진행 알림"
          description="챌린지 달성 및 배지 획득 소식을 알려줘요."
          value={challengeUpdates}
          onValueChange={setChallengeUpdates}
        />
        <SettingRow
          title="잠자는 옷장 알림"
          description="오래 입지 않은 아이템이 많아지면 알려줘요."
          value={sleepingWardrobe}
          onValueChange={setSleepingWardrobe}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

function SettingRow({
  description,
  onValueChange,
  title,
  value,
}: {
  description: string
  onValueChange: (value: boolean) => void
  title: string
  value: boolean
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
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
  content: {
    padding: spacing.md,
    gap: spacing.sm,
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
})
