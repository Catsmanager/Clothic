import { create } from 'zustand'
import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { isOnboardingDone, setOnboardingDone } from '../lib/onboarding'

// 인증 액션 결과: 화면에서 에러 메시지 표시에 사용한다.
type AuthResult = { error: string | null }
type SignUpResult = AuthResult & { needsEmailConfirmation?: boolean }
// 콜백 결과: 비밀번호 재설정(recovery) 링크면 recovery=true로 알려 새 비밀번호 화면으로 보낸다.
type AuthCallbackResult = AuthResult & { recovery?: boolean }

function getUrlParam(url: string, key: string): string | null {
  const sections = [url.split('?')[1]?.split('#')[0], url.split('#')[1]].filter(
    (section): section is string => Boolean(section)
  )

  for (const section of sections) {
    const pairs = section.split('&')
    for (const pair of pairs) {
      const [rawKey, rawValue] = pair.split('=')
      if (decodeURIComponent(rawKey ?? '') === key) {
        return decodeURIComponent((rawValue ?? '').replace(/\+/g, ' '))
      }
    }
  }

  return null
}

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
  signUpWithEmail: (email: string, password: string) => Promise<SignUpResult>
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>
  signInWithKakao: () => Promise<AuthResult>
  signInWithApple: () => Promise<AuthResult>
  sendPasswordReset: (email: string) => Promise<AuthResult>
  updatePassword: (newPassword: string) => Promise<AuthResult>
  handleAuthCallback: (url: string) => Promise<AuthCallbackResult>
  signOut: () => Promise<AuthResult>
  deleteAccount: () => Promise<AuthResult>
}

let authSubscription: { unsubscribe: () => void } | null = null

export const useAuthStore = create<AuthState>((set, get) => ({
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
    const redirectTo = Linking.createURL('auth/callback')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    })
    if (error) return { error: error.message }

    if (data.session) {
      set({ session: data.session, user: data.session.user })
      return { error: null, needsEmailConfirmation: false }
    }

    return { error: null, needsEmailConfirmation: true }
  },

  signInWithEmail: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    if (data.session) set({ session: data.session, user: data.session.user })
    return { error: null }
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

    // Kakao OAuth도 이메일 인증 링크와 같은 callback 처리 경로를 사용한다.
    return get().handleAuthCallback(result.url)
  },

  // Apple 네이티브 로그인(iOS): identityToken을 Supabase에 넘겨 세션을 만든다.
  // 재생 공격 방지를 위해 raw nonce를 SHA256 해시해 Apple에 보내고,
  // Supabase에는 raw nonce를 전달한다(Supabase가 토큰의 해시와 대조).
  // 사전 설정 필요: Apple Developer "Sign in with Apple" + Supabase Apple provider.
  signInWithApple: async () => {
    try {
      if (Platform.OS !== 'ios') {
        return { error: 'Apple 로그인은 iOS 기기에서만 사용할 수 있습니다.' }
      }

      const available = await AppleAuthentication.isAvailableAsync()
      if (!available) {
        return { error: '이 기기에서는 Apple 로그인을 사용할 수 없습니다.' }
      }

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

  // 비밀번호 재설정 메일 발송. 메일의 링크는 auth/callback으로 돌아온다.
  // PKCE 흐름에선 Supabase verify 리다이렉트가 type=recovery를 떨구므로,
  // redirect_to에 intent=recovery 표식을 직접 심어 콜백에서 재설정 흐름을 구분한다.
  sendPasswordReset: async (email) => {
    const redirectTo = Linking.createURL('auth/callback', { queryParams: { intent: 'recovery' } })
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    return { error: error?.message ?? null }
  },

  // 새 비밀번호 설정. recovery 세션이 열린 상태에서 호출한다.
  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: error?.message ?? null }
  },

  handleAuthCallback: async (url) => {
    const callbackError = getUrlParam(url, 'error_description') ?? getUrlParam(url, 'error')
    if (callbackError) return { error: callbackError }

    // 비밀번호 재설정 링크면 새 비밀번호 입력 화면으로 보내기 위해 표시한다.
    // type=recovery는 implicit 흐름, intent=recovery는 PKCE 흐름(우리가 심은 표식)에서 잡힌다.
    const recovery =
      getUrlParam(url, 'type') === 'recovery' || getUrlParam(url, 'intent') === 'recovery'

    const code = getUrlParam(url, 'code')
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) return { error: error.message }
      set({ session: data.session, user: data.session?.user ?? null })
      return { error: null, recovery }
    }

    const accessToken = getUrlParam(url, 'access_token')
    const refreshToken = getUrlParam(url, 'refresh_token')
    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      if (error) return { error: error.message }
      set({ session: data.session, user: data.session?.user ?? null })
      return { error: null, recovery }
    }

    return { error: '이메일 인증 정보를 앱에서 확인하지 못했습니다.' }
  },

  signOut: async () => {
    set({ session: null, user: null })

    const { error } = await supabase.auth.signOut({ scope: 'local' })
    return { error: error?.message ?? null }
  },

  // 계정 영구 삭제: Edge Function(delete-account)이 데이터+auth 계정을 삭제한다.
  // 성공 시 무효해진 로컬 세션을 정리한다(scope: 'local' — 서버 재호출 없이 토큰 제거).
  deleteAccount: async () => {
    const { error } = await supabase.functions.invoke('delete-account')
    if (error) return { error: error.message }
    await supabase.auth.signOut({ scope: 'local' })
    set({ session: null, user: null })
    return { error: null }
  },
}))
