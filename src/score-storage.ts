import type { DebriefReport } from './debrief-report'
import { scoreEntryFromRun, type ScoreEntry } from './score-history'

export const SCORE_STORAGE_KEY = 'galactic_hordes_high_scores_v1'
export const LEGACY_SCORE_STORAGE_KEYS = ['vector_shooter_high_scores']

interface ScoreStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

interface SaveScoreEntryInput {
  name: string
  score: number
  time: number
  level: number
  kills: number
  date: string
  debrief?: DebriefReport | null
}

const storageValueWithFallback = (storage: Pick<ScoreStorage, 'getItem'>, primaryKey: string, legacyKeys: string[]) => (
  storage.getItem(primaryKey) ?? legacyKeys.map((key) => storage.getItem(key)).find((value) => value !== null) ?? null
)

export const sanitizeScoreName = (value: string) => (
  value.toUpperCase().replace(/[^A-Z0-9 _-]/g, '').slice(0, 12).trim() || 'ACE'
)

export const loadScoreEntries = (storage: Pick<ScoreStorage, 'getItem'>): ScoreEntry[] => {
  try {
    return JSON.parse(storageValueWithFallback(storage, SCORE_STORAGE_KEY, LEGACY_SCORE_STORAGE_KEYS) || '[]') as ScoreEntry[]
  } catch {
    return []
  }
}

export const saveScoreEntry = (
  storage: ScoreStorage,
  entries: ScoreEntry[],
  input: SaveScoreEntryInput,
  limit = 10
) => {
  const entry = scoreEntryFromRun(input)
  const highs = [...entries, entry].sort((a, b) => b.score - a.score).slice(0, limit)
  storage.setItem(SCORE_STORAGE_KEY, JSON.stringify(highs))
  return highs
}
