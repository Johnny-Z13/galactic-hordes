import { MOTHERSHIP_STORAGE_KEY } from './mothership-storage'
import { LEGACY_SCORE_STORAGE_KEYS, SCORE_STORAGE_KEY } from './score-storage'

export const GRAPHICS_STORAGE_KEY = 'galactic_hordes_graphics_v1'
export const LEGACY_GRAPHICS_STORAGE_KEYS = ['vector_shooter_graphics']

interface PersistentProgressStorage {
  getItem(key: string): string | null
  removeItem(key: string): void
  key(index: number): string | null
  length: number
}

export const storageValueWithFallback = (
  storage: Pick<PersistentProgressStorage, 'getItem'>,
  primaryKey: string,
  legacyKeys: string[]
) => (
  storage.getItem(primaryKey) ?? legacyKeys.map((key) => storage.getItem(key)).find((value) => value !== null) ?? null
)

export const clearPersistentProgressStorage = (storage: PersistentProgressStorage) => {
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter((key): key is string => key !== null)
  for (const key of keys) {
    if (
      key === SCORE_STORAGE_KEY
      || LEGACY_SCORE_STORAGE_KEYS.includes(key)
      || key === GRAPHICS_STORAGE_KEY
      || LEGACY_GRAPHICS_STORAGE_KEYS.includes(key)
      || key === MOTHERSHIP_STORAGE_KEY
      || key.startsWith('galactic_hordes_')
    ) {
      storage.removeItem(key)
    }
  }
}
