import type { ImageResizeMode, ImageSourcePropType } from 'react-native'

export type AvatarBackgroundId =
  | 'room'
  | 'gardenDay'
  | 'gardenEvening'
  | 'alleyEvening'
  | 'parkEvening'
  | 'cafe'
  | 'houseEvening'

export interface AvatarBackground {
  id: AvatarBackgroundId
  label: string
  color: string
  image: ImageSourcePropType
  resizeMode: ImageResizeMode
}

export const AVATAR_BACKGROUNDS: AvatarBackground[] = [
  {
    id: 'room',
    label: '룸',
    color: '#F4EEE8',
    image: require('../assets/avatar/background/room_01.png'),
    resizeMode: 'contain',
  },
  {
    id: 'gardenDay',
    label: '정원 낮',
    color: '#F7EFE3',
    image: require('../assets/avatar/background/garden_day.png'),
    resizeMode: 'cover',
  },
  {
    id: 'gardenEvening',
    label: '정원 저녁',
    color: '#A96858',
    image: require('../assets/avatar/background/garden_evening.png'),
    resizeMode: 'cover',
  },
  {
    id: 'alleyEvening',
    label: '골목 저녁',
    color: '#E7C3A0',
    image: require('../assets/avatar/background/alley_evening.png'),
    resizeMode: 'cover',
  },
  {
    id: 'parkEvening',
    label: '공원 저녁',
    color: '#D7A87C',
    image: require('../assets/avatar/background/park_evening.png'),
    resizeMode: 'cover',
  },
  {
    id: 'cafe',
    label: '카페',
    color: '#E8C39A',
    image: require('../assets/avatar/background/cafe.png'),
    resizeMode: 'cover',
  },
  {
    id: 'houseEvening',
    label: '집 앞 저녁',
    color: '#8A5846',
    image: require('../assets/avatar/background/house_evening.png'),
    resizeMode: 'cover',
  },
]

export const DEFAULT_AVATAR_BACKGROUND_ID: AvatarBackgroundId = 'room'

export function getAvatarBackground(id: AvatarBackgroundId): AvatarBackground {
  return AVATAR_BACKGROUNDS.find((background) => background.id === id) ?? AVATAR_BACKGROUNDS[0]
}
