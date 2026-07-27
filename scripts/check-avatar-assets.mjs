import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { getAvatarLayerQualityIssues, readPngInfo } from './avatar-image-info.mjs'

const ROOT = process.cwd()
const BASE_ASSET = path.join(ROOT, 'assets/avatar/base/base_female_01.png')
const CATALOG_PATH = path.join(ROOT, 'constants/itemCatalog.ts')
const ASSET_MAP_PATH = path.join(ROOT, 'lib/avatarAssets.ts')
const QUALITY_BASELINE_PATH = path.join(ROOT, 'scripts/avatar-quality-baseline.json')
const CATEGORIES = ['top', 'outer', 'dress', 'bottom', 'shoes', 'hair', 'accessory']
const LAYER_SIZE_WARNING_BYTES = 512 * 1024

function toPosix(filePath) {
  return filePath.split(path.sep).join('/')
}

function parseCatalog(source) {
  source = source.replaceAll('\r\n', '\n')
  const items = []
  const entryPattern = /^  \{\n([\s\S]*?)^  \},/gm

  for (const match of source.matchAll(entryPattern)) {
    const body = match[1] ?? ''
    const id = body.match(/^\s+id: '([^']+)',/m)?.[1]
    const category = body.match(/^\s+category: '([^']+)',/m)?.[1]
    const imagePath = body.match(/^\s+imagePath: '([^']*)',/m)?.[1]
    if (id) {
      items.push({ id, category, imagePath })
    }
  }

  return items
}

function parseAssetMap(source) {
  source = source.replaceAll('\r\n', '\n')
  const assets = []
  const entryPattern = /^  ([a-z]+_\d+): \{\n([\s\S]*?)^  \},/gm

  for (const match of source.matchAll(entryPattern)) {
    const id = match[1]
    const requirePath = match[2]?.match(/source: require\('\.\.\/([^']+)'\)/)?.[1]
    const hasPreview = /^\s+preview: \{$/m.test(match[2] ?? '')
    const previewSourceId = match[2]?.match(/previewSourceId: '([^']+)',/)?.[1] ?? null
    if (id && requirePath) {
      assets.push({ id, imagePath: requirePath, hasPreview, previewSourceId })
    }
  }

  return assets
}

function findDuplicateValues(values) {
  const seen = new Set()
  const duplicates = new Set()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates]
}

function listLayerPngs() {
  return CATEGORIES.flatMap((category) => {
    const directory = path.join(ROOT, 'assets/avatar', category)
    if (!existsSync(directory)) return []

    return readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
      .map((entry) => toPosix(path.relative(ROOT, path.join(directory, entry.name))))
  })
}

function readQualityBaseline() {
  if (!existsSync(QUALITY_BASELINE_PATH)) return {}
  const parsed = JSON.parse(readFileSync(QUALITY_BASELINE_PATH, 'utf8'))
  return parsed.assets ?? {}
}

function main() {
  const errors = []
  const warnings = []
  const canvas = readPngInfo(BASE_ASSET)

  if (!canvas.hasAlpha) {
    errors.push('assets/avatar/base/base_female_01.png: missing alpha channel')
  }
  if (!canvas.hasTransparentPixels || !canvas.hasVisiblePixels) {
    errors.push(
      'assets/avatar/base/base_female_01.png: must contain visible and transparent pixels'
    )
  }

  const catalog = parseCatalog(readFileSync(CATALOG_PATH, 'utf8'))
  const assetMap = parseAssetMap(readFileSync(ASSET_MAP_PATH, 'utf8'))
  const qualityBaseline = readQualityBaseline()
  const catalogById = new Map(catalog.map((item) => [item.id, item]))
  const assetById = new Map(assetMap.map((asset) => [asset.id, asset]))

  for (const id of findDuplicateValues(catalog.map((item) => item.id))) {
    errors.push(`constants/itemCatalog.ts: duplicate id ${id}`)
  }
  for (const id of findDuplicateValues(assetMap.map((asset) => asset.id))) {
    errors.push(`lib/avatarAssets.ts: duplicate id ${id}`)
  }
  for (const imagePath of findDuplicateValues(
    catalog.map((item) => item.imagePath).filter(Boolean)
  )) {
    errors.push(`constants/itemCatalog.ts: duplicate image path ${imagePath}`)
  }
  for (const imagePath of findDuplicateValues(assetMap.map((asset) => asset.imagePath))) {
    errors.push(`lib/avatarAssets.ts: duplicate image path ${imagePath}`)
  }

  for (const item of catalog) {
    if (!item.category || !CATEGORIES.includes(item.category)) {
      errors.push(
        `constants/itemCatalog.ts: ${item.id} has unknown category ${item.category ?? '(missing)'}`
      )
      continue
    }
    if (!item.imagePath) {
      errors.push(`constants/itemCatalog.ts: ${item.id} is missing imagePath`)
      continue
    }
    if (!new RegExp(`^${item.category}_\\d{3}$`).test(item.id)) {
      errors.push(`constants/itemCatalog.ts: ${item.id} does not match category ${item.category}`)
    }
    const expectedDirectory = `assets/avatar/${item.category}/`
    const normalizedImagePath = path.posix.normalize(item.imagePath)
    if (
      item.imagePath.includes('\\') ||
      normalizedImagePath !== item.imagePath ||
      !normalizedImagePath.startsWith(expectedDirectory)
    ) {
      errors.push(`${item.id}: image path ${item.imagePath} must be inside ${expectedDirectory}`)
    }
    if (!path.posix.basename(item.imagePath).startsWith(`${item.id}_`)) {
      errors.push(`${item.id}: image filename must start with ${item.id}_`)
    }

    const asset = assetById.get(item.id)
    if (!asset) {
      errors.push(`constants/itemCatalog.ts: ${item.id} is not mapped in lib/avatarAssets.ts`)
      continue
    }
    if (asset.imagePath !== item.imagePath) {
      errors.push(
        `${item.id}: catalog path ${item.imagePath} does not match asset path ${asset.imagePath}`
      )
    }
  }

  for (const asset of assetMap) {
    if (!catalogById.has(asset.id)) {
      errors.push(`lib/avatarAssets.ts: ${asset.id} is missing from constants/itemCatalog.ts`)
    }
    if (!asset.hasPreview) {
      errors.push(`lib/avatarAssets.ts: ${asset.id} is missing preview metadata`)
    }
    if (asset.previewSourceId) {
      const category = asset.id.split('_')[0]
      if (
        asset.previewSourceId === asset.id ||
        !new RegExp(`^${category}_\\d{3}$`).test(asset.previewSourceId)
      ) {
        errors.push(
          `lib/avatarAssets.ts: ${asset.id} preview source ${asset.previewSourceId} must be a different ${category}_### item`
        )
      }
      const previewSource = assetById.get(asset.previewSourceId)
      if (!previewSource?.hasPreview) {
        errors.push(
          `lib/avatarAssets.ts: ${asset.id} preview source ${asset.previewSourceId} is missing or has no preview metadata`
        )
      }
    }

    const normalizedImagePath = path.posix.normalize(asset.imagePath)
    const avatarRoot = path.resolve(ROOT, 'assets/avatar')
    const absolutePath = path.resolve(ROOT, normalizedImagePath)
    const relativeToAvatarRoot = path.relative(avatarRoot, absolutePath)
    if (
      asset.imagePath.includes('\\') ||
      normalizedImagePath !== asset.imagePath ||
      relativeToAvatarRoot.startsWith('..') ||
      path.isAbsolute(relativeToAvatarRoot)
    ) {
      errors.push(`${asset.imagePath}: mapped path must stay inside assets/avatar`)
      continue
    }
    if (!existsSync(absolutePath)) {
      errors.push(`${asset.imagePath}: file not found`)
      continue
    }

    try {
      const info = readPngInfo(absolutePath)
      if (info.width !== canvas.width || info.height !== canvas.height) {
        errors.push(
          `${asset.imagePath}: expected ${canvas.width}x${canvas.height}, got ${info.width}x${info.height}`
        )
      }
      if (!info.hasAlpha) {
        errors.push(`${asset.imagePath}: missing alpha channel`)
      }
      if (!info.hasTransparentPixels) {
        errors.push(`${asset.imagePath}: alpha channel has no transparent pixels`)
      }
      if (!info.hasVisiblePixels) {
        errors.push(`${asset.imagePath}: layer has no visible pixels`)
      }
      const baseline = qualityBaseline[asset.imagePath]
      const allowedIssues =
        baseline?.sha256 === info.sha256 ? new Set(baseline.allowedIssues ?? []) : new Set()
      for (const issue of getAvatarLayerQualityIssues(info)) {
        if (allowedIssues.has(issue.code)) {
          warnings.push(
            `${asset.imagePath}: legacy quality baseline ${issue.code} (${issue.message})`
          )
        } else {
          errors.push(`${asset.imagePath}: ${issue.code}: ${issue.message}`)
        }
      }
      if (info.bytes > LAYER_SIZE_WARNING_BYTES) {
        warnings.push(
          `${asset.imagePath}: ${(info.bytes / 1024).toFixed(0)} KiB exceeds the 512 KiB layer budget`
        )
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `${asset.imagePath}: invalid PNG`)
    }
  }

  const mappedPaths = new Set(assetMap.map((asset) => asset.imagePath))
  for (const imagePath of listLayerPngs()) {
    if (!mappedPaths.has(imagePath)) {
      errors.push(`${imagePath}: PNG is not registered in lib/avatarAssets.ts`)
    }
  }

  if (warnings.length > 0) {
    console.warn(warnings.map((warning) => `warning: ${warning}`).join('\n'))
  }
  if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exit(1)
  }

  console.log(
    `Avatar asset check passed (${assetMap.length} assets, ${canvas.width}x${canvas.height}, catalog/map/files synchronized).`
  )
}

main()
