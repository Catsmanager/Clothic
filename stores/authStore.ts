import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// 인증 액션 결과: 화면에서 에러 메시지 표시에 사용한다.
type AuthResult = { error: string | null }

interface AuthState {
  session: Session | null
  user: User | null
  // 앱 시작 시 SecureStore에 저장된 세션 복원이 끝났는지 여부.
  // (인증 가드가 복원 완료 전 라우팅하지 않도록 사용)
  initialized: boolean

  initialize: () => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<AuthResult>
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,

  // 저장된 세션을 복원하고 이후 인증 상태 변화를 구독한다.
  // root layout에서 1회만 호출한다.
  initialize: async () => {
    const { data } = await supabase.auth.getSession()
    set({
      session: data.session,
      user: data.session?.user ?? null,
      initialized: true,
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  signUpWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error?.message ?? null }
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error: error?.message ?? null }
  },
}))
