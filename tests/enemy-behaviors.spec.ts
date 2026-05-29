import { expect, test } from '@playwright/test'
import { loadHarnessPage, waitForHarnessFunction } from './harness-page'

// REQUIRES: `npm run dev` (Vite on 127.0.0.1:5176) running before this test.
// This is the only spec that drives the live game over the dev server; the other
// specs are self-contained. Port is fixed by vite.config.ts.

// Characterization test: drives the REAL updateEnemies via the debug harness so that
// any future extraction of updateEnemies into a new module will be caught immediately.
//
// No math is reimplemented here. We spawn a chaser 400px to the right of the player
// in the live running game, step updateEnemies several times via debugStepEnemies, and
// assert that the chaser's measured distance to the player decreased in the real game
// objects. If updateEnemies becomes a no-op, the distance stays at 400 and the test fails.

test('chaser enemy closes distance when updateEnemies is stepped forward', async ({ page }) => {
  await readyHooks(page)

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

// Additional characterization cases added alongside the enemy-behaviors strategy
// table extraction. Each drives the REAL updateEnemies via the harness and asserts
// against the live game objects only (no math reimplemented here). Kinds chosen for
// DISTINCT movement so a transcription error would surface:
//   brute (pure pursuit), shooter (range-holding), mine (proximity-consume),
//   dreadnought (giant, range-holding, stays alive).

const readyHooks = async (page: import('@playwright/test').Page) => {
  await loadHarnessPage(page)
  await waitForHarnessFunction(page, 'debugStepEnemies')
}

test('brute enemy closes distance (pure pursuit) when stepped forward', async ({ page }) => {
  await readyHooks(page)

  const distances = await page.evaluate(() => {
    const w = window as unknown as {
      debugSpawnSingleEnemy: (kind: string, dx: number, dy: number) => void
      debugNearestEnemyDistance: () => number
      debugStepEnemies: (dt: number) => void
    }
    w.debugSpawnSingleEnemy('brute', 400, 0)
    const results: number[] = [w.debugNearestEnemyDistance()]
    for (let i = 0; i < 5; i += 1) {
      w.debugStepEnemies(0.1)
      results.push(w.debugNearestEnemyDistance())
    }
    return results
  })

  expect(distances[0]).toBeGreaterThan(350)
  // Brute is pure pursuit: distance decreases every step.
  for (let i = 1; i < distances.length; i += 1) {
    expect(distances[i]).toBeLessThan(distances[i - 1])
  }
  expect(distances[0] - distances[distances.length - 1]).toBeGreaterThan(0.5)
})

test('shooter enemy holds range rather than collapsing to the player', async ({ page }) => {
  await readyHooks(page)

  const distances = await page.evaluate(() => {
    const w = window as unknown as {
      debugSpawnSingleEnemy: (kind: string, dx: number, dy: number) => void
      debugNearestEnemyDistance: () => number
      debugStepEnemies: (dt: number) => void
    }
    // Spawn at the shooter's hold band so it strafes/holds rather than charges in.
    w.debugSpawnSingleEnemy('shooter', 360, 0)
    const results: number[] = [w.debugNearestEnemyDistance()]
    for (let i = 0; i < 12; i += 1) {
      w.debugStepEnemies(0.1)
      results.push(w.debugNearestEnemyDistance())
    }
    return results
  })

  // The shooter moves (range-pull + strafe), so it must not sit perfectly still...
  const moved = distances.some((d) => Math.abs(d - distances[0]) > 0.5)
  expect(moved).toBe(true)
  // ...but a range-holder must NOT collapse to the player like a chaser would.
  const minDistance = Math.min(...distances)
  expect(minDistance).toBeGreaterThan(150)
})

test('mine enemy is consumed when the player is inside its trigger radius', async ({ page }) => {
  await readyHooks(page)

  const result = await page.evaluate(() => {
    const w = window as unknown as {
      debugSpawnSingleEnemy: (kind: string, dx: number, dy: number) => void
      debugStepEnemies: (dt: number) => void
      debugEnemyCount: () => number
    }
    // Mine trigger radius is well above 60px; spawning inside it means one step
    // must run the proximity branch (damagePlayer + killEnemy -> consumed).
    w.debugSpawnSingleEnemy('mine', 60, 0)
    const before = w.debugEnemyCount()
    w.debugStepEnemies(0.1)
    const after = w.debugEnemyCount()
    return { before, after }
  })

  expect(result.before).toBe(1)
  expect(result.after).toBe(0)
})

test('dreadnought enemy moves and remains alive after a step', async ({ page }) => {
  await readyHooks(page)

  const result = await page.evaluate(() => {
    const w = window as unknown as {
      debugSpawnSingleEnemy: (kind: string, dx: number, dy: number) => void
      debugNearestEnemyDistance: () => number
      debugStepEnemies: (dt: number) => void
      debugEnemyCount: () => number
    }
    w.debugSpawnSingleEnemy('dreadnought', 600, 0)
    const start = w.debugNearestEnemyDistance()
    for (let i = 0; i < 8; i += 1) w.debugStepEnemies(0.1)
    const end = w.debugNearestEnemyDistance()
    return { start, end, count: w.debugEnemyCount() }
  })

  // Giant survives the step loop (not consumed by its own behavior).
  expect(result.count).toBe(1)
  // It maneuvers (range-pull + broadside drift), so its distance changes measurably.
  expect(Math.abs(result.end - result.start)).toBeGreaterThan(0.5)
})
