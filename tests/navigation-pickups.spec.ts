import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { bestNavigationPickup } from '../src/navigation-pickups'
import { powerupBalance } from '../src/powerup-balance'
import type { Pickup } from '../src/pickups'

const pickup = (kind: Pickup['kind'], x: number, y: number): Pickup => ({
  kind,
  x,
  y,
  vx: 0,
  vy: 0,
  value: 1,
  radius: 8,
  life: 10,
  color: '#fff'
})

test('navigation pickup scoring prefers valuable pickups over nearby scraps inside reach', () => {
  const player = { x: 0, y: 0 }
  const pickups = [
    pickup('xp', 110, 0),
    pickup('repair', 190, 0),
    pickup('chest', 220, 0)
  ]

  expect(bestNavigationPickup({ pickups, player, navRank: 0, magnetRank: 0 })).toBe(pickups[2])
})

test('navigation pickup reach scales from nav and magnet ranks', () => {
  const player = { x: 0, y: 0 }
  const reach = powerupBalance.ship.navPickupReachBase
    + 2 * powerupBalance.ship.navPickupReachPerNavRank
    + 3 * powerupBalance.ship.navPickupReachPerMagnetRank
  const pickups = [pickup('core', reach - 1, 0)]

  expect(bestNavigationPickup({ pickups, player, navRank: 0, magnetRank: 0 })).toBeNull()
  expect(bestNavigationPickup({ pickups, player, navRank: 2, magnetRank: 3 })).toBe(pickups[0])
})

test('main delegates navigation pickup scoring to focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const helper = readFileSync('src/navigation-pickups.ts', 'utf8')

  expect(helper).toContain('export function bestNavigationPickup')
  expect(main).toContain("from './navigation-pickups'")
  expect(main).toContain('return bestNavigationPickup({')
  expect(main).not.toContain("pickup.kind === 'chest' ? 9")
  expect(main).not.toContain('navPickupMinScoreDistance')
})
