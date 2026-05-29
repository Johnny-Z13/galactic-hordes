import { expect, test } from '@playwright/test'
import { defaultMothershipState } from '../src/mothership-progression'

class MemoryStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

test('mothership storage normalizes saved Galactic Hordes command state', async () => {
  const {
    MOTHERSHIP_STORAGE_KEY,
    loadMothershipState
  } = await import('../src/mothership-storage')
  const storage = new MemoryStorage()

  storage.setItem(MOTHERSHIP_STORAGE_KEY, JSON.stringify({
    version: 1,
    resources: { scrap: 14.8, crystal: -4, cores: 2 },
    departments: { scanner: 99, workbench: 2.2, archive: 1 },
    archive: {
      records: {
        valid: { id: 'valid', kind: 'planet', title: 'LUX MORGUE', count: 3.6 },
        invalid: { id: 'invalid', kind: 'noise', title: 'Bad' }
      },
      relicBlueprints: { choir: 2.8 },
      signalFragments: 4.9
    }
  }))

  const state = loadMothershipState(storage)

  expect(state.resources).toEqual({ scrap: 14, crystal: 0, cores: 2 })
  expect(state.departments.scanner).toBe(4)
  expect(state.departments.workbench).toBe(2)
  expect(state.archive.records.valid).toEqual({ id: 'valid', kind: 'planet', title: 'LUX MORGUE', count: 3 })
  expect(state.archive.records.invalid).toBeUndefined()
  expect(state.archive.relicBlueprints).toEqual({ choir: 2 })
  expect(state.archive.signalFragments).toBe(4)
})

test('mothership storage falls back safely and writes canonical state', async () => {
  const {
    MOTHERSHIP_STORAGE_KEY,
    loadMothershipState,
    saveMothershipState
  } = await import('../src/mothership-storage')
  const storage = new MemoryStorage()
  const state = defaultMothershipState()

  storage.setItem(MOTHERSHIP_STORAGE_KEY, '{bad json')
  expect(loadMothershipState(storage)).toEqual(defaultMothershipState())

  state.resources.scrap = 240
  state.departments.scanner = 1
  saveMothershipState(storage, state)

  expect(JSON.parse(storage.getItem(MOTHERSHIP_STORAGE_KEY) ?? 'null')).toEqual(state)
})
