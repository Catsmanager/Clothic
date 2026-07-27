import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { buildChallengeData } from '../lib/challenges.ts'
import { buildMonthData } from '../lib/monthlyStats.ts'
import { getPrimaryStyledOutfits, indexPrimaryStyledOutfitsByDate } from '../lib/outfitRecords.ts'
import { buildWeekData } from '../lib/weeklyStats.ts'

const fixture = JSON.parse(
  readFileSync(new URL('../HARNESS/fixtures/habit-journey-v1.json', import.meta.url), 'utf8')
)
const [item] = fixture.items
const primaryRecords = fixture.records.filter((record) => record.userId === fixture.users.primary)
const today = new Date(2026, 6, 27, 12)

test('월간 리포트는 아이템 없는 일기 row를 코디로 세지 않는다', () => {
  const data = buildMonthData(primaryRecords, [item], 2026, 6)

  assert.ok(data)
  assert.equal(data.totalOutfits, 1)
  assert.equal(data.diffFromLastMonth, 0)
  assert.deepEqual(
    data.topItems.map((entry) => entry.id),
    ['top_001']
  )
})

test('주간 리포트의 기록일은 실제 착장 저장일만 포함한다', () => {
  const weekStart = new Date(2026, 6, 26)
  const data = buildWeekData(primaryRecords, [item], weekStart)

  assert.equal(data.totalOutfits, 1)
  assert.deepEqual(data.recordedDates, ['2026-07-26'])
})

test('오늘이 일기-only이면 어제의 실제 코디 스트릭만 유지한다', () => {
  const data = buildChallengeData(primaryRecords, [item], today)

  assert.equal(data.summary.streakDays, 1)
  assert.equal(data.summary.weekRecorded, 1)
  assert.equal(data.badges.find((badge) => badge.id === 'first-record')?.earnedAt, '26.06.27')
})

const duplicateDateRecords = [
  {
    ...primaryRecords[1],
    id: 'older-rainy',
    date: '2026-07-26',
    weather: 'rainy',
    createdAt: '2026-07-26T01:00:00.000Z',
  },
  {
    ...primaryRecords[1],
    id: 'newer-sunny',
    date: '2026-07-26',
    weather: 'sunny',
    createdAt: '2026-07-26T04:00:00.000Z',
  },
  {
    ...primaryRecords[1],
    id: 'newer-diary-only',
    date: '2026-07-26',
    itemIds: [],
    createdAt: '2026-07-26T05:00:00.000Z',
  },
]

test('날짜별 대표 코디는 입력 순서와 무관하게 가장 최근 실제 착장을 고른다', () => {
  const forward = indexPrimaryStyledOutfitsByDate(duplicateDateRecords)
  const reversed = indexPrimaryStyledOutfitsByDate([...duplicateDateRecords].reverse())

  assert.equal(forward.get('2026-07-26')?.id, 'newer-sunny')
  assert.equal(reversed.get('2026-07-26')?.id, 'newer-sunny')
  assert.deepEqual(
    getPrimaryStyledOutfits(duplicateDateRecords).map((outfit) => outfit.id),
    ['newer-sunny']
  )
})

test('같은 createdAt이면 id tie-break로 날짜별 대표 코디를 결정한다', () => {
  const sameTimestamp = duplicateDateRecords.slice(0, 2).map((record, index) => ({
    ...record,
    id: index === 0 ? 'tie-a' : 'tie-b',
    createdAt: '2026-07-26T04:00:00.000Z',
  }))

  assert.equal(indexPrimaryStyledOutfitsByDate(sameTimestamp).get('2026-07-26')?.id, 'tie-b')
})

test('월간·주간 리포트는 같은 날짜의 대표 코디만 한 번 집계한다', () => {
  const monthly = buildMonthData(duplicateDateRecords, [item], 2026, 6)
  const weekly = buildWeekData(duplicateDateRecords, [item], new Date(2026, 6, 26))

  assert.ok(monthly)
  assert.equal(monthly.totalOutfits, 1)
  assert.equal(monthly.topItems[0]?.count, 1)
  assert.equal(weekly.totalOutfits, 1)
  assert.equal(weekly.topItems[0]?.count, 1)
  assert.deepEqual(weekly.recordedDates, ['2026-07-26'])
})

test('같은 날의 오래된 비 코디는 최신 맑음 코디를 덮어 챌린지를 올리지 않는다', () => {
  const data = buildChallengeData(duplicateDateRecords, [item], today)

  assert.equal(data.challenges.find((challenge) => challenge.id === 'rainy-day')?.current, 0)
  assert.equal(data.challenges.find((challenge) => challenge.id === 'new-combo')?.current, 1)
})

test('최신 대표 코디가 제거되면 같은 날짜의 이전 실제 착장이 다시 대표가 된다', () => {
  const withoutNewest = duplicateDateRecords.filter((record) => record.id !== 'newer-sunny')

  assert.equal(indexPrimaryStyledOutfitsByDate(withoutNewest).get('2026-07-26')?.id, 'older-rainy')
})
