import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// 환경변수는 .env.local에서 주입한다 (키 하드코딩 금지).
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase 환경변수가 없습니다. .env.local에 EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.'
  )
}

// Auth 세션 저장소: expo-secure-store 기반 (AsyncStorage 사용 금지 규칙 준수).
// 주의: SecureStore 값은 항목당 ~2KB 제한. 세션 토큰은 이 범위 내로 가정한다.
const SecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string): Promise<void> => SecureStore.setItemAsync(key, value),
  removeItem: (key: string): Promise<void> => SecureStore.deleteItemAsync(key),
}

// SecureStore는 네이티브 전용 — web에서는 기본(in-memory) 저장소를 사용한다.
const storage = Platform.OS === 'web' ? undefined : SecureStoreAdapter

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // React Native에는 URL 세션 감지가 없다.
    flowType: 'pkce', // 모바일 OAuth: 리다이렉트 code를 exchangeCodeForSession으로 교환.
  },
})
