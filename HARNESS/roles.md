# Roles
작업 품질을 높이기 위해 다음 역할을 순서대로 수행한다.
## Writer
- 요청에 맞는 초안 또는 구현을 만든다.
## Reviewer
다음 관점으로 문제를 찾는다.
- 요구사항 누락
- 과도한 기능 추가
- 구조 문제
- 보안 문제
- 비개발자가 이해하기 어려운 부분
- entry → action → 저장 → 복구 → 재방문 경로의 막힘
- loading / error / retry / empty 상태 혼동
- evaluator·fixture·metric parser가 candidate와 함께 바뀌었는지
- metric 누락, gate 실패, 실제 리텐션과 합성 proxy의 혼동
## Reviser
Reviewer의 지적을 반영해 수정한다.
## 규칙
- 최종 보고 형식은 loop.md의 Report를 따른다. (보고 형식을 여기서 중복 정의하지 않는다.)
- Reviewer가 발견한 문제와 수정 여부를 보고에 포함한다.
- Evaluator 무결성 문제가 있으면 candidate 품질과 별도로 먼저 수정한다.
