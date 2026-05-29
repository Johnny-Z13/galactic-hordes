import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { powerupBalance } from '../src/powerup-balance'
import {
  surfaceGunCooldown,
  surfaceGunDamage,
  surfaceGunSpeed,
  surfaceLowOxygenRatio,
  surfaceMaxHealth,
  surfaceMaxOxygen
} from '../src/surface/suit-stats'

test('surface suit stat helpers scale health oxygen and low oxygen threshold', () => {
  const build = { suitHealth: 3, suitO2: 2, suitBlaster: 0 }

  expect(surfaceMaxHealth(build)).toBe(powerupBalance.surface.baseHealth + 3 * powerupBalance.surface.healthPerSuitRank)
  expect(surfaceMaxOxygen(build)).toBe(powerupBalance.surface.baseOxygen + 2 * powerupBalance.surface.oxygenPerSuitRank)
  expect(surfaceLowOxygenRatio({ ...build, suitO2: 0 })).toBe(powerupBalance.surface.lowOxygenRatioBase)
  expect(surfaceLowOxygenRatio({ ...build, suitO2: powerupBalance.surface.lowOxygenSuitThreshold })).toBe(powerupBalance.surface.lowOxygenRatioUpgraded)
})

test('surface suit stat helpers scale blaster damage cadence and projectile speed', () => {
  const build = { suitHealth: 0, suitO2: 0, suitBlaster: 2 }

  expect(surfaceGunDamage(build)).toBe(powerupBalance.surface.baseGunDamage + 2 * powerupBalance.surface.gunDamagePerBlasterRank)
  expect(surfaceGunCooldown(build)).toBe(powerupBalance.surface.baseGunCooldown - 2 * powerupBalance.surface.gunCooldownPerBlasterRank)
  expect(surfaceGunCooldown({ ...build, suitBlaster: 99 })).toBe(powerupBalance.surface.minGunCooldown)
  expect(surfaceGunSpeed(build)).toBe(powerupBalance.surface.baseGunSpeed + 2 * powerupBalance.surface.gunSpeedPerBlasterRank)
})

test('main delegates surface suit stat formulas to a focused surface module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const stats = readFileSync('src/surface/suit-stats.ts', 'utf8')

  expect(stats).toContain('export function surfaceMaxHealth')
  expect(stats).toContain('export function surfaceGunCooldown')
  expect(main).toContain("from './surface/suit-stats'")
  expect(main).toContain('return surfaceMaxHealth(this.build)')
  expect(main).toContain('return surfaceGunCooldown(this.build)')
})
