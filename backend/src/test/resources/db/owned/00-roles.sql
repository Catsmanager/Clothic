-- 테스트 전용(자체 스키마): 서버 접속 역할. RLS가 없으므로 bypassrls도 필요 없다.
create role clothic_backend login password 'clothic_backend_test';
