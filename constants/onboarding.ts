export type OnboardingSlideType = 'welcome' | 'feature' | 'final'

export interface OnboardingSlide {
  id: string
  type: OnboardingSlideType
  badge?: string
  title: string
  subtitle: string
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 's0',
    type: 'welcome',
    title: '나의 매일을\n기록하는 코디 다이어리',
    subtitle: '오늘의 코디와 기분, 날씨까지\n한 번에 기록해보세요.',
  },
  {
    id: 's1',
    type: 'feature',
    badge: '01',
    title: '쉽고 빠르게\n코디를 기록해요',
    subtitle: '사진 또는 아바타로 간편하게\n오늘의 코디를 저장할 수 있어요.',
  },
  {
    id: 's2',
    type: 'feature',
    badge: '02',
    title: '날씨와 기분,\n한 줄 메모까지',
    subtitle: '그날의 날씨, 기분, 한 줄 메모로\n나만의 하루를 기록해보세요.',
  },
  {
    id: 's3',
    type: 'feature',
    badge: '03',
    title: '옷장을 관리하고\n활용해요',
    subtitle: "내 옷을 등록하고 '잠자는 옷장'에서\n안 입는 옷을 쉽게 확인해보세요.",
  },
  {
    id: 's4',
    type: 'feature',
    badge: '04',
    title: '통계와 리포트로\n나를 알아가요',
    subtitle: '월별 코디 통계와 자주 입는 아이템을\n확인하며 나만의 스타일을 찾아보세요.',
  },
  {
    id: 's5',
    type: 'final',
    title: '오늘부터\n나만의 스타일 여정을\n시작해볼까요? ✨',
    subtitle: '매일의 기록이 쌓여\n나만의 스타일이 완성돼요.',
  },
]

export const COLOR_STATS: { name: string; pct: string; color: string }[] = [
  { name: 'Black', pct: '42%', color: '#1C1C1C' },
  { name: 'Gray', pct: '21%', color: '#8A8A8A' },
  { name: 'White', pct: '15%', color: '#E8E8E8' },
  { name: 'Beige', pct: '10%', color: '#D4C4A8' },
  { name: 'Pink', pct: '12%', color: '#E8C4C4' },
]

export const TOP_ITEMS: { emoji: string; name: string; count: string }[] = [
  { emoji: '👢', name: '블랙 롱 부츠', count: '12회' },
  { emoji: '🧥', name: '네이비 후드', count: '10회' },
  { emoji: '👚', name: '슬리브리스', count: '8회' },
]

export const CONFETTI: { emoji: string; top: number; left: number; size: number }[] = [
  { emoji: '✨', top: 6, left: 20, size: 18 },
  { emoji: '🌸', top: 0, left: 70, size: 16 },
  { emoji: '💛', top: 24, left: 88, size: 16 },
  { emoji: '🔶', top: 60, left: 8, size: 14 },
  { emoji: '💫', top: 90, left: 90, size: 16 },
  { emoji: '🌼', top: 120, left: 4, size: 14 },
  { emoji: '✦', top: 40, left: 50, size: 14 },
]
