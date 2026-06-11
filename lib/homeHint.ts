import { getStoredValue, setStoredValue } from './keyValueStore'

// 홈 화면 코디 만들기 힌트를 본 적 있는지 여부.
const HOME_CREATE_HINT_KEY = 'clothic_home_create_hint_seen'

export async function isHomeCreateHintSeen(): Promise<boolean> {
  return (await getStoredValue(HOME_CREATE_HINT_KEY)) === 'true'
}

export async function setHomeCreateHintSeen(): Promise<void> {
  await setStoredValue(HOME_CREATE_HINT_KEY, 'true')
}
