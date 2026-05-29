import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('score entries preserve expedition debrief story metadata', async () => {
  const { scoreEntryFromRun } = await import('../src/score-history')
  const entry = scoreEntryFromRun({
    name: 'NOVA',
    score: 1299.8,
    time: 412,
    level: 7,
    kills: 118,
    date: '2026-05-28T18:00:00.000Z',
    debrief: {
      outcome: 'deepExtraction',
      journeyTitle: 'LATHE RELAY DEEP ROUTE',
      lightYears: 187,
      resources: { recovered: { scrap: 286, crystal: 41, cores: 3 } },
      highlights: [
        '187 LY travelled across 4 route nodes.',
        'Docked at LATHE RELAY.'
      ]
    }
  })

  expect(entry.score).toBe(1299)
  expect(entry.journeyTitle).toBe('LATHE RELAY DEEP ROUTE')
  expect(entry.lightYears).toBe(187)
  expect(entry.resources).toEqual({ scrap: 286, crystal: 41, cores: 3 })
  expect(entry.highlights).toEqual([
    '187 LY travelled across 4 route nodes.',
    'Docked at LATHE RELAY.'
  ])
})

test('score expedition logs prefer recent story-backed runs and ignore legacy rows', async () => {
  const { scoreExpeditionLogEntries } = await import('../src/score-history')
  const entries = [
    { name: 'ACE', score: 5000, time: 300, level: 4, kills: 90, date: '2026-05-27T10:00:00.000Z' },
    {
      name: 'ION',
      score: 1200,
      time: 260,
      level: 3,
      kills: 54,
      date: '2026-05-28T11:00:00.000Z',
      journeyTitle: 'ION DRIFT',
      outcome: 'cleanExtraction',
      lightYears: 90,
      resources: { scrap: 80, crystal: 6, cores: 0 },
      highlights: ['90 LY travelled across 2 route nodes.']
    },
    {
      name: 'VEX',
      score: 800,
      time: 220,
      level: 2,
      kills: 41,
      date: '2026-05-28T12:00:00.000Z',
      journeyTitle: 'VEX SURVEY',
      outcome: 'destroyed',
      lightYears: 74,
      resources: { scrap: 40, crystal: 2, cores: 0 },
      highlights: ['74 LY travelled across 1 route node.']
    }
  ] satisfies import('../src/score-history').ScoreEntry[]

  expect(scoreExpeditionLogEntries(entries, 1).map((entry) => entry.journeyTitle)).toEqual(['VEX SURVEY'])
})

test('scores screen renders a notable expedition log from saved debrief rows', () => {
  const scores = readFileSync('src/ui/scores.ts', 'utf8')
  const css = readFileSync('src/style.css', 'utf8')

  expect(scores).toContain('scoreExpeditionLogEntries')
  expect(scores).toContain("log.className = 'score-expedition-log'")
  expect(scores).toContain("card.className = 'score-expedition-card'")
  expect(scores).toContain('entry.journeyTitle')
  expect(scores).toContain('entry.highlights?.[0]')
  expect(scores).toContain('entry.resources?.scrap')
  expect(css).toContain('.score-expedition-log')
  expect(css).toContain('.score-expedition-card')
})
