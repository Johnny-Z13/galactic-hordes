import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { powerupBalance } from '../src/powerup-balance'
import { resolveShipFlightStats } from '../src/ship-flight-stats'

test('ship flight stats combine base speed with engine and navigation ranks', () => {
  const stats = resolveShipFlightStats({
    baseSpeed: 460,
    engine: 3,
    nav: 2
  })

  expect(stats.acceleration).toBe(
    powerupBalance.ship.accelerationBase
      + 3 * powerupBalance.ship.accelerationPerEngineRank
      + 2 * powerupBalance.ship.accelerationPerNavRank
  )
  expect(stats.maxSpeed).toBe(
    460
      + 3 * powerupBalance.ship.maxSpeedPerEngineRank
      + 2 * powerupBalance.ship.maxSpeedPerNavRank
  )
})

test('main delegates ship flight formulas to focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const helper = readFileSync('src/ship-flight-stats.ts', 'utf8')

  expect(helper).toContain('export function resolveShipFlightStats')
  expect(main).toContain("from './ship-flight-stats'")
  expect(main).toContain('const flightStats = resolveShipFlightStats({')
  expect(main).not.toContain('powerupBalance.ship.accelerationPerEngineRank')
  expect(main).not.toContain('powerupBalance.ship.maxSpeedPerNavRank')
})
