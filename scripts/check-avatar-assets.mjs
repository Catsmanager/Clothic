import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const BASE_ASSET = path.join(ROOT, 'assets/avatar/base/base_female_01.png')
const assetMapPath = path.join(ROOT, 'lib/avatarAssets.ts')

function readImageInfo(filePath) {
  const output = execFileSync(
    'sips',
    ['-g', 'pixelWidth', '-g', 'pixelHeight', '-g', 'hasAlpha', filePath],
    { encoding: 'utf8' }
  )

  return {
    width: Number(output.match(/pixelWidth:\s*(\d+)/)?.[1]),
    height: Number(output.match(/pixelHeight:\s*(\d+)/)?.[1]),
    hasAlpha: output.match(/hasAlpha:\s*(\w+)/)?.[1] === 'yes',
  }
}

function main() {
  const canvas = readImageInfo(BASE_ASSET)
  if (!canvas.hasAlpha) {
    console.error('assets/avatar/base/base_female_01.png: missing alpha channel')
    process.exit(1)
  }

  const source = readFileSync(assetMapPath, 'utf8')
  const matches = [...source.matchAll(/require\('\.\.\/([^']+)'\)/g)]
  const errors = []

  for (const match of matches) {
    const assetPath = match[1]
    const absolutePath = path.join(ROOT, assetPath)

    if (!existsSync(absolutePath)) {
      errors.push(`${assetPath}: file not found`)
      continue
    }

    const info = readImageInfo(absolutePath)
    if (info.width !== canvas.width || info.height !== canvas.height) {
      errors.push(
        `${assetPath}: expected ${canvas.width}x${canvas.height}, got ${info.width}x${info.height}`
      )
    }
    if (!info.hasAlpha) {
      errors.push(`${assetPath}: missing alpha channel`)
    }
  }

  if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exit(1)
  }

  console.log(
    `Avatar asset check passed (${matches.length} mapped assets, ${canvas.width}x${canvas.height}).`
  )
}

main()
