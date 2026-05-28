import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const HARNESS_URL = 'http://127.0.0.1:5176/?harness=1'
const READY_TIMEOUT = 10_000

test('surface threat renderers use the shared red hit-flash color', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const surfaceThreats = main.slice(main.indexOf('private renderSurfaceThreats'), main.indexOf('private renderSurfaceAliens'))

  expect(surfaceThreats).toContain('hitFlashColor(threat.hit > 0')
  expect(surfaceThreats).not.toContain("threat.hit > 0 ? '#fff27a'")
})

test('first safeDrift node consumes intro spawn pressure helpers at runtime', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const prepareSectorNode = main.slice(main.indexOf('private prepareSectorNode'), main.indexOf('private completeSectorNodeViaBeacon'))

  expect(prepareSectorNode).toContain("node.config.templateId === 'safeDrift'")
  expect(prepareSectorNode).toContain('introSafeDriftSpawnMultiplier(this.sectorNodeProfile.spawnMultiplier)')
  expect(prepareSectorNode).toContain('introSafeDriftStartingSpawns(this.sectorNodeProfile.config.enemies.startingSpawns)')
})

test('score popups appear after a kill and clear after popup lifetime elapses', async ({ page }) => {
  await page.goto(HARNESS_URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForFunction(
    () => typeof (window as unknown as { debugScorePopupsSnapshot?: unknown }).debugScorePopupsSnapshot === 'function',
    null,
    { timeout: READY_TIMEOUT }
  )
  const result = await page.evaluate(() => {
    const w = window as unknown as {
      debugSpawnSingleEnemy: (kind: string, dx: number, dy: number) => void
      debugForceKillNearestEnemy: (giant: boolean) => boolean
      debugScorePopupsSnapshot: () => { count: number; texts: string[] }
      debugStepScorePopups: (dt: number) => void
      __vectorShooter: { state: string }
    }
    w.__vectorShooter.state = 'playing'
    w.debugSpawnSingleEnemy('chaser', 60, 0)
    const before = w.debugScorePopupsSnapshot()
    w.debugForceKillNearestEnemy(false)
    const justAfter = w.debugScorePopupsSnapshot()
    // Popup lifeSeconds = 0.6; step 0.9s of game time deterministically to expire it.
    w.debugStepScorePopups(0.9)
    const later = w.debugScorePopupsSnapshot()
    return { before, justAfter, later }
  })
  expect(result.before.count).toBe(0)
  expect(result.justAfter.count).toBe(1)
  expect(result.justAfter.texts[0]).toMatch(/^\+\d+$/)
  expect(result.later.count).toBe(0)
})

test('hitstop fires on giant-kind kill but not on chaser kill', async ({ page }) => {
  await page.goto(HARNESS_URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForFunction(
    () => typeof (window as unknown as { debugHitstopUntil?: unknown }).debugHitstopUntil === 'function',
    null,
    { timeout: READY_TIMEOUT }
  )
  const result = await page.evaluate(() => {
    const w = window as unknown as {
      debugSpawnSingleEnemy: (kind: string, dx: number, dy: number) => void
      debugForceKillNearestEnemy: (giant: boolean) => boolean
      debugHitstopUntil: () => number
      __vectorShooter: { state: string }
    }
    w.__vectorShooter.state = 'playing'
    w.debugSpawnSingleEnemy('chaser', 60, 0)
    const t0 = performance.now() / 1000
    w.debugForceKillNearestEnemy(false)
    const afterChaser = w.debugHitstopUntil()
    // 'siphon' is a giant kind per spaceBossEnemyKinds — required to trigger hitstop.
    w.debugSpawnSingleEnemy('siphon', 100, 0)
    const t1 = performance.now() / 1000
    w.debugForceKillNearestEnemy(true)
    const afterGiant = w.debugHitstopUntil()
    return { t0, afterChaser, t1, afterGiant }
  })
  expect(result.afterChaser).toBeLessThanOrEqual(result.t0)
  expect(result.afterGiant).toBeGreaterThan(result.t1)
  expect(result.afterGiant - result.t1).toBeLessThan(0.2)
})

test('enemy.flash is stamped by damage with the configured hitFlash duration', async ({ page }) => {
  await page.goto(HARNESS_URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForFunction(
    () => typeof (window as unknown as { debugSpawnSingleEnemy?: unknown }).debugSpawnSingleEnemy === 'function',
    null,
    { timeout: READY_TIMEOUT }
  )
  const result = await page.evaluate(async () => {
    const w = window as unknown as {
      debugSpawnSingleEnemy: (kind: string, dx: number, dy: number) => void
      __vectorShooter: {
        state: string
        enemies: Array<{ hp: number; flash: number }>
        damageEnemy: (e: { hp: number; flash: number }, amount: number, color: string) => void
      }
    }
    const g = w.__vectorShooter
    g.state = 'playing'
    w.debugSpawnSingleEnemy('brute', 80, 0)
    const e = g.enemies[0]
    e.hp = 1000 // keep it alive so damage doesn't kill it
    e.flash = 0
    g.damageEnemy(e, 1, '#fff')
    return { flashAfter: e.flash }
  })
  // damageFeedbackConfig.hitFlash.durationSeconds = 0.08
  expect(result.flashAfter).toBeCloseTo(0.08, 2)
})
