import { expect, test } from '@playwright/test'
import { summarizeSimBatch } from '../src/sim/sim-metrics'
import { runSimPlaythrough } from '../src/sim/sim-runner'

test('intro hook pacing keeps the first minute loud fast and rewarding', () => {
  const options = { seed: 5000, runs: 40, policy: 'balanced' as const, maxSeconds: 1800, difficulty: 'normal' as const }
  const runs = Array.from({ length: options.runs }, (_, index) => runSimPlaythrough({ ...options, seed: options.seed + index }))
  const summary = summarizeSimBatch(options, runs)

  expect(summary.firstMinute.averageKillsFirst60Sec).toBeGreaterThanOrEqual(18)
  expect(summary.firstMinute.medianFirstLandingSec).toBeLessThanOrEqual(70)
  expect(summary.firstMinute.medianFirstWorkbenchSec).toBeLessThanOrEqual(90)
  expect(summary.balanceFlags).toEqual([])
})
