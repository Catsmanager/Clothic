import { useState } from 'react'
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SettingsHeader from '../../components/settings/SettingsHeader'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

export default function AppSettingsScreen() {
  const [compactMode, setCompactMode] = useState(false)
  const [weeklyStartMonday, setWeeklyStartMonday] = useState(false)

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SettingsHeader title="앱 설정" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>화면 표시</Text>
          <SettingRow
            title="컴팩트 보기"
            description="목록과 카드의 간격을 더 촘촘하게 표시해요."
            value={compactMode}
            onValueChange={setCompactMode}
          />
          <SettingRow
            title="월요일부터 주 시작"
            description="캘린더와 주간 기록 기준을 월요일로 맞춰요."
            value={weeklyStartMonday}
            onValueChange={setWeeklyStartMonday}
          />
        </View>
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
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
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
