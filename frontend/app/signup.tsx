import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import AuthErrorText from '../components/auth/AuthErrorText'
import AuthFooterLink from '../components/auth/AuthFooterLink'
import AuthHeader from '../components/auth/AuthHeader'
import AuthLegalLinks from '../components/auth/AuthLegalLinks'
import AuthScreen from '../components/auth/AuthScreen'
import AuthSubmitButton from '../components/auth/AuthSubmitButton'
import AuthTextField from '../components/auth/AuthTextField'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'
import { useAuthStore } from '../stores/authStore'

// Supabase 기본 비밀번호 최소 길이.
const MIN_PASSWORD_LENGTH = 6

export default function SignupScreen() {
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit =
    email.trim().length > 0 && password.length > 0 && passwordConfirm.length > 0 && !loading

  async function handleSignUp() {
    if (!canSubmit) return

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 해요.`)
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않아요.')
      return
    }

    setLoading(true)
    setError(null)
    setNotice(null)
    const { error: signUpError, needsEmailConfirmation } = await signUpWithEmail(
      email.trim(),
      password
    )
    setLoading(false)
    if (signUpError) {
      setError(signUpError)
      return
    }
    if (needsEmailConfirmation) {
      setNotice('인증 메일을 보냈어요. 메일의 확인 버튼을 누르면 앱에 로그인 상태가 반영됩니다.')
      return
    }
    router.replace('/(tabs)')
  }

  return (
    <AuthScreen
      footer={
        <View>
          <AuthFooterLink
            disabled={loading}
            prompt="이미 계정이 있으신가요?"
            linkLabel="로그인"
            onPress={() => router.back()}
          />
          <AuthLegalLinks />
        </View>
      }
    >
      <AuthHeader
        title="처음 오셨네요"
        subtitle={`이메일로 가입하고\n나만의 코디 다이어리를 시작해보세요.`}
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

        <AuthTextField
          label="비밀번호"
          value={password}
          onChangeText={setPassword}
          placeholder={`${MIN_PASSWORD_LENGTH}자 이상 입력하세요`}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
          editable={!loading}
        />

        <AuthTextField
          label="비밀번호 확인"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          placeholder="비밀번호를 다시 입력하세요"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
          editable={!loading}
        />

        <AuthErrorText message={error} />
        {notice && <Text style={styles.notice}>{notice}</Text>}

        <AuthSubmitButton
          label="회원가입"
          loading={loading}
          disabled={!canSubmit}
          onPress={handleSignUp}
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
