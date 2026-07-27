# Loop

모든 작업은 아래 순서로 수행한다.

## 1. Plan

- 목표와 핵심 사용자 경로를 확인한다.
- 수정 가능한 파일 범위와 위험 요소를 정한다.
- primary metric 하나, 방향, epsilon, 필수 gate, 중단 조건을 선언한다.

## 2. Freeze evaluator

- schema-v4 manifest에 명령·metric regex·방향·epsilon·repeat·timeout·CWD·환경·gate와 고정 fixture를 모두 기록한다.
- manifest·fixture·runner bundle hash와 runtime/environment identity를 baseline/candidate에서 동일하게 사용한다.
- evaluator가 없다면 known-fail과 known-pass를 구분하는지 먼저 검증하고 별도 iteration으로 고정한다.
- `evaluator.json`, `evaluator-v2.json`, `evaluator-v3.json`과 기존 log는 비재현 legacy 증거다. 새 pair에는 `evaluator-v4.json` 이상만 사용한다.

## 3. Baseline

- 코드를 수정하기 전에 evaluator를 실행한다.
- SHA, worktree/surface/runtime hash, metric, gate 결과를 `.autoresearch/*.jsonl` append-only log에 기록한다.
- metric이 없거나 파싱되지 않으면 baseline 성공으로 취급하지 않는다.

## 4. Candidate

- 한 iteration에서는 하나의 가설과 작은 file cluster만 수정한다.
- evaluator·fixture·metric parser는 candidate와 함께 바꾸지 않는다.

## 5. Compare

- baseline과 같은 evaluator hash·명령·repeat·metric 방향인지 확인한다.
- 모든 필수 gate와 metric delta를 계산한다.
- 브라우저나 실기기 검증이 없으면 source/build 검증을 시각 완료 증거로 확대 해석하지 않는다.

## 6. Adopt or reject

- 모든 gate를 통과하고 개선폭이 epsilon보다 클 때만 채택한다.
- 실패하거나 개선되지 않으면 해당 candidate 변경만 되돌리고 기각 이유는 log에 남긴다.
- 사용자 소유 변경이나 다른 채택 iteration은 되돌리지 않는다.

## 7. Repeat or stop

- 목표 달성, 명시한 iteration/time budget, 연속 기각 한도, 제품 결정 필요 중 하나에 도달하면 중단한다.
- 실제 사용자 행동 데이터 없이 합성 점수만 올랐다면 “리텐션 개선 완료”가 아니라 “리텐션 proxy 개선”으로 보고한다.

## 8. Report

- 변경 파일과 사용자 흐름 변화
- baseline → candidate metric과 delta
- 채택/기각한 가설 및 리뷰에서 수정한 문제
- 자동·런타임·수동 검증 결과와 미검증 범위
- 남은 제품/스키마/외부 시스템 문제
