import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import * as Linking from 'expo-linking'
import { router, useGlobalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import { useAuthStore } from '../../stores/authStore'

export default function AuthCallbackScreen() {
  const currentUrl = Linking.useURL()
  const params = useGlobalSearchParams()
  const handleAuthCallback = useAuthStore((s) => s.handleAuthCallback)
  const handledRef = useRef(false)
  const [message, setMessage] = useState('이메일 인증을 확인하고 있어요.')

  useEffect(() => {
    if (handledRef.current) return

    async function completeAuth() {
      const initialUrl = await Linking.getInitialURL()
      const fallbackQuery = new URLSearchParams(
        Object.entries(params).flatMap(([key, value]) =>
          Array.isArray(value) ? value.map((item) => [key, item]) : [[key, String(value)]]
        )
      ).toString()
      const url =
        currentUrl ??
        initialUrl ??
        (fallbackQuery.length > 0 ? `clothic://auth/callback?${fallbackQuery}` : null)

      if (!url) {
        setMessage('인증 링크를 확인하지 못했어요. 로그인 화면에서 다시 시도해주세요.')
        router.replace('/login')
        return
      }

      handledRef.current = true
      const { error, recovery } = await handleAuthCallback(url)
      if (error) {
        setMessage(error)
        router.replace('/login')
        return
      }

      router.replace(recovery ? '/reset-password' : '/(tabs)')
    }

    completeAuth()
  }, [currentUrl, handleAuthCallback, params])

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <ActivityIndicator color={colors.text} />
        <Text style={styles.message}>{message}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
})
