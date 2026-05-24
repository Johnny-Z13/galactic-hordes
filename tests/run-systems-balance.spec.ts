import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { nextXpThreshold, runBalance } from '../src/run-balance'
import { advancedRewardEnemyKinds, spaceEnemyBehavior } from '../src/space-enemy-behavior'
import {
  bossCacheValue,
  pickSurfaceResourceKind,
  surfaceResourceValue,
  surfaceRunBalance
} from '../src/surface-balance'

const mainSource = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')

test('run-level player xp timers and station values are named balance data', () => {
  const main = mainSource()

  expect(runBalance.player.baseHull).toBeGreaterThan(0)
  expect(nextXpThreshold(runBalance.xp.startingNext)).toBeGreaterThan(runBalance.xp.startingNext)
  expect(runBalance.timers.startingBossSeconds).toBeGreaterThan(runBalance.timers.startingSpawnSeconds)
  expect(runBalance.timers.introSectorBeaconSeconds).toBe(runBalance.timers.startingBossSeconds / 2)
  expect(runBalance.timers.introSectorBeaconSeconds).toBeLessThan(runBalance.timers.startingBossSeconds + 30)
  expect(runBalance.station.repairHull).toBeGreaterThan(0)
  expect(main).toContain('runBalance.player.baseHull')
  expect(main).toContain('nextXpThreshold(this.stats.nextXp)')
  expect(main).toContain('runBalance.station.repairHull')
})

test('space enemy behavior tuning is centralized outside the main game loop', () => {
  const main = mainSource()

  expect(spaceEnemyBehavior.global.spawnMinRadius).toBeLessThan(spaceEnemyBehavior.global.spawnMaxRadius)
  expect(spaceEnemyBehavior.shooter.nearDistance).toBeLessThan(spaceEnemyBehavior.shooter.farDistance)
  expect(spaceEnemyBehavior.cathedral.latticeRings).toBeGreaterThan(0)
  expect(advancedRewardEnemyKinds).toEqual(expect.arrayContaining(['shooter', 'lancer']))
  expect(main).toContain('spaceEnemyBehavior.global.spawnMinRadius')
  expect(main).toContain('const tuned = spaceEnemyBehavior.cathedral')
  expect(main).toContain('tuned.latticeRings')
})

test('surface resources events and boss cache payouts are named balance data', () => {
  expect(surfaceRunBalance.world.width).toBeGreaterThan(surfaceRunBalance.world.height)
  expect(pickSurfaceResourceKind({ index: 0, firstVisit: true, openingLanding: false, event: 'salvage', roll: 0.99 })).toBe('cache')
  expect(surfaceResourceValue('scrap', 'horde')).toBeGreaterThan(surfaceResourceValue('scrap', 'salvage'))
  expect(bossCacheValue(1, 'horde', 3)).toBeGreaterThan(bossCacheValue(1, 'boss', 3))
  expect(mainSource()).toContain('surfaceRunBalance.resource.cacheSafeDistance')
})
