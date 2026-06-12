import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import SettingsHeader from '../components/settings/SettingsHeader'
import { colors } from '../constants/colors'
import { radius, spacing } from '../constants/spacing'

const SUPPORT_EMAIL = 'hyeonjij450@gmail.com'

export default function ContactScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SettingsHeader title="문의하기" />
      <View style={styles.content}>
        <View style={styles.card}>
          <Feather name="mail" size={28} color={colors.text} />
          <Text style={styles.title}>도움이 필요하신가요?</Text>
          <Text style={styles.desc}>오류 제보, 계정 문의, 개선 의견을 이메일로 보내주세요.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Clothic%20문의`)}
          >
            <Text style={styles.buttonText}>이메일 보내기</Text>
          </TouchableOpacity>
          <Text style={styles.email}>{SUPPORT_EMAIL}</Text>
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
    flex: 1,
    padding: spacing.md,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  desc: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  button: {
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  email: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
})
