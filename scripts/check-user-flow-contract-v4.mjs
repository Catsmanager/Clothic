#!/usr/bin/env node

// Source-level guardrail only. The v4 evaluator's primary metric comes from
// executable core tests; these checks catch accidental wiring regressions.

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

const currentDateHook = read('hooks/useCurrentDateKey.ts')
const calendarHook = read('hooks/useCalendarMonth.ts')
const calendarLogic = read('lib/calendar.ts')
const coreDataLogic = read('lib/coreDataState.ts')
const coreDataState = read('components/CoreDataState.tsx')
const home = read('app/(tabs)/index.tsx')
const calendar = read('app/(tabs)/calendar.tsx')
const stats = read('app/(tabs)/stats.tsx')
const challenge = read('app/challenge.tsx')
const avatarCard = read('components/AvatarCard.tsx')
const outfitRecords = read('lib/outfitRecords.ts')
const monthlyStats = read('lib/monthlyStats.ts')
const weeklyStats = read('lib/weeklyStats.ts')
const challengeLogic = read('lib/challenges.ts')
const itemStore = read('stores/itemStore.ts')
const outfitStore = read('stores/outfitStore.ts')
const weatherHook = read('hooks/useWeather.ts')
const wardrobe = read('app/(tabs)/more.tsx')
const wardrobeHook = read('hooks/useSleepingWardrobe.ts')
const sleepingBanner = read('components/sleeping-wardrobe/SleepingBottomBanner.tsx')
const challengeBanner = read('components/challenge/ChallengeBottomBanner.tsx')
const notificationCenter = read('app/notifications.tsx')
const notificationSettings = read('app/settings/notifications.tsx')

const coreScreens = [home, calendar, stats, challenge]

const checks = [
  {
    name: 'live date and calendar selection follow foreground and date rollover',
    pass:
      hasAll(currentDateHook, ['AppState.addEventListener', 'setTimeout']) &&
      calendarHook.includes('syncCalendarViewToToday') &&
      hasAll(calendarLogic, [
        'didMonthChange',
        'current.selectedKey === previousTodayKey',
        'selectedKey: todayKey',
      ]),
  },
  {
    name: 'initial readiness is distinct from a refresh failure',
    pass:
      hasAll(coreDataLogic, [
        "'initial-error'",
        "'initial-loading'",
        "return 'ready'",
        'if (!ready && error)',
      ]) &&
      coreDataState.includes('getCoreDataPhase(ready, error)') &&
      coreScreens.every((source) =>
        hasAll(source, ['CoreDataState', 'ready={outfitLoaded && itemLoaded}', 'onRetry='])
      ) &&
      [itemStore, outfitStore].every((source) => hasAll(source, ['loaded: false', 'loaded: true'])),
  },
  {
    name: 'one deterministic styled representative is selected per date',
    pass:
      hasAll(outfitRecords, [
        'indexPrimaryStyledOutfitsByDate',
        'getPrimaryStyledOutfits',
        'isStyledOutfit',
        'candidate.createdAt.localeCompare(current.createdAt)',
        'candidate.id.localeCompare(current.id)',
      ]) &&
      [monthlyStats, weeklyStats, challengeLogic].every((source) =>
        source.includes('getPrimaryStyledOutfits(outfits)')
      ) &&
      [home, calendar].every((source) =>
        source.includes('indexPrimaryStyledOutfitsByDate(outfits)')
      ),
  },
  {
    name: 'home empty and recorded states have explicit truthful actions',
    pass:
      home.includes("router.push('/(tabs)/create')") &&
      home.includes('`/outfit/${todayOutfit.id}`') &&
      hasAll(avatarCard, [
        'onRecordPress',
        'onOutfitPress',
        "'오늘 코디 기록하기'",
        "'오늘 코디 상세 보기'",
      ]),
  },
  {
    name: 'item fetches are reset-safe latest-wins and expose loaded state',
    pass: hasAll(itemStore, [
      'storeGeneration += 1',
      'fetchSequence += 1',
      'const requestSequence = (fetchSequence += 1)',
      'generation !== storeGeneration || requestSequence !== fetchSequence',
      'loaded: true',
      'error: null',
    ]),
  },
  {
    name: 'weather refreshes on date and foreground without stale response wins',
    pass: hasAll(weatherHook, [
      "AppState.addEventListener('change'",
      "nextState === 'active'",
      'load(getTodayDateKey())',
      'void load(dateKey)',
      'requestSequence.current',
      'inFlightRequest.current?.dateKey === requestedDateKey',
      'lastSuccessfulDateKey.current',
      'isCurrentRequest()',
    ]),
  },
  {
    name: 'wardrobe and notification dead ends remain recoverable and honest',
    pass:
      hasAll(wardrobe, ['CoreDataState', 'onRetry={wardrobe.retry}', 'ready={wardrobe.ready}']) &&
      hasAll(wardrobeHook, ['ready: outfitLoaded && itemLoaded', 'retry']) &&
      notificationCenter.includes('다시 시도') &&
      notificationSettings.includes('현재 알림은 자동으로 발송되지 않아요'),
  },
  {
    name: 'repeat-record CTAs preserve wardrobe context and expose challenge action',
    pass:
      hasAll(sleepingBanner, ['selectedItemId: suggestedItem.id', 'selectionToken']) &&
      hasAll(challengeBanner, ["router.push('/(tabs)/create')", '코디 기록하기']),
  },
]

let passed = 0
for (const check of checks) {
  if (check.pass) passed += 1
  process.stdout.write(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}\n`)
}

process.stdout.write(`SOURCE_CONTRACT_SCORE=${passed}\n`)
process.stdout.write(`SOURCE_CONTRACT_TARGET=${checks.length}\n`)
if (passed !== checks.length) process.exitCode = 1
