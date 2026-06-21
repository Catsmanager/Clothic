import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AccessibilityInfo,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import type { OnboardingSlide } from '../constants/onboarding'
import { ONBOARDING_SCREEN_WIDTH } from '../components/onboarding/layout'

interface Options {
  totalSlides: number
}

export function useOnboardingPager({ totalSlides }: Options) {
  const listRef = useRef<FlatList<OnboardingSlide>>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  // '동작 줄이기'(reduced motion) 설정 시 슬라이드 전환 애니메이션을 끈다.
  const reduceMotionRef = useRef(false)

  useEffect(() => {
    let mounted = true
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) reduceMotionRef.current = enabled
    })
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      reduceMotionRef.current = enabled
    })
    return () => {
      mounted = false
      subscription.remove()
    }
  }, [])

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
      animated: !reduceMotionRef.current,
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
