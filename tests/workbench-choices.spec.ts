import { expect, test } from '@playwright/test'
import {
  availableWorkbenchEvolutions,
  rollWorkbenchChoices,
  workbenchUpgradeWeight
} from '../src/workbench-choices'
import { upgrades, workbenchBalance, type RelicId, type UpgradeId } from '../src/powerup-balance'

const emptyBuild = () => Object.fromEntries(upgrades.map((upgrade) => [upgrade.id, 0])) as Record<UpgradeId, number>

test('available workbench evolutions require a maxed weapon catalyst and unclaimed evolution', () => {
  const build = emptyBuild()
  build.rapid = upgrades.find((upgrade) => upgrade.id === 'rapid')!.max

  expect(availableWorkbenchEvolutions(build, new Set<RelicId>(['staticIdol']), new Set()).map((evolution) => evolution.weapon)).toContain('rapid')
  expect(availableWorkbenchEvolutions(build, new Set(), new Set()).map((evolution) => evolution.weapon)).not.toContain('rapid')
  expect(availableWorkbenchEvolutions(build, new Set<RelicId>(['staticIdol']), new Set<UpgradeId>(['rapid'])).map((evolution) => evolution.weapon)).not.toContain('rapid')
})

test('workbench upgrade weight keeps owned weapon bias explicit', () => {
  const rapid = upgrades.find((upgrade) => upgrade.id === 'rapid')!
  const build = emptyBuild()

  expect(workbenchUpgradeWeight(rapid, { build, rare: false, workbenchTier: 0 })).toBeCloseTo(rapid.rarity * workbenchBalance.weaponFocusWeight)

  build.rapid = 1
  expect(workbenchUpgradeWeight(rapid, { build, rare: false, workbenchTier: 3 })).toBeCloseTo(
    rapid.rarity
    * (workbenchBalance.ownedBiasBase + workbenchBalance.ownedBiasWorkbenchBonus)
    * workbenchBalance.weaponFocusWeight
  )
})

test('workbench choice rolling prioritizes jackpot discovery and upgrade offers before limit breaks', () => {
  const build = emptyBuild()
  build.rapid = upgrades.find((upgrade) => upgrade.id === 'rapid')!.max

  const choices = rollWorkbenchChoices({
    count: 3,
    rare: true,
    build,
    relics: new Set<RelicId>(['staticIdol']),
    evolved: new Set(),
    workbenchTier: 0,
    discoverySuitOffer: true,
    random: () => 0
  })

  expect(choices.map((choice) => choice.kind)).toEqual(['evolution', 'relic', 'upgrade'])
  expect(choices[0].kind === 'evolution' ? choices[0].evolution.weapon : '').toBe('rapid')
  expect(choices[2].kind === 'upgrade' ? choices[2].upgrade.id : '').toBe('suitO2')
})
