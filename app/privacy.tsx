import { ScrollView, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SettingsHeader from '../components/settings/SettingsHeader'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SettingsHeader title="개인정보 처리방침" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.paragraph}>
          Clothic은 코디 기록, 아이템 정보, 계정 정보를 서비스 제공과 사용자 경험 개선을 위해
          처리합니다.
        </Text>
        <Text style={styles.paragraph}>
          수집한 정보는 인증, 코디 저장, 통계 및 챌린지 진행도 계산에 사용되며, 관련 법령에 따른
          보관 기간이 끝나면 안전하게 삭제됩니다.
        </Text>
        <Text style={styles.paragraph}>
          정식 개인정보 처리방침 문서는 서비스 공개 전 최신 정책에 맞춰 업데이트됩니다.
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
