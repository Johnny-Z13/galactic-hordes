import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pickupBalance } from '../src/powerup-balance'
import { collectPickup, dropPickup, updatePickupsPhysics, type Pickup } from '../src/pickups'
import { runBalance } from '../src/run-balance'

const mainSource = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const mainUpdatePickupsSource = () => {
  const main = mainSource()
  const start = main.indexOf('private updatePickups(dt: number)')
  const end = main.indexOf('private updateParticles(dt: number)', start)
  return main.slice(start, end)
}

const xpDrop = (overrides: Partial<Pickup> = {}): Pickup => ({
  kind: 'xp',
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  value: 2,
  radius: pickupBalance.xp.radius,
  life: pickupBalance.xp.lifeSeconds,
  color: '#57fff3',
  ...overrides
})

const sequence = (...values: number[]) => {
  let index = 0
  return () => values[index++ % values.length]
}

test('pickup physics collects touched drops and removes expired drops', () => {
  const touched = xpDrop({ x: 8, y: 0 })
  const expired = xpDrop({ x: 500, y: 0, life: 0.01 })
  const safe = xpDrop({ x: 500, y: 0, life: 4 })
  const pickups = [touched, expired, safe]

  const result = updatePickupsPhysics({
    pickups,
    dt: 0.05,
    player: { x: 0, y: 0, radius: 18 },
    magnetInput: { magnetLevel: 0, limitMagnet: 0, hasHungryCompass: false },
    glintEvery: 6
  })

  expect(result.collected).toEqual([touched])
  expect(pickups).toEqual([safe])
})

test('pickup physics emits magnet glints while pulling drops', () => {
  const pickup = xpDrop({ x: 200, y: 0, glintFrame: 5 })
  const pickups = [pickup]

  const result = updatePickupsPhysics({
    pickups,
    dt: 0.016,
    player: { x: 0, y: 0, radius: 18 },
    magnetInput: { magnetLevel: 0, limitMagnet: 0, hasHungryCompass: false },
    glintEvery: 6
  })

  expect(result.glints).toEqual([{ x: 200, y: 0 }])
  expect(pickup.vx).toBeLessThan(0)
  expect(pickup.glintFrame).toBe(6)
})

test('drop helper merges nearby high-load xp drops', () => {
  const existing = xpDrop({ x: 10, y: 0, value: 2, life: 1 })
  const pickups = [existing]

  dropPickup({
    pickups,
    kind: 'xp',
    x: 0,
    y: 0,
    value: 3,
    highLoad: true,
    maxPickups: 8,
    random: sequence(0.5, 0.5)
  })

  expect(pickups).toEqual([existing])
  expect(existing.value).toBe(5)
  expect(existing.life).toBe(22)
  expect(existing.radius).toBe(pickupBalance.xp.radius + pickupBalance.xp.mergeRadiusStep)
  expect(existing.vx).toBe(0)
  expect(existing.vy).toBe(0)
})

test('drop helper evicts xp first and scatters new pickups deterministically at cap', () => {
  const kept = xpDrop({ kind: 'chest', color: '#fff27a', value: 1 })
  const pickups = [xpDrop(), kept]

  dropPickup({
    pickups,
    kind: 'repair',
    x: 5,
    y: 7,
    value: 12,
    highLoad: false,
    maxPickups: 2,
    random: sequence(0, 0.5)
  })

  expect(pickups[0]).toBe(kept)
  expect(pickups[1]).toMatchObject({
    kind: 'repair',
    x: 5,
    y: 7,
    value: 12,
    radius: pickupBalance.defaultRadius,
    life: pickupBalance.persistentLifeSeconds,
    color: '#8fff7d'
  })
  expect(pickups[1].vx).toBeCloseTo((pickupBalance.scatterSpeedMin + pickupBalance.scatterSpeedMax) / 2)
  expect(pickups[1].vy).toBeCloseTo(0)
})

test('collection helper resolves xp and banks crossed mutation signals', () => {
  const result = collectPickup({
    pickup: xpDrop({ value: runBalance.xp.startingNext + 4 }),
    stats: { score: 10, level: 1, xp: 0, nextXp: runBalance.xp.startingNext },
    player: { hull: 70, maxHull: 100, pickupAbsorbPulse: 0 },
    magnetRank: 0,
    maxMagnetRank: 6
  })

  expect(result.stats.score).toBe(10 + runBalance.xp.startingNext + 4)
  expect(result.stats.level).toBe(2)
  expect(result.stats.xp).toBe(4)
  expect(result.bankedSignals).toBe(1)
  expect(result.bankMessage).toBe('MUTATION SIGNAL BANKED. LAND TO INSTALL IT.')
  expect(result.player.pickupAbsorbPulse).toBe(0.34)
})

test('collection helper resolves repair magnet and chest rewards', () => {
  const repair = collectPickup({
    pickup: xpDrop({ kind: 'repair', value: 40, color: '#8fff7d' }),
    stats: { score: 0, level: 2, xp: 0, nextXp: 80 },
    player: { hull: 75, maxHull: 100, pickupAbsorbPulse: 0.2 },
    magnetRank: 0,
    maxMagnetRank: 6
  })
  expect(repair.player.hull).toBe(100)

  const magnet = collectPickup({
    pickup: xpDrop({ kind: 'magnet', value: 1, color: '#b990ff' }),
    stats: { score: 0, level: 2, xp: 0, nextXp: 80 },
    player: { hull: 75, maxHull: 100, pickupAbsorbPulse: 0 },
    magnetRank: 6,
    maxMagnetRank: 6
  })
  expect(magnet.magnetRank).toBe(6)
  expect(magnet.extendPickupLifeSeconds).toBe(2)
  expect(magnet.toast).toBe('SIGNAL MAGNET TEMPORARILY OVERCHARGED')

  const chest = collectPickup({
    pickup: xpDrop({ kind: 'chest', value: 1, color: '#fff27a' }),
    stats: { score: 5, level: 3, xp: 0, nextXp: 80 },
    player: { hull: 75, maxHull: 100, pickupAbsorbPulse: 0 },
    magnetRank: 0,
    maxMagnetRank: 6
  })
  expect(chest.stats.score).toBe(5 + runBalance.scoring.treasureCoreBase + 3 * runBalance.scoring.treasureCorePerLevel)
  expect(chest.bankedSignals).toBe(1)
  expect(chest.artifact?.id).toBe('cache:treasure-core')
})

test('opening xp assist pulls early drops from farther away only during the opening', () => {
  const openingPickup = xpDrop({ x: 400 })
  const latePickup = xpDrop({ x: 400 })

  updatePickupsPhysics({
    pickups: [openingPickup],
    dt: 0.016,
    player: { x: 0, y: 0, radius: 18 },
    magnetInput: { magnetLevel: 0, limitMagnet: 0, hasHungryCompass: false, elapsed: 20 },
    glintEvery: 6
  })
  updatePickupsPhysics({
    pickups: [latePickup],
    dt: 0.016,
    player: { x: 0, y: 0, radius: 18 },
    magnetInput: { magnetLevel: 0, limitMagnet: 0, hasHungryCompass: false, elapsed: 70 },
    glintEvery: 6
  })

  expect(openingPickup.vx).toBeLessThan(0)
  expect(latePickup.vx).toBe(0)
})

test('main delegates pickup physics to the focused pickup module', () => {
  const main = mainSource()
  const updatePickups = mainUpdatePickupsSource()

  expect(main).toContain("from './pickups'")
  expect(updatePickups).toContain('updatePickupsPhysics({')
  expect(updatePickups).toContain('elapsed: this.stats.time')
  expect(updatePickups).not.toContain('const magnet = pickupMagnetRange(p.kind, magnetInput)')
})

test('main delegates pickup drops to the focused pickup module', () => {
  const main = mainSource()

  expect(main).toContain('dropPickup({')
  expect(main).not.toContain("const color = kind === 'xp' ? '#57fff3'")
})

test('main delegates pickup collection rewards to the focused pickup module', () => {
  const main = mainSource()

  expect(main).toContain('const collection = collectPickup({')
  expect(main).not.toContain("if (p.kind === 'xp') {")
})
