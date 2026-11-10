import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

// 단순 key-value 영속 저장소 (AsyncStorage 사용 금지 규칙 준수).
// expo-secure-store는 네이티브 전용 — web에서는 localStorage로 대체한다.
// (lib/supabase.ts의 auth storage 분기와 동일한 정책)
// 주의: 키는 SecureStore 허용 문자(영숫자·"."·"-"·"_")만 사용한다.
const isWeb = Platform.OS === 'web'

export async function getStoredValue(key: string): Promise<string | null> {
  if (isWeb) {
    return globalThis.localStorage?.getItem(key) ?? null
  }
  return SecureStore.getItemAsync(key)
}

export async function setStoredValue(key: string, value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value)
    return
  }
  await SecureStore.setItemAsync(key, value)
}
