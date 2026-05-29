import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { loadHarnessPage, waitForHarnessFunction } from './harness-page'

test('surface threat renderers use the shared red hit-flash color', () => {
  const surfaceThreats = readFileSync('src/surface/render-threats.ts', 'utf8')

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
  await loadHarnessPage(page)
  await waitForHarnessFunction(page, 'debugScorePopupsSnapshot')
  const result = await page.evaluate(() => {
    const w = window as unknown as {
      debugSpawnSingleEnemy: (kind: string, dx: number, dy: number) => void
      debugForceKillNearestEnemy: (giant: boolean) => boolean
      debugScorePopupsSnapshot: () => { count: number; texts: string[] }
      debugStepScorePopups: (dt: number) => void
      __galacticHordes: { state: string }
    }
    w.__galacticHordes.state = 'playing'
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
  await loadHarnessPage(page)
  await waitForHarnessFunction(page, 'debugHitstopUntil')
  const result = await page.evaluate(() => {
    const w = window as unknown as {
      debugSpawnSingleEnemy: (kind: string, dx: number, dy: number) => void
      debugForceKillNearestEnemy: (giant: boolean) => boolean
      debugHitstopUntil: () => number
      __galacticHordes: { state: string }
    }
    w.__galacticHordes.state = 'playing'
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
  await loadHarnessPage(page)
  await waitForHarnessFunction(page, 'debugSpawnSingleEnemy')
  const result = await page.evaluate(async () => {
    const w = window as unknown as {
      debugSpawnSingleEnemy: (kind: string, dx: number, dy: number) => void
      __galacticHordes: {
        state: string
        enemies: Array<{ hp: number; flash: number }>
        damageEnemy: (e: { hp: number; flash: number }, amount: number, color: string) => void
      }
    }
    const g = w.__galacticHordes
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

test('pickup magnet glint uses a dedicated cyan signal color while pulled', async ({ page }) => {
  await loadHarnessPage(page)
  const result = await page.evaluate(() => {
    const g = (window as unknown as {
      __galacticHordes: {
        state: string
        player: { x: number; y: number }
        pickups: Array<{ kind: string; x: number; y: number; vx: number; vy: number; value: number; radius: number; life: number; color: string }>
        particles: Array<{ color: string }>
        updatePickups: (dt: number) => void
      }
    }).__galacticHordes
    g.state = 'playing'
    g.player.x = 0
    g.player.y = 0
    g.pickups = [{ kind: 'xp', x: 120, y: 0, vx: 0, vy: 0, value: 1, radius: 5.6, life: 10, color: '#8fff7d' }]
    g.particles = []
    for (let i = 0; i < 4; i += 1) g.updatePickups(1 / 60)
    return {
      particleCount: g.particles.length,
      particleColors: g.particles.map((particle: { color: string }) => particle.color)
    }
  })
  expect(result.particleCount).toBeGreaterThan(0)
  expect(result.particleColors).toContain('#57fff3')
})

test('banked mutation signals create visible decision feedback', async ({ page }) => {
  await loadHarnessPage(page)
  const result = await page.evaluate(() => {
    const g = (window as unknown as {
      __galacticHordes: {
        state: string
        player: { x: number; y: number }
        stats: { xp: number; nextXp: number }
        pickups: Array<{ kind: string; x: number; y: number; vx: number; vy: number; value: number; radius: number; life: number; color: string }>
        scorePopups: Array<{ text: string }>
        pendingUpgrades: number
        updatePickups: (dt: number) => void
      }
    }).__galacticHordes
    g.state = 'playing'
    g.player.x = 0
    g.player.y = 0
    g.stats.xp = g.stats.nextXp - 1
    g.pickups = [{ kind: 'xp', x: 0, y: 0, vx: 0, vy: 0, value: 2, radius: 5.6, life: 10, color: '#57fff3' }]
    g.scorePopups = []
    g.updatePickups(1 / 60)
    return {
      pendingUpgrades: g.pendingUpgrades,
      texts: g.scorePopups.map((popup: { text: string }) => popup.text)
    }
  })

  expect(result.pendingUpgrades).toBe(1)
  expect(result.texts).toContain('SIGNAL READY')
})

test('banked mutation signal lets the starter ship lock a planet for install', async ({ page }) => {
  await loadHarnessPage(page)
  const result = await page.evaluate(() => {
    const g = (window as unknown as {
      __galacticHordes: {
        state: string
        pendingUpgrades: number
        build: { nav: number }
        player: { x: number; y: number; landedCd: number }
        returnBeacon: unknown | null
        planets: Array<{
          id: string
          name: string
          x: number
          y: number
          vx: number
          vy: number
          radius: number
          color: string
          reward: string
          visited: boolean
          archetype: string
          biome: { label: string; baseColor: string; accentColor: string; surfaceMotif: string }
        }>
        autoNavTargetPlanetId: string | null
        toastText: string
        tryLand: () => void
      }
    }).__galacticHordes
    g.state = 'playing'
    g.pendingUpgrades = 1
    g.build.nav = 0
    g.player.x = 0
    g.player.y = 0
    g.player.landedCd = 0
    g.returnBeacon = null
    g.planets = [{
      id: 'install-world',
      name: 'Install World',
      x: 1200,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 120,
      color: '#57fff3',
      reward: 'Workbench landing',
      visited: false,
      archetype: 'repair',
      biome: { label: 'Signal flats', baseColor: '#57fff3', accentColor: '#fff27a', surfaceMotif: 'craters' }
    }]
    g.tryLand()
    return {
      target: g.autoNavTargetPlanetId,
      toast: g.toastText
    }
  })

  expect(result.target).toBe('install-world')
  expect(result.toast).toContain('SIGNAL COURSE LOCKED')
})
