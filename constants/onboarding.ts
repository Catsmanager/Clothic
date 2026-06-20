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
    id: 'welcome',
    type: 'welcome',
    title: '나의 매일을\n기록하는 코디 다이어리',
    subtitle: '오늘의 코디와 기분, 날씨까지\n한 번에 기록해보세요.',
  },
  {
    id: 'capture',
    type: 'feature',
    badge: '01',
    title: '쉽고 빠르게\n코디를 기록해요',
    subtitle: '사진 또는 아바타로 간편하게\n오늘의 코디를 저장할 수 있어요.',
  },
  {
    id: 'memo',
    type: 'feature',
    badge: '02',
    title: '날씨와 기분,\n한 줄 메모까지',
    subtitle: '그날의 날씨, 기분, 한 줄 메모로\n나만의 하루를 기록해보세요.',
  },
  {
    id: 'closet',
    type: 'feature',
    badge: '03',
    title: '옷장을 관리하고\n활용해요',
    subtitle: "내 옷을 등록하고 '잠자는 옷장'에서\n안 입는 옷을 쉽게 확인해보세요.",
  },
  {
    id: 'report',
    type: 'feature',
    badge: '04',
    title: '통계와 리포트로\n나를 알아가요',
    subtitle: '월별 코디 통계와 자주 입는 아이템을\n확인하며 나만의 스타일을 찾아보세요.',
  },
  {
    id: 'start',
    type: 'final',
    title: '오늘부터\n나만의 스타일 여정을\n시작해볼까요? ✨',
    subtitle: '매일의 기록이 쌓여\n나만의 스타일이 완성돼요.',
  },
]
