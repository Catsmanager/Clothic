-- 테스트 전용: 백엔드 역할에 읽기 권한만 준다. RLS 정책은 그대로 적용된다.
grant usage on schema public to clothic_backend;
grant select on public.items to clothic_backend;
grant usage on schema public to clothic_rls_probe;
grant select on public.items to clothic_rls_probe;
grant select, update on public.profiles to clothic_backend;
