import Constants from 'expo-constants'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SettingsHeader from '../components/settings/SettingsHeader'
import { colors } from '../constants/colors'
import { radius, spacing } from '../constants/spacing'

export default function AppInfoScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0'
  const slug = Constants.expoConfig?.slug ?? 'clothic'

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SettingsHeader title="앱 버전 정보" />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.appName}>Clothic</Text>
          <Text style={styles.version}>버전 {version}</Text>
          <Text style={styles.meta}>앱 ID: {slug}</Text>
        </View>
      </View>
    </SafeAreaView>
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
    padding: spacing.lg,
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  version: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
})
