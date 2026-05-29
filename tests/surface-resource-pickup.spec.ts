import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { powerupBalance } from '../src/powerup-balance'
import { resolveSurfaceResourcePickup } from '../src/surface/resource-pickup'

test('surface crystal pickup applies cargo gain score and mutation xp value', () => {
  const result = resolveSurfaceResourcePickup({
    resource: { kind: 'crystal', value: 10 },
    build: { cargo: 2, suitHealth: 0 }
  })
  const cargoBonus = 1 + 2 * powerupBalance.upgradeApply.cargoResourceBonusPerRank

  expect(result).toEqual({
    scrap: 0,
    crystal: Math.ceil(10 * cargoBonus),
    score: 120,
    mutationXp: 10,
    repair: 0,
    cache: false
  })
})

test('surface scrap and repair pickups apply their own upgrade scaling', () => {
  const scrap = resolveSurfaceResourcePickup({
    resource: { kind: 'scrap', value: 9 },
    build: { cargo: 3, suitHealth: 0 }
  })
  const repair = resolveSurfaceResourcePickup({
    resource: { kind: 'repair', value: 20 },
    build: { cargo: 0, suitHealth: 2 }
  })

  expect(scrap.scrap).toBe(Math.ceil(9 * (1 + 3 * powerupBalance.upgradeApply.cargoResourceBonusPerRank)))
  expect(scrap.score).toBe(scrap.scrap)
  expect(repair.repair).toBe(20 * (1 + 2 * powerupBalance.upgradeApply.suitRepairBonusPerRank))
})

test('surface cache pickup delegates reward handling to cache resolver', () => {
  const result = resolveSurfaceResourcePickup({
    resource: { kind: 'cache', value: 99 },
    build: { cargo: 4, suitHealth: 4 }
  })

  expect(result).toMatchObject({ scrap: 0, crystal: 0, score: 0, mutationXp: 0, repair: 0, cache: true })
})

test('main delegates ordinary surface pickup math to a focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const helper = readFileSync('src/surface/resource-pickup.ts', 'utf8')

  expect(helper).toContain('export function resolveSurfaceResourcePickup')
  expect(main).toContain("from './surface/resource-pickup'")
  expect(main).toContain('resolveSurfaceResourcePickup({')
  expect(main).not.toContain('cargoResourceBonusPerRank))')
})
