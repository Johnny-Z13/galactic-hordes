import { expect, test } from '@playwright/test'
import { PLANET_BIOMES, selectPlanetBiome } from '../src/planet-biomes'
import type { PlanetArchetype } from '../src/surface-encounters'

test('planet biome catalog includes distinct readable world fantasies', () => {
  const ids = PLANET_BIOMES.map((biome) => biome.id)

  expect(ids).toEqual(expect.arrayContaining([
    'forestMoon',
    'desertWorld',
    'atollWorld',
    'iceWorld',
    'lavaWorld',
    'crystalWorld',
    'ruinWorld'
  ]))
  expect(new Set(PLANET_BIOMES.map((biome) => biome.surfaceMotif)).size).toBeGreaterThanOrEqual(6)
  expect(new Set(PLANET_BIOMES.map((biome) => biome.baseColor)).size).toBe(PLANET_BIOMES.length)
})

test('biome selection is deterministic and varied across nearby planets', () => {
  const archetypes: PlanetArchetype[] = ['cache', 'hostile', 'repair', 'relic', 'strange', 'lore', 'horde']
  const selected = archetypes.flatMap((archetype, index) => [
    selectPlanetBiome(archetype, 0, 0, index).id,
    selectPlanetBiome(archetype, index - 2, index + 1, index).id
  ])

  expect(selectPlanetBiome('repair', 3, -2, 1).id).toBe(selectPlanetBiome('repair', 3, -2, 1).id)
  expect(new Set(selected).size).toBeGreaterThanOrEqual(5)
})

test('archetypes bias toward fitting biomes without locking every planet to one look', () => {
  const repairBiomes = new Set(Array.from({ length: 8 }, (_, index) => selectPlanetBiome('repair', index, 0, index).id))
  const hostileBiomes = new Set(Array.from({ length: 8 }, (_, index) => selectPlanetBiome('hostile', -index, 1, index).id))

  expect(repairBiomes).toContain('forestMoon')
  expect(repairBiomes).toContain('atollWorld')
  expect(hostileBiomes).toContain('lavaWorld')
  expect(hostileBiomes).toContain('desertWorld')
  expect(repairBiomes.size).toBeGreaterThan(2)
  expect(hostileBiomes.size).toBeGreaterThan(2)
})
