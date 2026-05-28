import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  planetAlienCatalogVariants,
  planetBossCatalogVariants,
  surfaceThreatMotionBalance
} from '../src/surface-balance'

test('planet alien and boss catalogs expose eight balanceable rows', () => {
  expect(planetAlienCatalogVariants.map((variant) => variant.name)).toEqual([
    'THE GLASS HERBALIST',
    'A STATIC PILGRIM',
    'THE COIN KEEPER',
    'THE STAR MAPMAKER',
    'THE STATION WIDOW',
    'THE SPORE CHOIR',
    'THE MIRROR DRIFTER',
    'THE SINGING ENGINE'
  ])
  expect(planetBossCatalogVariants.map((variant) => variant.behavior)).toEqual([
    'chaser',
    'chaser',
    'chaser',
    'chaser',
    'chaser',
    'orbiter',
    'blinker',
    'splitter'
  ])
})

test('planet sprite atlases have one row per catalog variant and four frames', () => {
  const alien = readFileSync('src/assets/planet-alien-catalog-alpha.png')
  const boss = readFileSync('src/assets/planet-boss-catalog-alpha.png')

  expect(alien.readUInt32BE(16)).toBe(192 * 4)
  expect(alien.readUInt32BE(20)).toBe(192 * planetAlienCatalogVariants.length)
  expect(boss.readUInt32BE(16)).toBe(256 * 4)
  expect(boss.readUInt32BE(20)).toBe(256 * planetBossCatalogVariants.length)
})

test('new planet boss behaviors are tuned from surface balance config', () => {
  const source = readFileSync('src/main.ts', 'utf8')
  const threatBehaviorSource = readFileSync('src/surface/threat-behavior.ts', 'utf8')

  expect(surfaceThreatMotionBalance.orbit.tangent).toBeGreaterThan(0)
  expect(surfaceThreatMotionBalance.blink.cooldownMax).toBeGreaterThan(surfaceThreatMotionBalance.blink.cooldownMin)
  expect(surfaceThreatMotionBalance.splitter.childCount).toBeGreaterThanOrEqual(2)
  expect(threatBehaviorSource).toContain("behavior === 'orbiter'")
  expect(threatBehaviorSource).toContain("behavior === 'blinker'")
  expect(source).toContain("threat.behavior === 'splitter'")
  expect(source).toContain('surfaceThreatMotionBalance')
})
