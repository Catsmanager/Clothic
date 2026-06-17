import { useEffect, useState } from 'react'
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { router } from 'expo-router'
import AuthDivider from '../components/auth/AuthDivider'
import AuthErrorText from '../components/auth/AuthErrorText'
import AuthHeader from '../components/auth/AuthHeader'
import AuthLegalLinks from '../components/auth/AuthLegalLinks'
import AuthScreen from '../components/auth/AuthScreen'
import AuthSubmitButton from '../components/auth/AuthSubmitButton'
import AuthTextField from '../components/auth/AuthTextField'
import { colors } from '../constants/colors'
import { spacing, radius } from '../constants/spacing'
import { useAuthStore } from '../stores/authStore'

const LOGIN_CHARACTER = require('../assets/auth/login-character-cropped.png')

export default function LoginScreen() {
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail)
  const signInWithKakao = useAuthStore((s) => s.signInWithKakao)
  const signInWithApple = useAuthStore((s) => s.signInWithApple)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [kakaoLoading, setKakaoLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const [appleAvailable, setAppleAvailable] = useState(false)

  const busy = loading || kakaoLoading || appleLoading
  const canSubmit = email.trim().length > 0 && password.length > 0 && !busy

  useEffect(() => {
    let mounted = true

    async function checkAppleAvailability() {
      if (Platform.OS !== 'ios') return
      const available = await AppleAuthentication.isAvailableAsync()
      if (mounted) setAppleAvailable(available)
    }

    checkAppleAvailability()
    return () => {
      mounted = false
    }
  }, [])

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

  async function handleApple() {
    if (busy) return
    setAppleLoading(true)
    setError(null)
    const { error: appleError } = await signInWithApple()
    setAppleLoading(false)
    // 성공 시 onAuthStateChange→인증 가드가 자동으로 /(tabs)로 보낸다.
    if (appleError) setError(appleError)
  }

  return (
    <AuthScreen footer={<AuthLegalLinks />}>
      <AuthHeader
        centered
        illustration={LOGIN_CHARACTER}
        illustrationStyle={styles.loginCharacter}
        title="다시 만나서 반가워요"
        subtitle="오늘의 코디를 기록해보세요."
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

        <TouchableOpacity
          style={styles.forgotLink}
          onPress={() => router.push('/forgot-password')}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="비밀번호 찾기"
        >
          <Text style={styles.forgotText}>비밀번호를 잊으셨나요?</Text>
        </TouchableOpacity>

        <AuthErrorText message={error} />

        <AuthSubmitButton
          label="로그인"
          loading={loading}
          disabled={!canSubmit}
          onPress={handleSignIn}
        />

        <View style={styles.signupLinkRow}>
          <Text style={styles.signupPrompt}>계정이 없으신가요?</Text>
          <TouchableOpacity
            onPress={() => router.push('/signup')}
            activeOpacity={0.7}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="회원가입"
            accessibilityState={{ disabled: busy }}
          >
            <Text style={[styles.signupLink, busy && styles.signupLinkDisabled]}>회원가입</Text>
          </TouchableOpacity>
        </View>

        <AuthDivider />

        <TouchableOpacity
          style={[styles.kakaoBtn, busy && styles.kakaoBtnDisabled]}
          onPress={handleKakao}
          activeOpacity={0.85}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={kakaoLoading ? '카카오 로그인 처리 중' : '카카오로 시작하기'}
          accessibilityState={{ disabled: busy }}
        >
          {kakaoLoading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.kakaoBtnText}>카카오로 시작하기</Text>
          )}
        </TouchableOpacity>

        {appleAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={radius.full}
            style={styles.appleBtn}
            onPress={handleApple}
          />
        )}
      </View>
    </AuthScreen>
  )
}

const styles = StyleSheet.create({
  loginCharacter: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
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
  signupLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: -spacing.xs,
  },
  signupPrompt: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  signupLink: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  signupLinkDisabled: {
    opacity: 0.4,
  },
  appleBtn: {
    width: '100%',
    height: 54,
  },
})
