import type { ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../constants/colors'
import type { OnboardingSlide } from '../../constants/onboarding'
import { radius, spacing } from '../../constants/spacing'
import { ONBOARDING_SCREEN_WIDTH } from './layout'

interface Props {
  Illustration: () => ReactElement
  slide: OnboardingSlide
}

export default function OnboardingSlideView({ Illustration, slide }: Props) {
  if (slide.type === 'final') {
    return (
      <View style={styles.slide}>
        <View style={styles.illustArea}>
          <Illustration />
        </View>
        <View style={styles.textBlockFinal}>
          <Text style={styles.titleCenter}>{slide.title}</Text>
          <Text style={styles.subtitleCenter}>{slide.subtitle}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.slide}>
      {slide.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{slide.badge}</Text>
        </View>
      )}
      <View style={styles.textBlock}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>
      <View style={styles.illustArea}>
        <Illustration />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  slide: {
    width: ONBOARDING_SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  textBlock: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  textBlockFinal: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 36,
  },
  titleCenter: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  subtitleCenter: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: 'center',
  },
  illustArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
