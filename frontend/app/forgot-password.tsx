import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import AuthErrorText from '../components/auth/AuthErrorText'
import AuthFooterLink from '../components/auth/AuthFooterLink'
import AuthHeader from '../components/auth/AuthHeader'
import AuthScreen from '../components/auth/AuthScreen'
import AuthSubmitButton from '../components/auth/AuthSubmitButton'
import AuthTextField from '../components/auth/AuthTextField'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'
import { useAuthStore } from '../stores/authStore'

export default function ForgotPasswordScreen() {
  const sendPasswordReset = useAuthStore((s) => s.sendPasswordReset)

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = email.trim().length > 0 && !loading

  async function handleSend() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    setNotice(null)
    const { error: resetError } = await sendPasswordReset(email.trim())
    setLoading(false)
    if (resetError) {
      setError(resetError)
      return
    }
    setNotice('재설정 메일을 보냈어요. 메일의 링크를 누르면 새 비밀번호를 설정할 수 있어요.')
  }

  return (
    <AuthScreen
      footer={
        <AuthFooterLink
          disabled={loading}
          prompt="비밀번호가 기억나셨나요?"
          linkLabel="로그인"
          onPress={() => router.back()}
        />
      }
    >
      <AuthHeader
        title="비밀번호를 잊으셨나요?"
        subtitle={`가입한 이메일을 입력하시면\n재설정 링크를 보내드려요.`}
      />

      <View style={styles.form}>
        <AuthTextField
          label="이메일"
          value={email}
          onChangeText={setEmail}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          editable={!loading}
        />

        <AuthErrorText message={error} />
        {notice && <Text style={styles.notice}>{notice}</Text>}

        <AuthSubmitButton
          label="재설정 메일 보내기"
          loading={loading}
          disabled={!canSubmit}
          onPress={handleSend}
        />
      </View>
    </AuthScreen>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  notice: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
})
