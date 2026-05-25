import { expect, test } from '@playwright/test'
import { summarizeSimBatch } from '../src/sim/sim-metrics'
import { runSimPlaythrough } from '../src/sim/sim-runner'
import { simBalanceTargets } from '../src/sim/sim-targets'

test('balanced ten-run simulation batch stays inside fast CI envelope', () => {
  const options = { seed: 1000, runs: 10, policy: 'balanced' as const, maxSeconds: 900, difficulty: 'normal' as const }
  const runs = Array.from({ length: options.runs }, (_, index) => runSimPlaythrough({ ...options, seed: options.seed + index }))
  const summary = summarizeSimBatch(options, runs)
  const target = simBalanceTargets.balanced

  expect(summary.survival.medianSeconds).toBeGreaterThanOrEqual(target.medianSurvivalMin)
  expect(summary.survival.destroyedRate).toBeLessThanOrEqual(target.destroyedRateMax)
  expect(Object.keys(summary.route.templateCounts).length).toBeGreaterThanOrEqual(target.routeTemplateVarietyMin)
  expect(Object.keys(summary.planets.archetypeCounts).length).toBeGreaterThanOrEqual(target.planetArchetypeVarietyMin)
  expect(summary.balanceFlags).toEqual([])
})
