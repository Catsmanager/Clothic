import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { deflateSync } from 'node:zlib'
import { getAvatarLayerQualityIssues, readPngInfo } from '../scripts/avatar-image-info.mjs'

const REPO_ROOT = path.resolve(import.meta.dirname, '..')
const ADD_SCRIPT = path.join(REPO_ROOT, 'scripts/add-avatar-item.mjs')
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

const CRC_TABLE = Array.from({ length: 256 }, (_, value) => {
  let crc = value
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc & 1) !== 0 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
  }
  return crc >>> 0
})

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type)
  const output = Buffer.alloc(data.length + 12)
  output.writeUInt32BE(data.length, 0)
  typeBuffer.copy(output, 4)
  data.copy(output, 8)
  output.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), data.length + 8)
  return output
}

function createPng(width, height, pixelAt) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 6

  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (width * 4 + 1)
    for (let x = 0; x < width; x += 1) {
      const [red, green, blue, alpha] = pixelAt(x, y)
      const offset = rowOffset + 1 + x * 4
      raw[offset] = red
      raw[offset + 1] = green
      raw[offset + 2] = blue
      raw[offset + 3] = alpha
    }
  }

  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

function blockPng(width = 32, height = 48) {
  return createPng(width, height, (x, y) =>
    x >= 10 && x < 22 && y >= 14 && y < 34 ? [80, 90, 100, 255] : [0, 0, 0, 0]
  )
}

function writeFixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'clothic-avatar-test-'))
  for (const directory of [
    'assets/avatar/base',
    'assets/avatar/top',
    'assets/staging',
    'constants',
    'lib',
    'scripts',
  ]) {
    mkdirSync(path.join(root, directory), { recursive: true })
  }

  writeFileSync(path.join(root, 'assets/avatar/base/base_female_01.png'), blockPng())
  writeFileSync(path.join(root, 'assets/avatar/top/top_001_black.png'), blockPng())
  writeFileSync(path.join(root, 'assets/staging/top_002_white.png'), blockPng())
  writeFileSync(
    path.join(root, 'constants/itemCatalog.ts'),
    `export const ITEM_CATALOG = [
  // top
  {
    id: 'top_001',
    category: 'top',
    subCategory: '티셔츠',
    name: '기준 상의',
    color: '#111111',
    imagePath: 'assets/avatar/top/top_001_black.png',
    styleTags: ['minimal'],
    seasons: ['all'],
  },

  // outer
]
`
  )
  writeFileSync(
    path.join(root, 'constants/items.ts'),
    `export const SUB_CATEGORIES = {
  top: ['전체', '티셔츠'],
  outer: ['전체'],
  dress: ['전체'],
  bottom: ['전체'],
  shoes: ['전체'],
  hair: ['전체'],
  accessory: ['전체'],
}
`
  )
  writeFileSync(
    path.join(root, 'lib/avatarAssets.ts'),
    `const AVATAR_ITEM_ASSETS = {
  top_001: {
    source: require('../assets/avatar/top/top_001_black.png'),
    preview: {
      widthScale: 1.5,
      heightScale: 2.25,
      topScale: -0.5,
    },
  },
}

const DEFAULT_PREVIEW = {}
`
  )
  for (const script of ['check-avatar-assets.mjs', 'avatar-image-info.mjs']) {
    copyFileSync(path.join(REPO_ROOT, 'scripts', script), path.join(root, 'scripts', script))
  }
  return root
}

function runAdd(root, extraArgs) {
  const common = [
    '--source',
    'assets/staging/top_002_white.png',
    '--id',
    'top_002',
    '--category',
    'top',
    '--subCategory',
    '티셔츠',
    '--name',
    '화이트 티',
    '--color',
    '#FFFFFF',
    '--colorKey',
    'white',
    '--styles',
    'minimal',
    '--seasons',
    'all',
  ]
  return spawnSync(process.execPath, [ADD_SCRIPT, ...common, ...extraArgs], {
    cwd: root,
    encoding: 'utf8',
  })
}

function runCheck(root) {
  return spawnSync(process.execPath, [path.join(root, 'scripts/check-avatar-assets.mjs')], {
    cwd: root,
    encoding: 'utf8',
  })
}

test('avatar:add rejects ambiguous argv before any write', () => {
  const root = writeFixture()
  try {
    const catalogPath = path.join(root, 'constants/itemCatalog.ts')
    const before = readFileSync(catalogPath)
    const invalidArguments = [
      ['--preview-from', 'top_001', '--dry-run=true'],
      ['--preview-from', 'top_001', '--dry-run', 'false'],
      ['--preview-from', 'top_001', '--dry-run', '--dry-run'],
      ['--preview-from', 'top_001', 'unexpected', '--dry-run'],
      ['--preview-from', 'top_001', '--unknown', '--dry-run'],
    ]

    for (const args of invalidArguments) {
      const result = runAdd(root, args)
      assert.notEqual(result.status, 0, `expected failure for ${args.join(' ')}`)
      assert.deepEqual(readFileSync(catalogPath), before)
    }
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('avatar:add dry-run is immutable and registration copies same-category preview', () => {
  const root = writeFixture()
  try {
    const assetMapPath = path.join(root, 'lib/avatarAssets.ts')
    const originalAssetMap = readFileSync(assetMapPath, 'utf8')
    writeFileSync(assetMapPath, originalAssetMap.replace(/    preview: \{\n[\s\S]*?    \},\n/, ''))
    assert.notEqual(runCheck(root).status, 0)
    writeFileSync(assetMapPath, originalAssetMap)

    const tracked = ['constants/itemCatalog.ts', 'constants/items.ts', 'lib/avatarAssets.ts']
    const before = new Map(
      tracked.map((filePath) => [filePath, readFileSync(path.join(root, filePath))])
    )
    const dryRun = runAdd(root, ['--preview-from', 'top_001', '--dry-run'])
    assert.equal(dryRun.status, 0, dryRun.stderr)
    for (const [filePath, contents] of before) {
      assert.deepEqual(readFileSync(path.join(root, filePath)), contents)
    }

    const wrongCategory = runAdd(root, ['--preview-from', 'bottom_001', '--dry-run'])
    assert.notEqual(wrongCategory.status, 0)
    const missingPreview = runAdd(root, ['--dry-run'])
    assert.notEqual(missingPreview.status, 0)

    const registered = runAdd(root, ['--preview-from', 'top_001'])
    assert.equal(registered.status, 0, registered.stderr)
    const assetMap = readFileSync(assetMapPath, 'utf8')
    assert.match(assetMap, /top_002: \{/)
    assert.match(assetMap, /previewSourceId: 'top_001'/)
    assert.match(assetMap, /widthScale: 1\.5/)

    writeFileSync(
      assetMapPath,
      assetMap.replace("previewSourceId: 'top_001'", "previewSourceId: 'bottom_001'")
    )
    assert.notEqual(runCheck(root).status, 0)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('PNG quality analysis rejects malformed, alpha-254, single-pixel, and detached layers', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'clothic-avatar-png-test-'))
  try {
    const malformedPath = path.join(root, 'malformed.png')
    writeFileSync(malformedPath, Buffer.from('not-a-png'))
    assert.throws(() => readPngInfo(malformedPath), /not a valid PNG/)

    const alpha254Path = path.join(root, 'alpha254.png')
    writeFileSync(
      alpha254Path,
      createPng(32, 48, () => [20, 30, 40, 254])
    )
    const alpha254Issues = getAvatarLayerQualityIssues(readPngInfo(alpha254Path))
    assert(alpha254Issues.some((issue) => issue.code === 'insufficient-transparent-coverage'))
    assert(alpha254Issues.some((issue) => issue.code === 'nontransparent-corner'))

    const singlePixelPath = path.join(root, 'single.png')
    writeFileSync(
      singlePixelPath,
      createPng(32, 48, (x, y) => (x === 16 && y === 24 ? [1, 2, 3, 255] : [0, 0, 0, 0]))
    )
    const singlePixelIssues = getAvatarLayerQualityIssues(readPngInfo(singlePixelPath))
    assert(singlePixelIssues.some((issue) => issue.code === 'insufficient-visible-pixels'))

    const detachedPath = path.join(root, 'detached.png')
    writeFileSync(
      detachedPath,
      createPng(128, 192, (x, y) => {
        const main = x >= 18 && x < 30 && y >= 24 && y < 36
        const detached = x >= 112 && x < 115 && y >= 176 && y < 179
        return main || detached ? [50, 60, 70, 255] : [0, 0, 0, 0]
      })
    )
    const detachedIssues = getAvatarLayerQualityIssues(readPngInfo(detachedPath))
    assert(detachedIssues.some((issue) => issue.code === 'distant-small-components'))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
