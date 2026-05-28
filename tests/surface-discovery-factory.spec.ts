import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { TAU } from '../src/math-utils'
import { planetAlienCatalogVariants, surfaceRunBalance } from '../src/surface-balance'
import {
  createSurfaceAliens,
  createSurfaceLoreSites
} from '../src/surface/discovery-factory'

const planet = { id: 'planet:glass', name: 'GLASS GARDEN', archetype: 'strange' as const }
const middleRange = (min: number, max: number) => (min + max) / 2

test('surface alien factory returns catalog alien with deterministic placement and gift', () => {
  const aliens = createSurfaceAliens({
    planet,
    event: 'repair',
    threatCount: 0,
    scenario: 'friendly',
    forcedCount: 1,
    surfaceInterest: 0.5,
    time: 93,
    random: () => 0.2,
    randomRange: middleRange
  })
  const expectedRow = aliens[0].spriteRow!
  const variant = planetAlienCatalogVariants[expectedRow]

  expect(aliens).toHaveLength(1)
  expect(aliens[0]).toMatchObject({
    x: 800,
    y: 585,
    radius: surfaceRunBalance.alien.radius,
    phase: TAU / 2,
    color: variant.color,
    name: variant.name,
    gift: variant.gift,
    resolved: false,
    sprite: 'alienCatalog',
    spriteRow: expectedRow
  })
})

test('surface alien factory can skip optional contacts when spawn chance fails', () => {
  const aliens = createSurfaceAliens({
    planet,
    event: 'swarm',
    threatCount: 4,
    scenario: 'salvage',
    surfaceInterest: 0,
    time: 0,
    random: () => 0.99,
    randomRange: middleRange
  })

  expect(aliens).toEqual([])
})

test('surface lore factory creates forced lore sites through the safe point callback', () => {
  const safePoints: Array<{ x: number; y: number; minDistance: number }> = []
  const sites = createSurfaceLoreSites({
    planet,
    scenario: 'lore',
    event: 'relic',
    forcedCount: 2,
    planetsVisited: 3,
    random: () => 0.1,
    randomRange: middleRange,
    safePoint: (point, minDistance) => {
      safePoints.push({ ...point, minDistance })
      return { x: point.x + 7, y: point.y - 11 }
    }
  })

  expect(sites).toHaveLength(2)
  expect(safePoints).toHaveLength(2)
  expect(safePoints.every((point) => point.minDistance === 260)).toBe(true)
  expect(sites[0]).toMatchObject({
    x: safePoints[0].x + 7,
    y: safePoints[0].y - 11,
    radius: sites[0].kind === 'pyramid' ? 36 : 30,
    phase: TAU / 2,
    resolved: false
  })
  expect(sites[0].copy).toContain(planet.name)
})

test('main delegates surface discovery construction to a focused surface factory', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain("from './surface/discovery-factory'")
  expect(main).toContain('createSurfaceAliensFactory({')
  expect(main).toContain('createSurfaceLoreSitesFactory({')
  expect(main).not.toContain('private loreLibrary(')
})
