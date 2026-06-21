import type { ComponentProps } from 'react'
import type { Feather } from '@expo/vector-icons'

// 인앱 알림센터 데이터(mock).
// 챌린지 진행 알림은 제외한다(요청).
export type NotificationType = 'reminder' | 'wardrobe' | 'system'

export interface AppNotification {
  id: string
  type: NotificationType
  icon: ComponentProps<typeof Feather>['name']
  title: string
  body: string
  // 상대 시간 표시용 문자열(mock)
  time: string
  read: boolean
}

// 타입별 기본 아이콘. DB의 icon 값이 비어있거나 누락된 경우 폴백으로 사용한다.
export const NOTIFICATION_TYPE_ICONS: Record<
  NotificationType,
  ComponentProps<typeof Feather>['name']
> = {
  reminder: 'edit-3',
  wardrobe: 'archive',
  system: 'bell',
}

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'reminder',
    icon: 'edit-3',
    title: '오늘의 코디를 기록해보세요',
    body: '아직 오늘 코디를 남기지 않았어요. 지금 기록해볼까요?',
    time: '방금 전',
    read: false,
  },
  {
    id: 'n2',
    type: 'wardrobe',
    icon: 'archive',
    title: '잠자는 옷장 알림',
    body: '30일 넘게 입지 않은 아이템이 5개 있어요. 옷장을 확인해보세요.',
    time: '2시간 전',
    read: false,
  },
  {
    id: 'n3',
    type: 'system',
    icon: 'bell',
    title: 'Clothic에 오신 걸 환영해요',
    body: '매일의 코디를 기록하고 월간 통계로 패션 습관을 분석해보세요.',
    time: '어제',
    read: true,
  },
]
