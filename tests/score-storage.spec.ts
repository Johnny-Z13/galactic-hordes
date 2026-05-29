import { expect, test } from '@playwright/test'

class MemoryStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

test('score storage reads Galactic Hordes scores with legacy fallback', async () => {
  const {
    LEGACY_SCORE_STORAGE_KEYS,
    SCORE_STORAGE_KEY,
    loadScoreEntries
  } = await import('../src/score-storage')
  const storage = new MemoryStorage()

  storage.setItem(LEGACY_SCORE_STORAGE_KEYS[0], JSON.stringify([
    { name: 'OLD', score: 400, time: 120, level: 2, kills: 20, date: '2026-05-27T10:00:00.000Z' }
  ]))
  expect(loadScoreEntries(storage)).toHaveLength(1)

  storage.setItem(SCORE_STORAGE_KEY, JSON.stringify([
    { name: 'NEW', score: 900, time: 240, level: 4, kills: 80, date: '2026-05-28T10:00:00.000Z' }
  ]))
  expect(loadScoreEntries(storage).map((entry) => entry.name)).toEqual(['NEW'])
})

test('score storage sanitizes pilot names and keeps the top ten sorted scores', async () => {
  const {
    SCORE_STORAGE_KEY,
    saveScoreEntry,
    sanitizeScoreName
  } = await import('../src/score-storage')
  const storage = new MemoryStorage()
  const existing = Array.from({ length: 10 }, (_, index) => ({
    name: `P${index}`,
    score: 1000 - index * 50,
    time: 90,
    level: 1,
    kills: index,
    date: '2026-05-28T10:00:00.000Z'
  }))

  expect(sanitizeScoreName(' nova!* pilot  ')).toBe('NOVA PILOT')

  const highs = saveScoreEntry(storage, existing, {
    name: sanitizeScoreName('ace'),
    score: 975.9,
    time: 180,
    level: 3,
    kills: 44,
    date: '2026-05-29T10:00:00.000Z',
    debrief: null
  })

  expect(highs).toHaveLength(10)
  expect(highs.map((entry) => entry.score).slice(0, 3)).toEqual([1000, 975, 950])
  expect(JSON.parse(storage.getItem(SCORE_STORAGE_KEY) ?? '[]')).toEqual(highs)
})
