import { expect, test } from '@playwright/test'

// REQUIRES: `npm run dev` (Vite on 127.0.0.1:5176) running before this test.
// This is the only spec that drives the live game over the dev server; the other
// specs are self-contained. Port is fixed by vite.config.ts.
const HARNESS_URL = 'http://127.0.0.1:5176/?harness=1'
const READY_TIMEOUT = 10_000

// Characterization test: drives the REAL updateEnemies via the debug harness so that
// any future extraction of updateEnemies into a new module will be caught immediately.
//
// No math is reimplemented here. We spawn a chaser 400px to the right of the player
// in the live running game, step updateEnemies several times via debugStepEnemies, and
// assert that the chaser's measured distance to the player decreased in the real game
// objects. If updateEnemies becomes a no-op, the distance stays at 400 and the test fails.

test('chaser enemy closes distance when updateEnemies is stepped forward', async ({ page }) => {
  await page.goto(HARNESS_URL, { waitUntil: 'networkidle' })

  // Wait until the harness hook is live on window
  await page.waitForFunction(
    () => typeof (window as unknown as Record<string, unknown>).debugStepEnemies === 'function',
    { timeout: READY_TIMEOUT }
  )

  // Sanity: confirm all four hooks are present as functions (this IS a behavior check — we
  // need them callable, not just present as source strings)
  const hooksReady = await page.evaluate(() => {
    const w = window as unknown as Record<string, unknown>
    return (
      typeof w.debugSpawnSingleEnemy === 'function' &&
      typeof w.debugPlayerPosition === 'function' &&
      typeof w.debugNearestEnemyDistance === 'function' &&
      typeof w.debugStepEnemies === 'function'
    )
  })
  expect(hooksReady).toBe(true)

  // Drive the real game: spawn one chaser 400px to the right of the player, then step
  // updateEnemies 5 times with dt=0.1 and measure the distance closing each time.
  const distances = await page.evaluate(() => {
    const w = window as unknown as {
      debugSpawnSingleEnemy: (kind: string, dx: number, dy: number) => void
      debugNearestEnemyDistance: () => number
      debugStepEnemies: (dt: number) => void
    }

    w.debugSpawnSingleEnemy('chaser', 400, 0)
    const results: number[] = [w.debugNearestEnemyDistance()]
    for (let i = 0; i < 5; i += 1) {
      w.debugStepEnemies(0.1)
      results.push(w.debugNearestEnemyDistance())
    }
    return results
  })

  // Initial distance should be ~400px
  expect(distances[0]).toBeGreaterThan(350)

  // Distance must strictly decrease each step (chaser moves toward player every frame)
  for (let i = 1; i < distances.length; i += 1) {
    expect(distances[i]).toBeLessThan(distances[i - 1])
  }

  // Final distance must be non-trivially closer than the start (guards against
  // speed/pursuit being zeroed — even one real step should close > 0.5px)
  expect(distances[0] - distances[distances.length - 1]).toBeGreaterThan(0.5)
})
