import { create } from 'zustand'
import type { ComponentProps } from 'react'
import type { Feather } from '@expo/vector-icons'
import type { Database } from '../lib/database.types'
import { supabase } from '../lib/supabase'
import type { NotificationType } from '../constants/notifications'

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

function mapRow(row: NotificationRow): AppNotificationRecord | null {
  if (!isNotificationType(row.type)) return null

  return {
    id: row.id,
    type: row.type,
    icon: row.icon as ComponentProps<typeof Feather>['name'],
    title: row.title,
    body: row.body,
    time: formatRelativeTime(row.created_at),
    read: row.read,
    createdAt: row.created_at,
  }
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      set({ loading: false, error: error.message })
      return
    }

    set({
      notifications: (data ?? [])
        .map(mapRow)
        .filter((item): item is AppNotificationRecord => item != null),
      loading: false,
    })
  },

  markRead: async (id) => {
    const prev = get().notifications
    set({ notifications: prev.map((item) => (item.id === id ? { ...item, read: true } : item)) })

    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
    if (error) set({ notifications: prev, error: error.message })
  },

  markAllRead: async () => {
    const prev = get().notifications
    set({ notifications: prev.map((item) => ({ ...item, read: true })) })

    const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false)
    if (error) set({ notifications: prev, error: error.message })
  },

  removeNotification: async (id) => {
    const prev = get().notifications
    set({ notifications: prev.filter((item) => item.id !== id) })

    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (error) set({ notifications: prev, error: error.message })
  },
}))
