#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const baseResult = spawnSync(
  process.execPath,
  [path.join(root, 'scripts/check-user-flow-contract-v2.mjs')],
  { cwd: root, encoding: 'utf8' }
)
const baseScoreMatch = /FLOW_SCORE=(\d+)/.exec(baseResult.stdout)
const baseTargetMatch = /FLOW_TARGET=(\d+)/.exec(baseResult.stdout)

if (!baseScoreMatch || !baseTargetMatch) {
  process.stderr.write(baseResult.stderr)
  process.stderr.write('The v2 flow evaluator did not emit a score.\n')
  process.exit(2)
}

process.stdout.write(
  baseResult.stdout
    .split('\n')
    .filter((line) => !line.startsWith('FLOW_SCORE=') && !line.startsWith('FLOW_TARGET='))
    .join('\n')
)

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

const wardrobeScreen = read('app/(tabs)/more.tsx')
const sleepingBanner = read('components/sleeping-wardrobe/SleepingBottomBanner.tsx')
const challengeBanner = read('components/challenge/ChallengeBottomBanner.tsx')

const checks = [
  {
    name: 'sleeping wardrobe starts a draft with the suggested dormant item equipped',
    pass:
      wardrobeScreen.includes('suggestedItem={wardrobe.items[0]') &&
      sleepingBanner.includes('selectedItemId') &&
      sleepingBanner.includes('selectionToken'),
  },
  {
    name: 'challenge guidance has an explicit create-outfit action',
    pass:
      challengeBanner.includes("router.push('/(tabs)/create')") &&
      challengeBanner.includes('코디 기록하기'),
  },
]

let passed = Number(baseScoreMatch[1])
for (const check of checks) {
  if (check.pass) passed += 1
  process.stdout.write(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}\n`)
}

const target = Number(baseTargetMatch[1]) + checks.length
process.stdout.write(`FLOW_SCORE=${passed}\n`)
process.stdout.write(`FLOW_TARGET=${target}\n`)
if (passed !== target) process.exitCode = 1
