import { View, Image, StyleSheet, Text } from 'react-native'
import { colors } from '../constants/colors'
import { spacing, radius } from '../constants/spacing'
import type { CatalogItem } from '../constants/items'
import OutfitAvatar from './OutfitAvatar'

// 아바타 뒤 방 배경 (오늘의 코디 카드)
const ROOM_BACKGROUND = require('../assets/avatar/background/room_01.png')
// 오늘 코디 미기록 시 보여주는 가려진(모자이크) 캐릭터.
// TODO(에셋): 현재는 base 복사본 플레이스홀더 — 디자이너가 픽셀화/모자이크 버전으로 교체 예정.
const MOSAIC_AVATAR = require('../assets/avatar/base/base_female_01_mosaic.png')

interface Props {
  // 오늘의 코디 아이템들. null이면 아직 기록 전(빈 상태).
  items: CatalogItem[] | null
}

export default function AvatarCard({ items }: Props) {
  const isEmpty = items == null

  return (
    <View style={styles.card}>
      {/* contain: 카드 높이가 화면에 맞춰 줄어도 방 배경 전체가 잘림 없이 보인다.
          여백은 카드 배경색(secondary)과 같아 자연스럽게 묻힌다. */}
      <Image source={ROOM_BACKGROUND} style={styles.background} resizeMode="contain" />

      {isEmpty && (
        <View style={styles.bubbleWrap} pointerEvents="none">
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>오늘의 코디를 기록해볼까요?</Text>
          </View>
          <View style={styles.bubbleTail} />
        </View>
      )}

      <View style={styles.avatarArea}>
        {isEmpty ? (
          <Image source={MOSAIC_AVATAR} style={styles.avatarImage} resizeMode="contain" />
        ) : (
          <OutfitAvatar style={styles.avatarImage} items={items} />
        )}
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
  bubbleWrap: {
    position: 'absolute',
    top: '14%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  bubbleTail: {
    marginTop: -5,
    width: 10,
    height: 10,
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    transform: [{ rotate: '45deg' }],
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
