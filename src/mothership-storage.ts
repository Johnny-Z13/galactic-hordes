import {
  defaultMothershipState,
  normalizeMothershipState,
  type MothershipState
} from './mothership-progression'

export const MOTHERSHIP_STORAGE_KEY = 'galactic_hordes_mothership_v2'

interface MothershipStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export const loadMothershipState = (storage: Pick<MothershipStorage, 'getItem'>): MothershipState => {
  try {
    return normalizeMothershipState(JSON.parse(storage.getItem(MOTHERSHIP_STORAGE_KEY) || 'null'))
  } catch {
    return defaultMothershipState()
  }
}

export const saveMothershipState = (storage: MothershipStorage, state: MothershipState) => {
  storage.setItem(MOTHERSHIP_STORAGE_KEY, JSON.stringify(state))
}
