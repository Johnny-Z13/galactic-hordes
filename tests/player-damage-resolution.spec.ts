import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { powerupBalance } from '../src/powerup-balance'
import { damageShipPlayer, damageSurfacePilot } from '../src/combat/player-damage-resolution'

test('ship damage helper applies phase reduction shield absorption and flash feedback', () => {
  const player = {
    hull: 100,
    maxHull: 100,
    shield: 20,
    shieldDelay: 0,
    invuln: 0
  }

  const result = damageShipPlayer({
    player,
    amount: 30,
    phaseRank: 2
  })

  const reducedDamage = 30 * (1 - 2 * powerupBalance.upgradeApply.phaseShipDamageReductionPerRank)
  expect(result).toMatchObject({ hullDamage: reducedDamage - 20, shieldDamage: 20 })
  expect(player.invuln).toBe(0.42)
  expect(player.shieldDelay).toBe(2.4)
  expect(player.shield).toBe(0)
  expect(player.hull).toBeCloseTo(100 - (reducedDamage - 20))
  expect(result?.flash.kind).toBe('hull')
})

test('ship damage helper skips invulnerable ships and reports shield-only hits', () => {
  const invulnerable = { hull: 100, maxHull: 100, shield: 0, shieldDelay: 0, invuln: 0.1 }
  expect(damageShipPlayer({ player: invulnerable, amount: 20, phaseRank: 0 })).toBeNull()
  expect(invulnerable.hull).toBe(100)

  const shielded = { hull: 100, maxHull: 100, shield: 30, shieldDelay: 0, invuln: 0 }
  const result = damageShipPlayer({ player: shielded, amount: 12, phaseRank: 0 })
  expect(result).toMatchObject({ hullDamage: 0, shieldDamage: 12 })
  expect(shielded.hull).toBe(100)
  expect(shielded.shield).toBe(18)
  expect(result?.flash.kind).toBe('shield')
})

test('surface damage helper applies suit reduction and critical return signal', () => {
  const pilot = {
    health: 50,
    maxHealth: 60,
    invuln: 0
  }

  const result = damageSurfacePilot({
    pilot,
    amount: 40,
    phaseRank: 3
  })

  const reducedDamage = 40 * (1 - 3 * powerupBalance.upgradeApply.phaseSurfaceDamageReductionPerRank)
  expect(result).toMatchObject({ hullDamage: reducedDamage, shieldDamage: 0, suitCritical: false })
  expect(pilot.invuln).toBe(0.65)
  expect(pilot.health).toBeCloseTo(50 - reducedDamage)
  expect(result?.flash.kind).toBe('surface')

  const fragile = { health: 6, maxHealth: 60, invuln: 0 }
  expect(damageSurfacePilot({ pilot: fragile, amount: 12, phaseRank: 0 })?.suitCritical).toBe(true)
  expect(fragile.health).toBe(0)
})

test('main delegates player damage resolution to a focused combat module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const damage = readFileSync('src/combat/player-damage-resolution.ts', 'utf8')

  expect(damage).toContain('export function damageShipPlayer')
  expect(damage).toContain('export function damageSurfacePilot')
  expect(main).toContain("from './combat/player-damage-resolution'")
  expect(main).toContain('const damage = damageShipPlayer({')
  expect(main).toContain('const damage = damageSuitPilot({')
})
