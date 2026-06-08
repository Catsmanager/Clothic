import { create } from 'zustand'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { isOnboardingDone, setOnboardingDone } from '../lib/onboarding'

// 인증 액션 결과: 화면에서 에러 메시지 표시에 사용한다.
type AuthResult = { error: string | null }

interface AuthState {
  session: Session | null
  user: User | null
  // 온보딩 완료 여부(SecureStore에서 복원). 인증 가드의 분기에 사용한다.
  onboardingDone: boolean
  // 앱 시작 시 SecureStore에 저장된 세션·온보딩 플래그 복원이 끝났는지 여부.
  // (인증 가드가 복원 완료 전 라우팅하지 않도록 사용)
  initialized: boolean

  initialize: () => Promise<void>
  completeOnboarding: () => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<AuthResult>
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>
  signInWithKakao: () => Promise<AuthResult>
  signInWithApple: () => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  deleteAccount: () => Promise<AuthResult>
}

let authSubscription: { unsubscribe: () => void } | null = null

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  onboardingDone: false,
  initialized: false,

  // 저장된 세션·온보딩 플래그를 복원하고 이후 인증 상태 변화를 구독한다.
  // root layout에서 1회만 호출한다.
  initialize: async () => {
    try {
      const [{ data }, onboardingDone] = await Promise.all([
        supabase.auth.getSession(),
        isOnboardingDone(),
      ])
      set({
        session: data.session,
        user: data.session?.user ?? null,
        onboardingDone,
        initialized: true,
      })
    } catch {
      set({ initialized: true })
    }

    if (authSubscription) return

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
    authSubscription = data.subscription
  },

  // 온보딩 완료 처리: SecureStore에 저장하고 메모리 상태도 갱신한다.
  completeOnboarding: async () => {
    await setOnboardingDone()
    set({ onboardingDone: true })
  },

  signUpWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error?.message ?? null }
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  },

  // 카카오 OAuth: 외부 브라우저에서 인증 후 리다이렉트된 code를 세션으로 교환한다.
  // 사전 설정 필요(docs/KAKAO_OAUTH.md): Supabase Kakao provider + 카카오 디벨로퍼스 앱.
  signInWithKakao: async () => {
    const redirectTo = Linking.createURL('auth/callback')

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo, skipBrowserRedirect: true },
    })
    if (error) return { error: error.message }
    if (!data.url) return { error: 'OAuth 인증 URL을 받지 못했습니다.' }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
    // 사용자가 인증창을 닫으면 success가 아니다 → 에러 없이 종료(취소).
    if (result.type !== 'success') return { error: null }

    const { queryParams } = Linking.parse(result.url)
    const code = typeof queryParams?.code === 'string' ? queryParams.code : null
    if (!code) return { error: '카카오 인증 코드를 받지 못했습니다.' }

    // 세션 교환 성공 시 onAuthStateChange가 store의 session/user를 갱신한다.
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    return { error: exchangeError?.message ?? null }
  },

  // Apple 네이티브 로그인(iOS): identityToken을 Supabase에 넘겨 세션을 만든다.
  // 재생 공격 방지를 위해 raw nonce를 SHA256 해시해 Apple에 보내고,
  // Supabase에는 raw nonce를 전달한다(Supabase가 토큰의 해시와 대조).
  // 사전 설정 필요: Apple Developer "Sign in with Apple" + Supabase Apple provider.
  signInWithApple: async () => {
    try {
      const rawNonce = Crypto.randomUUID()
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      )

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      })
      if (!credential.identityToken) {
        return { error: 'Apple 인증 토큰을 받지 못했습니다.' }
      }

      // 세션 교환 성공 시 onAuthStateChange가 store의 session/user를 갱신한다.
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      })
      return { error: error?.message ?? null }
    } catch (e) {
      // 사용자가 시트를 닫으면 취소 → 에러 없이 종료.
      if (e && typeof e === 'object' && 'code' in e && e.code === 'ERR_REQUEST_CANCELED') {
        return { error: null }
      }
      return { error: e instanceof Error ? e.message : 'Apple 로그인에 실패했습니다.' }
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error: error?.message ?? null }
  },

  // 계정 영구 삭제: Edge Function(delete-account)이 데이터+auth 계정을 삭제한다.
  // 성공 시 무효해진 로컬 세션을 정리한다(scope: 'local' — 서버 재호출 없이 토큰 제거).
  deleteAccount: async () => {
    const { error } = await supabase.functions.invoke('delete-account')
    if (error) return { error: error.message }
    await supabase.auth.signOut({ scope: 'local' })
    return { error: null }
  },
}))
