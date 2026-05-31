import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
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
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>다시 만나서 반가워요</Text>
            <Text style={styles.subtitle}>
              이메일로 로그인하고{'\n'}오늘의 코디를 기록해보세요.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!busy}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                editable={!busy}
              />
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleSignIn}
              activeOpacity={0.85}
              disabled={!canSubmit}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>로그인</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.kakaoBtn, busy && styles.submitBtnDisabled]}
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
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>아직 계정이 없으신가요?</Text>
          <TouchableOpacity onPress={() => router.push('/signup')} disabled={busy}>
            <Text style={styles.footerLink}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  form: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  input: {
    height: 52,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  error: {
    fontSize: 13,
    color: colors.danger,
  },
  submitBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.text,
    borderRadius: radius.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  kakaoBtn: {
    backgroundColor: '#FEE500', // 카카오 브랜드 컬러
    borderRadius: radius.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
})
