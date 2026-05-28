import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { surfaceThreatBalance } from '../src/game-balance'
import { TAU } from '../src/math-utils'
import { planetBossCatalogVariants, surfaceRunBalance, surfaceThreatMotionBalance } from '../src/surface-balance'
import {
  createGenericSurfaceThreat,
  createGlassMiteOracleThreat,
  createPlanetBossThreat
} from '../src/surface/threat-factory'
import { surfaceThreatKeepouts } from '../src/surface/threat-placement'

const planet = {
  id: 'planet:test',
  name: 'NULL CATHEDRAL'
}

const middleRange = (min: number, max: number) => (min + max) / 2
const keepouts = surfaceThreatKeepouts({ x: 600, y: 560 }, surfaceRunBalance.world.ship)

test('generic surface threat factory returns threat stats and discovery metadata', () => {
  const result = createGenericSurfaceThreat({
    planet,
    event: 'horde',
    index: 1,
    total: 4,
    keepouts,
    time: 20,
    randomRange: middleRange
  })

  expect(result.discovery).toMatchObject({
    id: 'enemy:surface:horde',
    title: 'Horde Larva',
    source: 'Planet surface telemetry',
    color: '#ff61d8'
  })
  expect(result.threat).toMatchObject({
    hp: surfaceThreatBalance.generic.hordeBaseHp + 20 * surfaceThreatBalance.generic.hordeHpPerSecond,
    radius: surfaceThreatBalance.generic.hordeRadius,
    color: '#ff61d8',
    behavior: 'chaser'
  })
  expect(result.threat.phase).toBe(TAU / 2)
})

test('planet boss factory chooses catalog variant and exposes boss discovery metadata', () => {
  const result = createPlanetBossThreat({
    planet,
    crowded: false,
    keepouts,
    time: 120,
    level: 4,
    planetsVisited: 2,
    randomRange: middleRange
  })
  const variant = planetBossCatalogVariants[result.threat.spriteRow ?? -1]

  expect(result.discovery).toEqual({
    id: `enemy:surface:boss:${result.threat.spriteRow}`,
    title: variant.title,
    detail: `${planet.name} ${variant.note}.`,
    source: 'Boss catalog telemetry',
    color: variant.color
  })
  expect(result.threat).toMatchObject({
    hp: surfaceThreatBalance.boss.baseHp + 120 * surfaceThreatBalance.boss.hpPerSecond + 4 * surfaceThreatBalance.boss.hpPerLevel,
    radius: surfaceThreatBalance.boss.radius,
    color: variant.color,
    sprite: 'bossCatalog',
    boss: true,
    behavior: variant.behavior,
    behaviorCooldown: (surfaceThreatMotionBalance.blink.cooldownMin + surfaceThreatMotionBalance.blink.cooldownMax) / 2
  })
})

test('oracle threat factory creates the rare oracle threat and discovery metadata', () => {
  const result = createGlassMiteOracleThreat({
    keepouts,
    time: 90,
    randomRange: middleRange
  })

  expect(result.discovery).toEqual({
    id: 'enemy:surface:oracle',
    title: 'Glass Mite Oracle',
    detail: 'Rare crystalline oracle encountered on a strange surface.',
    source: 'Planet surface telemetry',
    color: '#57fff3'
  })
  expect(result.threat).toMatchObject({
    hp: surfaceThreatBalance.oracle.baseHp + 90 * surfaceThreatBalance.oracle.hpPerSecond,
    radius: surfaceThreatBalance.oracle.radius,
    color: '#57fff3',
    sprite: 'glassMiteOracle',
    behavior: 'chaser'
  })
})

test('main delegates surface threat construction to a focused surface factory', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const factory = readFileSync('src/surface/threat-factory.ts', 'utf8')

  expect(factory).toContain('export function createGenericSurfaceThreat')
  expect(factory).toContain('export function createPlanetBossThreat')
  expect(factory).toContain('export function createGlassMiteOracleThreat')
  expect(main).toContain("from './surface/threat-factory'")
  expect(main).toContain('createGenericSurfaceThreatFactory({')
  expect(main).toContain('this.recordEnemyDiscovery(discovery.id')
})
