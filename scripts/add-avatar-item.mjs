import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { getAvatarLayerQualityIssues, readPngInfo } from './avatar-image-info.mjs'

const ROOT = process.cwd()
const BASE_ASSET = path.join(ROOT, 'assets/avatar/base/base_female_01.png')
const CATALOG_PATH = path.join(ROOT, 'constants/itemCatalog.ts')
const ITEMS_PATH = path.join(ROOT, 'constants/items.ts')
const ASSET_MAP_PATH = path.join(ROOT, 'lib/avatarAssets.ts')
const CHECK_SCRIPT = path.join(ROOT, 'scripts/check-avatar-assets.mjs')
const CATEGORIES = ['top', 'outer', 'dress', 'bottom', 'shoes', 'hair', 'accessory']
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
const SEASONS = ['spring', 'summer', 'fall', 'winter', 'all']
const VALUE_ARGS = new Set([
  'source',
  'id',
  'category',
  'subCategory',
  'name',
  'color',
  'colorKey',
  'styles',
  'seasons',
  'preview-from',
])
const BOOLEAN_ARGS = new Set(['replace', 'dry-run'])
const ALLOWED_ARGS = new Set([...VALUE_ARGS, ...BOOLEAN_ARGS])

function parseArgs(argv) {
  const args = {}
  const seen = new Set()

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) {
      fail(`unexpected positional argument: ${token}`)
    }
    if (token.includes('=')) {
      fail(
        `use a separate value after ${token.slice(0, token.indexOf('='))}; --flag=value is not supported`
      )
    }

    const key = token.slice(2)
    if (!ALLOWED_ARGS.has(key)) {
      fail(`unknown option: --${key}`)
    }
    if (seen.has(key)) {
      fail(`duplicate option: --${key}`)
    }
    seen.add(key)

    const next = argv[i + 1]
    if (BOOLEAN_ARGS.has(key)) {
      if (next != null && !next.startsWith('--')) {
        fail(`--${key} is a flag and does not accept a value`)
      }
      args[key] = true
      continue
    }

    if (next == null || next.startsWith('--')) {
      fail(`--${key} requires a value`)
    }
    args[key] = next
    i += 1
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

function csv(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/')
}

function rel(filePath) {
  return toPosix(path.relative(ROOT, filePath))
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function quote(value) {
  return `'${value
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")
    .replaceAll('\r', '\\r')
    .replaceAll('\n', '\\n')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')}'`
}

function normalizeEol(source) {
  return {
    source: source.replaceAll('\r\n', '\n'),
    eol: source.includes('\r\n') ? '\r\n' : '\n',
  }
}

function restoreEol(source, eol) {
  return eol === '\r\n' ? source.replaceAll('\n', '\r\n') : source
}

function assertSingleLine(value, key) {
  if (/[\u0000-\u001F\u007F\u2028\u2029]/.test(value)) {
    fail(`--${key} must be a single line without control characters`)
  }
}

function assertPngMatchesCanvas(sourcePath) {
  const canvas = readPngInfo(BASE_ASSET)
  const source = readPngInfo(sourcePath)

  if (source.width !== canvas.width || source.height !== canvas.height) {
    fail(
      `source must be ${canvas.width}x${canvas.height}; got ${source.width}x${source.height}. ` +
        'Resize on a full canvas before registration so alignment is not distorted.'
    )
  }
  if (!source.hasAlpha) {
    fail('source PNG must have an alpha channel')
  }
  if (!source.hasTransparentPixels) {
    fail('source PNG alpha channel must contain transparent pixels')
  }
  if (!source.hasVisiblePixels) {
    fail('source PNG must contain visible layer pixels')
  }
  const qualityIssues = getAvatarLayerQualityIssues(source)
  if (qualityIssues.length > 0) {
    fail(
      `source PNG failed the layer quality gate:\n${qualityIssues
        .map((issue) => `- ${issue.code}: ${issue.message}`)
        .join('\n')}`
    )
  }

  return canvas
}

function formatItem({ id, category, subCategory, name, color, imagePath, styleTags, seasons }) {
  return `  {
    id: ${quote(id)},
    category: ${quote(category)},
    subCategory: ${quote(subCategory)},
    name: ${quote(name)},
    color: ${quote(color)},
    imagePath: ${quote(imagePath)},
    styleTags: [${styleTags.map(quote).join(', ')}],
    seasons: [${seasons.map(quote).join(', ')}],
  }`
}

function findCatalogImagePath(source, id) {
  source = normalizeEol(source).source
  const entryPattern = /^  \{\n[\s\S]*?^  \},/gm
  const existing = [...source.matchAll(entryPattern)].find((match) =>
    new RegExp(`^    id: ${escapeRegExp(quote(id))},$`, 'm').test(match[0])
  )
  return existing?.[0].match(/^\s+imagePath: '([^']+)',$/m)?.[1] ?? null
}

function resolveExistingAssetPath(imagePath, category) {
  const expectedPrefix = `assets/avatar/${category}/`
  if (!imagePath.startsWith(expectedPrefix)) {
    fail(`existing imagePath must stay inside ${expectedPrefix}: ${imagePath}`)
  }

  const categoryDirectory = path.resolve(ROOT, 'assets/avatar', category)
  const absolutePath = path.resolve(ROOT, imagePath)
  const relativePath = path.relative(categoryDirectory, absolutePath)
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    fail(`refusing to replace an asset outside ${rel(categoryDirectory)}: ${imagePath}`)
  }
  return absolutePath
}

function updateCatalog(source, item, replace) {
  const normalized = normalizeEol(source)
  source = normalized.source
  const itemText = formatItem(item)
  const entryPattern = /^  \{\n[\s\S]*?^  \},/gm
  const existing = [...source.matchAll(entryPattern)].find((match) =>
    new RegExp(`^    id: ${escapeRegExp(quote(item.id))},$`, 'm').test(match[0])
  )

  if (existing && !replace) {
    fail(`${item.id} already exists in constants/itemCatalog.ts; pass --replace to update it`)
  }
  if (existing && existing.index != null) {
    return restoreEol(
      `${source.slice(0, existing.index)}${itemText},${source.slice(
        existing.index + existing[0].length
      )}`,
      normalized.eol
    )
  }

  const nextCategory = CATEGORIES[CATEGORIES.indexOf(item.category) + 1]
  const anchor = nextCategory ? `\n  // ${nextCategory}` : '\n]'
  const anchorIndex = source.indexOf(anchor)
  if (anchorIndex === -1) fail(`could not find catalog insertion point for ${item.category}`)

  return restoreEol(
    `${source.slice(0, anchorIndex)}\n${itemText},\n${source.slice(anchorIndex)}`,
    normalized.eol
  )
}

function updateSubCategory(source, category, subCategory) {
  const normalized = normalizeEol(source)
  source = normalized.source
  const pattern = new RegExp(`^  ${escapeRegExp(category)}: \\[([^\\]]*)\\],$`, 'm')
  const match = source.match(pattern)
  if (!match) fail(`could not find SUB_CATEGORIES.${category}`)

  const values = (match[1] ?? '')
    .split(',')
    .map((value) => value.trim().replace(/^'|'$/g, ''))
    .filter(Boolean)
  if (values.includes(subCategory) || subCategory === '전체') {
    return restoreEol(source, normalized.eol)
  }

  const nextValues = ['전체', ...values.filter((value) => value !== '전체'), subCategory]
  return restoreEol(
    source.replace(
      pattern,
      `  ${category}: [${nextValues.map((value) => quote(value)).join(', ')}],`
    ),
    normalized.eol
  )
}

function findAvatarAssetEntry(source, id) {
  const entryPattern = new RegExp(`^  ${escapeRegExp(id)}: \\{\\n[\\s\\S]*?^  \\},`, 'm')
  return source.match(entryPattern)?.[0] ?? null
}

function findAvatarPreview(source, id) {
  const entry = findAvatarAssetEntry(source, id)
  if (!entry) fail(`preview reference ${id} is not mapped in lib/avatarAssets.ts`)

  const preview = entry.match(/^    preview: \{\n[\s\S]*?^    \},/m)?.[0]
  if (!preview) fail(`preview reference ${id} is missing preview metadata`)
  return preview
}

function updateAvatarAsset(source, id, imagePath, replace, previewFrom) {
  const normalized = normalizeEol(source)
  source = normalized.source
  const entryPattern = new RegExp(`^  ${escapeRegExp(id)}: \\{\\n[\\s\\S]*?^  \\},`, 'm')
  const existing = source.match(entryPattern)?.[0]
  const requireLine = `    source: require('../${imagePath}'),`
  const preview = previewFrom ? findAvatarPreview(source, previewFrom) : null
  const previewSourceLine = previewFrom ? `    previewSourceId: ${quote(previewFrom)},` : null

  if (existing && !replace) {
    fail(`${id} already exists in lib/avatarAssets.ts; pass --replace to update it`)
  }
  if (existing) {
    if (!/^\s+source: require\('[^']+'\),$/m.test(existing)) {
      fail(`could not find source require for ${id} in lib/avatarAssets.ts`)
    }
    let updated = existing.replace(/^\s+source: require\('[^']+'\),$/m, requireLine)
    if (preview && previewSourceLine) {
      const existingPreview = updated.match(/^    preview: \{\n[\s\S]*?^    \},/m)?.[0]
      if (!existingPreview) fail(`${id} is missing preview metadata in lib/avatarAssets.ts`)

      if (/^    previewSourceId: '[^']+',$/m.test(updated)) {
        updated = updated.replace(/^    previewSourceId: '[^']+',$/m, previewSourceLine)
      } else {
        updated = updated.replace(requireLine, `${requireLine}\n${previewSourceLine}`)
      }
      updated = updated.replace(existingPreview, preview)
    }
    return restoreEol(source.replace(entryPattern, updated), normalized.eol)
  }

  if (!preview || !previewSourceLine) {
    fail('--preview-from is required when registering a new avatar item')
  }
  const anchor = '\n}\n\nconst DEFAULT_PREVIEW'
  const anchorIndex = source.indexOf(anchor)
  if (anchorIndex === -1) fail('could not find AVATAR_ITEM_ASSETS insertion point')

  const entry = `  ${id}: {\n${requireLine}\n${previewSourceLine}\n${preview}\n  },`
  return restoreEol(
    `${source.slice(0, anchorIndex)}\n${entry}${source.slice(anchorIndex)}`,
    normalized.eol
  )
}

function commitWithRollback(outputs) {
  const backups = outputs.map(({ filePath }) => ({
    filePath,
    existed: existsSync(filePath),
    data: existsSync(filePath) ? readFileSync(filePath) : null,
  }))

  try {
    for (const output of outputs) {
      if (output.remove) {
        if (existsSync(output.filePath)) rmSync(output.filePath)
        continue
      }
      mkdirSync(path.dirname(output.filePath), { recursive: true })
      writeFileSync(output.filePath, output.data)
    }

    execFileSync(process.execPath, [CHECK_SCRIPT], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
    })
  } catch (error) {
    for (const backup of backups.reverse()) {
      if (backup.existed && backup.data !== null) {
        mkdirSync(path.dirname(backup.filePath), { recursive: true })
        writeFileSync(backup.filePath, backup.data)
      } else if (existsSync(backup.filePath)) {
        rmSync(backup.filePath)
      }
    }

    const detail =
      error && typeof error === 'object' && 'stderr' in error
        ? String(error.stderr).trim()
        : error instanceof Error
          ? error.message
          : 'unknown write error'
    fail(`changes were rolled back: ${detail}`)
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const sourcePath = path.resolve(ROOT, required(args, 'source'))
  const id = required(args, 'id')
  const category = required(args, 'category')
  const subCategory = required(args, 'subCategory')
  const name = required(args, 'name')
  const color = required(args, 'color')
  const colorKey = required(args, 'colorKey')
  const styleTags = csv(required(args, 'styles'))
  const seasons = csv(required(args, 'seasons'))
  const replace = args.replace === true
  const dryRun = args['dry-run'] === true
  const previewFrom = typeof args['preview-from'] === 'string' ? args['preview-from'].trim() : null

  for (const [key, value] of [
    ['id', id],
    ['category', category],
    ['subCategory', subCategory],
    ['name', name],
    ['color', color],
    ['colorKey', colorKey],
  ]) {
    assertSingleLine(value, key)
  }

  if (!existsSync(sourcePath)) fail(`source not found: ${rel(sourcePath)}`)
  if (!CATEGORIES.includes(category)) fail(`category must be one of: ${CATEGORIES.join(', ')}`)
  if (!new RegExp(`^${escapeRegExp(category)}_\\d{3}$`).test(id)) {
    fail(`id must match "${category}_###"`)
  }
  if (previewFrom != null) {
    if (!new RegExp(`^${escapeRegExp(category)}_\\d{3}$`).test(previewFrom)) {
      fail(`--preview-from must reference an existing ${category}_### item`)
    }
    if (previewFrom === id) {
      fail('--preview-from must reference a different approved item')
    }
  }
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(colorKey)) {
    fail('--colorKey must contain lowercase letters, digits, hyphens, or underscores')
  }
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) fail('--color must be a hex value like #1C1C1C')
  if (styleTags.length === 0) fail('--styles must include at least one style tag')
  const invalidTag = styleTags.find((tag) => !STYLE_TAGS.includes(tag))
  if (invalidTag) fail(`invalid style tag: ${invalidTag}`)
  if (seasons.length === 0) fail('--seasons must include at least one season')
  const invalidSeason = seasons.find((season) => !SEASONS.includes(season))
  if (invalidSeason) fail(`invalid season: ${invalidSeason}`)
  if (seasons.includes('all') && seasons.length > 1) {
    fail('--seasons cannot combine "all" with another season')
  }

  const canvas = assertPngMatchesCanvas(sourcePath)
  const fileName = `${id}_${colorKey}.png`
  const targetPath = path.join(ROOT, 'assets/avatar', category, fileName)
  const imagePath = rel(targetPath)
  const targetExists = existsSync(targetPath)

  if (targetExists && !replace && sourcePath !== targetPath) {
    fail(`${imagePath} already exists; pass --replace to overwrite it`)
  }

  const catalogSource = readFileSync(CATALOG_PATH, 'utf8')
  const assetMapSource = readFileSync(ASSET_MAP_PATH, 'utf8')
  const existingAsset = findAvatarAssetEntry(normalizeEol(assetMapSource).source, id)
  if (!existingAsset && previewFrom == null) {
    fail('--preview-from is required when registering a new avatar item')
  }
  const previousImagePath = replace ? findCatalogImagePath(catalogSource, id) : null
  const previousAssetPath =
    previousImagePath && previousImagePath !== imagePath
      ? resolveExistingAssetPath(previousImagePath, category)
      : null

  const item = { id, category, subCategory, name, color, imagePath, styleTags, seasons }
  const catalog = updateCatalog(catalogSource, item, replace)
  const items = updateSubCategory(readFileSync(ITEMS_PATH, 'utf8'), category, subCategory)
  const assetMap = updateAvatarAsset(assetMapSource, id, imagePath, replace, previewFrom)

  const outputs = [
    { filePath: targetPath, data: readFileSync(sourcePath) },
    { filePath: CATALOG_PATH, data: catalog },
    { filePath: ITEMS_PATH, data: items },
    { filePath: ASSET_MAP_PATH, data: assetMap },
  ]
  if (previousAssetPath) {
    outputs.push({ filePath: previousAssetPath, data: null, remove: true })
  }

  console.log(`${dryRun ? 'Dry run' : 'Registering'} avatar item: ${id}`)
  console.log(`- canvas: ${canvas.width}x${canvas.height}`)
  console.log(`- image: ${imagePath}${targetExists ? ' (replace)' : ' (create)'}`)
  console.log(
    `- preview: ${
      previewFrom ? `copied from ${previewFrom}` : `preserved from existing ${id} metadata`
    }`
  )
  if (previousImagePath && previousImagePath !== imagePath) {
    console.log(`- remove replaced image: ${previousImagePath}`)
  }
  console.log('- sync: constants/itemCatalog.ts, constants/items.ts, lib/avatarAssets.ts')

  if (dryRun) {
    console.log('Dry run passed. No files were changed.')
    return
  }

  commitWithRollback(outputs)
  console.log('Avatar item registered and repository checks passed.')
}

main()
