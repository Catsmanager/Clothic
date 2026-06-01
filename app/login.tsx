import { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import AuthDivider from '../components/auth/AuthDivider'
import AuthErrorText from '../components/auth/AuthErrorText'
import AuthFooterLink from '../components/auth/AuthFooterLink'
import AuthHeader from '../components/auth/AuthHeader'
import AuthScreen from '../components/auth/AuthScreen'
import AuthSubmitButton from '../components/auth/AuthSubmitButton'
import AuthTextField from '../components/auth/AuthTextField'
import { colors } from '../constants/colors'
import { spacing, radius } from '../constants/spacing'
import { useAuthStore } from '../stores/authStore'

export default function LoginScreen() {
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail)
  const signInWithKakao = useAuthStore((s) => s.signInWithKakao)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [kakaoLoading, setKakaoLoading] = useState(false)

  const busy = loading || kakaoLoading
  const canSubmit = email.trim().length > 0 && password.length > 0 && !busy

  async function handleSignIn() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    const { error: signInError } = await signInWithEmail(email.trim(), password)
    setLoading(false)
    if (signInError) {
      setError(signInError)
      return
    }
    router.replace('/(tabs)')
  }

  async function handleKakao() {
    if (busy) return
    setKakaoLoading(true)
    setError(null)
    const { error: kakaoError } = await signInWithKakao()
    setKakaoLoading(false)
    // 성공 시 onAuthStateChange→인증 가드가 자동으로 /(tabs)로 보낸다.
    if (kakaoError) setError(kakaoError)
  }

  return (
    <AuthScreen
      footer={
        <AuthFooterLink
          disabled={busy}
          prompt="아직 계정이 없으신가요?"
          linkLabel="회원가입"
          onPress={() => router.push('/signup')}
        />
      }
    >
      <AuthHeader
        title="다시 만나서 반가워요"
        subtitle={`이메일로 로그인하고\n오늘의 코디를 기록해보세요.`}
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
          editable={!busy}
        />

        <AuthTextField
          label="비밀번호"
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호를 입력하세요"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          editable={!busy}
        />

        <AuthErrorText message={error} />

        <AuthSubmitButton
          label="로그인"
          loading={loading}
          disabled={!canSubmit}
          onPress={handleSignIn}
        />

        <AuthDivider />

        <TouchableOpacity
          style={[styles.kakaoBtn, busy && styles.kakaoBtnDisabled]}
          onPress={handleKakao}
          activeOpacity={0.85}
          disabled={busy}
        >
          {kakaoLoading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.kakaoBtnText}>카카오로 시작하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </AuthScreen>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  kakaoBtn: {
    backgroundColor: '#FEE500', // 카카오 브랜드 컬러
    borderRadius: radius.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoBtnDisabled: {
    opacity: 0.4,
  },
  kakaoBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
})
