import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuthStore } from '../stores/authStore'
import { colors } from '../constants/colors'

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize)
  const initialized = useAuthStore((s) => s.initialized)
  const onboardingDone = useAuthStore((s) => s.onboardingDone)
  const session = useAuthStore((s) => s.session)

  const segments = useSegments()
  const router = useRouter()

  // 앱 시작 시 세션·온보딩 플래그 복원 (1회).
  useEffect(() => {
    initialize()
  }, [initialize])

  // 인증 가드: 복원 완료 후 로그인/온보딩 상태에 따라 라우팅한다.
  useEffect(() => {
    if (!initialized) return

    const inOnboarding = segments[0] === 'onboarding'
    const inAuth = segments[0] === 'login' || segments[0] === 'signup'
    const inPublic = segments[0] === 'privacy' || segments[0] === 'terms'

    if (inPublic) return

    if (!onboardingDone) {
      // 온보딩 미완료 → 온보딩으로
      if (!inOnboarding) router.replace('/onboarding')
    } else if (!session) {
      // 온보딩 완료·미로그인 → 로그인으로
      if (!inAuth) router.replace('/login')
    } else {
      // 로그인 완료 → 인증/온보딩 화면에 있으면 앱 본화면으로
      if (inAuth || inOnboarding) router.replace('/(tabs)')
    }
  }, [initialized, onboardingDone, session, segments, router])

  // 복원 완료 전에는 깜빡임 방지를 위해 로딩만 표시한다.
  if (!initialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.text} />
      </View>
    )
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
  },
})
