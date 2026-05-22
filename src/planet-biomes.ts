import type { PlanetArchetype } from './surface-encounters'

export type PlanetBiomeId =
  | 'forestMoon'
  | 'desertWorld'
  | 'atollWorld'
  | 'iceWorld'
  | 'lavaWorld'
  | 'oceanWorld'
  | 'crystalWorld'
  | 'ruinWorld'

export type PlanetSurfaceMotif =
  | 'canopy'
  | 'dunes'
  | 'islands'
  | 'ice'
  | 'lava'
  | 'reef'
  | 'crystals'
  | 'ruins'

export interface PlanetBiomeProfile {
  id: PlanetBiomeId
  label: string
  baseColor: string
  accentColor: string
  shadowColor: string
  skyTop: string
  skyMid: string
  skyBottom: string
  gridColor: string
  horizonColor: string
  surfaceMotif: PlanetSurfaceMotif
}

export const PLANET_BIOMES: PlanetBiomeProfile[] = [
  {
    id: 'forestMoon',
    label: 'Forest Moon',
    baseColor: '#2fe68f',
    accentColor: '#b8ff6a',
    shadowColor: '#0b3f2b',
    skyTop: '#020806',
    skyMid: '#062317',
    skyBottom: '#102c1d',
    gridColor: 'rgba(143,255,125,0.11)',
    horizonColor: '#8fff7d',
    surfaceMotif: 'canopy'
  },
  {
    id: 'desertWorld',
    label: 'Desert Planet',
    baseColor: '#f0b45d',
    accentColor: '#fff27a',
    shadowColor: '#5a3018',
    skyTop: '#090604',
    skyMid: '#211308',
    skyBottom: '#34200d',
    gridColor: 'rgba(255,242,122,0.1)',
    horizonColor: '#f0b45d',
    surfaceMotif: 'dunes'
  },
  {
    id: 'atollWorld',
    label: 'Desert Atoll',
    baseColor: '#69d6c5',
    accentColor: '#ffe08a',
    shadowColor: '#164a4a',
    skyTop: '#02080a',
    skyMid: '#063038',
    skyBottom: '#1c3a2b',
    gridColor: 'rgba(105,214,197,0.11)',
    horizonColor: '#69d6c5',
    surfaceMotif: 'islands'
  },
  {
    id: 'iceWorld',
    label: 'Ice World',
    baseColor: '#b6e8ff',
    accentColor: '#70a8ff',
    shadowColor: '#172a4f',
    skyTop: '#03070d',
    skyMid: '#07162a',
    skyBottom: '#0c2238',
    gridColor: 'rgba(182,232,255,0.1)',
    horizonColor: '#b6e8ff',
    surfaceMotif: 'ice'
  },
  {
    id: 'lavaWorld',
    label: 'Lava World',
    baseColor: '#ff5d73',
    accentColor: '#ffb347',
    shadowColor: '#3c090b',
    skyTop: '#070101',
    skyMid: '#210505',
    skyBottom: '#33100a',
    gridColor: 'rgba(255,93,115,0.1)',
    horizonColor: '#ff5d73',
    surfaceMotif: 'lava'
  },
  {
    id: 'oceanWorld',
    label: 'Ocean World',
    baseColor: '#57fff3',
    accentColor: '#70a8ff',
    shadowColor: '#073d54',
    skyTop: '#01070a',
    skyMid: '#04212f',
    skyBottom: '#063a47',
    gridColor: 'rgba(87,255,243,0.1)',
    horizonColor: '#57fff3',
    surfaceMotif: 'reef'
  },
  {
    id: 'crystalWorld',
    label: 'Crystal World',
    baseColor: '#b990ff',
    accentColor: '#57fff3',
    shadowColor: '#2c164e',
    skyTop: '#05030a',
    skyMid: '#160a2b',
    skyBottom: '#21123e',
    gridColor: 'rgba(185,144,255,0.1)',
    horizonColor: '#b990ff',
    surfaceMotif: 'crystals'
  },
  {
    id: 'ruinWorld',
    label: 'Ruin World',
    baseColor: '#d7fff7',
    accentColor: '#b990ff',
    shadowColor: '#263238',
    skyTop: '#030405',
    skyMid: '#111719',
    skyBottom: '#1f2420',
    gridColor: 'rgba(215,255,247,0.09)',
    horizonColor: '#d7fff7',
    surfaceMotif: 'ruins'
  }
]

const BIOMES_BY_ID = new Map(PLANET_BIOMES.map((biome) => [biome.id, biome]))

const archetypeBiomePools: Record<PlanetArchetype, PlanetBiomeId[]> = {
  cache: ['oceanWorld', 'crystalWorld', 'atollWorld', 'desertWorld', 'ruinWorld'],
  hostile: ['lavaWorld', 'desertWorld', 'iceWorld', 'crystalWorld', 'ruinWorld'],
  repair: ['forestMoon', 'atollWorld', 'oceanWorld', 'iceWorld', 'desertWorld'],
  relic: ['ruinWorld', 'desertWorld', 'crystalWorld', 'iceWorld', 'forestMoon'],
  strange: ['crystalWorld', 'oceanWorld', 'lavaWorld', 'iceWorld', 'forestMoon'],
  lore: ['ruinWorld', 'iceWorld', 'desertWorld', 'forestMoon', 'crystalWorld'],
  horde: ['lavaWorld', 'ruinWorld', 'desertWorld', 'iceWorld', 'crystalWorld']
}

export const selectPlanetBiome = (
  archetype: PlanetArchetype,
  chunkX: number,
  chunkY: number,
  index: number
): PlanetBiomeProfile => {
  const pool = archetypeBiomePools[archetype]
  const seed = Math.abs(chunkX * 3 + chunkY * 5 + index)
  return BIOMES_BY_ID.get(pool[seed % pool.length]) ?? PLANET_BIOMES[0]
}
