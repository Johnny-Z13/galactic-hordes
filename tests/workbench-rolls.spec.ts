import { expect, test } from '@playwright/test'
import { upgrades, type UpgradeId } from '../src/powerup-balance'
import {
  firstOpportunityUpgrade,
  workbenchLockedUpgrades,
  workbenchRollableUpgrades,
  workbenchStarterUpgradeIds,
  workbenchUpgradeRows,
  workbenchUnlockedUpgradeIds
} from '../src/workbench-rolls'

const simpleUpgrades = [
  { id: 'rapid', max: 8 },
  { id: 'nav', max: 7 },
  { id: 'shield', max: 5 }
]

const emptyBuild = () => Object.fromEntries(upgrades.map((upgrade) => [upgrade.id, 0])) as Record<UpgradeId, number>

test('does not force a first opportunity upgrade by default', () => {
  expect(firstOpportunityUpgrade(simpleUpgrades, { rapid: 0, nav: 0, shield: 0 })).toBeNull()
})

test('can still require a specific upgrade when requested', () => {
  expect(firstOpportunityUpgrade(simpleUpgrades, { rapid: 0, nav: 0, shield: 0 }, 'nav')?.id).toBe('nav')
  expect(firstOpportunityUpgrade(simpleUpgrades, { rapid: 0, nav: 1, shield: 0 }, 'nav')).toBeNull()
})

test('starter workbench pool has five immediately rollable systems', () => {
  expect(workbenchStarterUpgradeIds).toEqual(['rapid', 'engine', 'magnet', 'shield', 'split'])
  expect(workbenchUnlockedUpgradeIds(upgrades, emptyBuild())).toEqual(workbenchStarterUpgradeIds)
})

test('starter systems unlock discovery branches before they are maxed', () => {
  const build = emptyBuild()
  build.rapid = 3
  build.engine = 3
  build.magnet = 4
  build.shield = 3
  build.split = 3

  const unlocked = workbenchUnlockedUpgradeIds(upgrades, build)

  expect(unlocked).toContain('chain')
  expect(unlocked).toContain('nav')
  expect(unlocked).toContain('luck')
  expect(unlocked).toContain('repair')
  expect(unlocked).toContain('pierce')
  expect(unlocked).toContain('orbit')
})

test('rollable workbench upgrades exclude maxed systems and include newly unlocked systems', () => {
  const build = emptyBuild()
  build.rapid = upgrades.find((upgrade) => upgrade.id === 'rapid')!.max

  const rollable = workbenchRollableUpgrades(upgrades, build).map((upgrade) => upgrade.id)

  expect(rollable).not.toContain('rapid')
  expect(rollable).toContain('chain')
  expect(rollable).toContain('rail')
})

test('locked workbench upgrades include human readable unlock requirements', () => {
  const locked = workbenchLockedUpgrades(upgrades, emptyBuild())
  const nav = locked.find((entry) => entry.upgrade.id === 'nav')
  const rift = locked.find((entry) => entry.upgrade.id === 'rift')
  const heat = locked.find((entry) => entry.upgrade.id === 'heat')

  expect(nav?.requirement).toBe('Drift Engine rank 3')
  expect(rift?.requirement).toBe('Max Rail Lattice or Echo Chamber')
  expect(heat?.requirement).toBe('Pulse Cannon rank 5 or Echo Chamber rank 2')
})

test('early planet pacing keeps the rollable system pool readable', () => {
  const build = emptyBuild()
  build.rapid = 3
  build.engine = 2
  build.magnet = 2
  build.shield = 2
  build.split = 2

  const rollable = workbenchRollableUpgrades(upgrades, build).map((upgrade) => upgrade.id)

  expect(rollable).toContain('chain')
  expect(rollable.length).toBeLessThanOrEqual(6)
  expect(rollable).not.toContain('nav')
  expect(rollable).not.toContain('luck')
  expect(rollable).not.toContain('repair')
  expect(rollable).not.toContain('pierce')
})

test('workbench upgrade rows keep systems in canonical positions while offers light up', () => {
  const build = emptyBuild()
  build.rapid = 1

  const rows = workbenchUpgradeRows(upgrades, build, ['rapid', 'engine'])

  expect(rows.map((row) => row.upgrade.id)).toEqual(upgrades.map((upgrade) => upgrade.id))
  expect(rows.find((row) => row.upgrade.id === 'rapid')?.status).toBe('offer')
  expect(rows.find((row) => row.upgrade.id === 'engine')?.status).toBe('offer')
  expect(rows.find((row) => row.upgrade.id === 'magnet')?.status).toBe('standby')
  expect(rows.find((row) => row.upgrade.id === 'nav')?.status).toBe('locked')
})
