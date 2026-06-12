import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface NotificationPrefs {
  dailyReminder: boolean
  sleepingWardrobe: boolean
}

interface NotificationPrefsState extends NotificationPrefs {
  loading: boolean
  fetchPrefs: () => Promise<void>
  updatePref: (key: keyof NotificationPrefs, value: boolean) => Promise<void>
}

export const useNotificationPrefsStore = create<NotificationPrefsState>((set, get) => ({
  dailyReminder: true,
  sleepingWardrobe: false,
  loading: false,

  fetchPrefs: async () => {
    set({ loading: true })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      set({ loading: false })
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('daily_reminder_enabled, sleeping_wardrobe_enabled')
      .eq('id', user.id)
      .single()

    if (data) {
      set({
        dailyReminder: data.daily_reminder_enabled,
        sleepingWardrobe: data.sleeping_wardrobe_enabled,
      })
    }
    set({ loading: false })
  },

  updatePref: async (key, value) => {
    const prev = { dailyReminder: get().dailyReminder, sleepingWardrobe: get().sleepingWardrobe }

    // optimistic update
    set({ [key]: value })

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      set(prev)
      return
    }

    const updateData =
      key === 'dailyReminder'
        ? { daily_reminder_enabled: value }
        : { sleeping_wardrobe_enabled: value }

    const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id)

    if (error) set(prev)
  },
}))
