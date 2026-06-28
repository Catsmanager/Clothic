import { useEffect, useState } from 'react'
import { Animated, Easing, View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import type { AvatarBackground } from '../constants/avatarBackgrounds'
import { colors } from '../constants/colors'
import { spacing, radius } from '../constants/spacing'
import type { CatalogItem } from '../constants/items'
import OutfitAvatar from './OutfitAvatar'

// 오늘 코디 미기록 시 보여주는 가려진(모자이크) 캐릭터.
// TODO(에셋): 현재는 base 복사본 플레이스홀더 — 디자이너가 픽셀화/모자이크 버전으로 교체 예정.
const MOSAIC_AVATAR = require('../assets/avatar/base/base_female_01_mosaic.png')

interface Props {
  // 오늘의 코디 아이템들. null이면 아직 기록 전(빈 상태).
  items: CatalogItem[] | null
  // 저장 직후 홈으로 돌아왔을 때 짧게 보여주는 성공 피드백.
  savedFeedback?: boolean
  background: AvatarBackground
  onBackgroundPress: () => void
}

export default function AvatarCard({
  items,
  savedFeedback = false,
  background,
  onBackgroundPress,
}: Props) {
  const [bubbleProgress] = useState(() => new Animated.Value(1))
  const [sparkleProgress] = useState(() => new Animated.Value(0))
  const isEmpty = items == null
  const showBubble = isEmpty || savedFeedback
  const bubbleMessage = savedFeedback ? '오늘의 코디 저장 완료!' : '오늘의 코디를 기록해볼까요?'

  useEffect(() => {
    if (!savedFeedback) return

    bubbleProgress.setValue(0)
    sparkleProgress.setValue(0)

    Animated.parallel([
      Animated.timing(bubbleProgress, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(sparkleProgress, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleProgress, {
          toValue: 0,
          duration: 1200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }, [bubbleProgress, savedFeedback, sparkleProgress])

  const animatedBubbleStyle = savedFeedback
    ? {
        opacity: bubbleProgress,
        transform: [
          {
            scale: bubbleProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
          {
            translateY: bubbleProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [8, 0],
            }),
          },
        ],
      }
    : null
  const sparkleStyle = {
    opacity: sparkleProgress,
    transform: [
      {
        scale: sparkleProgress.interpolate({
          inputRange: [0, 0.35, 1],
          outputRange: [0.35, 1.45, 0.65],
        }),
      },
    ],
  }
  const glowStyle = {
    opacity: sparkleProgress.interpolate({
      inputRange: [0, 0.35, 1],
      outputRange: [0, 0.55, 0],
    }),
    transform: [
      {
        scale: sparkleProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.72, 1.32],
        }),
      },
    ],
  }

  return (
    <View style={[styles.card, { backgroundColor: background.color }]}>
      <Image
        source={background.image}
        style={styles.background}
        resizeMode={background.resizeMode}
      />

      <TouchableOpacity
        style={styles.backgroundButton}
        onPress={onBackgroundPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="배경 변경"
      >
        <Feather name="image" size={17} color={colors.text} />
      </TouchableOpacity>

      {showBubble && (
        <Animated.View style={[styles.bubbleWrap, animatedBubbleStyle]} pointerEvents="none">
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{bubbleMessage}</Text>
          </View>
          <View style={styles.bubbleTail} />
        </Animated.View>
      )}

      {savedFeedback && (
        <View style={styles.sparkleLayer} pointerEvents="none">
          <Animated.View style={[styles.successGlow, glowStyle]} />
          <Animated.View style={[styles.sparkle, styles.sparkleOne, sparkleStyle]} />
          <Animated.View style={[styles.sparkle, styles.sparkleTwo, sparkleStyle]} />
          <Animated.View style={[styles.sparkleSmall, styles.sparkleThree, sparkleStyle]} />
          <Animated.View style={[styles.sparkleSmall, styles.sparkleFour, sparkleStyle]} />
          <Animated.View style={[styles.sparkle, styles.sparkleFive, sparkleStyle]} />
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
  backgroundButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 3,
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bubbleWrap: {
    position: 'absolute',
    top: '24%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  bubble: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    maxWidth: '82%',
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
  sparkleLayer: {
    position: 'absolute',
    top: '24%',
    left: 0,
    right: 0,
    height: '36%',
    zIndex: 1,
  },
  successGlow: {
    position: 'absolute',
    left: '24%',
    right: '24%',
    top: '20%',
    bottom: '0%',
    borderRadius: 999,
    backgroundColor: '#FFDFA3',
    shadowColor: '#F0B45C',
    shadowOpacity: 0.5,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
  },
  sparkle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F7C948',
    shadowColor: '#F7C948',
    shadowOpacity: 0.7,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  sparkleSmall: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F7C948',
  },
  sparkleOne: {
    left: '24%',
    top: '24%',
  },
  sparkleTwo: {
    right: '22%',
    top: '42%',
  },
  sparkleThree: {
    left: '66%',
    top: '10%',
  },
  sparkleFour: {
    left: '18%',
    top: '58%',
  },
  sparkleFive: {
    right: '35%',
    top: '70%',
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
