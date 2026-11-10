# Clothic 문서 안내

제품·설계·운영 문서를 주제별로 나눠 관리한다. 처음 읽을 때는 앱 개요와 제품 범위를 보고, 진행할 작업의 문서로 이동한다.

## 먼저 읽을 문서

1. [앱 개요](product/OVERVIEW.md): 서비스와 주요 사용자 흐름
2. [제품 요구사항](product/PRD.md): 최소 기능 제품(Minimum Viable Product, MVP)의 범위
3. [현재 아키텍처](architecture/ARCHITECTURE.md)와 [데이터 모델](architecture/DATA_MODEL.md): 기존 구현 구조
4. [Spring Boot 전환 계획](migration/SPRING_BOOT_MIGRATION_PLAN.md): 현재 진행할 학습·구현 순서

## 폴더별 문서

| 폴더 | 문서 | 내용 |
| --- | --- | --- |
| `product/` | [OVERVIEW.md](product/OVERVIEW.md) | 앱 개요·화면·사용자 흐름 |
| | [PRD.md](product/PRD.md) | 제품 요구사항과 기능 범위 |
| | [PRIVACY_POLICY.md](product/PRIVACY_POLICY.md) | 개인정보 처리방침 원문 |
| `architecture/` | [ARCHITECTURE.md](architecture/ARCHITECTURE.md) | 현재 기술 구성과 데이터 흐름 |
| | [DATA_MODEL.md](architecture/DATA_MODEL.md) | 타입·테이블·계산 규칙 |
| | [ADR.md](architecture/ADR.md) | 기술 결정과 선택 이유 |
| `design/` | [DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md) | 색상·타이포그래피·컴포넌트 기준 |
| | [UI_GUIDE.md](design/UI_GUIDE.md) | 화면 디자인 방향 |
| `avatar/` | [ASSET_PLAN.md](avatar/ASSET_PLAN.md) | 에셋 아트 방향·파일 규칙 |
| | [ITEM_ASSET_FLOW.md](avatar/ITEM_ASSET_FLOW.md) | 아이템 등록·미리보기 흐름 |
| | [AVATAR_ASSET_PIPELINE.md](avatar/AVATAR_ASSET_PIPELINE.md) | 아바타 에셋 생성·등록·검증 |
| | [AVATAR_ASSET_SCALE_ROADMAP.md](avatar/AVATAR_ASSET_SCALE_ROADMAP.md) | 에셋 규모 확장 계획 |
| | [IMAGE_OPTIMIZATION.md](avatar/IMAGE_OPTIMIZATION.md) | 이미지 용량 최적화 안내 |
| `auth/` | [APPLE_SIGNIN.md](auth/APPLE_SIGNIN.md) | Apple 로그인 설정 |
| | [KAKAO_OAUTH.md](auth/KAKAO_OAUTH.md) | Kakao 로그인 설정 |
| | [AUTH_DEEPLINK_TROUBLESHOOTING.md](auth/AUTH_DEEPLINK_TROUBLESHOOTING.md) | 인증 딥링크 진단 기록과 절차 |
| `operations/` | [CICD.md](operations/CICD.md) | GitHub 협업·버전·자동 검사·빌드·제출 흐름 |
| | [APP_STORE_SUBMISSION_CHECKLIST.md](operations/APP_STORE_SUBMISSION_CHECKLIST.md) | 스토어 제출 확인 항목 |
| | [TEST_PLAN.md](operations/TEST_PLAN.md) | 자동·수동 검증 항목 |
| | [SUPABASE_TODO.md](operations/SUPABASE_TODO.md) | Supabase 환경 설정·점검 항목 |
| `migration/` | [SPRING_BOOT_MIGRATION_PLAN.md](migration/SPRING_BOOT_MIGRATION_PLAN.md) | Spring Boot 전환 학습·작업 계획 |

## 새 문서를 추가할 때

- `docs/` 바로 아래에는 이 안내만 둔다. 새 문서는 가장 가까운 주제 폴더에 추가하고 위 목록에도 연결한다.
- 기존 문서에서 다루는 내용이면 해당 문서를 보완한다. 작업할 때마다 같은 목적의 새 계획서를 만들지 않는다.
- 폴더를 늘릴 때는 기존 분류로 설명할 수 없는 주제인지 먼저 확인한다. 현재는 한 단계의 폴더 구조를 유지한다.
- 학습·이관 계획은 `migration/`, 실제 구현 구조와 확정된 기술 결정은 `architecture/`에 둔다. 계획을 구현 완료 설명으로 바꾸지 않는다.
- 작업별 진행 상황은 루트 [TODO.md](../TODO.md), 날짜가 있는 이력은 [LOG.md](../LOG.md), 에이전트 작업 절차는 [HARNESS](../HARNESS/)에서 관리한다.
- 링크는 문서 파일 위치 기준의 상대 경로를 사용한다. 파일을 옮길 때는 링크와 프로젝트 지침·스킬·소스 주석의 참조도 함께 수정한다.

## 이전 경로와 문서 상태

2026-11-10에 기존 문서 21개를 `docs/` 루트에서 위 하위 폴더로 이동했다. 파일명은 유지했으므로 과거 `LOG.md`의 `docs/파일명.md`는 위 목록에서 같은 파일명을 찾아 이동할 수 있다. 날짜가 있는 로그의 당시 경로는 이력으로 보존한다.

이번 정리는 파일 배치와 참조 경로를 바꾼 작업이다. 기존 문서의 체크 상태·출시 상태·운영 설정이 현재 환경에서도 유효한지는 별도 확인이 필요하다. 특히 개인정보 처리방침의 공개 주소·실제 열람 가능 여부는 원문 파일 존재와 구분한다.
