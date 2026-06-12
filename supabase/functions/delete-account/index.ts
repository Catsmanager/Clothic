// Supabase Edge Function: delete-account
// 호출자(로그인 사용자)의 계정과 관련 데이터를 영구 삭제한다.
// auth.users 삭제는 service_role 권한이 필요하므로 서버(Edge Function)에서 처리한다.
//
// 배포: supabase functions deploy delete-account
// 필요 시크릿: SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
//   → 위 3개는 Supabase가 Edge Function에 기본 주입하므로 별도 설정 불필요.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing authorization header' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: 'Server is missing required environment variables' }, 500)
    }

    // 1) 전달된 JWT로 호출자 식별·검증
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()
    if (userError || !user) {
      return json({ error: 'Invalid or expired token' }, 401)
    }

    const uid = user.id

    // 2) service_role로 사용자 데이터 삭제 (RLS 우회)
    const admin = createClient(supabaseUrl, serviceRoleKey)

    const tables = ['notifications', 'outfits', 'items'] as const
    for (const table of tables) {
      const { error } = await admin.from(table).delete().eq('user_id', uid)
      if (error) {
        return json({ error: `Failed to delete ${table}: ${error.message}` }, 500)
      }
    }
    // profiles는 PK가 id (= auth user id)
    const { error: profileError } = await admin.from('profiles').delete().eq('id', uid)
    if (profileError) {
      return json({ error: `Failed to delete profile: ${profileError.message}` }, 500)
    }

    // 3) auth 사용자 삭제
    const { error: deleteError } = await admin.auth.admin.deleteUser(uid)
    if (deleteError) {
      return json({ error: `Failed to delete user: ${deleteError.message}` }, 500)
    }

    return json({ success: true }, 200)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500)
  }
})
