import type { ImageSourcePropType, ImageStyle } from 'react-native'

interface AvatarItemAsset {
  source: ImageSourcePropType
  layerStyle?: ImageStyle
}

const AVATAR_ITEM_ASSETS: Record<string, AvatarItemAsset> = {
}

export function getAvatarItemImage(itemId: string): ImageSourcePropType | null {
  return AVATAR_ITEM_ASSETS[itemId]?.source ?? null
}

export function getAvatarItemAsset(itemId: string): AvatarItemAsset | null {
  return AVATAR_ITEM_ASSETS[itemId] ?? null
}
