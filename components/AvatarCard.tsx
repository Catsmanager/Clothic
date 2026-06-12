import { View, Image, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'
import { spacing, radius } from '../constants/spacing'
import OutfitAvatar from './OutfitAvatar'

// 아바타 뒤 방 배경 (오늘의 코디 카드)
const ROOM_BACKGROUND = require('../assets/avatar/background/room_01.png')

export default function AvatarCard() {
  return (
    <View style={styles.card}>
      {/* contain: 카드 높이가 화면에 맞춰 줄어도 방 배경 전체가 잘림 없이 보인다.
          여백은 카드 배경색(secondary)과 같아 자연스럽게 묻힌다. */}
      <Image source={ROOM_BACKGROUND} style={styles.background} resizeMode="contain" />

      <View style={styles.avatarArea}>
        <OutfitAvatar style={styles.avatarImage} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: spacing.md,
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
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
