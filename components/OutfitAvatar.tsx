import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import type { CatalogItem, Category } from '../constants/items'

const BASE_AVATAR = require('../assets/avatar/base/base_female_01.png')

interface Props {
  style: StyleProp<ViewStyle>
  items?: CatalogItem[]
  compact?: boolean
}

const CATEGORY_ORDER: Category[] = ['bottom', 'shoes', 'top', 'bag', 'accessory']

export default function OutfitAvatar({ style, items = [], compact = false }: Props) {
  const itemByCategory = new Map<Category, CatalogItem>()
  CATEGORY_ORDER.forEach((category) => {
    const item = items.find((candidate) => candidate.category === category)
    if (item && item.color !== 'transparent') itemByCategory.set(category, item)
  })

  return (
    <View style={[styles.root, style]}>
      <Image source={BASE_AVATAR} style={styles.base} resizeMode="contain" />
      {Array.from(itemByCategory.entries()).map(([category, item]) => (
        <View
          key={`${category}-${item.id}`}
          style={[
            styles.layer,
            styles[category],
            compact && styles[`${category}Compact`],
            { backgroundColor: item.color },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  base: {
    width: '100%',
    height: '100%',
  },
  layer: {
    position: 'absolute',
    borderColor: 'rgba(0,0,0,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    opacity: 0.9,
  },
  accessory: {
    top: '13%',
    width: '28%',
    height: '8%',
    borderRadius: 8,
  },
  top: {
    top: '37%',
    width: '25%',
    height: '18%',
    borderRadius: 7,
  },
  bottom: {
    top: '54%',
    width: '24%',
    height: '15%',
    borderRadius: 5,
  },
  shoes: {
    bottom: '8%',
    width: '30%',
    height: '6%',
    borderRadius: 5,
  },
  bag: {
    top: '48%',
    right: '23%',
    width: '12%',
    height: '19%',
    borderRadius: 7,
  },
  accessoryCompact: {
    top: '14%',
    height: '7%',
  },
  topCompact: {
    top: '38%',
    height: '17%',
  },
  bottomCompact: {
    top: '54%',
    height: '14%',
  },
  shoesCompact: {
    bottom: '8%',
    height: '5%',
  },
  bagCompact: {
    right: '20%',
    width: '13%',
  },
})
