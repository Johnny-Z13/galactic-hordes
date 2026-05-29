import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  evolutions,
  limitBreakChoices,
  pickupBalance,
  powerupBalance,
  relics,
  upgradeMaxRank,
  upgrades,
  workbenchBalance
} from '../src/powerup-balance'

const mainSource = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const workbenchSource = () => readFileSync(resolve(process.cwd(), 'src/ui/workbench.ts'), 'utf8')
const workbenchChoicesSource = () => readFileSync(resolve(process.cwd(), 'src/workbench-choices.ts'), 'utf8')

test('upgrade and relic definitions live in the powerup balance source', () => {
  expect(upgrades.length).toBeGreaterThan(20)
  expect(relics.length).toBeGreaterThanOrEqual(8)
  expect(evolutions.length).toBeGreaterThanOrEqual(6)
  expect(limitBreakChoices.map((choice) => choice.id)).toEqual(['might', 'cooldown', 'amount', 'speed', 'magnet', 'hull'])
})

test('weapon and pickup tuning values are named config, not main-loop constants', () => {
  expect(powerupBalance.weapon.baseFireCooldown).toBe(0.31)
  expect(powerupBalance.weapon.minFireCooldown).toBe(0.075)
  expect(pickupBalance.xp.radius).toBe(5.6)
  expect(pickupBalance.xp.mergeRadiusMax).toBe(12.6)

  const main = mainSource()
  expect(main).not.toContain('const BASE_FIRE_COOLDOWN')
  expect(main).not.toContain('const XP_PICKUP_RADIUS')
})

test('workbench roll tuning is configurable', () => {
  expect(workbenchBalance.baseChoiceCount).toBe(4)
  expect(workbenchBalance.ownedBiasBase).toBeGreaterThan(1)
  expect(workbenchBalance.ownedBiasWorkbenchTier).toBe(3)
  expect(workbenchBalance.relicChanceRare).toBeGreaterThan(workbenchBalance.relicChanceBase)
  expect(workbenchBalance.surfaceSignalCapBase).toBe(2)
  expect(workbenchBalance.surfaceSignalCapRewardEventBonus).toBe(1)
  expect(workbenchBalance.overflowSignalScrap).toBeGreaterThan(0)
})

test('power-up application values are driven by balance data and upgrade definitions', () => {
  const main = mainSource()

  expect(powerupBalance.ship.navPlanetLockRank).toBe(3)
  expect(powerupBalance.upgradeApply.temporaryMagnetRanks).toBe(1)
  expect(powerupBalance.upgradeApply.limitHullMaxPerRank).toBe(3)
  expect(powerupBalance.upgradeApply.limitHullRepairPerRank).toBe(10)
  expect(powerupBalance.upgradeApply.alienMapSurveyRanks).toBe(1)
  expect(upgradeMaxRank('shield')).toBe(upgrades.find((upgrade) => upgrade.id === 'shield')?.max)
  expect(main).toContain("upgradeMaxRank('magnet')")
  expect(main).toContain('powerupBalance.ship.navPlanetLockRank')
  expect(main).toContain('powerupBalance.upgradeApply.limitHullMaxPerRank')
  expect(main).toContain("upgradeMaxRank('survey')")
  expect(main).not.toContain('this.player.maxHull += 3')
  expect(main).not.toContain('this.player.hull + 10')
  expect(main).not.toContain("upgrades.find((u) => u.id === 'survey')?.max ?? 6")
  expect(main).not.toContain('this.build.nav >= 3')
  expect(main).not.toContain('250 + this.stats.level * 35')
})

test('signal magnet upgrade copy matches range tuning', () => {
  const magnet = upgrades.find((upgrade) => upgrade.id === 'magnet')

  expect(powerupBalance.pickupMagnet.rangePerMagnetRank).toBe(62)
  expect(magnet?.levels).toHaveLength(magnet?.max)
  expect(magnet?.levels.every((level) => level === `+${powerupBalance.pickupMagnet.rangePerMagnetRank} pickup range`)).toBe(true)
  expect(magnet?.levels.some((level) => level.includes('pickup speed'))).toBe(false)
})

test('option orb workbench path is framed as a visible weapon grade branch', () => {
  const orbit = upgrades.find((upgrade) => upgrade.id === 'orbit')

  expect(orbit?.name).toBe('Option Orbs')
  expect(orbit?.category).toBe('weapon')
  expect(orbit?.levels).toHaveLength(orbit?.max)
  expect(orbit?.levels).toEqual(expect.arrayContaining(['+1 option orb', 'Second option orb online', 'Third option orb online']))
  expect(powerupBalance.orbit.maxOptionOrbs).toBe(3)
  expect(powerupBalance.orbit.firstRankFireEvery).toBe(2)
})

test('rear gun is a weapon upgrade with named balance tuning', () => {
  const rear = upgrades.find((upgrade) => upgrade.id === 'rear')

  expect(rear).toMatchObject({ name: 'Rear Gun', category: 'weapon', bucket: 'weapons', max: 5 })
  expect(rear?.levels).toEqual(expect.arrayContaining(['Rear pulse fires backward', 'Twin rear barrels']))
  expect(powerupBalance.rearGun.damageMultiplierBase).toBeGreaterThan(0)
  expect(powerupBalance.rearGun.twinBarrelRank).toBe(3)
})

test('workbench upgrade cards distinguish next rank from current manifest rank', () => {
  const main = mainSource()

  const workbench = workbenchSource()
  const workbenchChoices = workbenchChoicesSource()

  const mothership = readFileSync(resolve(process.cwd(), 'src/ui/mothership-console.ts'), 'utf8')

  expect(main).toContain('INSTALL RANK ${level}/${choice.upgrade.max}')
  expect(mothership).toContain("runtime['upgradeLevelDetail'](upgrade, level)")
  expect(workbenchChoices).toContain('workbenchRollableUpgrades(upgrades, input.build, input.extraUnlockedIds)')
  expect(workbench).toContain('renderWorkbenchBayDetail')
  expect(workbench).toContain('renderWorkbenchUpgradeChip')
  expect(main).not.toContain('fourthChoiceChance')
})
