import { View, Image, StyleSheet, Dimensions } from 'react-native'
import { colors } from '../constants/colors'
import { spacing, radius } from '../constants/spacing'
import OutfitAvatar from './OutfitAvatar'

// 방 배경 이미지 원본 크기 (가로 x 세로)
const ROOM_IMAGE_WIDTH = 1023
const ROOM_IMAGE_HEIGHT = 1537

const CARD_WIDTH = Dimensions.get('window').width - spacing.md * 2
// 카드 높이를 배경 이미지 비율에 맞춰 고정 → 배경 전체가 잘림 없이 보인다
const CARD_HEIGHT = Math.round((CARD_WIDTH * ROOM_IMAGE_HEIGHT) / ROOM_IMAGE_WIDTH)

// 아바타 뒤 방 배경 (오늘의 코디 카드)
const ROOM_BACKGROUND = require('../assets/avatar/background/room_01.png')

export default function AvatarCard() {
  return (
    <View style={styles.card}>
      <Image source={ROOM_BACKGROUND} style={styles.background} resizeMode="cover" />

      <View style={styles.avatarArea}>
        <OutfitAvatar style={styles.avatarImage} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  avatarArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: '6%',
  },
  avatarImage: {
    width: '55%',
    height: '70%',
  },
})
