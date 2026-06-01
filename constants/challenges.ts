// 챌린지 화면 mock 데이터 (잠자는 옷장과 동일하게 화면 우선 구현).
// 실제 진행도는 추후 코디 저장 데이터 기반으로 대체한다.

export type ChallengeIcon = 'calendar' | 'wardrobe' | 'hanger' | 'umbrella'
export type BadgeIcon = 'sprout' | 'calendar' | 'wardrobe' | 'umbrella' | 'lock'

export interface Challenge {
  id: string
  icon: ChallengeIcon
  title: string
  description: string
  current: number
  goal: number
}

export interface Badge {
  id: string
  icon: BadgeIcon
  name: string
  // 획득일(YY.MM.DD). 미획득 배지는 null.
  earnedAt: string | null
}

export interface ChallengeSummary {
  // 진행 중 챌린지 개수 안내 문구에 사용.
  activeCount: number
  streakDays: number
  weekRecorded: number
  weekGoal: number
}

export const CHALLENGE_SUMMARY: ChallengeSummary = {
  activeCount: 4,
  streakDays: 5,
  weekRecorded: 5,
  weekGoal: 7,
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'streak-7',
    icon: 'calendar',
    title: '7일 연속 기록하기',
    description: '7일 연속 코디를 기록해보세요.',
    current: 5,
    goal: 7,
  },
  {
    id: 'wake-sleeping',
    icon: 'wardrobe',
    title: '잠자는 옷 깨우기',
    description: '30일 이상 안 입은 옷을 입고 코디를 기록해보세요.',
    current: 0,
    goal: 1,
  },
  {
    id: 'new-combo',
    icon: 'hanger',
    title: '새로운 조합 만들기',
    description: '이번 달, 한 번도 입지 않은 조합을 만들어보세요.',
    current: 2,
    goal: 3,
  },
  {
    id: 'rainy-day',
    icon: 'umbrella',
    title: '비 오는 날 코디 기록하기',
    description: '비 오는 날의 코디를 기록해보세요.',
    current: 0,
    goal: 1,
  },
]

export const BADGES: Badge[] = [
  { id: 'first-record', icon: 'sprout', name: '첫 기록', earnedAt: '25.05.01' },
  { id: 'streak-7', icon: 'calendar', name: '7일 연속', earnedAt: '25.05.05' },
  { id: 'wake-sleeping', icon: 'wardrobe', name: '잠자는 옷 깨우기', earnedAt: '25.05.10' },
  { id: 'rainy-day', icon: 'umbrella', name: '비 오는 날', earnedAt: '25.05.12' },
  { id: 'style-explorer', icon: 'lock', name: '스타일 탐험가', earnedAt: null },
]
