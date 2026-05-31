import { Image, type ImageStyle, type StyleProp } from 'react-native'

const BASE_AVATAR = require('../assets/avatar/base/base_female_01.png')

interface Props {
  style: StyleProp<ImageStyle>
}

export default function OutfitAvatar({ style }: Props) {
  return <Image source={BASE_AVATAR} style={style} resizeMode="contain" />
}
