import { create } from 'zustand'
import type { ComponentProps } from 'react'
import type { Feather } from '@expo/vector-icons'
import type { Database } from '../lib/database.types'
import { supabase } from '../lib/supabase'
import { NOTIFICATION_TYPE_ICONS, type NotificationType } from '../constants/notifications'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

export interface AppNotificationRecord {
  id: string
  type: NotificationType
  icon: ComponentProps<typeof Feather>['name']
  title: string
  body: string
  time: string
  read: boolean
  createdAt: string
}

interface NotificationState {
  notifications: AppNotificationRecord[]
  loading: boolean
  error: string | null

  fetchNotifications: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  reset: () => void
}

function isNotificationType(value: string): value is NotificationType {
  return value === 'reminder' || value === 'wardrobe' || value === 'system'
}

function formatRelativeTime(value: string): string {
  const createdAt = new Date(value).getTime()
  const diffMs = Date.now() - createdAt
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (Number.isNaN(createdAt) || diffMs < minute) return '방금 전'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}분 전`
  if (diffMs < day) return `${Math.floor(diffMs / hour)}시간 전`
  if (diffMs < day * 7) return `${Math.floor(diffMs / day)}일 전`

  return new Date(value).toLocaleDateString('ko-KR')
}

// DB icon 값이 비어있거나 누락되면 타입별 기본 아이콘으로 폴백한다(깨진 아이콘 방지).
function resolveIcon(
  icon: string | null,
  type: NotificationType
): ComponentProps<typeof Feather>['name'] {
  if (typeof icon === 'string' && icon.trim().length > 0) {
    return icon as ComponentProps<typeof Feather>['name']
  }
  return NOTIFICATION_TYPE_ICONS[type]
}

function mapRow(row: NotificationRow): AppNotificationRecord | null {
  if (!isNotificationType(row.type)) return null

  return {
    id: row.id,
    type: row.type,
    icon: resolveIcon(row.icon, row.type),
    title: row.title,
    body: row.body,
    time: formatRelativeTime(row.created_at),
    read: row.read,
    createdAt: row.created_at,
  }
}

let storeGeneration = 0
let fetchSequence = 0
let mutationSequence = 0
const mutationVersions = new Map<string, number>()
const pendingReadValues = new Map<string, { version: number; value: boolean }>()
const blockedNotificationIds = new Map<string, number>()
const confirmedReadValues = new Map<string, boolean>()
const deletedNotificationIds = new Set<string>()

function beginMutation(id: string): number {
  const version = (mutationSequence += 1)
  mutationVersions.set(id, version)
  return version
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  reset: () => {
    storeGeneration += 1
    fetchSequence += 1
    mutationVersions.clear()
    pendingReadValues.clear()
    blockedNotificationIds.clear()
    confirmedReadValues.clear()
    deletedNotificationIds.clear()
    set({ notifications: [], loading: false, error: null })
  },

  fetchNotifications: async () => {
    const generation = storeGeneration
    const requestSequence = (fetchSequence += 1)
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      if (generation !== storeGeneration || requestSequence !== fetchSequence) return
      set({ loading: false, error: error.message })
      return
    }

    if (generation !== storeGeneration || requestSequence !== fetchSequence) return
    set({
      notifications: (data ?? [])
        .map(mapRow)
        .filter((item): item is AppNotificationRecord => item != null)
        .filter((item) => !blockedNotificationIds.has(item.id))
        .map((item) => {
          const pendingRead = pendingReadValues.get(item.id)
          if (pendingRead) return { ...item, read: pendingRead.value }
          confirmedReadValues.set(item.id, item.read)
          return item
        }),
      loading: false,
    })
  },

  markRead: async (id) => {
    const generation = storeGeneration
    const mutationVersion = beginMutation(id)
    const previousRead = get().notifications.find((item) => item.id === id)?.read
    if (previousRead !== undefined && !confirmedReadValues.has(id)) {
      confirmedReadValues.set(id, previousRead)
    }
    pendingReadValues.set(id, { version: mutationVersion, value: true })
    fetchSequence += 1
    set({
      loading: false,
      notifications: get().notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item
      ),
    })

    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
    if (generation !== storeGeneration) return
    if (!error && !deletedNotificationIds.has(id)) confirmedReadValues.set(id, true)
    if (mutationVersions.get(id) !== mutationVersion) {
      // 이 write가 더 최신인 fetch보다 늦게 끝났을 수 있으므로, 방금 확정된 DB 결과보다
      // 앞선 SELECT 응답은 폐기한다.
      fetchSequence += 1
      if (
        !pendingReadValues.has(id) &&
        !blockedNotificationIds.has(id) &&
        !deletedNotificationIds.has(id)
      ) {
        const confirmedRead = confirmedReadValues.get(id)
        if (confirmedRead !== undefined) {
          set({
            loading: false,
            notifications: get().notifications.map((item) =>
              item.id === id ? { ...item, read: confirmedRead } : item
            ),
          })
        }
      }
      set({ loading: false })
      return
    }
    fetchSequence += 1
    if (pendingReadValues.get(id)?.version === mutationVersion) pendingReadValues.delete(id)
    if (error) {
      const confirmedRead = confirmedReadValues.get(id)
      set({
        loading: false,
        notifications: get().notifications.map((item) =>
          item.id === id && confirmedRead !== undefined ? { ...item, read: confirmedRead } : item
        ),
        error: error.message,
      })
    }
  },

  markAllRead: async () => {
    const generation = storeGeneration
    const previous = get().notifications.map((item) => ({ id: item.id, read: item.read }))
    for (const item of previous) {
      if (!confirmedReadValues.has(item.id)) confirmedReadValues.set(item.id, item.read)
    }
    const versions = new Map(previous.map((item) => [item.id, beginMutation(item.id)]))
    for (const [id, version] of versions) {
      pendingReadValues.set(id, { version, value: true })
    }
    fetchSequence += 1
    set({
      notifications: get().notifications.map((item) => ({ ...item, read: true })),
      loading: false,
    })

    const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false)
    if (generation !== storeGeneration) return
    if (!error) {
      for (const { id } of previous) {
        if (!deletedNotificationIds.has(id)) confirmedReadValues.set(id, true)
      }
    }
    fetchSequence += 1
    for (const [id, version] of versions) {
      if (pendingReadValues.get(id)?.version === version) pendingReadValues.delete(id)
    }
    set({
      loading: false,
      notifications: get().notifications.map((item) => {
        if (pendingReadValues.has(item.id) || blockedNotificationIds.has(item.id)) return item
        const confirmedRead = confirmedReadValues.get(item.id)
        return confirmedRead === undefined ? item : { ...item, read: confirmedRead }
      }),
      ...(error ? { error: error.message } : {}),
    })
  },

  removeNotification: async (id) => {
    const generation = storeGeneration
    const mutationVersion = beginMutation(id)
    const previous = get().notifications
    const removedIndex = previous.findIndex((item) => item.id === id)
    const removed = removedIndex >= 0 ? previous[removedIndex] : undefined
    pendingReadValues.delete(id)
    blockedNotificationIds.set(id, mutationVersion)
    fetchSequence += 1
    set({ notifications: previous.filter((item) => item.id !== id), loading: false })

    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (generation !== storeGeneration) return
    if (mutationVersions.get(id) !== mutationVersion) return
    fetchSequence += 1
    if (error) {
      if (blockedNotificationIds.get(id) === mutationVersion) blockedNotificationIds.delete(id)
      const current = get().notifications
      if (!removed || current.some((item) => item.id === id)) {
        set({ error: error.message, loading: false })
        return
      }
      const next = [...current]
      const restoredRead = confirmedReadValues.get(id) ?? removed.read
      next.splice(Math.min(removedIndex, next.length), 0, { ...removed, read: restoredRead })
      set({ notifications: next, error: error.message, loading: false })
      return
    }
    deletedNotificationIds.add(id)
    confirmedReadValues.delete(id)
    pendingReadValues.delete(id)
  },
}))
