import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { radius } from '../constants/spacing'
import {
  getItemImageSource,
  getItemPreviewImageStyle,
  type ItemVisualInput,
} from '../lib/itemVisuals'

interface Props {
  item: ItemVisualInput
  size: number
  fallbackStyle?: StyleProp<ViewStyle>
}

export default function ItemPreviewThumb({ item, size, fallbackStyle }: Props) {
  const source = getItemImageSource(item)

  if (source == null) {
    return (
      <View
        style={[
          styles.colorBox,
          {
            width: size * 0.65,
            height: size * 0.65,
            backgroundColor: item.color,
          },
          fallbackStyle,
        ]}
      />
    )
  }

  return (
    <Image
      source={source}
      style={[styles.image, getItemPreviewImageStyle(item, size)]}
      resizeMode="contain"
    />
  )
}

const styles = StyleSheet.create({
  colorBox: {
    borderRadius: radius.sm,
  },
  image: {
    position: 'absolute',
    alignSelf: 'center',
  },
})
