import type { ResourceBundle, RunOutcomeKind } from './mothership-progression'

export interface ScoreEntry {
  name: string
  score: number
  time: number
  level: number
  kills: number
  date: string
  outcome?: RunOutcomeKind
  journeyTitle?: string
  lightYears?: number
  resources?: ResourceBundle
  highlights?: string[]
}

interface ScoreDebriefSnapshot {
  outcome: RunOutcomeKind
  journeyTitle: string
  lightYears: number
  resources: {
    recovered: ResourceBundle
  }
  highlights: string[]
}

interface ScoreEntryInput {
  name: string
  score: number
  time: number
  level: number
  kills: number
  date: string
  debrief?: ScoreDebriefSnapshot | null
}

export const scoreEntryFromRun = (input: ScoreEntryInput): ScoreEntry => {
  const entry: ScoreEntry = {
    name: input.name,
    score: Math.floor(input.score),
    time: input.time,
    level: input.level,
    kills: input.kills,
    date: input.date
  }
  if (!input.debrief) return entry
  return {
    ...entry,
    outcome: input.debrief.outcome,
    journeyTitle: input.debrief.journeyTitle,
    lightYears: input.debrief.lightYears,
    resources: { ...input.debrief.resources.recovered },
    highlights: input.debrief.highlights.slice(0, 4)
  }
}

export const scoreExpeditionLogEntries = (entries: ScoreEntry[], limit = 3) => (
  entries
    .filter((entry) => entry.journeyTitle && entry.resources && entry.highlights?.length)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, limit)
)
