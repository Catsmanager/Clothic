import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

// 온보딩 완료 여부 플래그. AsyncStorage 대신 expo-secure-store 사용(규칙 준수).
// 키는 SecureStore 허용 문자(영숫자·"."·"-"·"_")만 사용한다.
const ONBOARDING_KEY = 'clothic_onboarding_done'

// expo-secure-store는 네이티브 전용 — web에서는 localStorage로 대체한다.
// (lib/supabase.ts의 storage 분기와 동일한 정책)
const isWeb = Platform.OS === 'web'

export async function isOnboardingDone(): Promise<boolean> {
  if (isWeb) {
    return globalThis.localStorage?.getItem(ONBOARDING_KEY) === 'true'
  }
  const value = await SecureStore.getItemAsync(ONBOARDING_KEY)
  return value === 'true'
}

export async function setOnboardingDone(): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(ONBOARDING_KEY, 'true')
    return
  }
  await SecureStore.setItemAsync(ONBOARDING_KEY, 'true')
}
