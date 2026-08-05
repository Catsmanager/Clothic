import assert from 'node:assert/strict'
import test from 'node:test'
import { ITEMS } from '../constants/items.ts'
import {
  buildAnalyticsCatalogItems,
  buildOwnedCatalogItems,
  buildResolvableCatalogItems,
} from '../lib/wardrobeCatalog.ts'
import { buildSleepingItems } from '../lib/sleepingWardrobe.ts'

const template = ITEMS.find((item) => item.id === 'top_001')
assert.ok(template)

const ownedItem = {
  id: '00000000-0000-0000-0000-000000000001',
  userId: 'user-a',
  catalogItemId: template.id,
  name: template.name,
  category: template.category,
  imagePath: template.imagePath,
  color: template.color,
  styleTags: template.styleTags,
  createdAt: '2026-08-03T00:00:00.000Z',
}

test('내 옷장 카탈로그는 사용자가 확인한 아이템만 포함한다', () => {
  const items = buildOwnedCatalogItems([ownedItem])

  assert.equal(items.length, 1)
  assert.equal(items[0]?.id, ownedItem.id)
  assert.equal(items[0]?.assetId, template.id)
  assert.equal(items[0]?.subCategory, template.subCategory)
  assert.deepEqual(items[0]?.seasons, template.seasons)
})

test('기록 조회 카탈로그는 과거 정적 ID와 신규 사용자 UUID를 모두 해석한다', () => {
  const items = buildResolvableCatalogItems([ownedItem])

  assert.ok(items.some((item) => item.id === template.id))
  assert.ok(items.some((item) => item.id === ownedItem.id))
})

test('분석 카탈로그는 미소유 기본 옷을 제외하고 확인된 옷의 과거 ID만 연결한다', () => {
  const items = buildAnalyticsCatalogItems([ownedItem])

  assert.deepEqual(new Set(items.map((item) => item.id)), new Set([ownedItem.id, template.id]))
  assert.equal(
    items.some((item) => item.id === 'top_002'),
    false
  )
})

test('미소유 기본 옷의 과거 착용은 잠자는 옷장에 포함하지 않는다', () => {
  const outfits = [
    {
      id: 'outfit-1',
      userId: 'user-a',
      date: '2026-06-01',
      mood: null,
      weather: null,
      memo: null,
      itemIds: [template.id],
      itemColors: {},
      isFavorite: false,
      createdAt: '2026-06-01T00:00:00.000Z',
    },
  ]
  const today = new Date(2026, 7, 3, 12)

  assert.deepEqual(buildSleepingItems(outfits, buildAnalyticsCatalogItems([]), today), [])
  assert.equal(
    buildSleepingItems(outfits, buildAnalyticsCatalogItems([ownedItem]), today).length,
    1
  )
})
