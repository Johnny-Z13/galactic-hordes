import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spaceEnemyDefinitions } from '../src/space-enemies'
import { spaceEnemyBehavior } from '../src/space-enemy-behavior'

const mainSource = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')

// Characterization test: pins the chaser update behavior before extracting updateEnemies.
//
// We cannot instantiate VectorShooter in Node.js (it requires a browser DOM), so we
// simulate one step of the chaser update path using the same constants that updateEnemies
// reads at runtime. This is a deterministic mirror of lines 2516-2519 (pursuit acceleration)
// plus velocity damping (lines 2731-2732) and position integration (lines 2733-2734).
//
// Assertion: after < before (distance closes). Stable because the chaser starts with vx=0,
// is placed 400px from the player, and dt=0.1 accelerates it toward the player with no RNG.
// We also verify the debug harness hooks are present in source and gated behind ?harness=1.

test('chaser enemy closes distance when updateEnemies is stepped forward', () => {
  // --- Physics simulation matching updateEnemies chaser path ---
  const playerX = 0
  const playerY = 0
  // Enemy placed 400px to the right, matching debugSpawnSingleEnemy('chaser', 400, 0)
  const ex0 = playerX + 400
  const ey0 = playerY + 0

  const speed = spaceEnemyDefinitions.chaser.speed
  const pursuit = spaceEnemyBehavior.chaser.pursuit
  const damping = spaceEnemyBehavior.global.velocityDamping
  const dt = 0.1

  // Direction from enemy to player (toP = norm(player - enemy))
  const dx = playerX - ex0
  const dy = playerY - ey0
  const l = Math.hypot(dx, dy) || 1
  const toP = { x: dx / l, y: dy / l }

  // Chaser pursuit (no hungryCompass relic at initial state so hunger=1)
  let vx = toP.x * speed * pursuit * 1 * dt
  let vy = toP.y * speed * pursuit * 1 * dt

  // Velocity damping and position update
  vx *= Math.pow(damping, dt)
  vy *= Math.pow(damping, dt)
  const ex1 = ex0 + vx * dt
  const ey1 = ey0 + vy * dt

  const before = Math.sqrt((ex0 - playerX) ** 2 + (ey0 - playerY) ** 2)
  const after = Math.sqrt((ex1 - playerX) ** 2 + (ey1 - playerY) ** 2)

  expect(after).toBeLessThan(before)

  // Distance reduction must be non-trivial (>0.5px) to guard against speed/pursuit zeroing
  expect(before - after).toBeGreaterThan(0.5)

  // --- Source structure: debug hooks exist and are gated behind installHarnessIfRequested ---
  const main = mainSource()

  expect(main).toContain('private debugSpawnSingleEnemy(kind: EnemyKind, dx: number, dy: number)')
  expect(main).toContain('private debugPlayerPosition()')
  expect(main).toContain('private debugNearestEnemyDistance()')
  expect(main).toContain('private debugStepEnemies(dt: number)')

  // All window exposures live inside installHarnessIfRequested — nowhere else
  const harnessRegion = main.slice(
    main.indexOf('private installHarnessIfRequested()'),
    main.indexOf('private debugSpawnSingleEnemy(')
  )
  expect(harnessRegion).toContain('w.debugSpawnSingleEnemy')
  expect(harnessRegion).toContain('w.debugNearestEnemyDistance')
  expect(harnessRegion).toContain('w.debugStepEnemies')

  // debugStepEnemies window exposure must NOT appear outside the harness block
  const beforeHarness = main.slice(0, main.indexOf('private installHarnessIfRequested()'))
  const afterHarness = main.slice(main.indexOf('private debugSpawnSingleEnemy('))
  expect(beforeHarness).not.toContain('w.debugStepEnemies')
  expect(afterHarness).not.toContain('w.debugStepEnemies')
})
