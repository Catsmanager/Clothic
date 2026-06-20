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
      <View style={[styles.slide, styles.finalSlide]}>
        <View style={styles.finalIllustArea}>
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
    paddingTop: spacing.xxl,
  },
  finalSlide: {
    justifyContent: 'flex-start',
    paddingTop: spacing.xl,
  },
  badge: {
    width: 58,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textMuted,
  },
  textBlock: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  textBlockFinal: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 45,
  },
  titleCenter: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 42,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textMuted,
    lineHeight: 34,
  },
  subtitleCenter: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textMuted,
    lineHeight: 32,
    textAlign: 'center',
  },
  illustArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  finalIllustArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
})
