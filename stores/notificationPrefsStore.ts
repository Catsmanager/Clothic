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
  reset: () => void
}

let storeGeneration = 0
let fetchSequence = 0
let mutationSequence = 0
const mutationVersions = new Map<keyof NotificationPrefs, number>()
const mutationQueues = new Map<keyof NotificationPrefs, Promise<void>>()
const pendingValues = new Map<keyof NotificationPrefs, { version: number; value: boolean }>()
const confirmedValues = new Map<keyof NotificationPrefs, boolean>()

function beginMutation(key: keyof NotificationPrefs): number {
  const version = (mutationSequence += 1)
  mutationVersions.set(key, version)
  return version
}

async function enqueueMutation<T>(
  key: keyof NotificationPrefs,
  operation: () => Promise<T>
): Promise<T> {
  const previous = mutationQueues.get(key) ?? Promise.resolve()
  const queued = previous.then(operation, operation)
  const completion = queued.then(
    () => undefined,
    () => undefined
  )
  mutationQueues.set(key, completion)

  try {
    return await queued
  } finally {
    if (mutationQueues.get(key) === completion) mutationQueues.delete(key)
  }
}

export const useNotificationPrefsStore = create<NotificationPrefsState>((set, get) => ({
  dailyReminder: true,
  sleepingWardrobe: false,
  loading: false,

  reset: () => {
    storeGeneration += 1
    fetchSequence += 1
    mutationVersions.clear()
    mutationQueues.clear()
    pendingValues.clear()
    confirmedValues.clear()
    set({ dailyReminder: true, sleepingWardrobe: false, loading: false })
  },

  fetchPrefs: async () => {
    const generation = storeGeneration
    const requestSequence = (fetchSequence += 1)
    set({ loading: true })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (generation !== storeGeneration || requestSequence !== fetchSequence) return
    if (!user) {
      set({ loading: false })
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('daily_reminder_enabled, sleeping_wardrobe_enabled')
      .eq('id', user.id)
      .single()

    if (generation !== storeGeneration || requestSequence !== fetchSequence) return
    if (data) {
      if (!pendingValues.has('dailyReminder')) {
        confirmedValues.set('dailyReminder', data.daily_reminder_enabled)
      }
      if (!pendingValues.has('sleepingWardrobe')) {
        confirmedValues.set('sleepingWardrobe', data.sleeping_wardrobe_enabled)
      }
      set({
        dailyReminder: pendingValues.get('dailyReminder')?.value ?? data.daily_reminder_enabled,
        sleepingWardrobe:
          pendingValues.get('sleepingWardrobe')?.value ?? data.sleeping_wardrobe_enabled,
        loading: false,
      })
      return
    }
    set({ loading: false })
  },

  updatePref: async (key, value) => {
    const generation = storeGeneration
    const mutationVersion = beginMutation(key)
    const previousValue = get()[key]
    if (!confirmedValues.has(key)) confirmedValues.set(key, previousValue)
    pendingValues.set(key, { version: mutationVersion, value })
    fetchSequence += 1

    // optimistic update
    set({ [key]: value, loading: false })

    const updateData =
      key === 'dailyReminder'
        ? { daily_reminder_enabled: value }
        : { sleeping_wardrobe_enabled: value }

    const errorMessage = await enqueueMutation(key, async () => {
      if (generation !== storeGeneration) return null
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (generation !== storeGeneration) return null
      if (!user) return '로그인이 필요합니다.'

      const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id)
      if (!error && generation === storeGeneration) confirmedValues.set(key, value)
      return error?.message ?? null
    })

    if (generation !== storeGeneration) return
    if (mutationVersions.get(key) !== mutationVersion) return
    fetchSequence += 1
    if (pendingValues.get(key)?.version === mutationVersion) pendingValues.delete(key)
    if (errorMessage) {
      set({ [key]: confirmedValues.get(key) ?? previousValue, loading: false })
    }
  },
}))
