// Expo가 주입하는 EXPO_PUBLIC_* 환경변수 타입 선언.
// (@types/node를 끌어오지 않고 process.env만 최소 타이핑)
declare const process: {
  env: {
    EXPO_PUBLIC_SUPABASE_URL?: string
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string
  }
}
