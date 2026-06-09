import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const HOME_CREATE_HINT_KEY = 'clothic_home_create_hint_seen'

const isWeb = Platform.OS === 'web'

export async function isHomeCreateHintSeen(): Promise<boolean> {
  if (isWeb) {
    return globalThis.localStorage?.getItem(HOME_CREATE_HINT_KEY) === 'true'
  }

  const value = await SecureStore.getItemAsync(HOME_CREATE_HINT_KEY)
  return value === 'true'
}

export async function setHomeCreateHintSeen(): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(HOME_CREATE_HINT_KEY, 'true')
    return
  }

  await SecureStore.setItemAsync(HOME_CREATE_HINT_KEY, 'true')
}
