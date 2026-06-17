import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SettingsHeader from '../components/settings/SettingsHeader'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. 수집하는 개인정보 항목',
    body:
      '· 계정: 이메일, 비밀번호(해시 저장)\n' +
      '· 소셜 로그인: 카카오 또는 Apple 계정 식별자·이메일(Apple 비공개 릴레이 주소 포함)\n' +
      '· 프로필·설정: 닉네임, 알림 설정\n' +
      '· 서비스 데이터: 코디 기록(날짜·기분·날씨·메모·아이템·색상·즐겨찾기), 옷 아이템, 앱 내 알림\n' +
      '· 위치: 날씨 표시를 위해 사용 중에만 일시 사용하며 저장하지 않습니다.',
  },
  {
    title: '2. 이용 목적',
    body: '회원 인증, 코디 기록 저장·조회, 월간 통계·챌린지 계산, 현재 위치 기반 날씨 표시, 문의 응대에 사용합니다. 별도의 분석·광고·크래시 수집 도구는 사용하지 않습니다.',
  },
  {
    title: '3. 보유 및 이용 기간',
    body: '회원 탈퇴 시 개인정보와 서비스 이용 데이터를 지체 없이 파기합니다. 앱 내 [설정] → [계정 삭제]에서 계정과 모든 데이터를 직접 삭제할 수 있습니다.',
  },
  {
    title: '4. 처리 위탁',
    body:
      '· Supabase, Inc.: 인증·데이터베이스(대한민국 리전 저장, 해외 법인 운영)\n' +
      '· 카카오 / Apple: 소셜 로그인 인증\n' +
      '· Open-Meteo: 날씨 조회(위치 좌표만 전송, 식별 정보 미전송)\n' +
      '서비스는 결제 기능을 제공하지 않으며, 개인정보를 판매하지 않습니다.',
  },
  {
    title: '5. 이용자의 권리',
    body: '개인정보 열람·정정·삭제를 요청할 수 있으며, 앱 내에서 직접 계정을 삭제할 수 있습니다. 위치 권한은 기기 설정에서 언제든 철회할 수 있습니다.',
  },
  {
    title: '6. 안전성 확보 조치',
    body: '전송 구간은 HTTPS로 암호화하고, 데이터베이스는 행 수준 보안(RLS)으로 본인 데이터만 접근하도록 제한합니다. 로그인 세션은 기기 보안 저장소에 보관하며, 비밀번호는 해시 처리됩니다.',
  },
  {
    title: '7. 문의처',
    body: '운영자: 진현지\n이메일: hyeonjij450@gmail.com',
  },
]

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SettingsHeader title="개인정보 처리방침" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.effectiveDate}>시행일: 2026년 6월 15일</Text>
        <Text style={styles.paragraph}>
          Clothic은 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을
          준수합니다.
        </Text>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.paragraph}>{section.body}</Text>
          </View>
        ))}
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
  effectiveDate: {
    fontSize: 13,
    color: colors.textMuted,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
})
