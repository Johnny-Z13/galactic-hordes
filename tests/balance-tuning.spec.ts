import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pickupBalance, powerupBalance } from '../src/powerup-balance'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const weaponSource = () => readFileSync(resolve(process.cwd(), 'src/space-player-weapons.ts'), 'utf8')
const pickupSource = () => readFileSync(resolve(process.cwd(), 'src/pickups.ts'), 'utf8')
const pickupRenderSource = () => readFileSync(resolve(process.cwd(), 'src/render/pickups.ts'), 'utf8')

test('starter ship fire cadence and bullet speed begin slower', () => {
  const weapons = weaponSource()

  expect(powerupBalance.weapon.baseFireCooldown).toBe(0.31)
  expect(powerupBalance.weapon.rapidCooldownPerRank).toBe(0.012)
  expect(powerupBalance.weapon.minFireCooldown).toBe(0.075)
  expect(powerupBalance.weapon.baseProjectileSpeed).toBe(650)
  expect(weapons).toContain('powerupBalance.weapon.baseFireCooldown')
  expect(weapons).toContain('powerupBalance.weapon.rapidCooldownPerRank')
})

test('xp pickups are thirty percent smaller including merged drops and halos', () => {
  const main = source()
  const pickupLogic = pickupSource()
  const pickups = pickupRenderSource()

  expect(pickupBalance.xp.radius).toBe(5.6)
  expect(pickupBalance.xp.mergeRadiusStep).toBe(0.45)
  expect(pickupBalance.xp.mergeRadiusMax).toBe(12.6)
  expect(pickupBalance.xp.outerHalo).toBe(9.8)
  expect(pickupLogic).toContain("kind === 'chest' ? pickupBalance.chestRadius : kind === 'xp' ? pickupBalance.xp.radius : pickupBalance.defaultRadius")
  expect(pickupLogic).toContain('pickup.radius + pickupBalance.xp.mergeRadiusStep')
  expect(main).toContain("from './render/pickups'")
  expect(pickups).toContain('export function renderPickups')
  expect(pickups).toContain("pickup.kind === 'xp' ? r + pickupBalance.xp.radius : r + pickupBalance.defaultRadius")
  expect(pickups).toContain('r + pickupBalance.xp.outerHalo')
})
