import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const MAX_DECODED_BYTES = 64 * 1024 * 1024
const MAX_REPORTED_COMPONENTS = 10_000
const MIN_VISIBLE_PIXELS = 64
const MIN_TRANSPARENT_RATIO = 0.5
const SIGNIFICANT_COMPONENT_PIXELS = 56
const DISTANT_COMPONENT_PADDING = 48
const MIN_DISTANT_COMPONENT_PIXELS = 8

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

function paethPredictor(left, up, upperLeft) {
  const estimate = left + up - upperLeft
  const leftDistance = Math.abs(estimate - left)
  const upDistance = Math.abs(estimate - up)
  const upperLeftDistance = Math.abs(estimate - upperLeft)

  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left
  if (upDistance <= upperLeftDistance) return up
  return upperLeft
}

function inspectVisibleComponents(alphaMask, width, height, visiblePixels) {
  if (visiblePixels === 0) {
    return { components: [], componentOverflow: false }
  }

  const stack = new Int32Array(visiblePixels)
  const components = []
  let componentOverflow = false

  for (let index = 0; index < alphaMask.length; index += 1) {
    if (alphaMask[index] !== 1) continue

    let stackLength = 1
    stack[0] = index
    alphaMask[index] = 2

    let pixels = 0
    let minX = width
    let minY = height
    let maxX = -1
    let maxY = -1

    while (stackLength > 0) {
      const currentIndex = stack[--stackLength]
      const x = currentIndex % width
      const y = Math.floor(currentIndex / width)

      pixels += 1
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)

      const startX = Math.max(0, x - 1)
      const endX = Math.min(width - 1, x + 1)
      const startY = Math.max(0, y - 1)
      const endY = Math.min(height - 1, y + 1)

      for (let neighborY = startY; neighborY <= endY; neighborY += 1) {
        for (let neighborX = startX; neighborX <= endX; neighborX += 1) {
          if (neighborX === x && neighborY === y) continue
          const neighborIndex = neighborY * width + neighborX
          if (alphaMask[neighborIndex] !== 1) continue

          alphaMask[neighborIndex] = 2
          stack[stackLength] = neighborIndex
          stackLength += 1
        }
      }
    }

    if (components.length < MAX_REPORTED_COMPONENTS) {
      components.push({ pixels, minX, minY, maxX, maxY })
    } else {
      componentOverflow = true
    }
  }

  components.sort((left, right) => right.pixels - left.pixels)
  return { components, componentOverflow }
}

function inspectRgbaPixels(filePath, compressed, width, height) {
  const bytesPerPixel = 4
  const rowBytes = width * bytesPerPixel
  const expectedBytes = (rowBytes + 1) * height

  if (!Number.isSafeInteger(expectedBytes) || expectedBytes > MAX_DECODED_BYTES) {
    throw new Error(`${filePath}: decoded PNG exceeds the 64 MiB safety limit`)
  }

  let raw
  try {
    raw = inflateSync(compressed, { maxOutputLength: expectedBytes })
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'invalid compressed data'
    throw new Error(`${filePath}: PNG pixel data could not be decoded (${detail})`)
  }

  if (raw.length !== expectedBytes) {
    throw new Error(
      `${filePath}: decoded PNG length mismatch (expected ${expectedBytes}, got ${raw.length})`
    )
  }

  let offset = 0
  let previous = Buffer.alloc(rowBytes)
  const alphaMask = Buffer.alloc(width * height)
  let transparentPixels = 0
  let visiblePixels = 0
  let opaquePixels = 0
  let borderVisiblePixels = 0

  for (let row = 0; row < height; row += 1) {
    const filter = raw[offset]
    offset += 1
    if (filter == null || filter > 4) {
      throw new Error(`${filePath}: unsupported PNG filter ${String(filter)}`)
    }

    const current = Buffer.allocUnsafe(rowBytes)
    for (let column = 0; column < rowBytes; column += 1) {
      const encoded = raw[offset + column] ?? 0
      const left = column >= bytesPerPixel ? (current[column - bytesPerPixel] ?? 0) : 0
      const up = previous[column] ?? 0
      const upperLeft = column >= bytesPerPixel ? (previous[column - bytesPerPixel] ?? 0) : 0

      let value = encoded
      if (filter === 1) value += left
      if (filter === 2) value += up
      if (filter === 3) value += Math.floor((left + up) / 2)
      if (filter === 4) value += paethPredictor(left, up, upperLeft)
      current[column] = value & 0xff
    }
    offset += rowBytes

    for (let alphaOffset = 3; alphaOffset < rowBytes; alphaOffset += bytesPerPixel) {
      const alpha = current[alphaOffset] ?? 0
      const column = (alphaOffset - 3) / bytesPerPixel
      const pixelIndex = row * width + column

      if (alpha === 0) {
        transparentPixels += 1
      } else {
        visiblePixels += 1
        alphaMask[pixelIndex] = 1
        if (row === 0 || row === height - 1 || column === 0 || column === width - 1) {
          borderVisiblePixels += 1
        }
      }
      if (alpha === 255) opaquePixels += 1
    }
    previous = current
  }

  const cornerIndexes = [0, width - 1, (height - 1) * width, height * width - 1]
  const transparentCorners = cornerIndexes.filter((index) => alphaMask[index] === 0).length
  const { components, componentOverflow } = inspectVisibleComponents(
    alphaMask,
    width,
    height,
    visiblePixels
  )

  return {
    hasTransparentPixels: transparentPixels > 0,
    hasVisiblePixels: visiblePixels > 0,
    transparentPixels,
    visiblePixels,
    opaquePixels,
    borderVisiblePixels,
    transparentCorners,
    components,
    componentOverflow,
  }
}

function isOutsidePaddedBounds(component, bounds, padding) {
  return (
    component.maxX < bounds.minX - padding ||
    component.minX > bounds.maxX + padding ||
    component.maxY < bounds.minY - padding ||
    component.minY > bounds.maxY + padding
  )
}

export function getAvatarLayerQualityIssues(info) {
  const issues = []
  const totalPixels = info.width * info.height
  const transparentRatio = totalPixels === 0 ? 0 : info.transparentPixels / totalPixels

  if (info.visiblePixels < MIN_VISIBLE_PIXELS) {
    issues.push({
      code: 'insufficient-visible-pixels',
      message: `needs at least ${MIN_VISIBLE_PIXELS} visible pixels; got ${info.visiblePixels}`,
    })
  }
  if (transparentRatio < MIN_TRANSPARENT_RATIO) {
    issues.push({
      code: 'insufficient-transparent-coverage',
      message: `at least ${Math.round(
        MIN_TRANSPARENT_RATIO * 100
      )}% of the full canvas must be fully transparent; got ${(transparentRatio * 100).toFixed(2)}%`,
    })
  }
  if (info.transparentCorners !== 4) {
    issues.push({
      code: 'nontransparent-corner',
      message: `all four canvas corners must be fully transparent; got ${info.transparentCorners}/4`,
    })
  }
  if (info.borderVisiblePixels > 0) {
    issues.push({
      code: 'visible-border',
      message: `${info.borderVisiblePixels} visible pixels touch the canvas border (possible clipping)`,
    })
  }
  if (info.componentOverflow) {
    issues.push({
      code: 'component-overflow',
      message: `more than ${MAX_REPORTED_COMPONENTS} disconnected visible components were found`,
    })
  }

  const significantComponents = info.components.filter(
    (component) => component.pixels >= SIGNIFICANT_COMPONENT_PIXELS
  )
  if (significantComponents.length > 0) {
    const significantBounds = significantComponents.reduce(
      (bounds, component) => ({
        minX: Math.min(bounds.minX, component.minX),
        minY: Math.min(bounds.minY, component.minY),
        maxX: Math.max(bounds.maxX, component.maxX),
        maxY: Math.max(bounds.maxY, component.maxY),
      }),
      { minX: info.width, minY: info.height, maxX: -1, maxY: -1 }
    )
    const distantComponents = info.components.filter(
      (component) =>
        component.pixels < SIGNIFICANT_COMPONENT_PIXELS &&
        isOutsidePaddedBounds(component, significantBounds, DISTANT_COMPONENT_PADDING)
    )

    const distantPixels = distantComponents.reduce(
      (total, component) => total + component.pixels,
      0
    )
    if (distantPixels >= MIN_DISTANT_COMPONENT_PIXELS) {
      const examples = distantComponents
        .slice(0, 3)
        .map(
          (component) =>
            `${component.pixels}px@(${component.minX},${component.minY})-(${component.maxX},${component.maxY})`
        )
        .join(', ')
      issues.push({
        code: 'distant-small-components',
        message: `${distantComponents.length} distant small components (${distantPixels} pixels): ${examples}`,
      })
    }
  }

  return issues
}

export function readPngInfo(filePath) {
  const data = readFileSync(filePath)

  if (data.length < 57 || !data.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error(`${filePath}: not a valid PNG file`)
  }

  let offset = PNG_SIGNATURE.length
  let width = 0
  let height = 0
  let bitDepth = 0
  let colorType = -1
  let sawHeader = false
  let sawImageData = false
  let endedImageData = false
  let sawEnd = false
  const imageDataChunks = []

  while (offset < data.length) {
    if (offset + 12 > data.length) {
      throw new Error(`${filePath}: truncated PNG chunk`)
    }

    const length = data.readUInt32BE(offset)
    const typeStart = offset + 4
    const type = data.toString('ascii', typeStart, typeStart + 4)
    const dataStart = offset + 8
    const chunkEnd = dataStart + length
    const nextOffset = chunkEnd + 4

    if (!/^[A-Za-z]{4}$/.test(type) || nextOffset > data.length) {
      throw new Error(`${filePath}: malformed PNG chunk ${type || '(unknown)'}`)
    }

    const expectedCrc = data.readUInt32BE(chunkEnd)
    const actualCrc = crc32(data.subarray(typeStart, chunkEnd))
    if (actualCrc !== expectedCrc) {
      throw new Error(`${filePath}: invalid CRC for PNG chunk ${type}`)
    }

    if (!sawHeader && type !== 'IHDR') {
      throw new Error(`${filePath}: IHDR must be the first PNG chunk`)
    }
    const isCriticalChunk = (type.charCodeAt(0) & 0x20) === 0
    if (isCriticalChunk && !['IHDR', 'PLTE', 'IDAT', 'IEND'].includes(type)) {
      throw new Error(`${filePath}: unsupported critical PNG chunk ${type}`)
    }
    if (sawImageData && type !== 'IDAT' && type !== 'IEND') endedImageData = true

    if (type === 'IHDR') {
      if (sawHeader || length !== 13) {
        throw new Error(`${filePath}: malformed PNG header`)
      }
      width = data.readUInt32BE(dataStart)
      height = data.readUInt32BE(dataStart + 4)
      bitDepth = data[dataStart + 8] ?? 0
      colorType = data[dataStart + 9] ?? -1
      const compression = data[dataStart + 10]
      const filter = data[dataStart + 11]
      const interlace = data[dataStart + 12]

      if (width <= 0 || height <= 0) throw new Error(`${filePath}: invalid PNG dimensions`)
      if (bitDepth !== 8 || colorType !== 6) {
        throw new Error(`${filePath}: avatar PNG must use 8-bit RGBA pixels`)
      }
      if (compression !== 0 || filter !== 0 || interlace !== 0) {
        throw new Error(`${filePath}: avatar PNG must be non-interlaced with standard encoding`)
      }
      sawHeader = true
    } else if (type === 'IDAT') {
      if (endedImageData) throw new Error(`${filePath}: PNG IDAT chunks must be consecutive`)
      sawImageData = true
      imageDataChunks.push(data.subarray(dataStart, chunkEnd))
    } else if (type === 'IEND') {
      if (length !== 0 || !sawImageData) {
        throw new Error(`${filePath}: malformed PNG end`)
      }
      sawEnd = true
      offset = nextOffset
      break
    }

    offset = nextOffset
  }

  if (!sawHeader || !sawImageData || !sawEnd) {
    throw new Error(`${filePath}: PNG is missing IHDR, IDAT, or IEND`)
  }
  if (offset !== data.length) {
    throw new Error(`${filePath}: unexpected data after PNG IEND`)
  }

  const pixelInfo = inspectRgbaPixels(filePath, Buffer.concat(imageDataChunks), width, height)

  return {
    width,
    height,
    bitDepth,
    colorType,
    hasAlpha: true,
    ...pixelInfo,
    bytes: data.length,
    sha256: createHash('sha256').update(data).digest('hex'),
  }
}
