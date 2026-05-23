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
  planets: SectorPlanetConfig
  enemies: SectorEnemyConfig
  waves: SectorWaveConfig[]
  hazardConfig: SectorHazardConfig
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
  encounterBias: Partial<Record<SpaceEncounterKind, number>>
  encounterGapMultiplier: number
  config: SectorNodeConfig
  stationServices: SectorStationService[]
  allowsMetaUpgrades: boolean
}

const nodeRows = [0, 1, 2, 3] as const

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

const encounterBiasForTags = (hazards: SectorHazardTag[], waveOrder: SectorWaveOrder, pace: SectorNodePace): Partial<Record<SpaceEncounterKind, number>> => ({
  meteorFront: hazards.includes('asteroids') ? 2.4 : hazards.includes('clear') ? 0.72 : 1,
  hunterWing: hazards.includes('hunterWing') ? 2.25 : waveOrder === 'ambush' ? 1.45 : 0.95,
  derelictCache: hazards.includes('derelictCache') ? 2.1 : pace === 'safe' || pace === 'mild' ? 1.25 : 0.78
})

const asteroidConfigFor = (hazards: SectorHazardTag[], pace: SectorNodePace): SectorAsteroidHazardConfig | undefined => {
  if (!hazards.includes('asteroids')) return undefined
  return {
    density: pace === 'boss' ? 2.1 : pace === 'intense' ? 1.8 : 1.25,
    damageMultiplier: pace === 'boss' ? 1.15 : 1,
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
}: Omit<SectorNodeConfig, 'templateId' | 'depth' | 'hazardConfig'> & {
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
  planets,
  enemies,
  waves,
  hazardConfig: { asteroids: asteroidConfigFor(hazards, pace), encounters: encounterBiasForTags(hazards, waveOrder, pace) },
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
      planets: planetConfig(1, depth > 0.45 ? 3 : 2, 'sparse', { repair: 1.6, cache: 1.1 }),
      enemies: enemyConfig(['chaser'], { chaser: 1, splinter: 0.55, lancer: depth > 0.45 ? 0.35 : 0 }, 0.68 * pacePressureFor(pace) * pressureScale(depth, template.pressureRole), 0.75),
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
    const maxPlanets = depth > 0.55 ? 5 : 6
    return configFromTemplate({
      templateId,
      column,
      columns,
      pace,
      theme: 'planetCluster',
      waveOrder,
      hazards,
      planets: planetConfig(3, maxPlanets, 'dense', { cache: 1.4, relic: 1.2, repair: 1.1, lore: 1 }),
      enemies: enemyConfig(['chaser', 'splinter'], { chaser: 1, splinter: 1, lancer: 0.75, shooter: depth > 0.5 ? 0.35 : 0 }, 0.86 * pacePressureFor(pace) * pressureScale(depth, template.pressureRole), 0.9 + depth * 0.08),
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
      planets: planetConfig(0, depth > 0.5 ? 2 : 3, 'sparse', { strange: 1.2, relic: 1.1, cache: 0.8 }),
      enemies: enemyConfig(['mine', 'skimmer'], { mine: 1.7, skimmer: 1.1, siphon: depth > 0.55 ? 0.55 : 0.2 }, 1.05 * pacePressureFor(pace) * pressureScale(depth, template.pressureRole), 1.05 + depth * 0.12),
      waves: [
        { atSeconds: 20, label: 'Mine screen', enemies: scaleEnemyCounts({ mine: 5, chaser: 3 }, depth), notes: 'Area denial before the first hazard roll.' },
        { atSeconds: 75, label: 'Skimmer patrol', enemies: scaleEnemyCounts({ skimmer: 3, splinter: 5 }, depth) }
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
      planets: planetConfig(1, 3, 'normal', { hostile: 1.3, cache: 1, repair: 0.7 }),
      enemies: enemyConfig(['shooter', 'razor'], { shooter: 1.2, razor: 1, skimmer: 0.9, lancer: depth > 0.45 ? 0.55 : 0.25 }, 1.14 * pacePressureFor(pace) * pressureScale(depth, template.pressureRole), 1.05 + depth * 0.15),
      waves: [
        { atSeconds: 25, label: 'Hostile screen', enemies: scaleEnemyCounts({ shooter: 3, chaser: 5 }, depth) },
        { atSeconds: 80, label: 'Ambush wing', enemies: scaleEnemyCounts({ razor: 3, skimmer: 2 }, depth), notes: 'Fast enemies punish passive routing.' }
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
      planets: planetConfig(1, 3, 'normal', { cache: 1.7, relic: 0.9, hostile: 0.6 }),
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
      planets: planetConfig(1, 3, 'sparse', { strange: 1.6, relic: 1.2, horde: 0.7 }),
      enemies: enemyConfig(['mine', 'skimmer'], { mine: 1.2, skimmer: 1.3, siphon: 0.45 + depth * 0.35 }, 1.08 * pacePressureFor(pace) * pressureScale(depth, template.pressureRole), 1.05 + depth * 0.16),
      waves: [
        { atSeconds: 20, label: 'Static bloom', enemies: scaleEnemyCounts({ mine: 4, chaser: 4 }, depth), notes: 'Unstable opening pressure before the hazard family is clear.' },
        { atSeconds: 75, label: 'Skimmer patrol', enemies: scaleEnemyCounts({ skimmer: 3, splinter: 5 }, depth) }
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
      planets: planetConfig(1, 3, 'sparse', { hostile: 1.5, horde: 1.2, cache: 0.9 }),
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

const templateFor = (column: number, row: number, random: () => number, usedInColumn: Set<SectorNodeTemplateId>): SectorNodeTemplateId => {
  if (column === 0) return 'mothership'
  if (column === 5) return 'finalStand'
  if (column === 1 && row === 0) return 'safeDrift'
  if (column === 1 && row === 1) return 'planetCluster'
  if ((column === 2 && row === 1) || (column === 4 && row === 3)) return 'freeport'
  if (column === 4 && row % 2 === 0) return 'bossGate'
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

const nodeId = (column: number, row: number) => column === 0 ? 'mothership' : column === 5 ? 'final' : `c${column}r${row}`

export const createSectorMap = (seed = Date.now()): SectorMap => {
  const random = rngFrom(seed)
  const columns = 6
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
      config: configFor('mothership', 0, random, columns)
    }
  ]

  for (let column = 1; column < columns - 1; column += 1) {
    const usedInColumn = new Set<SectorNodeTemplateId>()
    for (const row of nodeRows) {
      const templateId = templateFor(column, row, random, usedInColumn)
      usedInColumn.add(templateId)
      const kind = sectorNodeTemplateCatalog[templateId].kind
      nodes.push({
        id: nodeId(column, row),
        column,
        row,
        kind,
        label: labelFor(kind, column, row, templateId),
        description: descriptionFor(templateId),
        completed: false,
        stationServices: kind === 'station' ? ['repair', 'workbench', 'trade', 'scan'] : [],
        config: configFor(templateId, column, random, columns)
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
    config: configFor('finalStand', columns - 1, random, columns)
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

const weightedKeys = <T extends string>(weights: Partial<Record<T, number>>) => (
  Object.entries(weights)
    .filter(([, weight]) => typeof weight === 'number' && weight > 0)
    .map(([key]) => key as T)
)

export const sectorNodeRunProfile = (node: SectorNode): SectorNodeRunProfile => {
  const common = {
    encounterBias: node.config.hazardConfig.encounters,
    encounterGapMultiplier: encounterGapFor(node.config.pace),
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
    bossRequired: node.kind === 'boss' || node.kind === 'final'
  }
}
