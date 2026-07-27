#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function hasAll(source, fragments) {
  return fragments.every((fragment) => source.includes(fragment))
}

const home = read('app/(tabs)/index.tsx')
const avatarCard = read('components/AvatarCard.tsx')
const dateBar = read('components/DateWeatherBar.tsx')
const calendarHook = read('hooks/useCalendarMonth.ts')
const stats = read('app/(tabs)/stats.tsx')
const challenge = read('app/challenge.tsx')
const monthlyStats = read('lib/monthlyStats.ts')
const weeklyStats = read('lib/weeklyStats.ts')
const challengeLogic = read('lib/challenges.ts')
const coreDataStatePath = path.join(root, 'components/CoreDataState.tsx')
const currentDateHookPath = path.join(root, 'hooks/useCurrentDateKey.ts')

const checks = [
  {
    name: 'live date hook handles midnight and foreground resume',
    pass:
      fs.existsSync(currentDateHookPath) &&
      hasAll(read('hooks/useCurrentDateKey.ts'), ['AppState.addEventListener', 'setTimeout']),
  },
  {
    name: 'home uses the live date and routes empty state to create',
    pass: hasAll(home, ['useCurrentDateKey()', 'onRecordPress', "router.push('/(tabs)/create')"]),
  },
  {
    name: 'recorded home avatar opens outfit detail',
    pass:
      home.includes('onOutfitPress') &&
      home.includes('`/outfit/${todayOutfit.id}`') &&
      hasAll(avatarCard, ['onOutfitPress', '오늘 코디 상세 보기']),
  },
  {
    name: 'home and date bar cannot create or display a stale diary-only today',
    pass:
      !home.includes('itemIds: []') &&
      dateBar.includes('useCurrentDateKey()') &&
      avatarCard.includes('오늘 코디 기록하기'),
  },
  {
    name: 'calendar follows the live day and resets selection when month changes',
    pass: hasAll(calendarHook, ['useCurrentDateKey()', 'selectKeyForMonth']),
  },
  {
    name: 'stats and challenge receive the live current date',
    pass:
      hasAll(stats, ['useCurrentDateKey()', 'currentDate']) &&
      hasAll(challenge, ['useCurrentDateKey()', 'currentDate']),
  },
  {
    name: 'style analytics and challenges exclude item-less diary rows',
    pass: [monthlyStats, weeklyStats, challengeLogic].every((source) =>
      source.includes('isStyledOutfit')
    ),
  },
  {
    name: 'core retention screens distinguish loading and fetch errors',
    pass:
      fs.existsSync(coreDataStatePath) &&
      [
        'app/(tabs)/index.tsx',
        'app/(tabs)/calendar.tsx',
        'app/(tabs)/stats.tsx',
        'app/challenge.tsx',
      ]
        .map(read)
        .every((source) => source.includes('CoreDataState')),
  },
]

let passed = 0
for (const check of checks) {
  if (check.pass) passed += 1
  process.stdout.write(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}\n`)
}

process.stdout.write(`FLOW_SCORE=${passed}\n`)
process.stdout.write(`FLOW_TARGET=${checks.length}\n`)

if (passed !== checks.length) process.exitCode = 1
