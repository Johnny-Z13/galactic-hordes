import type { PlanetArchetype } from './surface-encounters'
import type { SpaceEnemyKind } from './game-balance'
import type { SpaceEncounterKind } from './space-encounters'

export type SectorNodeKind = 'mothership' | 'hostile' | 'planet' | 'station' | 'anomaly' | 'boss' | 'final'
export type SectorStationService = 'repair' | 'workbench' | 'trade' | 'scan'
export type SectorNodePace = 'safe' | 'mild' | 'standard' | 'intense' | 'boss'
export type SectorWaveOrder = 'scouts' | 'swarm' | 'ambush' | 'bulwark' | 'cathedral'
export type SectorHazardTag = 'clear' | 'asteroids' | 'hunterWing' | 'derelictCache' | 'nebula'
export type SectorNodeTheme = 'openSpace' | 'asteroidBelt' | 'planetCluster' | 'derelictField' | 'nebula' | 'bossGate' | 'finalStand'
export type SectorPlanetDensity = 'sparse' | 'normal' | 'dense'
export type SectorNodeTemplateId = 'mothership' | 'safeDrift' | 'planetCluster' | 'asteroidBelt' | 'hunterLane' | 'derelictField' | 'nebulaAnomaly' | 'freeport' | 'bossGate' | 'finalStand'
export type SectorModifierId = 'quietDeadZone' | 'richSalvage' | 'aggressiveHunters' | 'asteroidStorm' | 'signalDrought' | 'oldWarzone'
export type SectorRewardShapeId = 'balanced' | 'scrapHeavy' | 'signalBloom' | 'cacheLean' | 'relicTrace' | 'repairCache'
export type SectorEnemyPacketId = 'baseline' | 'scoutPickets' | 'knifeWing' | 'alienBloom' | 'mineScreen' | 'gunline' | 'siegeGuard'

export interface SectorNodeModifier {
  id: SectorModifierId
  label: string
  readout: string
}

export interface SectorRewardShape {
  id: SectorRewardShapeId
  label: string
  readout: string
}

export interface SectorEnemyPacket {
  id: SectorEnemyPacketId
  label: string
  readout: string
}

export interface SectorPlanetConfig {
  countMin: number
  countMax: number
  density: SectorPlanetDensity
  archetypeBias: Partial<Record<PlanetArchetype, number>>
}

export interface SectorEnemyConfig {
  startingSpawns: SpaceEnemyKind[]
  bias: Partial<Record<SpaceEnemyKind, number>>
  maxAliveMultiplier: number
  spawnMultiplier: number
}

export interface SectorWaveConfig {
  atSeconds: number
  label: string
  enemies: Partial<Record<SpaceEnemyKind, number>>
  notes?: string
}

export interface SectorAsteroidHazardConfig {
  density: number
  damageMultiplier: number
  drift: 'slow' | 'crosswind' | 'chaotic'
}

export interface SectorHazardConfig {
  asteroids?: SectorAsteroidHazardConfig
  encounters: Partial<Record<SpaceEncounterKind, number>>
}

export interface SectorRewardConfig {
  resourceMultiplier: number
  chestIntervalMultiplier: number
  upgradeSignalBonusChance: number
}

export interface SectorNodeConfig {
  templateId: SectorNodeTemplateId
  depth: number
  pace: SectorNodePace
  theme: SectorNodeTheme
  waveOrder: SectorWaveOrder
  hazards: SectorHazardTag[]
  modifiers: SectorNodeModifier[]
  rewardShape: SectorRewardShape
  enemyPacket: SectorEnemyPacket
  planets: SectorPlanetConfig
  enemies: SectorEnemyConfig
  waves: SectorWaveConfig[]
  hazardConfig: SectorHazardConfig
  encounterGapMultiplier: number
  rewards: SectorRewardConfig
  objective: string
  readout: string
  notes: string[]
}

export interface SectorNodeTemplate {
  id: SectorNodeTemplateId
  kind: SectorNodeKind
  family: string
  pressureRole: 'low' | 'medium' | 'high' | 'boss'
  rewardRole: 'safe' | 'exploration' | 'combat' | 'cache' | 'volatile' | 'service' | 'boss'
  summary: string
}

export interface SectorNode {
  id: string
  column: number
  row: number
  kind: SectorNodeKind
  label: string
  description: string
  completed: boolean
  stationServices: SectorStationService[]
  config: SectorNodeConfig
}

export interface SectorEdge {
  from: string
  to: string
}

export interface SectorMap {
  seed: number
  columns: number
  currentNodeId: string
  nodes: SectorNode[]
  edges: SectorEdge[]
}

export interface SectorNodeRunProfile {
  enemyBias: SpaceEnemyKind[]
  planetBias: PlanetArchetype[]
  spawnMultiplier: number
  rewardMultiplier: number
  bossRequired: boolean
  modifiers: SectorNodeModifier[]
  rewardShape: SectorRewardShape
  enemyPacket: SectorEnemyPacket
  encounterBias: Partial<Record<SpaceEncounterKind, number>>
  encounterGapMultiplier: number
  config: SectorNodeConfig
  stationServices: SectorStationService[]
  allowsMetaUpgrades: boolean
}

export interface SectorNodeDecisionIntel {
  directive: string
  reward: string
  risk: string
}

const nodeRows = [0, 1, 2, 3] as const
const sectorColumnCount = 7

export const sectorNodeTemplateCatalog: Record<SectorNodeTemplateId, SectorNodeTemplate> = {
  mothership: {
    id: 'mothership',
    kind: 'mothership',
    family: 'launch',
    pressureRole: 'low',
    rewardRole: 'safe',
    summary: 'Safe launch node with light scouts and normal route access.'
  },
  safeDrift: {
    id: 'safeDrift',
    kind: 'hostile',
    family: 'breather',
    pressureRole: 'low',
    rewardRole: 'safe',
    summary: 'Low-pressure open space that gives the player breathing room.'
  },
  planetCluster: {
    id: 'planetCluster',
    kind: 'planet',
    family: 'exploration',
    pressureRole: 'medium',
    rewardRole: 'exploration',
    summary: 'Dense planet choices with lighter space pressure and stronger landing value.'
  },
  asteroidBelt: {
    id: 'asteroidBelt',
    kind: 'anomaly',
    family: 'navigation',
    pressureRole: 'high',
    rewardRole: 'volatile',
    summary: 'Movement-stress route with asteroid drift, mines, and fewer planets.'
  },
  hunterLane: {
    id: 'hunterLane',
    kind: 'hostile',
    family: 'combat',
    pressureRole: 'high',
    rewardRole: 'combat',
    summary: 'Enemy-forward lane with hunter wings, razors, shooters, and high combat payoff.'
  },
  derelictField: {
    id: 'derelictField',
    kind: 'hostile',
    family: 'greed',
    pressureRole: 'medium',
    rewardRole: 'cache',
    summary: 'Cache-heavy route that tempts detours while guardians build pressure.'
  },
  nebulaAnomaly: {
    id: 'nebulaAnomaly',
    kind: 'anomaly',
    family: 'volatility',
    pressureRole: 'high',
    rewardRole: 'volatile',
    summary: 'Unstable anomaly with unpredictable hazards and higher reward variance.'
  },
  freeport: {
    id: 'freeport',
    kind: 'station',
    family: 'service',
    pressureRole: 'low',
    rewardRole: 'service',
    summary: 'Run-only repair, trade, scan, and workbench services.'
  },
  bossGate: {
    id: 'bossGate',
    kind: 'boss',
    family: 'skillCheck',
    pressureRole: 'boss',
    rewardRole: 'boss',
    summary: 'Elite gate that stacks hazards and boss-class enemies before the final sector.'
  },
  finalStand: {
    id: 'finalStand',
    kind: 'final',
    family: 'climax',
    pressureRole: 'boss',
    rewardRole: 'boss',
    summary: 'Final node with maximum pressure and the run win condition.'
  }
}

const rngFrom = (seed: number) => {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const labelFor = (kind: SectorNodeKind, column: number, row: number, templateId: SectorNodeTemplateId) => {
  if (kind === 'mothership') return 'MOTHERSHIP'
  if (kind === 'final') return 'THE LAST STAND'
  const prefix = {
    safeDrift: 'SAFE DRIFT',
    planetCluster: 'PLANET CLUSTER',
    asteroidBelt: 'ASTEROID BELT',
    hunterLane: 'HUNTER LANE',
    derelictField: 'DERELICT FIELD',
    nebulaAnomaly: 'NEBULA',
    freeport: 'FREEPORT',
    bossGate: 'BOSS GATE',
    mothership: 'MOTHERSHIP',
    finalStand: 'THE LAST STAND'
  }[templateId]
  return `${prefix} ${column}-${row + 1}`
}

const descriptionFor = (templateId: SectorNodeTemplateId) => sectorNodeTemplateCatalog[templateId].summary

const defaultRewardShape: SectorRewardShape = {
  id: 'balanced',
  label: 'Balanced Cache',
  readout: 'Balanced salvage and signal odds.'
}

const defaultEnemyPacket: SectorEnemyPacket = {
  id: 'baseline',
  label: 'Baseline Contacts',
  readout: 'Template-standard enemy mix.'
}

const encounterBiasForTags = (hazards: SectorHazardTag[], waveOrder: SectorWaveOrder, pace: SectorNodePace): Partial<Record<SpaceEncounterKind, number>> => ({
  meteorFront: hazards.includes('asteroids') ? 2.4 : hazards.includes('clear') ? 0.72 : 1,
  asteroidField: hazards.includes('asteroids') ? 2.75 : pace === 'boss' ? 1.35 : 0.78,
  hunterWing: hazards.includes('hunterWing') ? 2.25 : waveOrder === 'ambush' ? 1.45 : 0.95,
  derelictCache: hazards.includes('derelictCache') ? 2.1 : pace === 'safe' || pace === 'mild' ? 1.25 : 0.78,
  alienBloom: hazards.includes('nebula') ? 2.15 : waveOrder === 'ambush' ? 1.18 : 0.86
})

const asteroidConfigFor = (hazards: SectorHazardTag[], pace: SectorNodePace): SectorAsteroidHazardConfig | undefined => {
  if (!hazards.includes('asteroids')) return undefined
  return {
    density: pace === 'boss' ? 1.92 : pace === 'intense' ? 1.62 : 1.18,
    damageMultiplier: pace === 'boss' ? 1.08 : 1,
    drift: pace === 'boss' ? 'chaotic' : pace === 'intense' ? 'crosswind' : 'slow'
  }
}

const planetConfig = (countMin: number, countMax: number, density: SectorPlanetDensity, archetypeBias: Partial<Record<PlanetArchetype, number>>): SectorPlanetConfig => ({
  countMin,
  countMax,
  density,
  archetypeBias
})

const enemyConfig = (
  startingSpawns: SpaceEnemyKind[],
  bias: Partial<Record<SpaceEnemyKind, number>>,
  spawnMultiplier: number,
  maxAliveMultiplier = 1
): SectorEnemyConfig => ({
  startingSpawns,
  bias,
  maxAliveMultiplier,
  spawnMultiplier
})

const routeDepth = (column: number, columns: number) => Math.max(0, Math.min(1, column / Math.max(1, columns - 1)))

const rewardScale = (depth: number) => 1 + depth * 0.18

const pressureScale = (depth: number, role: SectorNodeTemplate['pressureRole']) => {
  if (role === 'low') return 1 + depth * 0.06
  if (role === 'medium') return 1 + depth * 0.14
  if (role === 'high') return 1 + depth * 0.22
  return 1 + depth * 0.3
}

const scaleEnemyCounts = (enemies: Partial<Record<SpaceEnemyKind, number>>, depth: number, intensity = 0.65): Partial<Record<SpaceEnemyKind, number>> => {
  const scaled: Partial<Record<SpaceEnemyKind, number>> = {}
  for (const [kind, count] of Object.entries(enemies) as Array<[SpaceEnemyKind, number]>) {
    scaled[kind] = Math.max(1, Math.round(count * (1 + depth * intensity)))
  }
  return scaled
}

const configFromTemplate = ({
  templateId,
  column,
  columns,
  pace,
  theme,
  waveOrder,
  hazards,
  planets,
  enemies,
  waves,
  rewards,
  objective,
  readout,
  notes
}: Omit<SectorNodeConfig, 'templateId' | 'depth' | 'hazardConfig' | 'modifiers' | 'rewardShape' | 'enemyPacket' | 'encounterGapMultiplier'> & {
  templateId: SectorNodeTemplateId
  column: number
  columns: number
}): SectorNodeConfig => ({
  templateId,
  depth: routeDepth(column, columns),
  pace,
  theme,
  waveOrder,
  hazards,
  modifiers: [],
  rewardShape: defaultRewardShape,
  enemyPacket: defaultEnemyPacket,
  planets,
  enemies,
  waves,
  hazardConfig: { asteroids: asteroidConfigFor(hazards, pace), encounters: encounterBiasForTags(hazards, waveOrder, pace) },
  encounterGapMultiplier: 1,
  rewards,
  objective,
  readout,
  notes
})

const configFor = (templateId: SectorNodeTemplateId, column: number, random: () => number, columns: number): SectorNodeConfig => {
  const depth = routeDepth(column, columns)
  const template = sectorNodeTemplateCatalog[templateId]
  if (templateId === 'mothership') {
    const pace: SectorNodePace = 'safe'
    const waveOrder: SectorWaveOrder = 'scouts'
    const hazards: SectorHazardTag[] = ['clear']
    return configFromTemplate({
      templateId,
      column,
      columns,
      pace,
      theme: 'openSpace',
      waveOrder,
      hazards,
      planets: planetConfig(1, 2, 'sparse', { repair: 1, cache: 1 }),
      enemies: enemyConfig(['chaser'], { chaser: 1, splinter: 0.35 }, 1),
      waves: [{ atSeconds: 20, label: 'Scout drift', enemies: { chaser: 3 }, notes: 'Low-pressure launch space.' }],
      rewards: { resourceMultiplier: 1, chestIntervalMultiplier: 1, upgradeSignalBonusChance: 0 },
      objective: 'Launch the run and commit to a route.',
      readout: 'Safe start. Pick a branch.',
      notes: ['Launch node. Minimal pressure and normal planet access.']
    })
  }
  if (templateId === 'freeport') {
    const pace: SectorNodePace = 'safe'
    const waveOrder: SectorWaveOrder = 'scouts'
    const hazards: SectorHazardTag[] = ['clear', 'derelictCache']
    return configFromTemplate({
      templateId,
      column,
      columns,
      pace,
      theme: 'derelictField',
      waveOrder,
      hazards,
      planets: planetConfig(1, 2, 'sparse', { repair: 2, cache: 1.2 }),
      enemies: enemyConfig(['chaser'], { chaser: 1 }, 0.45, 0.6),
      waves: [{ atSeconds: 35, label: 'Dock pickets', enemies: { chaser: 3 }, notes: 'Small harassment wave before station services.' }],
      rewards: { resourceMultiplier: 0.8 * rewardScale(depth), chestIntervalMultiplier: 1.35, upgradeSignalBonusChance: 0.04 + depth * 0.02 },
      objective: 'Take run-only repairs and workbench services.',
      readout: 'Safe station. Repair, trade, workbench.',
      notes: ['Run-only services. No permanent mothership upgrades.']
    })
  }
  if (templateId === 'safeDrift') {
    const pace: SectorNodePace = depth > 0.55 && random() < 0.35 ? 'mild' : 'safe'
    const waveOrder: SectorWaveOrder = 'scouts'
    const hazards: SectorHazardTag[] = random() < 0.7 ? ['clear'] : ['clear', 'derelictCache']
    return configFromTemplate({
      templateId,
      column,
      columns,
      pace,
      theme: 'openSpace',
      waveOrder,
      hazards,
      planets: planetConfig(1, 2, 'sparse', { repair: 1.6, cache: 1.1 }),
      enemies: enemyConfig(['chaser'], { chaser: 1, splinter: 0.55, lancer: depth > 0.45 ? 0.35 : 0 }, 0.6 * pacePressureFor(pace) * pressureScale(depth, template.pressureRole), 0.72),
      waves: [
        { atSeconds: 30, label: 'Scout drift', enemies: scaleEnemyCounts({ chaser: 3, splinter: 1 }, depth, 0.35), notes: 'Low-pressure route that protects recovery space.' }
      ],
      rewards: { resourceMultiplier: 0.9 * rewardScale(depth), chestIntervalMultiplier: 1.15, upgradeSignalBonusChance: 0.03 + depth * 0.03 },
      objective: 'Recover, scout, and reach the next route branch.',
      readout: 'Safe drift. Low pressure, modest rewards.',
      notes: ['Breather node. Use sparingly so route choices are not all combat pressure.']
    })
  }
  if (templateId === 'planetCluster') {
    const pace: SectorNodePace = depth > 0.55 || random() < 0.45 ? 'standard' : 'mild'
    const waveOrder: SectorWaveOrder = 'swarm'
    const hazards: SectorHazardTag[] = random() < 0.5 ? ['derelictCache'] : ['clear']
    const maxPlanets = depth > 0.55 ? 4 : 5
    return configFromTemplate({
      templateId,
      column,
      columns,
      pace,
      theme: 'planetCluster',
      waveOrder,
      hazards,
      planets: planetConfig(2, maxPlanets, 'dense', { cache: 1.4, relic: 1.2, repair: 1.1, lore: 1 }),
      enemies: enemyConfig(['chaser', 'splinter'], { chaser: 1, splinter: 1, lancer: 0.75, shooter: depth > 0.5 ? 0.35 : 0 }, 0.82 * pacePressureFor(pace) * pressureScale(depth, template.pressureRole), 0.88 + depth * 0.08),
      waves: [
        { atSeconds: 25, label: 'Approach swarm', enemies: scaleEnemyCounts({ chaser: 5, splinter: 3 }, depth) },
        { atSeconds: 90, label: 'Landing pressure', enemies: scaleEnemyCounts({ lancer: 2, splinter: 5 }, depth), notes: 'Pushes the player to commit to a planet.' }
      ],
      rewards: { resourceMultiplier: 1.15 * rewardScale(depth), chestIntervalMultiplier: 0.95, upgradeSignalBonusChance: 0.08 + depth * 0.04 },
      objective: 'Scout planet-rich space and land for discoveries.',
      readout: 'Planet route. More landings, moderate pressure.',
      notes: ['More planets than average. Enemy recipe is lighter, but routes invite surface risk.']
    })
  }
  if (templateId === 'asteroidBelt') {
    const pace: SectorNodePace = depth > 0.45 || random() < 0.5 ? 'intense' : 'standard'
    const waveOrder: SectorWaveOrder = 'ambush'
    const hazards: SectorHazardTag[] = random() < 0.5 ? ['asteroids'] : ['asteroids', 'nebula']
    return configFromTemplate({
      templateId,
      column,
      columns,
      pace,
      theme: 'asteroidBelt',
      waveOrder,
      hazards,
      planets: planetConfig(0, 2, 'sparse', { strange: 1.2, relic: 1.1, cache: 0.8 }),
      enemies: enemyConfig(['mine', 'skimmer'], { mine: 1.7, skimmer: 1.1, shard: 0.8, siphon: depth > 0.55 ? 0.55 : 0.2 }, 1.05 * pacePressureFor(pace) * pressureScale(depth, template.pressureRole), 1.05 + depth * 0.12),
      waves: [
        { atSeconds: 20, label: 'Mine screen', enemies: scaleEnemyCounts({ mine: 5, chaser: 3 }, depth), notes: 'Area denial before the first hazard roll.' },
        { atSeconds: 75, label: 'Skimmer patrol', enemies: scaleEnemyCounts({ skimmer: 3, shard: 2, splinter: 5 }, depth) }
      ],
      rewards: { resourceMultiplier: 1.24 * rewardScale(depth), chestIntervalMultiplier: 0.92, upgradeSignalBonusChance: 0.09 + depth * 0.04 },
      objective: 'Navigate asteroid pressure and break through the belt.',
      readout: 'Asteroid belt. Low planets, high navigation pressure.',
      notes: ['Movement-stress route. Rewards compensate for fewer landing choices.']
    })
  }
  if (templateId === 'hunterLane') {
    const pace: SectorNodePace = depth > 0.4 || random() < 0.55 ? 'intense' : 'standard'
    const waveOrder: SectorWaveOrder = random() < 0.45 ? 'swarm' : 'ambush'
    const hazards: SectorHazardTag[] = ['hunterWing']
    return configFromTemplate({
      templateId,
      column,
      columns,
      pace,
      theme: 'openSpace',
      waveOrder,
      hazards,
      planets: planetConfig(1, 2, 'normal', { hostile: 1.3, cache: 1, repair: 0.7 }),
      enemies: enemyConfig(['shooter', 'razor'], { shooter: 1.2, razor: 1, shard: 1.05, skimmer: 0.9, prism: depth > 0.55 ? 0.45 : 0.18, lancer: depth > 0.45 ? 0.55 : 0.25 }, 1.14 * pacePressureFor(pace) * pressureScale(depth, template.pressureRole), 1.05 + depth * 0.15),
      waves: [
        { atSeconds: 25, label: 'Hostile screen', enemies: scaleEnemyCounts({ shooter: 3, chaser: 5 }, depth) },
        { atSeconds: 80, label: 'Ambush wing', enemies: scaleEnemyCounts({ razor: 2, shard: 3, skimmer: 2 }, depth), notes: 'Fast enemies punish passive routing.' }
      ],
      rewards: { resourceMultiplier: 1.18 * rewardScale(depth), chestIntervalMultiplier: 0.95, upgradeSignalBonusChance: 0.08 + depth * 0.05 },
      objective: 'Clear a hunter patrol lane and cash in combat rewards.',
      readout: 'Hunter lane. Enemy-forward combat route.',
      notes: ['Baseline combat route. Strong enemy bias with average planet access.']
    })
  }
  if (templateId === 'derelictField') {
    const pace: SectorNodePace = depth > 0.55 && random() < 0.45 ? 'intense' : 'standard'
    const waveOrder: SectorWaveOrder = random() < 0.5 ? 'scouts' : 'ambush'
    const hazards: SectorHazardTag[] = ['derelictCache']
    return configFromTemplate({
      templateId,
      column,
      columns,
      pace,
      theme: 'derelictField',
      waveOrder,
      hazards,
      planets: planetConfig(1, 2, 'normal', { cache: 1.7, relic: 0.9, hostile: 0.6 }),
      enemies: enemyConfig(['chaser', 'shooter'], { chaser: 1, shooter: 0.9, warden: depth > 0.45 ? 0.18 : 0, splinter: 0.75 }, 0.96 * pacePressureFor(pace) * pressureScale(depth, template.pressureRole), 0.95 + depth * 0.1),
      waves: [
        { atSeconds: 30, label: 'Cache guardians', enemies: scaleEnemyCounts({ chaser: 4, shooter: 2 }, depth), notes: 'Pressure arrives after the player sees cache bait.' },
        { atSeconds: 95, label: 'Warden ping', enemies: scaleEnemyCounts({ warden: 1, splinter: 4 }, depth, 0.35) }
      ],
      rewards: { resourceMultiplier: 1.12 * rewardScale(depth), chestIntervalMultiplier: 0.82, upgradeSignalBonusChance: 0.07 + depth * 0.04 },
      objective: 'Detour through derelict caches without overcommitting.',
      readout: 'Derelict field. Cache-rich, guardian pressure.',
      notes: ['Greed route. The route should ask whether cache detours are worth the pressure.']
    })
  }
  if (templateId === 'nebulaAnomaly') {
    const pace: SectorNodePace = random() < 0.4 && depth < 0.55 ? 'standard' : 'intense'
    const waveOrder: SectorWaveOrder = 'ambush'
    const hazards: SectorHazardTag[] = random() < 0.5 ? ['nebula', 'hunterWing'] : ['nebula', 'asteroids']
    return configFromTemplate({
      templateId,
      column,
      columns,
      pace,
      theme: 'nebula',
      waveOrder,
      hazards,
      planets: planetConfig(0, 2, 'sparse', { strange: 1.6, relic: 1.2, horde: 0.7 }),
      enemies: enemyConfig(['mine', 'helix'], { mine: 1.2, skimmer: 1.05, helix: 1.25, prism: 0.75, siphon: 0.45 + depth * 0.35 }, 1.08 * pacePressureFor(pace) * pressureScale(depth, template.pressureRole), 1.05 + depth * 0.16),
      waves: [
        { atSeconds: 20, label: 'Static bloom', enemies: scaleEnemyCounts({ mine: 4, chaser: 4 }, depth), notes: 'Unstable opening pressure before the hazard family is clear.' },
        { atSeconds: 75, label: 'Alien bloom', enemies: scaleEnemyCounts({ helix: 3, prism: 2, shard: 2 }, depth) }
      ],
      rewards: { resourceMultiplier: 1.28 * rewardScale(depth), chestIntervalMultiplier: 0.9, upgradeSignalBonusChance: 0.1 + depth * 0.05 },
      objective: 'Survive unstable space weather for richer rewards.',
      readout: 'Anomaly route. Volatile hazards, higher payoff.',
      notes: ['Fewer planets. Higher reward multiplier. Hazards and mines create navigation pressure.']
    })
  }
  if (templateId === 'bossGate') {
    const pace: SectorNodePace = 'boss'
    const waveOrder: SectorWaveOrder = 'bulwark'
    const hazards: SectorHazardTag[] = ['hunterWing', 'asteroids']
    return configFromTemplate({
      templateId,
      column,
      columns,
      pace,
      theme: 'bossGate',
      waveOrder,
      hazards,
      planets: planetConfig(0, 2, 'sparse', { hostile: 1.5, horde: 1.2, cache: 0.9 }),
      enemies: enemyConfig(['dreadnought'], { bulwark: 1.4, dreadnought: 0.8, shooter: 1 }, 1.18 * pacePressureFor(pace) * pressureScale(depth, template.pressureRole), 1.2 + depth * 0.12),
      waves: [
        { atSeconds: 45, label: 'Gate guardian', enemies: { dreadnought: 1 } },
        { atSeconds: 70, label: 'Bulwark wall', enemies: scaleEnemyCounts({ bulwark: 2, shooter: 4 }, depth, 0.35) }
      ],
      rewards: { resourceMultiplier: 1.35 * rewardScale(depth), chestIntervalMultiplier: 0.85, upgradeSignalBonusChance: 0.12 + depth * 0.04 },
      objective: 'Break an elite guardian gate before the final sector.',
      readout: 'Boss gate. Heavy wave order and hazards.',
      notes: ['Boss required. Asteroids and hunter wings are intentionally stacked.']
    })
  }
  if (templateId === 'finalStand') {
    const pace: SectorNodePace = 'boss'
    const waveOrder: SectorWaveOrder = 'cathedral'
    const hazards: SectorHazardTag[] = ['hunterWing', 'asteroids', 'nebula']
    return configFromTemplate({
      templateId,
      column,
      columns,
      pace,
      theme: 'finalStand',
      waveOrder,
      hazards,
      planets: planetConfig(0, 2, 'sparse', { horde: 1.6, strange: 1.2, lore: 0.8 }),
      enemies: enemyConfig(['cathedral', 'dreadnought'], { cathedral: 1, dreadnought: 0.9, siphon: 0.8 }, 1.32 * pacePressureFor(pace), 1.35),
      waves: [
        { atSeconds: 60, label: 'Final vector', enemies: { cathedral: 1, dreadnought: 1 } },
        { atSeconds: 90, label: 'Signal collapse', enemies: { siphon: 2, skimmer: 4 }, notes: 'Late-run pressure spike.' }
      ],
      rewards: { resourceMultiplier: 1.5, chestIntervalMultiplier: 0.75, upgradeSignalBonusChance: 0.15 },
      objective: 'Beat the final stand and extract to win the run.',
      readout: 'Final stand. Maximum pressure.',
      notes: ['Maximum pressure. Few safe planets and no route station after this node.']
    })
  }
  return configFor('safeDrift', column, random, columns)
}

const weightedTemplate = (
  candidates: Array<[SectorNodeTemplateId, number]>,
  random: () => number,
  usedInColumn: Set<SectorNodeTemplateId>
) => {
  const fresh = candidates.filter(([id]) => !usedInColumn.has(id))
  const weighted = (fresh.length ? fresh : candidates).map(([id, weight]) => [id, weight] as const)
  const total = weighted.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = random() * total
  for (const [id, weight] of weighted) {
    roll -= weight
    if (roll <= 0) return id
  }
  return weighted[weighted.length - 1][0]
}

const templateFor = (column: number, row: number, random: () => number, usedInColumn: Set<SectorNodeTemplateId>, columns: number): SectorNodeTemplateId => {
  const finalColumn = columns - 1
  const routeCheckColumn = columns - 2
  if (column === 0) return 'mothership'
  if (column === finalColumn) return 'finalStand'
  if (column === 1 && row === 0) return 'safeDrift'
  if (column === 1 && row === 1) return 'planetCluster'
  if ((column === 2 && row === 1) || (column === routeCheckColumn && row === 3)) return 'freeport'
  if (column === routeCheckColumn && row % 2 === 0) return 'bossGate'
  if (column === 1) return weightedTemplate([
    ['derelictField', 1.15],
    ['hunterLane', 0.9],
    ['planetCluster', 0.7],
    ['asteroidBelt', 0.35]
  ], random, usedInColumn)
  if (column === 2) return weightedTemplate([
    ['planetCluster', 1.1],
    ['derelictField', 1],
    ['hunterLane', 1],
    ['nebulaAnomaly', 0.75],
    ['asteroidBelt', 0.55]
  ], random, usedInColumn)
  if (column === 3) return weightedTemplate([
    ['asteroidBelt', 1.1],
    ['hunterLane', 1.05],
    ['derelictField', 0.9],
    ['nebulaAnomaly', 0.9],
    ['planetCluster', 0.75]
  ], random, usedInColumn)
  return weightedTemplate([
    ['nebulaAnomaly', 1.05],
    ['asteroidBelt', 0.95],
    ['hunterLane', 0.85],
    ['derelictField', 0.45]
  ], random, usedInColumn)
}

const nodeId = (column: number, row: number, columns: number) => column === 0 ? 'mothership' : column === columns - 1 ? 'final' : `c${column}r${row}`

export const createSectorMap = (seed = Date.now()): SectorMap => {
  const random = rngFrom(seed)
  const columns = sectorColumnCount
  const nodes: SectorNode[] = [
    {
      id: 'mothership',
      column: 0,
      row: 1,
      kind: 'mothership',
      label: 'MOTHERSHIP',
      description: descriptionFor('mothership'),
      completed: true,
      stationServices: [],
      config: applyProceduralSectorTexture(configFor('mothership', 0, random, columns), random)
    }
  ]

  for (let column = 1; column < columns - 1; column += 1) {
    const usedInColumn = new Set<SectorNodeTemplateId>()
    for (const row of nodeRows) {
      const templateId = templateFor(column, row, random, usedInColumn, columns)
      usedInColumn.add(templateId)
      const kind = sectorNodeTemplateCatalog[templateId].kind
      nodes.push({
        id: nodeId(column, row, columns),
        column,
        row,
        kind,
        label: labelFor(kind, column, row, templateId),
        description: descriptionFor(templateId),
        completed: false,
        stationServices: kind === 'station' ? ['repair', 'workbench', 'trade', 'scan'] : [],
        config: applyProceduralSectorTexture(configFor(templateId, column, random, columns), random)
      })
    }
  }

  nodes.push({
    id: 'final',
    column: columns - 1,
    row: 1,
    kind: 'final',
    label: 'THE LAST STAND',
    description: descriptionFor('finalStand'),
    completed: false,
    stationServices: [],
    config: applyProceduralSectorTexture(configFor('finalStand', columns - 1, random, columns), random)
  })

  const edges: SectorEdge[] = []
  for (const node of nodes) {
    if (node.column >= columns - 1) continue
    const next = nodes.filter((candidate) => candidate.column === node.column + 1)
    const reachable = next.filter((candidate) => Math.abs(candidate.row - node.row) <= 1)
    const fallback = next.sort((a, b) => Math.abs(a.row - node.row) - Math.abs(b.row - node.row)).slice(0, 1)
    const targets = reachable.length ? reachable : fallback
    for (const target of targets) edges.push({ from: node.id, to: target.id })
  }

  return { seed, columns, currentNodeId: 'mothership', nodes, edges }
}

export const availableSectorChoices = (map: SectorMap): SectorNode[] => {
  if (!currentSectorNode(map).completed) return []
  const outbound = map.edges.filter((edge) => edge.from === map.currentNodeId)
  return outbound
    .map((edge) => map.nodes.find((node) => node.id === edge.to))
    .filter((node): node is SectorNode => Boolean(node && !node.completed))
}

export const selectSectorNode = (map: SectorMap, nodeIdToSelect: string): SectorMap => {
  if (!availableSectorChoices(map).some((node) => node.id === nodeIdToSelect)) return map
  return { ...map, currentNodeId: nodeIdToSelect }
}

export const completeSectorNode = (map: SectorMap): SectorMap => ({
  ...map,
  nodes: map.nodes.map((node) => node.id === map.currentNodeId ? { ...node, completed: true } : node)
})

export const currentSectorNode = (map: SectorMap): SectorNode => (
  map.nodes.find((node) => node.id === map.currentNodeId) ?? map.nodes[0]
)

const encounterGapFor = (pace: SectorNodePace) => ({
  safe: 1.65,
  mild: 1.28,
  standard: 1,
  intense: 0.78,
  boss: 0.62
})[pace]

const pacePressureFor = (pace: SectorNodePace) => ({
  safe: 0.72,
  mild: 0.88,
  standard: 1,
  intense: 1.16,
  boss: 1.28
})[pace]

const clampNumber = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

interface SectorTextureEffects {
  spawn: number
  maxAlive: number
  reward: number
  chest: number
  signal: number
  encounterGap: number
  waveTime: number
  waveCount: number
  planetMinDelta: number
  planetMaxDelta: number
  asteroidDensity: number
  asteroidDamage: number
  enemyBias: Partial<Record<SpaceEnemyKind, number>>
  encounterBias: Partial<Record<SpaceEncounterKind, number>>
  planetBias: Partial<Record<PlanetArchetype, number>>
}

interface SectorModifierDefinition extends SectorNodeModifier {
  weight: number
  applies: (config: SectorNodeConfig) => boolean
  effects: Partial<SectorTextureEffects>
}

interface SectorRewardShapeDefinition extends SectorRewardShape {
  weight: number
  applies: (config: SectorNodeConfig) => boolean
  effects: Partial<SectorTextureEffects>
}

interface SectorEnemyPacketDefinition extends SectorEnemyPacket {
  weight: number
  applies: (config: SectorNodeConfig) => boolean
  effects: Partial<SectorTextureEffects>
  startingSpawns: SpaceEnemyKind[]
}

const neutralTextureEffects = (): SectorTextureEffects => ({
  spawn: 1,
  maxAlive: 1,
  reward: 1,
  chest: 1,
  signal: 0,
  encounterGap: 1,
  waveTime: 1,
  waveCount: 1,
  planetMinDelta: 0,
  planetMaxDelta: 0,
  asteroidDensity: 1,
  asteroidDamage: 1,
  enemyBias: {},
  encounterBias: {},
  planetBias: {}
})

const sectorModifierCatalog: Record<SectorModifierId, SectorModifierDefinition> = {
  quietDeadZone: {
    id: 'quietDeadZone',
    label: 'Quiet Dead Zone',
    readout: 'slower contact cadence, fewer reward spikes',
    weight: 0.9,
    applies: (config) => config.pace !== 'boss',
    effects: { spawn: 0.86, reward: 0.94, encounterGap: 1.18, waveTime: 1.1, waveCount: 0.88, planetMaxDelta: -1 }
  },
  richSalvage: {
    id: 'richSalvage',
    label: 'Rich Salvage',
    readout: 'more cargo value, slightly hotter pressure',
    weight: 1,
    applies: (config) => config.templateId !== 'freeport' && config.templateId !== 'mothership',
    effects: { spawn: 1.04, reward: 1.14, chest: 0.94, signal: 0.01 }
  },
  aggressiveHunters: {
    id: 'aggressiveHunters',
    label: 'Aggressive Hunters',
    readout: 'hunter wings and fast contacts show up sooner',
    weight: 0.95,
    applies: (config) => config.templateId !== 'mothership' && config.templateId !== 'freeport',
    effects: { spawn: 1.12, encounterGap: 0.92, waveTime: 0.93, enemyBias: { razor: 1.2, shard: 1.35, skimmer: 0.8, shooter: 0.7 }, encounterBias: { hunterWing: 1.4 } }
  },
  asteroidStorm: {
    id: 'asteroidStorm',
    label: 'Asteroid Storm',
    readout: 'denser Asteroids-style hazard pockets',
    weight: 1.25,
    applies: (config) => config.hazards.includes('asteroids'),
    effects: { reward: 1.08, encounterGap: 0.97, asteroidDensity: 1.12, asteroidDamage: 1.03, encounterBias: { meteorFront: 1.16, asteroidField: 1.18 } }
  },
  signalDrought: {
    id: 'signalDrought',
    label: 'Signal Drought',
    readout: 'fewer mutation signals, better raw salvage',
    weight: 0.8,
    applies: (config) => config.templateId !== 'mothership' && config.templateId !== 'freeport',
    effects: { reward: 1.08, chest: 1.05, signal: -0.035, encounterGap: 1.04 }
  },
  oldWarzone: {
    id: 'oldWarzone',
    label: 'Old Warzone',
    readout: 'bigger wave packets and better cache value',
    weight: 0.85,
    applies: (config) => config.pace !== 'safe',
    effects: { spawn: 1.08, reward: 1.1, waveCount: 1.16, waveTime: 0.96, enemyBias: { brute: 0.6, bulwark: 0.45, shooter: 0.75 } }
  }
}

const sectorRewardShapeCatalog: Record<SectorRewardShapeId, SectorRewardShapeDefinition> = {
  balanced: { ...defaultRewardShape, weight: 0.35, applies: () => true, effects: {} },
  scrapHeavy: {
    id: 'scrapHeavy',
    label: 'Scrap Heavy',
    readout: 'more raw resources, fewer signal spikes',
    weight: 0.95,
    applies: () => true,
    effects: { reward: 1.12, chest: 1.05, signal: -0.012 }
  },
  signalBloom: {
    id: 'signalBloom',
    label: 'Signal Bloom',
    readout: 'better mutation signal odds, leaner salvage',
    weight: 0.72,
    applies: (config) => config.templateId !== 'freeport',
    effects: { reward: 0.96, signal: 0.026, encounterGap: 0.98 }
  },
  cacheLean: {
    id: 'cacheLean',
    label: 'Lean Cache',
    readout: 'fewer cache beats, calmer reward curve',
    weight: 0.62,
    applies: (config) => config.pace !== 'boss',
    effects: { reward: 0.94, chest: 1.16, signal: -0.018, spawn: 0.96 }
  },
  relicTrace: {
    id: 'relicTrace',
    label: 'Relic Trace',
    readout: 'relic and lore planets become more likely',
    weight: 0.7,
    applies: (config) => config.templateId !== 'freeport',
    effects: { reward: 1.03, signal: 0.008, planetBias: { relic: 0.65, lore: 0.45, strange: 0.25 } }
  },
  repairCache: {
    id: 'repairCache',
    label: 'Repair Cache',
    readout: 'safer recovery economy, less upgrade velocity',
    weight: 0.68,
    applies: (config) => config.pace === 'safe' || config.pace === 'mild' || config.templateId === 'planetCluster',
    effects: { reward: 0.92, chest: 0.94, signal: -0.014, planetBias: { repair: 0.7 }, spawn: 0.95 }
  }
}

const sectorEnemyPacketCatalog: Record<SectorEnemyPacketId, SectorEnemyPacketDefinition> = {
  baseline: { ...defaultEnemyPacket, weight: 0.25, applies: () => true, effects: {}, startingSpawns: [] },
  scoutPickets: {
    id: 'scoutPickets',
    label: 'Scout Pickets',
    readout: 'chaser, splinter, and lancer pressure',
    weight: 1,
    applies: (config) => config.depth < 0.45 || config.pace === 'safe' || config.pace === 'mild',
    effects: { spawn: 0.97, waveCount: 0.95, enemyBias: { chaser: 1.4, splinter: 1.1, lancer: 0.85 } },
    startingSpawns: ['chaser', 'splinter']
  },
  knifeWing: {
    id: 'knifeWing',
    label: 'Knife Wing',
    readout: 'fast angular ambushers dominate the lane',
    weight: 1.05,
    applies: (config) => config.depth > 0.25 && config.templateId !== 'freeport',
    effects: { spawn: 1.08, waveTime: 0.94, enemyBias: { razor: 1.15, shard: 1.45, skimmer: 0.9 } },
    startingSpawns: ['shard']
  },
  alienBloom: {
    id: 'alienBloom',
    label: 'Alien Bloom',
    readout: 'strange projectile entities color the route',
    weight: 0.95,
    applies: (config) => config.depth > 0.3 && (config.hazards.includes('nebula') || config.templateId === 'nebulaAnomaly' || config.templateId === 'planetCluster'),
    effects: { spawn: 1.05, encounterGap: 0.96, enemyBias: { helix: 1.3, prism: 1.05, shard: 0.85 }, encounterBias: { alienBloom: 1.45 } },
    startingSpawns: ['helix']
  },
  mineScreen: {
    id: 'mineScreen',
    label: 'Mine Screen',
    readout: 'mines and skimmers turn movement into the puzzle',
    weight: 1,
    applies: (config) => config.hazards.includes('asteroids') || config.templateId === 'asteroidBelt',
    effects: { spawn: 1.03, enemyBias: { mine: 1.45, skimmer: 1.05, siphon: 0.35 }, encounterBias: { asteroidField: 1.2 } },
    startingSpawns: ['mine']
  },
  gunline: {
    id: 'gunline',
    label: 'Gunline',
    readout: 'ranged shooters and prisms hold space',
    weight: 0.9,
    applies: (config) => config.depth > 0.2 && config.templateId !== 'freeport',
    effects: { waveCount: 1.06, enemyBias: { shooter: 1.25, prism: 0.85, bulwark: 0.35 }, encounterBias: { hunterWing: 1.12 } },
    startingSpawns: ['shooter']
  },
  siegeGuard: {
    id: 'siegeGuard',
    label: 'Siege Guard',
    readout: 'heavy hulls anchor the route check',
    weight: 1.05,
    applies: (config) => config.pace === 'boss' || config.depth > 0.65,
    effects: { spawn: 1.06, maxAlive: 1.08, waveTime: 1.04, waveCount: 1.08, enemyBias: { brute: 0.9, bulwark: 1.15, warden: 0.35, dreadnought: 0.25 } },
    startingSpawns: ['brute']
  }
}

const mergeNumericRecords = <T extends string>(
  base: Partial<Record<T, number>>,
  addition: Partial<Record<T, number>>,
  mode: 'add' | 'multiply' = 'add'
) => {
  const merged: Partial<Record<T, number>> = { ...base }
  for (const [key, value] of Object.entries(addition) as Array<[T, number]>) {
    merged[key] = mode === 'multiply'
      ? (merged[key] ?? 1) * value
      : (merged[key] ?? 0) + value
  }
  return merged
}

const mergeEffects = (target: SectorTextureEffects, addition: Partial<SectorTextureEffects>) => {
  target.spawn *= addition.spawn ?? 1
  target.maxAlive *= addition.maxAlive ?? 1
  target.reward *= addition.reward ?? 1
  target.chest *= addition.chest ?? 1
  target.signal += addition.signal ?? 0
  target.encounterGap *= addition.encounterGap ?? 1
  target.waveTime *= addition.waveTime ?? 1
  target.waveCount *= addition.waveCount ?? 1
  target.planetMinDelta += addition.planetMinDelta ?? 0
  target.planetMaxDelta += addition.planetMaxDelta ?? 0
  target.asteroidDensity *= addition.asteroidDensity ?? 1
  target.asteroidDamage *= addition.asteroidDamage ?? 1
  target.enemyBias = mergeNumericRecords(target.enemyBias, addition.enemyBias ?? {})
  target.encounterBias = mergeNumericRecords(target.encounterBias, addition.encounterBias ?? {}, 'multiply')
  target.planetBias = mergeNumericRecords(target.planetBias, addition.planetBias ?? {})
}

const weightedPick = <T extends { weight: number }>(candidates: T[], random: () => number): T => {
  const total = candidates.reduce((sum, candidate) => sum + candidate.weight, 0)
  let roll = random() * total
  for (const candidate of candidates) {
    roll -= candidate.weight
    if (roll <= 0) return candidate
  }
  return candidates[candidates.length - 1]
}

const rollSectorModifiers = (config: SectorNodeConfig, random: () => number): SectorModifierDefinition[] => {
  if (config.templateId === 'mothership') return []
  const candidates = Object.values(sectorModifierCatalog).filter((modifier) => modifier.applies(config))
  const count = 1 + (config.depth > 0.35 && random() < 0.45 ? 1 : 0)
  const picked: SectorModifierDefinition[] = []
  for (let i = 0; i < count && candidates.length > picked.length; i += 1) {
    const remaining = candidates.filter((candidate) => !picked.some((modifier) => modifier.id === candidate.id))
    picked.push(weightedPick(remaining, random))
  }
  return picked
}

const rollRewardShape = (config: SectorNodeConfig, random: () => number) => (
  weightedPick(Object.values(sectorRewardShapeCatalog).filter((shape) => shape.applies(config)), random)
)

const rollEnemyPacket = (config: SectorNodeConfig, random: () => number) => (
  weightedPick(Object.values(sectorEnemyPacketCatalog).filter((packet) => packet.applies(config)), random)
)

const mutateWaveEnemies = (
  enemies: Partial<Record<SpaceEnemyKind, number>>,
  scale: number,
  random: () => number
) => {
  const mutated: Partial<Record<SpaceEnemyKind, number>> = {}
  for (const [kind, count] of Object.entries(enemies) as Array<[SpaceEnemyKind, number]>) {
    mutated[kind] = Math.max(1, Math.round(count * scale * (0.88 + random() * 0.24)))
  }
  return mutated
}

const mutateWaves = (waves: SectorWaveConfig[], effects: SectorTextureEffects, random: () => number) => {
  let previous = 0
  return waves.map((wave) => {
    const jittered = Math.round(wave.atSeconds * effects.waveTime * (0.9 + random() * 0.2) + (random() * 8 - 4))
    const atSeconds = Math.max(previous + 8, clampNumber(jittered, 14, 120))
    previous = atSeconds
    return {
      ...wave,
      atSeconds,
      enemies: mutateWaveEnemies(wave.enemies, effects.waveCount, random)
    }
  })
}

const applyProceduralSectorTexture = (config: SectorNodeConfig, random: () => number): SectorNodeConfig => {
  if (config.templateId === 'mothership') {
    return { ...config, encounterGapMultiplier: encounterGapFor(config.pace) }
  }
  const modifiers = rollSectorModifiers(config, random)
  const rewardShape = rollRewardShape(config, random)
  const enemyPacket = rollEnemyPacket(config, random)
  const effects = neutralTextureEffects()
  for (const modifier of modifiers) mergeEffects(effects, modifier.effects)
  mergeEffects(effects, rewardShape.effects)
  mergeEffects(effects, enemyPacket.effects)

  const planets = {
    ...config.planets,
    countMin: clampNumber(config.planets.countMin + effects.planetMinDelta, 0, 6),
    countMax: clampNumber(config.planets.countMax + effects.planetMaxDelta, 0, 6),
    archetypeBias: mergeNumericRecords(config.planets.archetypeBias, effects.planetBias)
  }
  planets.countMax = Math.max(planets.countMin, planets.countMax)

  const asteroid = config.hazardConfig.asteroids
  const hazardConfig = {
    asteroids: asteroid
      ? {
          ...asteroid,
          density: clampNumber(asteroid.density * effects.asteroidDensity, 0.65, 3),
          damageMultiplier: clampNumber(asteroid.damageMultiplier * effects.asteroidDamage, 0.75, 1.45)
        }
      : undefined,
    encounters: mergeNumericRecords(config.hazardConfig.encounters, effects.encounterBias, 'multiply')
  }

  const startingSpawns = [...config.enemies.startingSpawns]
  for (const kind of enemyPacket.startingSpawns) {
    if (!startingSpawns.includes(kind) && startingSpawns.length < 4) startingSpawns.push(kind)
  }

  const readoutTags = [
    ...modifiers.map((modifier) => modifier.label),
    enemyPacket.id === 'baseline' ? '' : enemyPacket.label,
    rewardShape.id === 'balanced' ? '' : rewardShape.label
  ].filter(Boolean)

  return {
    ...config,
    modifiers: modifiers.map(({ id, label, readout }) => ({ id, label, readout })),
    rewardShape: { id: rewardShape.id, label: rewardShape.label, readout: rewardShape.readout },
    enemyPacket: { id: enemyPacket.id, label: enemyPacket.label, readout: enemyPacket.readout },
    planets,
    enemies: {
      ...config.enemies,
      startingSpawns,
      bias: mergeNumericRecords(config.enemies.bias, effects.enemyBias),
      spawnMultiplier: clampNumber(config.enemies.spawnMultiplier * effects.spawn, 0.35, 2.3),
      maxAliveMultiplier: clampNumber(config.enemies.maxAliveMultiplier * effects.maxAlive, 0.5, 1.8)
    },
    waves: mutateWaves(config.waves, effects, random),
    hazardConfig,
    encounterGapMultiplier: clampNumber(encounterGapFor(config.pace) * effects.encounterGap, 0.48, 1.95),
    rewards: {
      resourceMultiplier: clampNumber(config.rewards.resourceMultiplier * effects.reward, 0.65, 2.1),
      chestIntervalMultiplier: clampNumber(config.rewards.chestIntervalMultiplier * effects.chest, 0.65, 1.6),
      upgradeSignalBonusChance: clampNumber(config.rewards.upgradeSignalBonusChance + effects.signal, 0, 0.22)
    },
    readout: readoutTags.length ? `${config.readout} ${readoutTags.join(' // ')}.` : config.readout,
    notes: [
      ...config.notes,
      ...modifiers.map((modifier) => `${modifier.label}: ${modifier.readout}.`),
      `${enemyPacket.label}: ${enemyPacket.readout}.`,
      `${rewardShape.label}: ${rewardShape.readout}.`
    ]
  }
}

const weightedKeys = <T extends string>(weights: Partial<Record<T, number>>) => (
  Object.entries(weights)
    .filter(([, weight]) => typeof weight === 'number' && weight > 0)
    .flatMap(([key, weight]) => Array.from({ length: Math.max(1, Math.round((weight as number) * 2)) }, () => key as T))
)

export const sectorNodeRunProfile = (node: SectorNode): SectorNodeRunProfile => {
  const common = {
    encounterBias: node.config.hazardConfig.encounters,
    encounterGapMultiplier: node.config.encounterGapMultiplier,
    config: node.config,
    stationServices: node.stationServices,
    allowsMetaUpgrades: false
  }
  return {
    ...common,
    enemyBias: weightedKeys<SpaceEnemyKind>(node.config.enemies.bias),
    planetBias: weightedKeys<PlanetArchetype>(node.config.planets.archetypeBias),
    spawnMultiplier: node.config.enemies.spawnMultiplier,
    rewardMultiplier: node.config.rewards.resourceMultiplier,
    bossRequired: node.kind === 'boss' || node.kind === 'final',
    modifiers: node.config.modifiers,
    rewardShape: node.config.rewardShape,
    enemyPacket: node.config.enemyPacket
  }
}

export const sectorNodeDecisionIntel = (node: SectorNode): SectorNodeDecisionIntel => {
  const profile = sectorNodeRunProfile(node)
  return {
    directive: sectorNodeDirective(node),
    reward: sectorNodeRewardRead(node, profile),
    risk: sectorNodeRiskRead(node, profile)
  }
}

const sectorNodeDirective = (node: SectorNode) => {
  if (node.kind === 'station') return 'SERVICE'
  if (node.kind === 'boss') return 'BOSS GATE'
  if (node.kind === 'final') return 'LAST STAND'
  if (node.config.templateId === 'safeDrift') return 'RECOVER'
  if (node.config.templateId === 'planetCluster') return 'LANDINGS'
  if (node.config.templateId === 'asteroidBelt') return 'NAV TEST'
  if (node.config.templateId === 'hunterLane') return 'FIGHT'
  if (node.config.templateId === 'derelictField') return 'GREED'
  if (node.config.templateId === 'nebulaAnomaly') return 'VOLATILE'
  return node.kind === 'planet' ? 'LANDINGS' : 'ROUTE'
}

const sectorNodeRewardRead = (node: SectorNode, profile: SectorNodeRunProfile) => {
  if (node.kind === 'station') return 'REPAIR / WORKBENCH'
  if (profile.rewardShape.id === 'relicTrace') return 'RELIC TRACE'
  if (profile.rewardShape.id === 'signalBloom' || node.config.rewards.upgradeSignalBonusChance >= 0.08) return 'SIGNAL'
  if (node.config.planets.countMin >= 2 || node.config.templateId === 'planetCluster') return 'PLANETS'
  if (profile.rewardShape.id === 'repairCache') return 'REPAIR'
  if (node.config.hazards.includes('derelictCache')) return 'CACHE'
  if (profile.rewardShape.id === 'scrapHeavy' || profile.rewardMultiplier >= 1.08) return 'SALVAGE'
  return 'SALVAGE'
}

const sectorNodeRiskRead = (node: SectorNode, profile: SectorNodeRunProfile) => {
  if (node.kind === 'station') return 'SAFE DOCK'
  if (
    node.kind === 'boss'
    || node.kind === 'final'
    || node.config.pace === 'boss'
    || node.config.pace === 'intense'
    || node.config.hazards.includes('asteroids')
    || node.config.hazards.includes('hunterWing')
    || node.config.hazards.includes('nebula')
    || profile.spawnMultiplier >= 1.05
  ) return 'HIGH RISK'
  if (node.config.pace === 'safe' && profile.spawnMultiplier < 0.82) return 'LOW RISK'
  return 'MED RISK'
}
