import { useCallback } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'
import { ONBOARDING_SLIDES } from '../constants/onboarding'
import OnboardingControls from '../components/onboarding/OnboardingControls'
import { ONBOARDING_ILLUSTRATIONS } from '../components/onboarding/OnboardingIllustrations'
import OnboardingSlideView from '../components/onboarding/OnboardingSlideView'
import { ONBOARDING_SCREEN_WIDTH } from '../components/onboarding/layout'
import { useOnboardingPager } from '../hooks/useOnboardingPager'
import { useAuthStore } from '../stores/authStore'

export default function OnboardingScreen() {
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding)
  const { currentIndex, goNext, isFirst, isLast, listRef, onScroll } = useOnboardingPager({
    totalSlides: ONBOARDING_SLIDES.length,
  })

  const goStart = useCallback(async () => {
    await completeOnboarding()
    router.replace('/login')
  }, [completeOnboarding])

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {!isLast && (
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={goStart}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="온보딩 건너뛰기"
        >
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: ONBOARDING_SCREEN_WIDTH,
          offset: ONBOARDING_SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item, index }) => {
          const Illustration = ONBOARDING_ILLUSTRATIONS[index]
          return <OnboardingSlideView slide={item} Illustration={Illustration} />
        }}
      />

      <OnboardingControls
        currentIndex={currentIndex}
        isFirst={isFirst}
        isLast={isLast}
        totalSlides={ONBOARDING_SLIDES.length}
        onNext={goNext}
        onStart={goStart}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  skipBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.xl,
    zIndex: 10,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
  },
})
