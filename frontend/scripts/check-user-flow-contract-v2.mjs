#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const baseResult = spawnSync(
  process.execPath,
  [path.join(root, 'scripts/check-user-flow-contract.mjs')],
  {
    cwd: root,
    encoding: 'utf8',
  }
)
const baseScoreMatch = /FLOW_SCORE=(\d+)/.exec(baseResult.stdout)
const baseTargetMatch = /FLOW_TARGET=(\d+)/.exec(baseResult.stdout)

if (!baseScoreMatch || !baseTargetMatch) {
  process.stderr.write(baseResult.stderr)
  process.stderr.write('The v1 flow evaluator did not emit a score.\n')
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

const wardrobe = read('app/(tabs)/more.tsx')
const wardrobeHook = read('hooks/useSleepingWardrobe.ts')
const notificationCenter = read('app/notifications.tsx')
const notificationSettings = read('app/settings/notifications.tsx')

const checks = [
  {
    name: 'wardrobe distinguishes loading, error, retry and empty data',
    pass:
      wardrobe.includes('CoreDataState') &&
      ['outfitLoading', 'itemLoading', 'error', 'retry'].every((fragment) =>
        wardrobeHook.includes(fragment)
      ),
  },
  {
    name: 'notification UI offers recovery without promising an unavailable reminder',
    pass:
      notificationCenter.includes('다시 시도') &&
      notificationSettings.includes('현재 알림은 자동으로 발송되지 않아요') &&
      notificationSettings.includes('disabled'),
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
