import { ScrollView, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SettingsHeader from '../components/settings/SettingsHeader'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SettingsHeader title="서비스 이용약관" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.paragraph}>
          Clothic은 사용자가 코디를 기록하고 옷장 데이터를 관리할 수 있도록 돕는 서비스입니다.
        </Text>
        <Text style={styles.paragraph}>
          사용자는 본인의 계정과 기록을 책임 있게 관리해야 하며, 타인의 권리를 침해하거나 서비스를
          부정하게 이용해서는 안 됩니다.
        </Text>
        <Text style={styles.paragraph}>
          정식 서비스 이용약관 문서는 서비스 공개 전 최신 정책에 맞춰 업데이트됩니다.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
})
