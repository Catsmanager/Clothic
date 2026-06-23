import type { ImageSourcePropType, ImageStyle } from 'react-native'

interface AvatarItemPreview {
  widthScale: number
  heightScale: number
  topScale: number
  xOffsetScale?: number
}

interface AvatarItemAsset {
  source: ImageSourcePropType
  layerOrder?: number
  layerStyle?: ImageStyle
  preview?: AvatarItemPreview
}

const AVATAR_ITEM_ASSETS: Record<string, AvatarItemAsset> = {
  top_001: {
    source: require('../assets/avatar/top/top_001_black.png'),
    preview: {
      widthScale: 2.55,
      heightScale: 3.82,
      topScale: -0.92,
    },
  },
  top_002: {
    source: require('../assets/avatar/top/top_002_white.png'),
    preview: {
      widthScale: 2.3,
      heightScale: 3.45,
      topScale: -0.78,
    },
  },
  top_003: {
    source: require('../assets/avatar/top/top_003_black_crop.png'),
    preview: {
      widthScale: 2.7,
      heightScale: 4.05,
      topScale: -1.0,
    },
  },
  top_005: {
    source: require('../assets/avatar/top/top_005_white_sweatshirt.png'),
    preview: {
      widthScale: 2.05,
      heightScale: 3.08,
      topScale: -0.64,
    },
  },
  top_006: {
    source: require('../assets/avatar/top/top_006_white_shirt.png'),
    preview: {
      widthScale: 2.0,
      heightScale: 3.0,
      topScale: -0.62,
    },
  },
  top_007: {
    source: require('../assets/avatar/top/top_007_gray_basic_tshirt.png'),
    preview: {
      widthScale: 2.0,
      heightScale: 3.0,
      topScale: -0.62,
    },
  },
  top_008: {
    source: require('../assets/avatar/top/top_008_black_blouse.png'),
    preview: {
      widthScale: 2.0,
      heightScale: 3.0,
      topScale: -0.62,
    },
  },
  top_009: {
    source: require('../assets/avatar/top/top_009_cream_navy_striped_tshirt.png'),
    preview: {
      widthScale: 2.0,
      heightScale: 3.0,
      topScale: -0.62,
    },
  },
  outer_001: {
    source: require('../assets/avatar/outer/outer_001_cream_cardigan.png'),
    preview: {
      widthScale: 2.0,
      heightScale: 3.0,
      topScale: -0.62,
    },
  },
  outer_002: {
    source: require('../assets/avatar/outer/outer_002_cream_hoodie_zipup.png'),
    preview: {
      widthScale: 2.0,
      heightScale: 3.0,
      topScale: -0.62,
    },
  },
  dress_001: {
    source: require('../assets/avatar/dress/dress_001_cream_onepiece.png'),
    layerOrder: 2,
    preview: {
      widthScale: 1.3,
      heightScale: 1.95,
      topScale: -0.4,
    },
  },
  dress_002: {
    source: require('../assets/avatar/dress/dress_002_cream_long_onepiece.png'),
    layerOrder: 2,
    preview: {
      widthScale: 0.95,
      heightScale: 1.425,
      topScale: -0.3,
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
  bottom_012: {
    source: require('../assets/avatar/bottom/bottom_012_cream_long_skirt.png'),
    preview: {
      widthScale: 1.32,
      heightScale: 1.98,
      topScale: -0.78,
    },
  },
  bottom_013: {
    source: require('../assets/avatar/bottom/bottom_013_black_slacks.png'),
    preview: {
      widthScale: 1.32,
      heightScale: 1.98,
      topScale: -0.78,
    },
  },
  bottom_014: {
    source: require('../assets/avatar/bottom/bottom_014_blue_shorts.png'),
    preview: {
      widthScale: 1.32,
      heightScale: 1.98,
      topScale: -0.78,
    },
  },
  bottom_015: {
    source: require('../assets/avatar/bottom/bottom_015_black_h_line_skirt.png'),
    preview: {
      widthScale: 1.32,
      heightScale: 1.98,
      topScale: -0.78,
    },
  },
  bottom_016: {
    source: require('../assets/avatar/bottom/bottom_016_gray_pleated_skirt.png'),
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
  shoes_008: {
    source: require('../assets/avatar/shoes/shoes_008_black_loafer.png'),
    preview: {
      widthScale: 3.1,
      heightScale: 4.65,
      topScale: -3.62,
    },
  },
  hair_001: {
    source: require('../assets/avatar/hair/hair_001_brown.png'),
    preview: {
      widthScale: 2.5,
      heightScale: 3.75,
      topScale: 0.02,
    },
  },
  hair_002: {
    source: require('../assets/avatar/hair/hair_002_brown.png'),
    preview: {
      widthScale: 3.15,
      heightScale: 4.72,
      topScale: -0.08,
    },
  },
  hair_003: {
    source: require('../assets/avatar/hair/hair_003_brown_short_cut.png'),
    preview: {
      widthScale: 3.15,
      heightScale: 4.72,
      topScale: -0.08,
    },
  },
  hair_004: {
    source: require('../assets/avatar/hair/hair_004_brown_half_up.png'),
    preview: {
      widthScale: 1.55,
      heightScale: 2.325,
      topScale: 0.05,
    },
  },
  hair_005: {
    source: require('../assets/avatar/hair/hair_005_dark_brown_long_straight.png'),
    preview: {
      widthScale: 1.3,
      heightScale: 1.95,
      topScale: 0.04,
    },
  },
  hair_006: {
    source: require('../assets/avatar/hair/hair_006_dark_brown_short_bob.png'),
    preview: {
      widthScale: 3.15,
      heightScale: 4.72,
      topScale: -0.08,
    },
  },
  accessory_001: {
    source: require('../assets/avatar/accessory/accessory_001_glasses.png'),
    preview: {
      widthScale: 4.5,
      heightScale: 6.75,
      topScale: -0.58,
    },
  },
  accessory_002: {
    source: require('../assets/avatar/accessory/accessory_002_knee_socks.png'),
    layerOrder: -1,
    preview: {
      widthScale: 2.5,
      heightScale: 3.75,
      topScale: -2.18,
    },
  },
  accessory_003: {
    source: require('../assets/avatar/accessory/accessory_003_necklace.png'),
    preview: {
      widthScale: 8.0,
      heightScale: 12.0,
      topScale: -2.58,
    },
  },
  accessory_004: {
    source: require('../assets/avatar/accessory/accessory_004_watch.png'),
    preview: {
      widthScale: 7.0,
      heightScale: 10.5,
      topScale: -4.5,
      xOffsetScale: -1.08,
    },
  },
  accessory_006: {
    source: require('../assets/avatar/accessory/accessory_006_brown_shoulder_bag.png'),
    preview: {
      // 원본의 투명 여백이 커서 일반 액세서리 좌표를 쓰면 카드 아래로 밀린다.
      widthScale: 2.6,
      heightScale: 3.9,
      topScale: -1.0,
    },
  },
  accessory_007: {
    source: require('../assets/avatar/accessory/accessory_007_black_sunglasses.png'),
    preview: {
      widthScale: 3.6,
      heightScale: 5.4,
      topScale: -0.08,
    },
  },
}

const DEFAULT_PREVIEW: AvatarItemPreview = {
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

export function getAvatarItemLayerOrder(itemId: string): number | null {
  return AVATAR_ITEM_ASSETS[itemId]?.layerOrder ?? null
}

export function getAvatarItemPreviewStyle(itemId: string, itemSize: number): ImageStyle {
  const preview = AVATAR_ITEM_ASSETS[itemId]?.preview ?? DEFAULT_PREVIEW
  const transform =
    preview.xOffsetScale == null ? undefined : [{ translateX: itemSize * preview.xOffsetScale }]

  return {
    width: itemSize * preview.widthScale,
    height: itemSize * preview.heightScale,
    top: itemSize * preview.topScale,
    transform,
  }
}
