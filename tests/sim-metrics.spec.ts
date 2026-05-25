import { expect, test } from '@playwright/test'
import { summarizeSimBatch } from '../src/sim/sim-metrics'
import { runSimPlaythrough } from '../src/sim/sim-runner'

test('batch summary aggregates survival route planets economy and combat', () => {
  const options = { seed: 300, runs: 5, policy: 'balanced' as const, maxSeconds: 600, difficulty: 'normal' as const }
  const runs = Array.from({ length: options.runs }, (_, index) => runSimPlaythrough({ ...options, seed: options.seed + index }))
  const summary = summarizeSimBatch(options, runs)

  expect(summary.runs).toHaveLength(5)
  expect(summary.survival.averageSeconds).toBeGreaterThan(0)
  expect(summary.route.averageNodesCleared).toBeGreaterThan(0)
  expect(Object.values(summary.route.templateCounts).reduce((sum, count) => sum + count, 0)).toBeGreaterThan(0)
  expect(summary.combat.averageKills).toBeGreaterThanOrEqual(0)
})

test('batch summary flags destructive median survival', () => {
  const options = { seed: 400, runs: 3, policy: 'stress' as const, maxSeconds: 120, difficulty: 'stress' as const }
  const runs = Array.from({ length: options.runs }, (_, index) => ({
    ...runSimPlaythrough({ ...options, seed: options.seed + index }),
    outcome: 'destroyed' as const,
    seconds: 45,
    damageTaken: 150
  }))
  const summary = summarizeSimBatch(options, runs)

  expect(summary.balanceFlags.some((flag) => flag.includes('Median survival'))).toBe(true)
})

test('batch summary flags missing procedural variety', () => {
  const options = { seed: 500, runs: 5, policy: 'balanced' as const, maxSeconds: 600, difficulty: 'normal' as const }
  const runs = Array.from({ length: options.runs }, (_, index) => {
    const run = runSimPlaythrough({ ...options, seed: options.seed + index })
    run.coverage.routeTemplates = { safeDrift: 1 }
    run.coverage.planetArchetypes = { cache: 1 }
    return run
  })

  const summary = summarizeSimBatch(options, runs)

  expect(summary.balanceFlags.some((flag) => flag.includes('route template variety'))).toBe(true)
  expect(summary.balanceFlags.some((flag) => flag.includes('planet archetype variety'))).toBe(true)
})
