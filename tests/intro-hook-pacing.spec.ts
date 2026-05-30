import { expect, test } from '@playwright/test'
import { summarizeSimBatch } from '../src/sim/sim-metrics'
import { runSimPlaythrough } from '../src/sim/sim-runner'

test('intro hook pacing keeps the first minute loud fast and rewarding', () => {
  // Scope: this test guards the FIRST-MINUTE hook only — opening kills, time to first landing,
  // time to first workbench. Every metric below is captured inside the opening node, so the
  // CI-envelope horizon (900s) is plenty. Full-arc balance (destroyed rate, final-clear pacing)
  // is out of scope here and is covered by tests/sim-ci.spec.ts; asserting balanceFlags === []
  // on top of intro metrics would fail this test on unrelated late-game seed variance.
  const options = { seed: 5000, runs: 40, policy: 'balanced' as const, maxSeconds: 900, difficulty: 'normal' as const }
  const runs = Array.from({ length: options.runs }, (_, index) => runSimPlaythrough({ ...options, seed: options.seed + index }))
  const summary = summarizeSimBatch(options, runs)

  expect(summary.firstMinute.averageKillsFirst60Sec).toBeGreaterThanOrEqual(18)
  expect(summary.firstMinute.medianFirstLandingSec).toBeLessThanOrEqual(70)
  expect(summary.firstMinute.medianFirstWorkbenchSec).toBeLessThanOrEqual(90)
})
