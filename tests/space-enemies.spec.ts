import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { isForwardAmbushEnemy, spaceBossEnemyKinds, spaceEnemyDefinitions, spaceEnemySpawnPoint, spriteEnemyKinds } from '../src/space-enemies'

test('sprite enemy catalog defines six harder forward ambush enemies', () => {
  expect(spriteEnemyKinds).toEqual(['razor', 'skimmer', 'bulwark', 'siphon', 'dreadnought', 'cathedral'])

  for (const [row, kind] of spriteEnemyKinds.entries()) {
    const definition = spaceEnemyDefinitions[kind]

    expect(definition.spriteRow).toBe(row)
    expect(definition.forwardAmbush).toBe(true)
    expect(definition.hp).toBeGreaterThanOrEqual(82)
    expect(definition.value).toBeGreaterThanOrEqual(22)
    expect(isForwardAmbushEnemy(kind)).toBe(true)
  }
})

test('new sprite enemies include three giant boss threats with unique patterns', () => {
  expect(spaceBossEnemyKinds).toEqual(['siphon', 'dreadnought', 'cathedral'])
  const patterns = new Set<string>()

  for (const kind of spaceBossEnemyKinds) {
    const definition = spaceEnemyDefinitions[kind]

    expect(definition.radius).toBeGreaterThanOrEqual(52)
    expect(definition.hp).toBeGreaterThanOrEqual(520)
    expect(definition.value).toBeGreaterThanOrEqual(90)
    expect(definition.projectileDamage).toBeGreaterThanOrEqual(12)
    expect(definition.timeGateSeconds).toBeGreaterThanOrEqual(330)
    expect(definition.bossPattern).toBeTruthy()
    patterns.add(definition.bossPattern ?? '')
  }

  expect(patterns.size).toBe(3)
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

test('high-load renderer batches every sprite enemy kind', () => {
  const source = readFileSync('src/main.ts', 'utf8')

  for (const kind of spriteEnemyKinds) {
    expect(source).toContain(`strokeEnemyBatch(ctx, '${kind}'`)
  }

  expect(source).toContain('this.renderPrioritySpriteEnemies(ctx)')
})

test('giant boss enemies have dedicated attack routines', () => {
  const source = readFileSync('src/main.ts', 'utf8')

  expect(source).toContain('this.fireSiphonVortex')
  expect(source).toContain('this.fireDreadnoughtBroadside')
  expect(source).toContain('this.fireCathedralLattice')
})
