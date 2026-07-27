import assert from 'node:assert/strict'
import test from 'node:test'
import { getCoreDataPhase } from '../lib/coreDataState.ts'

test('필수 데이터 중 하나라도 최초 조회 전이면 빈 기록 대신 로딩을 표시한다', () => {
  assert.equal(getCoreDataPhase(false, null), 'initial-loading')
})

test('필수 데이터 최초 조회가 실패하면 다른 소스 데이터가 있어도 오류를 표시한다', () => {
  assert.equal(getCoreDataPhase(false, 'outfits fetch failed'), 'initial-error')
})

test('최초 조회를 마친 뒤 재조회 오류는 기존 화면을 유지할 수 있다', () => {
  assert.equal(getCoreDataPhase(true, 'refresh failed'), 'ready')
})
