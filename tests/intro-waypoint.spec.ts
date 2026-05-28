import { expect, test } from '@playwright/test'

const HARNESS_URL = 'http://127.0.0.1:5176/?harness=1'
const READY_TIMEOUT = 10_000

test('intro waypoint activates on a fresh first-ever run', async ({ page }) => {
  await page.goto(HARNESS_URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForFunction(() => typeof (window as unknown as { debugIntroWaypointState?: unknown }).debugIntroWaypointState === 'function', null, { timeout: READY_TIMEOUT })
  const result = await page.evaluate(async () => {
    const w = window as unknown as {
      debugForceFirstEverRun: () => void
      debugIntroWaypointState: () => { active: boolean; timer: number; targetPlanetId: string | null } | null
      __vectorShooter: { state: string }
    }
    w.debugForceFirstEverRun()
    const g = w.__vectorShooter
    g.state = 'playing'
    // Wait two animation frames so updatePlaying can run and call tryStartIntroWaypoint.
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    return w.debugIntroWaypointState()
  })
  expect(result).not.toBeNull()
  expect(result.active).toBe(true)
  expect(result.timer).toBeGreaterThan(0)
  expect(result.timer).toBeLessThanOrEqual(30)
  expect(result.targetPlanetId).not.toBeNull()
})

test('intro waypoint deactivates after landing', async ({ page }) => {
  await page.goto(HARNESS_URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForFunction(() => typeof (window as unknown as { debugIntroWaypointState?: unknown }).debugIntroWaypointState === 'function', null, { timeout: READY_TIMEOUT })
  const result = await page.evaluate(async () => {
    const w = window as unknown as {
      debugForceFirstEverRun: () => void
      debugIntroWaypointState: () => { active: boolean; timer: number; targetPlanetId: string | null } | null
      debugLandOnNearestPlanet: () => boolean
      __vectorShooter: { state: string }
    }
    w.debugForceFirstEverRun()
    const g = w.__vectorShooter
    g.state = 'playing'
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    const beforeLanding = w.debugIntroWaypointState()
    w.debugLandOnNearestPlanet()
    return { beforeLanding, afterLanding: w.debugIntroWaypointState() }
  })
  expect(result.beforeLanding?.active).toBe(true)
  expect(result.afterLanding?.active).toBe(false)
})

test('intro waypoint does NOT activate on a second run (debrief present)', async ({ page }) => {
  await page.goto(HARNESS_URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForFunction(() => typeof (window as unknown as { debugIntroWaypointState?: unknown }).debugIntroWaypointState === 'function', null, { timeout: READY_TIMEOUT })
  const result = await page.evaluate(async () => {
    const w = window as unknown as {
      debugIntroWaypointState: () => { active: boolean; timer: number; targetPlanetId: string | null } | null
      __vectorShooter: {
        state: string
        debrief: unknown
        stats: { planets: number }
        introWaypoint: null
      }
    }
    const g = w.__vectorShooter
    // @see DebriefReport in src/main.ts — keep shape in sync.
    g.debrief = { resources: { recovered: { scrap: 0, crystal: 0, cores: 0 } }, discoveries: [], lightYears: 0, stationVisits: [], skippedBeacons: 0, title: 'Test', copy: '' }
    g.stats.planets = 1
    g.state = 'playing'
    g.introWaypoint = null
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    return w.debugIntroWaypointState()
  })
  expect(result).toBeNull()
})
