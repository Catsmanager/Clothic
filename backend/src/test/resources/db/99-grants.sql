-- 테스트 전용: 백엔드 역할의 기능별 조회·추가 권한. RLS 정책은 그대로 적용된다.
grant usage on schema public to clothic_backend;
grant select on public.items to clothic_backend;
grant insert on public.items to clothic_backend;
grant usage on schema public to clothic_rls_probe;
grant select on public.items to clothic_rls_probe;
grant select, update on public.profiles to clothic_backend;
grant select on public.outfits to clothic_backend;
grant insert on public.outfits to clothic_backend;
grant update (mood, memo) on public.outfits to clothic_backend;
