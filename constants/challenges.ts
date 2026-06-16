export type ChallengeIcon = 'calendar' | 'wardrobe' | 'hanger' | 'umbrella'
export type BadgeIcon = 'sprout' | 'calendar' | 'wardrobe' | 'umbrella' | 'compass'

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
