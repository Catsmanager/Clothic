# Clothic 작업 지침

작업 요청을 받으면 먼저 루트 [plan.md](plan.md)를 읽고 대상 기능·선행 조건·완료 기준·현재 체크 상태를 확인한다. 실행 상태의 기준은 이 파일이다.

그다음 [.codex/skills/clothic-task-workflow/SKILL.md](.codex/skills/clothic-task-workflow/SKILL.md)를 읽고 따른다. 최소 기능 단위의 GitHub 원격 작업 브랜치가 생성되었는지 확인한 뒤 파일 변경을 시작한다. 기능 구현과 검증이 끝나면 같은 작업에서 plan.md의 해당 항목만 체크하고 근거를 남긴다. PR을 만든 뒤 CI 통과와 충돌 없음을 확인하면 main에 병합한다.

질문·설명·읽기 전용 검토에는 이 절차로 브랜치나 이슈를 만들지 않는다. 같은 작업의 후속 수정은 확인한 기존 브랜치를 이어 쓴다.

작업 지침·스킬을 만들거나 바꿀 때는 이 파일과 `.codex/skills/`, 그리고 [CLAUDE.md](CLAUDE.md)에 같은 내용을 함께 반영한다.

문서 탐색은 [docs/README.md](docs/README.md), 기존 프로젝트 범위와 검증 규칙은 [CLAUDE.md](CLAUDE.md)를 따른다.

앱 작업은 `frontend/`, 서버 작업은 `backend/`에서 실행한다. 앱 검증은 루트에서 `npm --prefix frontend run check`, 서버 검증은 `cd backend && ./mvnw --batch-mode verify`다. 공통 문서·스킬·Supabase 이력은 루트에 둔다.
