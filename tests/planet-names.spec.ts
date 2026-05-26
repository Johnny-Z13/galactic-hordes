import { expect, test } from '@playwright/test'
import { planetNameFor } from '../src/planet-names'
import type { PlanetArchetype } from '../src/surface-encounters'

test('planet names are deterministic and compact', () => {
  const name = planetNameFor({ archetype: 'relic', biomeId: 'ruinWorld', chunkX: 4, chunkY: -2, index: 1 })

  expect(name).toBe(planetNameFor({ archetype: 'relic', biomeId: 'ruinWorld', chunkX: 4, chunkY: -2, index: 1 }))
  expect(name.split(/\s+/).length).toBeLessThanOrEqual(3)
})

test('planet names vary across archetypes and coordinates', () => {
  const archetypes: PlanetArchetype[] = ['cache', 'hostile', 'repair', 'relic', 'strange', 'lore', 'horde']
  const names = new Set(archetypes.flatMap((archetype, i) => [
    planetNameFor({ archetype, biomeId: 'crystalWorld', chunkX: i, chunkY: i + 2, index: 0 }),
    planetNameFor({ archetype, biomeId: 'ruinWorld', chunkX: i + 3, chunkY: -i, index: 1 })
  ]))

  expect(names.size).toBeGreaterThanOrEqual(12)
})
