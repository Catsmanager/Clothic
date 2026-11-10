import { getStoredValue, setStoredValue } from './keyValueStore'

// 온보딩 완료 여부 플래그.
const ONBOARDING_KEY = 'clothic_onboarding_done'

export async function isOnboardingDone(): Promise<boolean> {
  return (await getStoredValue(ONBOARDING_KEY)) === 'true'
}

export async function setOnboardingDone(): Promise<void> {
  await setStoredValue(ONBOARDING_KEY, 'true')
}
