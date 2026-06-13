import type { ImageSourcePropType, ImageStyle } from 'react-native'
import {
  getAvatarItemAsset,
  getAvatarItemLayerOrder,
  getAvatarItemPreviewStyle,
} from './avatarAssets'

export interface ItemVisualInput {
  id: string
  color: string
  imagePath?: string
}

const URI_PREFIXES = ['http://', 'https://', 'file://', 'content://', 'data:image/']

function getRenderableUri(path?: string): string | null {
  const value = path?.trim()
  if (!value) return null

  return URI_PREFIXES.some((prefix) => value.startsWith(prefix)) ? value : null
}

export function getItemImageSource(item: ItemVisualInput): ImageSourcePropType | null {
  const asset = getAvatarItemAsset(item.id)
  if (asset) return asset.source

  const uri = getRenderableUri(item.imagePath)
  return uri ? { uri } : null
}

export function getItemLayerStyle(item: ItemVisualInput): ImageStyle | undefined {
  return getAvatarItemAsset(item.id)?.layerStyle
}

export function getItemLayerOrder(item: ItemVisualInput): number | null {
  return getAvatarItemLayerOrder(item.id)
}

export function getItemPreviewImageStyle(item: ItemVisualInput, itemSize: number): ImageStyle {
  if (getAvatarItemAsset(item.id)) {
    return getAvatarItemPreviewStyle(item.id, itemSize)
  }

  return {
    width: itemSize * 0.82,
    height: itemSize * 0.82,
  }
}
