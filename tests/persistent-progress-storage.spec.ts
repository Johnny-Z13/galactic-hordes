import { expect, test } from '@playwright/test'

class MemoryStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null
  }

  get length() {
    return this.values.size
  }
}

test('persistent progress storage clears Galactic Hordes and legacy progress keys only', async () => {
  const { clearPersistentProgressStorage } = await import('../src/persistent-progress-storage')
  const storage = new MemoryStorage()

  storage.setItem('galactic_hordes_high_scores_v1', 'scores')
  storage.setItem('vector_shooter_high_scores', 'legacy scores')
  storage.setItem('galactic_hordes_graphics_v1', 'GLOW')
  storage.setItem('vector_shooter_graphics', 'LOW')
  storage.setItem('galactic_hordes_mothership_v2', 'ship')
  storage.setItem('galactic_hordes_future_flag', 'future')
  storage.setItem('other_game_save', 'keep')

  clearPersistentProgressStorage(storage)

  expect(storage.getItem('galactic_hordes_high_scores_v1')).toBeNull()
  expect(storage.getItem('vector_shooter_high_scores')).toBeNull()
  expect(storage.getItem('galactic_hordes_graphics_v1')).toBeNull()
  expect(storage.getItem('vector_shooter_graphics')).toBeNull()
  expect(storage.getItem('galactic_hordes_mothership_v2')).toBeNull()
  expect(storage.getItem('galactic_hordes_future_flag')).toBeNull()
  expect(storage.getItem('other_game_save')).toBe('keep')
})

test('persistent progress storage reads current keys before legacy fallbacks', async () => {
  const {
    GRAPHICS_STORAGE_KEY,
    LEGACY_GRAPHICS_STORAGE_KEYS,
    storageValueWithFallback
  } = await import('../src/persistent-progress-storage')
  const storage = new MemoryStorage()

  storage.setItem(LEGACY_GRAPHICS_STORAGE_KEYS[0], 'LOW')
  expect(storageValueWithFallback(storage, GRAPHICS_STORAGE_KEY, LEGACY_GRAPHICS_STORAGE_KEYS)).toBe('LOW')

  storage.setItem(GRAPHICS_STORAGE_KEY, 'GLOW')
  expect(storageValueWithFallback(storage, GRAPHICS_STORAGE_KEY, LEGACY_GRAPHICS_STORAGE_KEYS)).toBe('GLOW')
})
