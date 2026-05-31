# Clothic

패션 습관 분석 기반 모바일 코디 다이어리 앱

사용자는 픽셀 아바타를 활용해 코디를 만들고,
날짜별로 기록하며,
월간 통계를 통해 자신의 패션 습관을 분석할 수 있다.

# 기술스택
- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- Supabase (Auth + DB)
- expo-secure-store
- expo-web-browser

## 기본 원칙
CRITICAL: docs/PRD.md의 MVP 범위를 벗어난 기능은 만들지 않는다.
CRITICAL: 구조 변경 전에는 먼저 제안하고 승인받는다.
CRITICAL: API 키는 절대 코드에 하드코딩하지 않는다.
CRITICAL: 환경변수는 .env.local을 사용한다.
CRITICAL: 작업 후 변경 파일 목록을 보고한다.
CRITICAL: 작업 후 검증 결과를 보고한다.
CRITICAL: TODO.md의 다음 미완료 항목 하나만 처리한다.
CRITICAL: 작업 완료 후 LOG.md를 업데이트한다.

## 작업 방식
1. 작업 전 관련 문서를 읽는다.
2. 사용할 문서와 제외할 문서를 선언한다.
3. 계획을 먼저 제시한다.
4. 작은 단위로 수정한다.
5. 수정 후 자체 검토한다.
6. TODO.md와 LOG.md를 업데이트한다.

# 절대규칙
- TypeScript strict mode 사용
- any 사용 금지
- type import 사용
- 함수형 컴포넌트만 사용
- Zustand 사용
- Supabase 사용 (AsyncStorage 사용 금지)
- Context API 사용 금지
- MVP 범위 밖 기능 구현 금지


# 금지사항
- 요청하지 않은 기능 추가 금지
- 전체 구조 임의 변경 금지
- 불필요한 리팩토링 금지
- 테스트 없이 완료 선언 금지
- 모르는 내용을 아는 척하지 말 것
- 결제 기능 구현 금지
