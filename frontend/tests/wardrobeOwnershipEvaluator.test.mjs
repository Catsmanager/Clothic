import assert from 'node:assert/strict'
import test from 'node:test'
import { evaluateWardrobeOwnershipContract } from '../scripts/check-wardrobe-ownership-contract.mjs'

const emptySources = {
  migration: '',
  databaseTypes: '',
  itemStore: '',
  outfitEditor: '',
  createScreen: '',
  itemSelectScreen: '',
  items: '',
  itemVisuals: '',
  sleepingWardrobe: '',
  stats: '',
  challenge: '',
  home: '',
  calendar: '',
  outfits: '',
  outfitDetail: '',
}

test('wardrobe evaluator rejects a source set with no ownership contract', () => {
  const result = evaluateWardrobeOwnershipContract(emptySources)

  assert.equal(result.score, 0)
  assert.equal(result.target, 8)
})

test('wardrobe evaluator accepts a source set with the complete ownership contract', () => {
  const result = evaluateWardrobeOwnershipContract({
    ...emptySources,
    migration: 'catalog_item_id text',
    databaseTypes: 'catalog_item_id: string | null',
    itemStore: [
      'catalogItemId',
      'addCatalogItem',
      ".from('items')",
      '.insert(',
      'fetchItems',
      'buildOwnedCatalogItems',
      'buildResolvableCatalogItems',
      'buildAnalyticsCatalogItems',
    ].join('\n'),
    outfitEditor: 'buildOwnedCatalogItems',
    createScreen: "onBrowseCatalogPress mode: 'catalog'",
    itemSelectScreen: "ItemSourceTabs mode === 'catalog' addCatalogItem 내 옷장에 추가",
    items: 'assetId?: string',
    itemVisuals: 'item.assetId ?? item.id',
    sleepingWardrobe: 'buildAnalyticsCatalogItems(userItems)',
    stats: 'buildAnalyticsCatalogItems',
    challenge: 'buildAnalyticsCatalogItems',
    home: 'buildResolvableCatalogItems',
    calendar: 'buildResolvableCatalogItems',
    outfits: 'buildResolvableCatalogItems',
    outfitDetail: 'buildResolvableCatalogItems',
  })

  assert.equal(result.score, 8)
  assert.equal(result.target, 8)
})
