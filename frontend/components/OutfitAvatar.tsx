import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { RENDER_ORDER, type CatalogItem } from '../constants/items'
import { getItemImageSource, getItemLayerOrder, getItemLayerStyle } from '../lib/itemVisuals'

const BASE_AVATAR = require('../assets/avatar/base/base_female_01.png')

interface Props {
  style: StyleProp<ViewStyle>
  items?: CatalogItem[]
}

export default function OutfitAvatar({ style, items = [] }: Props) {
  const layeredItems = items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => getRenderOrder(a.item) - getRenderOrder(b.item) || a.index - b.index)
    .map(({ item }) => item)

  return (
    <View style={[styles.root, style]}>
      <Image
        source={BASE_AVATAR}
        style={styles.layerImage}
        resizeMode="contain"
        accessible={false}
      />
      {layeredItems.map((item) => {
        const source = getItemImageSource(item)
        if (source == null) return null

        return (
          <Image
            key={item.id}
            source={source}
            style={[styles.layerImage, getItemLayerStyle(item)]}
            resizeMode="contain"
            accessible={false}
          />
        )
      })}
    </View>
  )
}

function getRenderOrder(item: CatalogItem): number {
  const itemOrder = getItemLayerOrder(item)
  if (itemOrder != null) return itemOrder

  return RENDER_ORDER.indexOf(item.category)
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  layerImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
})
