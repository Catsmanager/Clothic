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
