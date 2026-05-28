import { expect, test } from '@playwright/test'
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
