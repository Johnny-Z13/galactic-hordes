import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { isForwardAmbushEnemy, spaceEnemyDefinitions, spaceEnemySpawnPoint, spriteEnemyKinds } from '../src/space-enemies'

test('sprite enemy catalog defines three harder forward ambush enemies', () => {
  expect(spriteEnemyKinds).toEqual(['razor', 'skimmer', 'bulwark'])

  for (const [row, kind] of spriteEnemyKinds.entries()) {
    const definition = spaceEnemyDefinitions[kind]

    expect(definition.spriteRow).toBe(row)
    expect(definition.forwardAmbush).toBe(true)
    expect(definition.hp).toBeGreaterThanOrEqual(82)
    expect(definition.value).toBeGreaterThanOrEqual(22)
    expect(isForwardAmbushEnemy(kind)).toBe(true)
  }
})

test('forward ambush enemies spawn ahead of player travel with readable side spread', () => {
  const point = spaceEnemySpawnPoint(
    'razor',
    { x: 100, y: 200, vx: 360, vy: 0, angle: 0 },
    680,
    980,
    () => 0.75
  )

  expect(point.x).toBeGreaterThanOrEqual(780)
  expect(point.x).toBeLessThanOrEqual(1080)
  expect(point.y).toBeGreaterThan(200)
  expect(point.y).toBeLessThanOrEqual(500)
})

test('forward ambush spawn falls back to ship angle when travel velocity is low', () => {
  const point = spaceEnemySpawnPoint(
    'bulwark',
    { x: 0, y: 0, vx: 0.01, vy: 0.01, angle: Math.PI / 2 },
    600,
    600,
    () => 0.5
  )

  expect(Math.abs(point.x)).toBeLessThan(1)
  expect(point.y).toBeCloseTo(600, 5)
})

test('space enemy sprite atlas has one row per new enemy and four frames', () => {
  const png = readFileSync('src/assets/space-enemy-catalog-alpha.png')
  const width = png.readUInt32BE(16)
  const height = png.readUInt32BE(20)

  expect(width).toBe(192 * 4)
  expect(height).toBe(192 * spriteEnemyKinds.length)
})
