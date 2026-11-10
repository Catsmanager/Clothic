import type { ComponentProps } from 'react'
import type { Feather } from '@expo/vector-icons'

// 인앱 알림센터 타입 정의. 실제 데이터는 Supabase(useNotificationStore)에서 가져온다.
// 챌린지 진행 알림은 제외한다(요청).
export type NotificationType = 'reminder' | 'wardrobe' | 'system'

export interface AppNotification {
  id: string
  type: NotificationType
  icon: ComponentProps<typeof Feather>['name']
  title: string
  body: string
  // 상대 시간 표시용 문자열
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
