import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pickupBalance } from '../src/powerup-balance'
import { updatePickupsPhysics, type Pickup } from '../src/pickups'

const mainSource = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')

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

test('main delegates pickup physics to the focused pickup module', () => {
  const main = mainSource()

  expect(main).toContain("from './pickups'")
  expect(main).toContain('updatePickupsPhysics({')
  expect(main).not.toContain('const magnet = pickupMagnetRange(p.kind, magnetInput)')
})
