import { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import AuthErrorText from '../components/auth/AuthErrorText'
import AuthHeader from '../components/auth/AuthHeader'
import AuthScreen from '../components/auth/AuthScreen'
import AuthSubmitButton from '../components/auth/AuthSubmitButton'
import AuthTextField from '../components/auth/AuthTextField'
import { spacing } from '../constants/spacing'
import { useAuthStore } from '../stores/authStore'

// Supabase 기본 비밀번호 최소 길이.
const MIN_PASSWORD_LENGTH = 6

export default function ResetPasswordScreen() {
  const updatePassword = useAuthStore((s) => s.updatePassword)

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = password.length > 0 && passwordConfirm.length > 0 && !loading

  async function handleUpdate() {
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
    const { error: updateError } = await updatePassword(password)
    setLoading(false)
    if (updateError) {
      setError(updateError)
      return
    }

    Alert.alert('비밀번호 변경 완료', '새 비밀번호로 변경되었어요.', [
      { text: '확인', onPress: () => router.replace('/(tabs)') },
    ])
  }

  return (
    <AuthScreen>
      <AuthHeader title="새 비밀번호 설정" subtitle={`사용할 새 비밀번호를\n입력해주세요.`} />

      <View style={styles.form}>
        <AuthTextField
          label="새 비밀번호"
          value={password}
          onChangeText={setPassword}
          placeholder={`${MIN_PASSWORD_LENGTH}자 이상 입력하세요`}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
          editable={!loading}
        />

        <AuthTextField
          label="새 비밀번호 확인"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          placeholder="비밀번호를 다시 입력하세요"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
          editable={!loading}
        />

        <AuthErrorText message={error} />

        <AuthSubmitButton
          label="비밀번호 변경"
          loading={loading}
          disabled={!canSubmit}
          onPress={handleUpdate}
        />
      </View>
    </AuthScreen>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
})
