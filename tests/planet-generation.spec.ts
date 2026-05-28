import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  createChunkPlanet,
  pickSectorPlanetArchetype,
  planetClearance,
  planetFallbackSlot
} from '../src/planet-generation'

const scriptedRandom = (values: number[]) => {
  let index = 0
  return () => values[index++] ?? values[values.length - 1] ?? 0
}

test('sector archetype picker prefers weighted route bias when it wins the roll', () => {
  const archetype = pickSectorPlanetArchetype({
    chunkX: 4,
    chunkY: -2,
    index: 1,
    archetypeBias: { cache: 0, hostile: 0, repair: 4, relic: 0, strange: 0, lore: 0, horde: 0 },
    random: scriptedRandom([0.2, 0.5])
  })

  expect(archetype).toBe('repair')
})

test('planet fallback slots cycle through readable chunk positions', () => {
  expect(planetFallbackSlot(0, 0)).toEqual({ x: 0.2, y: 0.24 })
  expect(planetFallbackSlot(1, 0)).toEqual({ x: 0.78, y: 0.34 })
  expect(planetFallbackSlot(2, 0)).toEqual({ x: 0.42, y: 0.78 })
  expect(planetFallbackSlot(3, 0)).toEqual({ x: 0.2, y: 0.24 })
  expect(planetClearance(130, 150)).toBe(580)
})

test('chunk planet generation returns named visited planets with route reward copy', () => {
  const planet = createChunkPlanet({
    chunkX: 0,
    chunkY: 0,
    index: 1,
    rng: scriptedRandom([0.1, 0.1, 0.5, 0.5, 0.5]),
    existing: [],
    visitedPlanetIds: new Set(['0:0:1']),
    archetypeBias: { cache: 1, hostile: 0, repair: 0, relic: 0, strange: 0, lore: 0, horde: 0 },
    chunkSize: 3600
  })

  expect(planet).toMatchObject({
    id: '0:0:1',
    chunkX: 0,
    chunkY: 0,
    archetype: 'cache',
    color: '#57fff3',
    visited: true,
    reward: 'Cache-heavy salvage and mutation signals.'
  })
  expect(planet.name.length).toBeGreaterThan(0)
  expect(planet.biome.id.length).toBeGreaterThan(0)
})

test('main delegates procedural planet construction to planet-generation', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain("from './planet-generation'")
  expect(main).toContain('createChunkPlanet({')
  expect(main).not.toContain('private pickSectorPlanetArchetype(')
  expect(main).not.toContain('private planetFallbackSlot(')
})
