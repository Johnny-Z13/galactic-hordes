import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { simBalanceTargets } from '../src/sim/sim-targets'
import { summarizeSimBatch } from '../src/sim/sim-metrics'
import { runSimPlaythrough } from '../src/sim/sim-runner'

test('every policy has a concrete simulation target envelope', () => {
  expect(Object.keys(simBalanceTargets)).toEqual(['balanced', 'survival', 'planetHunter', 'greedyCache', 'routeRusher', 'stress'])
  expect(simBalanceTargets.balanced.medianSurvivalMin).toBeGreaterThan(0)
  expect(simBalanceTargets.planetHunter.averagePlanetsMin).toBeGreaterThan(simBalanceTargets.routeRusher.averagePlanetsMin)
  expect(simBalanceTargets.balanced.medianFinalClearMin).toBeGreaterThan(simBalanceTargets.routeRusher.medianFinalClearMin)
})

test('target flags identify low planet engagement', () => {
  const options = { seed: 610, runs: 4, policy: 'planetHunter' as const, maxSeconds: 600, difficulty: 'normal' as const }
  const runs = Array.from({ length: options.runs }, (_, index) => ({
    ...runSimPlaythrough({ ...options, seed: options.seed + index }),
    planetsLanded: 0
  }))

  const summary = summarizeSimBatch(options, runs)

  expect(summary.balanceFlags.some((flag) => flag.includes('Average planet landings'))).toBe(true)
})

test('simulation balance target docs describe final-clear pacing targets', () => {
  const doc = readFileSync(resolve(process.cwd(), 'docs/simulation-balance-targets.md'), 'utf8')

  expect(doc).toContain('Median Final Clear')
  expect(doc).toContain('balanced | 4:00-20:00 | >= 12:00')
})
