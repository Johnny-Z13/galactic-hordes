import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { isForwardAmbushEnemy, spaceBossEnemyKinds, spaceEnemyDefinitions, spaceEnemySpawnPoint, spriteEnemyKinds } from '../src/space-enemies'

test('sprite enemy catalog defines harder forward ambush enemies', () => {
  expect(spriteEnemyKinds).toEqual(['razor', 'skimmer', 'shard', 'helix', 'prism', 'bulwark', 'siphon', 'dreadnought', 'cathedral'])

  for (const [row, kind] of spriteEnemyKinds.entries()) {
    const definition = spaceEnemyDefinitions[kind]

    expect(definition.spriteRow).toBe(row)
    expect(definition.forwardAmbush).toBe(true)
    expect(definition.hp).toBeGreaterThanOrEqual(84)
    expect(definition.value).toBeGreaterThanOrEqual(22)
    expect(isForwardAmbushEnemy(kind)).toBe(true)
  }
})

test('new strange alien entities fill fast angular and projectile roles', () => {
  expect(spaceEnemyDefinitions.shard.speed).toBeGreaterThan(380)
  expect(spaceEnemyDefinitions.shard.maxSpeed).toBeGreaterThan(700)
  expect(spaceEnemyDefinitions.shard.attackCooldownSeconds).toBeLessThan(1)

  for (const kind of ['helix', 'prism'] as const) {
    expect(spaceEnemyDefinitions[kind].projectileDamage).toBeGreaterThan(0)
    expect(spaceEnemyDefinitions[kind].attackRange).toBeGreaterThan(800)
    expect(spaceEnemyDefinitions[kind].bossPattern).toBeUndefined()
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
  const source = readFileSync('src/render/enemies.ts', 'utf8')

  for (const kind of spriteEnemyKinds) {
    expect(source).toContain(`strokeEnemyBatch(view, '${kind}'`)
  }

  expect(source).toContain('renderPrioritySpriteEnemies(view)')
})

test('lancer enemy reads as a hostile craft instead of yellow docking UI', () => {
  const renderer = readFileSync('src/render/enemies.ts', 'utf8')

  expect(spaceEnemyDefinitions.lancer.color).toBe('#ff7a3d')
  expect(spaceEnemyDefinitions.lancer.color).not.toBe('#fff27a')
  expect(renderer).toContain("strokeEnemyBatch(view, 'lancer', '#ff7a3d')")
  expect(renderer).not.toContain("strokeEnemyBatch(view, 'lancer', '#fff27a')")
  expect(renderer).toContain('e.radius * 0.28')
  expect(renderer).toContain('r * 0.28')
  expect(renderer).toContain('r * 1.45')
})

test('giant boss enemies have dedicated attack routines', () => {
  const source = readFileSync('src/space-enemy-attacks.ts', 'utf8')
  const main = readFileSync('src/main.ts', 'utf8')

  expect(source).toContain('export function fireSiphonVortex')
  expect(source).toContain('export function fireDreadnoughtBroadside')
  expect(source).toContain('export function fireCathedralLattice')
  expect(main).toContain("from './space-enemy-attacks'")
  expect(main).not.toContain('private fireSiphonVortex(')
  expect(main).not.toContain('private fireDreadnoughtBroadside(')
  expect(main).not.toContain('private fireCathedralLattice(')
})

test('strange sprite aliens have dedicated movement and attack routines', () => {
  const behaviors = readFileSync('src/enemy-behaviors.ts', 'utf8')
  const attacks = readFileSync('src/space-enemy-attacks.ts', 'utf8')
  const main = readFileSync('src/main.ts', 'utf8')

  expect(behaviors).toContain('shard: (e, ctx, dt, def)')
  expect(attacks).toContain('export function fireHelixSpikes')
  expect(attacks).toContain('export function firePrismFan')
  expect(main).not.toContain('private fireHelixSpikes(')
  expect(main).not.toContain('private firePrismFan(')
})
