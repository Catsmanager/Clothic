import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { serverCatalog } from '../scripts/export-server-catalog.mjs'

test('서버의 등록용 카탈로그는 앱의 실제 기본 아이템 메타데이터와 일치한다', () => {
  const actual = JSON.parse(
    readFileSync(
      new URL('../../backend/src/main/resources/catalog-items.json', import.meta.url),
      'utf8'
    )
  )
  assert.deepEqual(actual, serverCatalog())
})
