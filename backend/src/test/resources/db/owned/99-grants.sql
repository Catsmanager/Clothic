-- 테스트 전용(자체 스키마): 서버 역할의 기능별 권한. Supabase 스키마용 ../99-grants.sql과 같은 범위다.
grant usage on schema public to clothic_backend;
grant select, insert on public.items to clothic_backend;
grant select, update on public.profiles to clothic_backend;
grant select, insert on public.outfits to clothic_backend;
grant update (mood, memo) on public.outfits to clothic_backend;
-- S-02: 가입·로그인. 계정 생성 트리거가 profiles 행을 넣으므로 그 권한도 필요하다.
grant select, insert on public.users to clothic_backend;
grant insert on public.profiles to clothic_backend;
grant select, insert, update on public.refresh_tokens to clothic_backend;
