# Test Plan

## 자동 검증

```bash
npm run check
npm run verify:environment # Expo/의존성 변경 시 별도
npx expo export --platform web --output-dir <unique-/private/tmp/path> --clear
```

`npm run check`는 typecheck, lint, format, avatar, `test:core`, versioned
`flow:check`, harness 회귀 테스트를 한 번에 실행한다. 새 측정은
`HARNESS/evaluator-v4.json`과 `.autoresearch/experiments.jsonl`의 동일 frozen identity
baseline/candidate pair로만 채택 여부를 확인한다. v1-v3 기록은 비재현 legacy다.
이 점수는 합성 리텐션 proxy이며 실제 D1/D7 행동 데이터가 아니다. 네트워크가 필요한
Expo 환경 검사와 실제 Supabase 검증은 결정론적 gate와 분리해 결과를 기록한다.

## 인증과 계정 격리

- 이메일 회원가입·로그인·로그아웃
- 카카오 로그인(KOE205 콘솔 설정 완료 후)
- 미인증 보호 화면 → 로그인 리다이렉트
- 앱 재실행·재설치 후 로그인 → 사용자 데이터 복원
- 사용자 A 데이터 조회 → 로그아웃 → 사용자 B 로그인
  - A의 코디, 아이템, 알림, 알림 설정이 한 프레임도 B 화면에 노출되지 않음
  - A가 시작한 느린 조회가 완료되어도 B store를 덮지 않음
  - 계정 전환 중 시작한 코디 저장은 중단되고 다시 시도 안내
- 만료 세션과 네트워크 오류에서 다른 계정의 cached data 비노출
- 다른 사용자의 코디·아이템·알림 접근 불가(RLS 교차 계정 검증)
- 계정 삭제 중 오류가 발생해도 계정만 남고 데이터가 일부 삭제되는 상태가 생기지 않음

## 코디 생성

- compact picker 선택·해제 → 아바타와 selected 상태 동기화
- 전체 보기 진입 → 하위 분류 변경 → 아이템 선택
  - 기존 편집 초안 유지
  - 선택한 아이템 한 번만 반영
  - 선택 카테고리로 복귀
- 원피스와 상·하의 상호 배타 규칙
- 액세서리 복수 선택
- 실행 취소·전체 해제·랜덤
- 저장 버튼 빈 코디 비활성화
- 저장 성공 후 홈·캘린더·통계 반영
- 저장 실패 시 입력과 편집 초안 보존

## 코디 조회와 복구

- 목록 → 상세 진입
- 상세 URL/딥링크 직접 진입
- Web 상세 새로고침
- 느린 응답에서 로딩 표시
- 네트워크 오류에서 오류 문구·다시 시도
- 삭제/권한 없음에서 not-found 문구
- 상세 즐겨찾기·삭제
- 상세 아이템 색상 swatch가 `itemColors` override를 우선 표시
- 320pt 폭과 200% 글자 크기에서 상세 화면 스크롤 가능

## 핵심 탭과 데이터 정확성

- 홈, 캘린더, 월간·주간 통계, 잠자는 옷장, 챌린지
- 각 화면의 loading / error / retry / empty 상태 구분
- 같은 날짜 복수 row와 item 없는 mood/memo row 처리
  - 현재 임시 정책: item이 있는 row 중 최신 `createdAt` 1건만 홈·캘린더·통계·챌린지 대표값
  - 기존 복수 row는 코디 목록/상세에서 유지되고, 최신 row 삭제 시 이전 row가 대표로 복귀
  - 최종 하루 한 코디/복수 코디 제품 결정과 일치
  - 실제 아이템 없는 row가 코디 수·챌린지를 부풀리지 않음
- 자정을 넘겨 앱을 유지했을 때 오늘 날짜 갱신
- 백그라운드에서 날짜가 바뀐 뒤 foreground 복귀 시 홈·캘린더·통계·챌린지 날짜 갱신
- 잠자는 옷장 추천 CTA → 추천 아이템이 착용된 편집 초안
- 실제 producer가 없는 알림 설정은 자동 발송을 약속하지 않음
- 현재 계절과 미착용 일수 경계값

## 아바타와 에셋

- `avatar:add --dry-run`이 파일을 변경하지 않음
- unknown/duplicate/positional 옵션과 `--dry-run=true/false` 오용 거부
- 신규 ID가 같은 카테고리 `--preview-from` 없이 등록되지 않고 preview를 안전하게 복사
- 신규 등록이 catalog ↔ asset map ↔ disk를 동기화
- 기존 ID는 `--replace` 없이는 거부
- 등록 후 checker 실패 시 파일과 metadata rollback
- `avatar:check`가 다음을 거부
  - 중복 ID, 누락/고아 PNG, category/path 불일치
  - 1024×1536이 아닌 canvas
  - CRC/IDAT/IEND가 손상되었거나 8-bit RGBA가 아닌 PNG
  - 실제 투명 픽셀 또는 가시 픽셀이 없는 PNG
  - 불투명에 가까운 full-canvas 배경, 비투명 corner/border, 지나치게 적은 가시 픽셀,
    본체에서 멀리 떨어진 작은 component
- 기존 품질 예외는 파일 SHA가 일치하는 baseline만 warning으로 허용하고 변경 파일은 실패
- compact/full picker, 편집기, 캘린더, 목록/상세, 옷장, 통계에서 이미지 확인
- ImageGen 후보는 base overlay에서 정렬·halo·stray pixel을 사람 눈으로 승인

## 접근성·기기

- 카테고리, 하위 분류, 아이템, 아이콘 버튼의 이름·role·selected/disabled 상태
- 터치 타깃 최소 44pt
- 스크린리더에서 장식용 아바타 레이어 개별 낭독 안 함
- modal 초점 격리·닫기·escape
- 320pt 폭, 200% 글자, reduced motion, 위치 권한 거부
- 작은 본문·보조 텍스트·버튼 색 대비 WCAG AA

## 금지되는 결과

- 빈 화면, 무한 로딩, 앱 크래시
- 교차 계정 데이터 노출, 부분 데이터 유실
- 오류를 정상 empty state로 표시
- 깨진 이미지, 레이어 오정렬
- 콘솔·TypeScript·lint 오류

## MVP 완료 기준

- 코디 생성·저장·조회·상세 복구 가능
- 캘린더·통계·잠자는 옷장·챌린지의 데이터 규칙 일치
- 로그아웃·계정 전환 시 사용자 데이터 격리
- 앱 재실행 후 데이터 유지
- 자동 검증과 필수 수동 매트릭스 결과 기록
