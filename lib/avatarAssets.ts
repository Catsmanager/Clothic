import type { ImageSourcePropType, ImageStyle } from 'react-native'

interface AvatarItemAsset {
  source: ImageSourcePropType
  layerStyle?: ImageStyle
  preview?: {
    widthScale: number
    heightScale: number
    topScale: number
  }
}

const AVATAR_ITEM_ASSETS: Record<string, AvatarItemAsset> = {
  top_002: {
    source: require('../assets/avatar/top/top_002_white.png'),
    preview: {
      widthScale: 2.3,
      heightScale: 3.45,
      topScale: -0.78,
    },
  },
  bottom_009: {
    source: require('../assets/avatar/bottom/bottom_009_blue.png'),
    preview: {
      widthScale: 2.75,
      heightScale: 4.12,
      topScale: -1.52,
    },
  },
  bottom_010: {
    source: require('../assets/avatar/bottom/bottom_010_blue.png'),
    preview: {
      widthScale: 1.32,
      heightScale: 1.98,
      topScale: -0.78,
    },
  },
  bottom_011: {
    source: require('../assets/avatar/bottom/bottom_011_gray.png'),
    preview: {
      widthScale: 1.32,
      heightScale: 1.98,
      topScale: -0.78,
    },
  },
  shoes_001: {
    source: require('../assets/avatar/shoes/shoes_001_white.png'),
    preview: {
      widthScale: 3.0,
      heightScale: 4.5,
      topScale: -3.4,
    },
  },
  shoes_002: {
    source: require('../assets/avatar/shoes/shoes_002_black.png'),
    preview: {
      widthScale: 2.7,
      heightScale: 4.05,
      topScale: -2.72,
    },
  },
  shoes_007: {
    source: require('../assets/avatar/shoes/shoes_007_black.png'),
    preview: {
      widthScale: 3.1,
      heightScale: 4.65,
      topScale: -3.62,
    },
  },
}

const DEFAULT_PREVIEW = {
  widthScale: 2.2,
  heightScale: 4.4,
  topScale: -1.52,
}

export function getAvatarItemImage(itemId: string): ImageSourcePropType | null {
  return AVATAR_ITEM_ASSETS[itemId]?.source ?? null
}

export function getAvatarItemAsset(itemId: string): AvatarItemAsset | null {
  return AVATAR_ITEM_ASSETS[itemId] ?? null
}

export function getAvatarItemPreviewStyle(itemId: string, itemSize: number): ImageStyle {
  const preview = AVATAR_ITEM_ASSETS[itemId]?.preview ?? DEFAULT_PREVIEW

  return {
    width: itemSize * preview.widthScale,
    height: itemSize * preview.heightScale,
    top: itemSize * preview.topScale,
  }
}
