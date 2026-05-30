import { expect, test } from '@playwright/test'
import { summarizeSimBatch } from '../src/sim/sim-metrics'
import { runSimPlaythrough } from '../src/sim/sim-runner'
import { simBalanceTargets } from '../src/sim/sim-targets'

test('balanced simulation batch stays inside fast CI envelope', () => {
  const options = { seed: 1000, runs: 100, policy: 'balanced' as const, maxSeconds: 900, difficulty: 'normal' as const }
  const runs = Array.from({ length: options.runs }, (_, index) => runSimPlaythrough({ ...options, seed: options.seed + index }))
  const summary = summarizeSimBatch(options, runs)
  const target = simBalanceTargets.balanced

  expect(summary.survival.medianSeconds).toBeGreaterThanOrEqual(target.medianSurvivalMin)
  expect(summary.survival.destroyedRate).toBeLessThanOrEqual(target.destroyedRateMax)
  expect(Object.keys(summary.route.templateCounts).length).toBeGreaterThanOrEqual(target.routeTemplateVarietyMin)
  expect(Object.keys(summary.planets.archetypeCounts).length).toBeGreaterThanOrEqual(target.planetArchetypeVarietyMin)
  expect(summary.balanceFlags).toEqual([])
})

// The 30-minute preset deliberately runs well past the intended ~12-18 minute overwhelm
// curve (see docs/game-balance-design.md), so most runs SHOULD end in a deep, glorious death.
// It validates full-arc depth and procedural coverage, not half-hour survivability — the
// strict survival ceiling lives in the 900s test above.
test('balanced full-arc simulation preset reaches deep, varied progress', () => {
  const options = { seed: 5000, runs: 100, policy: 'balanced' as const, maxSeconds: 1800, difficulty: 'normal' as const }
  const runs = Array.from({ length: options.runs }, (_, index) => runSimPlaythrough({ ...options, seed: options.seed + index }))
  const summary = summarizeSimBatch(options, runs)
  const target = simBalanceTargets.balanced

  // Full-arc runs should go deep: more nodes cleared than a short run, and the median
  // run survives past the intended overwhelm window before falling.
  expect(summary.route.averageNodesCleared).toBeGreaterThanOrEqual(5)
  expect(summary.survival.medianSeconds).toBeGreaterThanOrEqual(target.medianSurvivalMin)
  // Some runs must still reach the final stand within a deep arc.
  expect(summary.route.finalReached).toBeGreaterThan(0)
  // Procedural coverage must stay broad across a long batch.
  expect(Object.keys(summary.route.templateCounts).length).toBeGreaterThanOrEqual(target.routeTemplateVarietyMin)
  expect(Object.keys(summary.planets.archetypeCounts).length).toBeGreaterThanOrEqual(target.planetArchetypeVarietyMin)
  // It should be hard, not a catastrophe: deaths stay below a generous full-arc ceiling.
  expect(summary.survival.destroyedRate).toBeLessThanOrEqual(0.92)
  // No single death cause should dominate a healthy full-arc batch.
  const dominanceFlag = summary.balanceFlags.find((flag) => flag.includes('causes') && flag.includes('destroyed runs'))
  expect(dominanceFlag).toBeUndefined()
})
