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
import { getStoredValue, setStoredValue } from './keyValueStore'

// 홈 화면 코디 만들기 힌트를 본 적 있는지 여부.
const HOME_CREATE_HINT_KEY = 'clothic_home_create_hint_seen'

export async function isHomeCreateHintSeen(): Promise<boolean> {
  return (await getStoredValue(HOME_CREATE_HINT_KEY)) === 'true'
}

export async function setHomeCreateHintSeen(): Promise<void> {
  await setStoredValue(HOME_CREATE_HINT_KEY, 'true')
}
