import { expect, test } from '@playwright/test'
import { runSimPlaythrough } from '../src/sim/sim-runner'

test('simulation runner returns deterministic results for a fixed seed', () => {
  const options = { seed: 100, policy: 'balanced' as const, maxSeconds: 600, difficulty: 'normal' as const }

  expect(runSimPlaythrough(options)).toEqual(runSimPlaythrough(options))
})

test('simulation runner records route planet economy and ending events', () => {
  const result = runSimPlaythrough({ seed: 101, policy: 'planetHunter', maxSeconds: 900, difficulty: 'normal' })

  expect(result.seconds).toBeGreaterThan(0)
  expect(result.events.some((event) => event.kind === 'routeSelected')).toBe(true)
  expect(result.events.some((event) => event.kind === 'runEnded')).toBe(true)
  expect(Object.values(result.coverage.routeTemplates).reduce((sum, count) => sum + count, 0)).toBeGreaterThan(0)
  expect(result.economy.scrap + result.economy.crystal + result.economy.cores).toBeGreaterThanOrEqual(0)
})

test('simulation runner records first-minute engagement telemetry', () => {
  const result = runSimPlaythrough({ seed: 101, policy: 'planetHunter', maxSeconds: 900, difficulty: 'normal' })

  expect(result.firstMinute.killsFirst60Sec).toBeGreaterThanOrEqual(0)
  expect(result.firstMinute.firstKillSec).not.toBeNull()
  expect(result.firstMinute.firstKillSec).toBeGreaterThanOrEqual(0)
  expect(result.firstMinute.firstKillSec).toBeLessThanOrEqual(60)
  expect(result.firstMinute.firstLandingSec).not.toBeNull()
  expect(result.firstMinute.firstWorkbenchSec === null || result.firstMinute.firstWorkbenchSec >= 0).toBe(true)
})

test('survival policy takes less damage than greedy cache policy across the same seeds', () => {
  const seeds = Array.from({ length: 30 }, (_, index) => 200 + index)
  const survivalDamage = seeds.reduce((sum, seed) => sum + runSimPlaythrough({ seed, policy: 'survival', maxSeconds: 600, difficulty: 'normal' }).damageTaken, 0)
  const greedyDamage = seeds.reduce((sum, seed) => sum + runSimPlaythrough({ seed, policy: 'greedyCache', maxSeconds: 600, difficulty: 'normal' }).damageTaken, 0)

  expect(survivalDamage).toBeLessThan(greedyDamage)
})

test('planet hunter lands more often than route rusher across the same seeds', () => {
  const seeds = [310, 311, 312, 313, 314]
  const planetHunterLandings = seeds.reduce((sum, seed) => sum + runSimPlaythrough({ seed, policy: 'planetHunter', maxSeconds: 900, difficulty: 'normal' }).planetsLanded, 0)
  const routeRusherLandings = seeds.reduce((sum, seed) => sum + runSimPlaythrough({ seed, policy: 'routeRusher', maxSeconds: 900, difficulty: 'normal' }).planetsLanded, 0)

  expect(planetHunterLandings).toBeGreaterThan(routeRusherLandings)
})
