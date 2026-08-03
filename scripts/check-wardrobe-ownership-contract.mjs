#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function hasAll(source, fragments) {
  return fragments.every((fragment) => source.includes(fragment))
}

export function evaluateWardrobeOwnershipContract(sources) {
  const checks = [
    {
      name: 'items schema persists the selected catalog template',
      pass:
        sources.migration.includes('catalog_item_id text') &&
        sources.databaseTypes.includes('catalog_item_id: string | null'),
    },
    {
      name: 'item store maps ownership and exposes a recoverable add action',
      pass: hasAll(sources.itemStore, [
        'catalogItemId',
        'addCatalogItem',
        ".from('items')",
        '.insert(',
        'fetchItems',
      ]),
    },
    {
      name: 'owned, resolvable, and analytics catalogs have separate helpers',
      pass: hasAll(sources.itemStore, [
        'buildOwnedCatalogItems',
        'buildResolvableCatalogItems',
        'buildAnalyticsCatalogItems',
      ]),
    },
    {
      name: 'the outfit editor uses owned items and offers a catalog recovery action',
      pass:
        sources.outfitEditor.includes('buildOwnedCatalogItems') &&
        hasAll(sources.createScreen, ['onBrowseCatalogPress', "mode: 'catalog'"]),
    },
    {
      name: 'the item selection screen separates closet and catalog modes',
      pass: hasAll(sources.itemSelectScreen, [
        'ItemSourceTabs',
        "mode === 'catalog'",
        'addCatalogItem',
        '내 옷장에 추가',
      ]),
    },
    {
      name: 'user-owned items reuse the selected static avatar asset',
      pass:
        sources.items.includes('assetId?: string') &&
        sources.itemVisuals.includes('item.assetId ?? item.id'),
    },
    {
      name: 'sleeping wardrobe only evaluates confirmed owned items',
      pass: sources.sleepingWardrobe.includes('buildAnalyticsCatalogItems(userItems)'),
    },
    {
      name: 'analytics use owned aliases while history screens keep legacy resolution',
      pass:
        [sources.stats, sources.challenge].every((source) =>
          source.includes('buildAnalyticsCatalogItems')
        ) &&
        [sources.home, sources.calendar, sources.outfits, sources.outfitDetail].every((source) =>
          source.includes('buildResolvableCatalogItems')
        ),
    },
  ]

  return {
    checks,
    score: checks.filter((check) => check.pass).length,
    target: checks.length,
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function readRepositorySources() {
  const latestMigration = fs
    .readdirSync(path.join(root, 'supabase/migrations'))
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => read(`supabase/migrations/${name}`))
    .join('\n')

  return {
    migration: latestMigration,
    databaseTypes: read('lib/database.types.ts'),
    itemStore: read('stores/itemStore.ts'),
    outfitEditor: read('hooks/useOutfitEditor.ts'),
    createScreen: read('app/(tabs)/create.tsx'),
    itemSelectScreen: read('app/item-select.tsx'),
    items: read('constants/items.ts'),
    itemVisuals: read('lib/itemVisuals.ts'),
    sleepingWardrobe: read('hooks/useSleepingWardrobe.ts'),
    stats: read('app/(tabs)/stats.tsx'),
    challenge: read('app/challenge.tsx'),
    home: read('app/(tabs)/index.tsx'),
    calendar: read('app/(tabs)/calendar.tsx'),
    outfits: read('app/outfits.tsx'),
    outfitDetail: read('app/outfit/[id].tsx'),
  }
}

function run() {
  const result = evaluateWardrobeOwnershipContract(readRepositorySources())

  result.checks.forEach((check) => {
    process.stdout.write(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}\n`)
  })
  process.stdout.write(`WARDROBE_OWNERSHIP_SCORE=${result.score}\n`)
  process.stdout.write(`WARDROBE_OWNERSHIP_TARGET=${result.target}\n`)
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  run()
}
