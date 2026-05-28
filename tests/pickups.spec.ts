import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pickupBalance } from '../src/powerup-balance'
import { updatePickupsPhysics, type Pickup } from '../src/pickups'

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
