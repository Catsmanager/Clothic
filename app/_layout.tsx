import { useEffect, useState } from 'react'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ONBOARDING_KEY = 'clothic_onboarding_done'

export default function RootLayout() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((done) => {
      setReady(true)
      if (!done) {
        router.replace('/onboarding')
      }
    })
  }, [])

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}
