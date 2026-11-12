import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ITEM_CATALOG } from '../constants/itemCatalog.ts'

export function serverCatalog() {
  return ITEM_CATALOG.map(({ id, name, category, imagePath, color, styleTags }) => ({
    id,
    name,
    category,
    imagePath,
    color,
    styleTags,
  }))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const target = new URL('../../backend/src/main/resources/catalog-items.json', import.meta.url)
  if (process.argv[2] === '--write') {
    writeFileSync(target, `${JSON.stringify(serverCatalog(), null, 2)}\n`)
    process.stdout.write('Updated server catalog from the canonical app catalog\n')
  } else {
    const actual = JSON.parse(readFileSync(target, 'utf8'))
    if (JSON.stringify(actual) !== JSON.stringify(serverCatalog())) {
      throw new Error('Server catalog differs from the app; run this script with --write')
    }
    process.stdout.write('Server and app catalogs match\n')
  }
}
