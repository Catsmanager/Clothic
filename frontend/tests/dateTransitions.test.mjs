import assert from 'node:assert/strict'
import test from 'node:test'
import { syncCalendarViewToToday } from '../lib/calendar.ts'

test('월말에 현재 달을 자동 이동하면 선택일도 새 달의 오늘로 옮긴다', () => {
  const next = syncCalendarViewToToday(
    { year: 2026, month: 6, selectedKey: '2026-07-15' },
    '2026-07-31',
    '2026-08-01'
  )

  assert.deepEqual(next, {
    year: 2026,
    month: 7,
    selectedKey: '2026-08-01',
  })
})

test('같은 달의 날짜 전환은 사용자가 고른 다른 날짜를 유지한다', () => {
  const next = syncCalendarViewToToday(
    { year: 2026, month: 6, selectedKey: '2026-07-15' },
    '2026-07-27',
    '2026-07-28'
  )

  assert.deepEqual(next, {
    year: 2026,
    month: 6,
    selectedKey: '2026-07-15',
  })
})

test('과거 달을 보고 있으면 자정 이후에도 표시 달을 유지한다', () => {
  const current = { year: 2026, month: 5, selectedKey: '2026-06-10' }
  const next = syncCalendarViewToToday(current, '2026-07-31', '2026-08-01')

  assert.equal(next, current)
})

test('오늘을 선택한 상태에서는 같은 달의 다음 날로 선택일을 갱신한다', () => {
  const next = syncCalendarViewToToday(
    { year: 2026, month: 6, selectedKey: '2026-07-27' },
    '2026-07-27',
    '2026-07-28'
  )

  assert.deepEqual(next, {
    year: 2026,
    month: 6,
    selectedKey: '2026-07-28',
  })
})
