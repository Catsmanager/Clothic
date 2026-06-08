import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, copyFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const BASE_ASSET = path.join(ROOT, 'assets/avatar/base/base_female_01.png')
const CATEGORIES = ['top', 'bottom', 'shoes', 'bag', 'accessory']
const STYLE_TAGS = [
  'casual',
  'formal',
  'street',
  'feminine',
  'minimal',
  'sporty',
  'vintage',
  'chic',
  'bohemian',
  'preppy',
]

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) continue

    const key = token.slice(2)
    const next = argv[i + 1]
    if (next == null || next.startsWith('--')) {
      args[key] = true
    } else {
      args[key] = next
      i += 1
    }
  }
  return args
}

function fail(message) {
  console.error(`\nAvatar asset add failed: ${message}`)
  process.exit(1)
}

function required(args, key) {
  const value = args[key]
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(`--${key} is required`)
  }
  return value.trim()
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/')
}

function rel(filePath) {
  return toPosix(path.relative(ROOT, filePath))
}

function readImageInfo(filePath) {
  const output = execFileSync('sips', [
    '-g',
    'pixelWidth',
    '-g',
    'pixelHeight',
    '-g',
    'hasAlpha',
    filePath,
  ], { encoding: 'utf8' })

  return {
    width: Number(output.match(/pixelWidth:\s*(\d+)/)?.[1]),
    height: Number(output.match(/pixelHeight:\s*(\d+)/)?.[1]),
    hasAlpha: output.match(/hasAlpha:\s*(\w+)/)?.[1] === 'yes',
  }
}

function readCanvas() {
  const info = readImageInfo(BASE_ASSET)
  if (!info.hasAlpha) {
    fail('base avatar must have an alpha channel')
  }
  return { width: info.width, height: info.height }
}

function normalizeImage(sourcePath, targetPath) {
  const canvas = readCanvas()
  mkdirSync(path.dirname(targetPath), { recursive: true })
  copyFileSync(sourcePath, targetPath)
  execFileSync('sips', ['-z', String(canvas.height), String(canvas.width), targetPath], {
    stdio: 'ignore',
  })

  const info = readImageInfo(targetPath)
  if (info.width !== canvas.width || info.height !== canvas.height) {
    fail(`expected ${canvas.width}x${canvas.height}, got ${info.width}x${info.height}`)
  }
  if (!info.hasAlpha) {
    fail('PNG must have an alpha channel. Export with a transparent background.')
  }
}

function formatItem({ id, category, subCategory, name, color, imagePath, styleTags }) {
  const tags = styleTags.map((tag) => `'${tag}'`).join(', ')
  return `  {
    id: '${id}',
    category: '${category}',
    subCategory: '${subCategory}',
    name: '${name}',
    color: '${color}',
    imagePath: '${imagePath}',
    styleTags: [${tags}],
  }`
}

function upsertCatalogItem(item) {
  const catalogPath = path.join(ROOT, 'constants/itemCatalog.ts')
  let source = readFileSync(catalogPath, 'utf8')
  const itemText = formatItem(item)
  const existingPattern = new RegExp(
    `  \\{\\n\\s+id: '${item.id}',[\\s\\S]*?\\n  \\}`,
    'm'
  )

  if (existingPattern.test(source)) {
    source = source.replace(existingPattern, itemText)
  } else {
    const nextCategory = CATEGORIES[CATEGORIES.indexOf(item.category) + 1]
    const anchor = nextCategory ? `\n  // ${nextCategory}` : '\n]'
    const anchorIndex = source.indexOf(anchor)
    if (anchorIndex === -1) fail(`could not find insertion point for ${item.category}`)

    source = `${source.slice(0, anchorIndex)}${itemText},\n${source.slice(anchorIndex)}`
  }

  writeFileSync(catalogPath, source)
}

function upsertSubCategory(category, subCategory) {
  const itemsPath = path.join(ROOT, 'constants/items.ts')
  let source = readFileSync(itemsPath, 'utf8')
  const pattern = new RegExp(`  ${category}: \\[([^\\]]+)\\],`)
  const match = source.match(pattern)
  if (match == null) fail(`could not find SUB_CATEGORIES.${category}`)

  const values = match[1]
    .split(',')
    .map((value) => value.trim().replace(/^'|'$/g, ''))
    .filter(Boolean)

  if (values.includes(subCategory)) return

  const nextValues = ['전체', ...values.filter((value) => value !== '전체'), subCategory]
  const line = `  ${category}: [${nextValues.map((value) => `'${value}'`).join(', ')}],`
  source = source.replace(pattern, line)
  writeFileSync(itemsPath, source)
}

function upsertAvatarAsset(id, imagePath) {
  const assetPath = path.join(ROOT, 'lib/avatarAssets.ts')
  let source = readFileSync(assetPath, 'utf8')
  const requirePath = `../${imagePath}`
  const line = `  ${id}: require('${requirePath}'),`
  const linePattern = new RegExp(`  ${id}: require\\('[^']+'\\),`)

  if (linePattern.test(source)) {
    source = source.replace(linePattern, line)
  } else {
    source = source.replace(
      /const AVATAR_ITEM_IMAGES: Record<string, ImageSourcePropType> = \{\n/,
      `const AVATAR_ITEM_IMAGES: Record<string, ImageSourcePropType> = {\n${line}\n`
    )
  }

  writeFileSync(assetPath, source)
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const source = path.resolve(ROOT, required(args, 'source'))
  const id = required(args, 'id')
  const category = required(args, 'category')
  const subCategory = required(args, 'subCategory')
  const name = required(args, 'name')
  const color = required(args, 'color')
  const colorKey = required(args, 'colorKey')
  const styleTags = required(args, 'styles')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  if (!existsSync(source)) fail(`source not found: ${rel(source)}`)
  if (!CATEGORIES.includes(category)) fail(`category must be one of: ${CATEGORIES.join(', ')}`)
  if (!id.startsWith(`${category}_`)) fail(`id must start with "${category}_"`)
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) fail('--color must be a hex value like #1C1C1C')
  const invalidTag = styleTags.find((tag) => !STYLE_TAGS.includes(tag))
  if (invalidTag != null) fail(`invalid style tag: ${invalidTag}`)

  const fileName = `${id}_${colorKey}.png`
  const target = path.join(ROOT, 'assets/avatar', category, fileName)
  const imagePath = rel(target)

  normalizeImage(source, target)
  upsertCatalogItem({ id, category, subCategory, name, color, imagePath, styleTags })
  upsertSubCategory(category, subCategory)
  upsertAvatarAsset(id, imagePath)

  console.log(`Added avatar item: ${id}`)
  console.log(`- image: ${imagePath}`)
  console.log('- updated: constants/itemCatalog.ts')
  console.log('- updated: constants/items.ts')
  console.log('- updated: lib/avatarAssets.ts')
}

main()
