import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  currentIndex: number
  isFirst: boolean
  isLast: boolean
  totalSlides: number
  onNext: () => void
  onStart: () => void
}

export default function OnboardingControls({
  currentIndex,
  isFirst,
  isLast,
  totalSlides,
  onNext,
  onStart,
}: Props) {
  const dots = (
    <View style={styles.dots}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <View key={index} style={[styles.dot, index === currentIndex && styles.dotActive]} />
      ))}
    </View>
  )

  if (isFirst) {
    return (
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.startBtn} onPress={onNext} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>시작하기</Text>
        </TouchableOpacity>
        {dots}
      </View>
    )
  }

  if (isLast) {
    return (
      <View style={styles.bottom}>
        {dots}
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>시작하기</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.bottom}>
      <View style={styles.featureBottom}>
        {dots}
        <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.85}>
          <Feather name="arrow-right" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  featureBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.text,
  },
  startBtn: {
    backgroundColor: colors.text,
    borderRadius: radius.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  nextBtn: {
    width: 54,
    height: 54,
    borderRadius: radius.full,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
