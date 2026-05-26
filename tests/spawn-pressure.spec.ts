import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pressurePackSize, shouldRecycleEnemy } from '../src/spawn-pressure'

const mainSource = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')

test('recycles enemies that are far enough to starve new spawns', () => {
  expect(shouldRecycleEnemy({ x: 2500, y: 0 }, { x: 0, y: 0 }, 2200)).toBe(true)
  expect(shouldRecycleEnemy({ x: 800, y: 0 }, { x: 0, y: 0 }, 2200)).toBe(false)
})

test('keeps a minimum pressure pack when nearby field is quiet', () => {
  expect(pressurePackSize({ nearbyEnemies: 0, targetNearbyEnemies: 7, maxPack: 4 })).toBe(4)
  expect(pressurePackSize({ nearbyEnemies: 5, targetNearbyEnemies: 7, maxPack: 4 })).toBe(2)
  expect(pressurePackSize({ nearbyEnemies: 9, targetNearbyEnemies: 7, maxPack: 4 })).toBe(0)
})

test('quiet field reinforcement is paced instead of filling every frame', () => {
  const main = mainSource()
  const updateSpawning = main.slice(main.indexOf('private updateSpawning'), main.indexOf('private updateSectorWaves'))

  expect(main).toContain('private quietFieldTimer = 0')
  expect(main).toContain('this.quietFieldTimer -= dt')
  expect(updateSpawning).toContain('if (this.quietFieldTimer <= 0)')
  expect(updateSpawning).toContain('this.reinforceQuietField()')
  expect(updateSpawning).toContain('spaceSpawnBalance.quietField.reinforcementCooldownSeconds')
  expect(updateSpawning).toContain('const pressure = spawnPressureMinutes(this.stats.time)')
})
