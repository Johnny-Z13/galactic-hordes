import { selectPlanetBiome, type PlanetBiomeProfile } from './planet-biomes'
import { planetNameFor } from './planet-names'
import { planetRadius } from './planet-sizing'
import { rollPlanetArchetype, type PlanetArchetype } from './surface-encounters'

export interface GeneratedPlanet {
  id: string
  name: string
  x: number
  y: number
  radius: number
  color: string
  visited: boolean
  reward: string
  chunkX: number
  chunkY: number
  archetype: PlanetArchetype
  biome: PlanetBiomeProfile
}

export type PlanetArchetypeBias = Partial<Record<PlanetArchetype, number>>

const planetColors: Record<PlanetArchetype, string> = {
  cache: '#57fff3',
  hostile: '#ff5d73',
  repair: '#8fff7d',
  relic: '#fff27a',
  strange: '#b990ff',
  lore: '#d7fff7',
  horde: '#ff61d8'
}

const planetRewards: Record<PlanetArchetype, string> = {
  cache: 'Cache-heavy salvage and mutation signals.',
  hostile: 'Hostile planet. Better rewards, uglier landing.',
  repair: 'Repair-rich safe dock with quieter salvage.',
  relic: 'Relic signatures and rare cache odds.',
  strange: 'Unstable signal. Anything could be waiting.',
  lore: 'Quiet ruins, fossils, graves, and inspectable narrative signals.',
  horde: 'Vast enemy horde guarding a massive treasure vault.'
}

export function createChunkPlanet(input: {
  chunkX: number
  chunkY: number
  index: number
  rng: () => number
  existing: GeneratedPlanet[]
  visitedPlanetIds: ReadonlySet<string>
  archetypeBias: PlanetArchetypeBias
  chunkSize: number
}): GeneratedPlanet {
  const archetype = pickSectorPlanetArchetype({
    chunkX: input.chunkX,
    chunkY: input.chunkY,
    index: input.index,
    archetypeBias: input.archetypeBias,
    random: input.rng
  })
  const biome = selectPlanetBiome(archetype, input.chunkX, input.chunkY, input.index)
  const name = planetNameFor({ archetype, biomeId: biome.id, chunkX: input.chunkX, chunkY: input.chunkY, index: input.index })
  const margin = 420
  const radius = planetRadius(input.rng)
  let x = input.chunkX * input.chunkSize + margin + input.rng() * (input.chunkSize - margin * 2)
  let y = input.chunkY * input.chunkSize + margin + input.rng() * (input.chunkSize - margin * 2)
  let placed = false
  for (let attempt = 0; attempt < 28; attempt += 1) {
    const candidate = {
      x: input.chunkX * input.chunkSize + margin + input.rng() * (input.chunkSize - margin * 2),
      y: input.chunkY * input.chunkSize + margin + input.rng() * (input.chunkSize - margin * 2)
    }
    const clear = input.existing.every((planet) => Math.sqrt((planet.x - candidate.x) ** 2 + (planet.y - candidate.y) ** 2) > planetClearance(radius, planet.radius))
    if (clear) {
      x = candidate.x
      y = candidate.y
      placed = true
      break
    }
  }
  if (!placed) {
    const slot = planetFallbackSlot(input.index, input.existing.length)
    x = input.chunkX * input.chunkSize + margin + slot.x * (input.chunkSize - margin * 2)
    y = input.chunkY * input.chunkSize + margin + slot.y * (input.chunkSize - margin * 2)
  }
  const id = `${input.chunkX}:${input.chunkY}:${input.index}`
  return {
    id,
    name,
    x,
    y,
    radius,
    color: planetColors[archetype],
    visited: input.visitedPlanetIds.has(id),
    reward: planetRewards[archetype],
    chunkX: input.chunkX,
    chunkY: input.chunkY,
    archetype,
    biome
  }
}

export function planetClearance(a: number, b: number) {
  return Math.max(520, a + b + 300)
}

export function pickSectorPlanetArchetype(input: {
  chunkX: number
  chunkY: number
  index: number
  archetypeBias: PlanetArchetypeBias
  random: () => number
}) {
  const total = Object.values(input.archetypeBias).reduce((sum, weight) => sum + (weight ?? 0), 0)
  if (total > 0 && input.random() < 0.55) {
    let roll = input.random() * total
    for (const [archetype, weight] of Object.entries(input.archetypeBias) as Array<[PlanetArchetype, number]>) {
      roll -= weight
      if (roll <= 0) return archetype
    }
  }
  return rollPlanetArchetype({ chunkX: input.chunkX, chunkY: input.chunkY, index: input.index, random: input.random })
}

export function planetFallbackSlot(index: number, existingCount: number) {
  const slots = [
    { x: 0.2, y: 0.24 },
    { x: 0.78, y: 0.34 },
    { x: 0.42, y: 0.78 }
  ]
  return slots[(index + existingCount) % slots.length]
}
