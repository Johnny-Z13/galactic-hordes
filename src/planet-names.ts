import type { PlanetBiomeId } from './planet-biomes'
import type { PlanetArchetype } from './surface-encounters'

export interface PlanetNameInput {
  archetype: PlanetArchetype
  biomeId: PlanetBiomeId
  chunkX: number
  chunkY: number
  index: number
}

const hashString = (value: string, salt = 0) => {
  let h = 2166136261 ^ salt
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const pick = <T>(values: readonly T[], key: string, salt: number) => values[hashString(key, salt) % values.length]

const prefixByArchetype: Record<PlanetArchetype, readonly string[]> = {
  cache: ['LUX', 'GLASS', 'GOLD', 'CIPHER', 'BRIGHT', 'VAULT'],
  hostile: ['RED', 'IRON', 'KNIFE', 'EMBER', 'GRIEF', 'WOUND'],
  repair: ['GREEN', 'MERCY', 'HALO', 'HAVEN', 'KIND', 'HUSH'],
  relic: ['SAINT', 'ANCIENT', 'STATIC', 'RELIQUARY', 'CROWN', 'PILGRIM'],
  strange: ['NULL', 'VOID', 'GHOST', 'MIRROR', 'ODD', 'ECHO'],
  lore: ['DUST', 'BONE', 'SCRIPT', 'ASHEN', 'PALE', 'MEMORY'],
  horde: ['DREAD', 'FEAST', 'SWARM', 'BLACK', 'TEETH', 'HUNGER']
}

const suffixByArchetype: Record<PlanetArchetype, readonly string[]> = {
  cache: ['VAULT', 'CACHE', 'TROVE', 'LOCK', 'BEACON', 'WELL'],
  hostile: ['CITADEL', 'MASS', 'FRONT', 'MAW', 'BURN', 'ENGINE'],
  repair: ['HARBOR', 'CHOIR', 'GARDEN', 'MERCY', 'DOCK', 'LIGHT'],
  relic: ['OSSUARY', 'SHRINE', 'IDOL', 'RELIQUARY', 'CATHEDRAL', 'TOMB'],
  strange: ['MIRROR', 'WAKE', 'ORACLE', 'STATIC', 'LENS', 'DREAM'],
  lore: ['SCRIPTURE', 'FOSSIL SEA', 'GRAVE', 'MEMORIAL', 'PYRAMID', 'BONE ORCHARD'],
  horde: ['HORDE VAULT', 'WARREN', 'TREASURE PIT', 'DREAD HOLD', 'FEAST VAULT', 'NEST']
}

const middleByBiome: Record<PlanetBiomeId, readonly string[]> = {
  forestMoon: ['CANOPY', 'MOSS', 'VERDANT'],
  desertWorld: ['DUNE', 'SALT', 'SUN'],
  atollWorld: ['ATOLL', 'REEF', 'TIDE'],
  iceWorld: ['FROST', 'WHITE', 'GLACIER'],
  lavaWorld: ['CINDER', 'BASALT', 'ASH'],
  oceanWorld: ['ABYSS', 'BLUE', 'KELP'],
  crystalWorld: ['PRISM', 'QUARTZ', 'GLASS'],
  ruinWorld: ['RUIN', 'ARCH', 'REMAINS']
}

const rareNames = [
  'LAITHE',
  'MERCY NINE',
  'THE OLD BLUE',
  'KARAN WELL',
  'VOSS MEMORIAL',
  'STATIC EDEN',
  'NULL SAINT',
  'ORISON WAKE'
] as const

export const planetNameFor = ({ archetype, biomeId, chunkX, chunkY, index }: PlanetNameInput) => {
  const key = `${archetype}:${biomeId}:${chunkX}:${chunkY}:${index}`
  const rareRoll = hashString(key, 211) % 97
  if (rareRoll === 0) return pick(rareNames, key, 223)

  const prefix = pick(prefixByArchetype[archetype], key, 17)
  const suffix = pick(suffixByArchetype[archetype], key, 29)
  if (hashString(key, 41) % 4 === 0) {
    const middle = pick(middleByBiome[biomeId], key, 53)
    return `${prefix} ${middle} ${suffix}`
  }
  return `${prefix} ${suffix}`
}
