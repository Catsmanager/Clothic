import { useCallback, useRef, useState } from 'react'
import { FlatList, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native'
import type { OnboardingSlide } from '../constants/onboarding'
import { ONBOARDING_SCREEN_WIDTH } from '../components/onboarding/layout'

interface Options {
  totalSlides: number
}

export function useOnboardingPager({ totalSlides }: Options) {
  const listRef = useRef<FlatList<OnboardingSlide>>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / ONBOARDING_SCREEN_WIDTH)
    setCurrentIndex((prev) => (prev === index ? prev : index))
  }, [])

  const goNext = useCallback(() => {
    const next = Math.min(currentIndex + 1, totalSlides - 1)
    if (next === currentIndex) return
    setCurrentIndex(next)
    listRef.current?.scrollToOffset({
      offset: next * ONBOARDING_SCREEN_WIDTH,
      animated: true,
    })
  }, [currentIndex, totalSlides])

  return {
    currentIndex,
    goNext,
    isFirst: currentIndex === 0,
    isLast: currentIndex === totalSlides - 1,
    listRef,
    onScroll,
  }
}
