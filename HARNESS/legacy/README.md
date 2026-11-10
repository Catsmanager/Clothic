# Legacy evaluator manifests

이 폴더의 manifest는 과거 측정 기록을 보존하기 위한 것이다. 새 baseline/candidate 쌍에는 사용하지 않는다.

| 파일 | 상태 | 비고 |
| --- | --- | --- |
| `evaluator.json`, `evaluator-v2.json`, `evaluator-v3.json` | 비재현 legacy | CLI 설정 허용, gate·runtime·surface hash 미기록 |
| `evaluator-v4.json`, `evaluator-v5.json` | 과거 루트 앱 구조 기준 고정 기록 | 앱이 저장소 루트에 있던 시기의 경로를 가리킨다 |

- 현역 manifest는 `HARNESS/evaluator-v6-habit.json`, `HARNESS/evaluator-v6-ownership.json`이다.
- v1~v3가 호출하던 user-flow 스크립트는 `frontend/scripts/legacy/`에 있다. 현역 검사 스크립트는 `frontend/scripts/check-user-flow-contract-v4.mjs`다.
- `.autoresearch/experiments.jsonl`의 과거 항목이 가리키는 `HARNESS/evaluator*.json` 경로는 당시 위치다. 파일 내용과 기록된 bundle hash는 바꾸지 않았다.
