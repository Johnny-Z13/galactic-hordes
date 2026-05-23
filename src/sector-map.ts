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

const rngFrom = (seed: number) => {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T>(values: readonly T[], random: () => number) => values[Math.min(values.length - 1, Math.floor(random() * values.length))]

const labelFor = (kind: SectorNodeKind, column: number, row: number) => {
  if (kind === 'mothership') return 'MOTHERSHIP'
  if (kind === 'final') return 'THE LAST STAND'
  if (kind === 'station') return `FREEPORT ${column}-${row + 1}`
  if (kind === 'boss') return `BOSS GATE ${column}-${row + 1}`
  if (kind === 'anomaly') return `NEBULA ${column}-${row + 1}`
  if (kind === 'planet') return `PLANET CLUSTER ${column}-${row + 1}`
  return `HOSTILE SWARM ${column}-${row + 1}`
}

const descriptionFor = (kind: SectorNodeKind) => ({
  mothership: 'Launch point. Permanent meta upgrades are managed here between runs.',
  hostile: 'Dense wave order with better mutation signal odds.',
  planet: 'Richer planet field with more landing choices and discovery value.',
  station: 'Run-only repairs, workbench installs, trading, and route scans. No permanent meta upgrades.',
  anomaly: 'Unstable rule set. Higher reward, less predictable enemy pressure.',
  boss: 'Elite guardian route check before the final stand.',
  final: 'Final sector node. Beat the node and extract to win the run.'
})[kind]

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

const configFor = (kind: SectorNodeKind, random: () => number): SectorNodeConfig => {
  if (kind === 'mothership') {
    const pace: SectorNodePace = 'safe'
    const waveOrder: SectorWaveOrder = 'scouts'
    const hazards: SectorHazardTag[] = ['clear']
    return {
      pace,
      theme: 'openSpace',
      waveOrder,
      hazards,
      planets: planetConfig(1, 2, 'sparse', { repair: 1, cache: 1 }),
      enemies: enemyConfig(['chaser'], { chaser: 1, splinter: 0.35 }, 1),
      waves: [{ atSeconds: 20, label: 'Scout drift', enemies: { chaser: 3 }, notes: 'Low-pressure launch space.' }],
      hazardConfig: { encounters: encounterBiasForTags(hazards, waveOrder, pace) },
      rewards: { resourceMultiplier: 1, chestIntervalMultiplier: 1, upgradeSignalBonusChance: 0 },
      objective: 'Launch the run and commit to a route.',
      readout: 'Safe start. Pick a branch.',
      notes: ['Launch node. Minimal pressure and normal planet access.']
    }
  }
  if (kind === 'station') {
    const pace: SectorNodePace = 'safe'
    const waveOrder: SectorWaveOrder = 'scouts'
    const hazards: SectorHazardTag[] = ['clear', 'derelictCache']
    return {
      pace,
      theme: 'derelictField',
      waveOrder,
      hazards,
      planets: planetConfig(1, 2, 'sparse', { repair: 2, cache: 1.2 }),
      enemies: enemyConfig(['chaser'], { chaser: 1 }, 0.45, 0.6),
      waves: [{ atSeconds: 35, label: 'Dock pickets', enemies: { chaser: 3 }, notes: 'Small harassment wave before station services.' }],
      hazardConfig: { encounters: encounterBiasForTags(hazards, waveOrder, pace) },
      rewards: { resourceMultiplier: 0.8, chestIntervalMultiplier: 1.35, upgradeSignalBonusChance: 0.04 },
      objective: 'Take run-only repairs and workbench services.',
      readout: 'Safe station. Repair, trade, workbench.',
      notes: ['Run-only services. No permanent mothership upgrades.']
    }
  }
  if (kind === 'planet') {
    const pace: SectorNodePace = random() < 0.55 ? 'mild' : 'standard'
    const waveOrder: SectorWaveOrder = 'swarm'
    const hazards: SectorHazardTag[] = random() < 0.5 ? ['derelictCache'] : ['clear']
    return {
      pace,
      theme: 'planetCluster',
      waveOrder,
      hazards,
      planets: planetConfig(3, 6, 'dense', { cache: 1.4, relic: 1.2, repair: 1.1, lore: 1 }),
      enemies: enemyConfig(['chaser', 'splinter'], { chaser: 1, splinter: 1, lancer: 0.75 }, 0.86 * pacePressureFor(pace), 0.9),
      waves: [
        { atSeconds: 25, label: 'Approach swarm', enemies: { chaser: 5, splinter: 3 } },
        { atSeconds: 90, label: 'Landing pressure', enemies: { lancer: 2, splinter: 5 }, notes: 'Pushes the player to commit to a planet.' }
      ],
      hazardConfig: { encounters: encounterBiasForTags(hazards, waveOrder, pace) },
      rewards: { resourceMultiplier: 1.15, chestIntervalMultiplier: 0.95, upgradeSignalBonusChance: 0.08 },
      objective: 'Scout planet-rich space and land for discoveries.',
      readout: 'Planet route. More landings, moderate pressure.',
      notes: ['More planets than average. Enemy recipe is lighter, but routes invite surface risk.']
    }
  }
  if (kind === 'anomaly') {
    const pace: SectorNodePace = random() < 0.5 ? 'standard' : 'intense'
    const waveOrder: SectorWaveOrder = 'ambush'
    const hazards: SectorHazardTag[] = ['nebula', random() < 0.6 ? 'asteroids' : 'hunterWing']
    return {
      pace,
      theme: hazards.includes('asteroids') ? 'asteroidBelt' : 'nebula',
      waveOrder,
      hazards,
      planets: planetConfig(1, 3, 'sparse', { strange: 1.6, relic: 1.2, horde: 0.7 }),
      enemies: enemyConfig(['mine', 'skimmer'], { mine: 1.6, skimmer: 1.3, siphon: 0.45 }, 1.08 * pacePressureFor(pace), 1.05),
      waves: [
        { atSeconds: 20, label: 'Mine screen', enemies: { mine: 5, chaser: 3 }, notes: 'Area denial before the first hazard roll.' },
        { atSeconds: 75, label: 'Skimmer patrol', enemies: { skimmer: 3, splinter: 5 } }
      ],
      hazardConfig: { asteroids: asteroidConfigFor(hazards, pace), encounters: encounterBiasForTags(hazards, waveOrder, pace) },
      rewards: { resourceMultiplier: 1.28, chestIntervalMultiplier: 0.9, upgradeSignalBonusChance: 0.1 },
      objective: 'Survive unstable space weather for richer rewards.',
      readout: 'Anomaly route. Volatile hazards, higher payoff.',
      notes: ['Fewer planets. Higher reward multiplier. Hazards and mines create navigation pressure.']
    }
  }
  if (kind === 'boss') {
    const pace: SectorNodePace = 'boss'
    const waveOrder: SectorWaveOrder = 'bulwark'
    const hazards: SectorHazardTag[] = ['hunterWing', 'asteroids']
    return {
      pace,
      theme: 'bossGate',
      waveOrder,
      hazards,
      planets: planetConfig(1, 3, 'sparse', { hostile: 1.5, horde: 1.2, cache: 0.9 }),
      enemies: enemyConfig(['dreadnought'], { bulwark: 1.4, dreadnought: 0.8, shooter: 1 }, 1.18 * pacePressureFor(pace), 1.2),
      waves: [
        { atSeconds: 45, label: 'Gate guardian', enemies: { dreadnought: 1 } },
        { atSeconds: 70, label: 'Bulwark wall', enemies: { bulwark: 2, shooter: 4 } }
      ],
      hazardConfig: { asteroids: asteroidConfigFor(hazards, pace), encounters: encounterBiasForTags(hazards, waveOrder, pace) },
      rewards: { resourceMultiplier: 1.35, chestIntervalMultiplier: 0.85, upgradeSignalBonusChance: 0.12 },
      objective: 'Break an elite guardian gate before the final sector.',
      readout: 'Boss gate. Heavy wave order and hazards.',
      notes: ['Boss required. Asteroids and hunter wings are intentionally stacked.']
    }
  }
  if (kind === 'final') {
    const pace: SectorNodePace = 'boss'
    const waveOrder: SectorWaveOrder = 'cathedral'
    const hazards: SectorHazardTag[] = ['hunterWing', 'asteroids', 'nebula']
    return {
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
      hazardConfig: { asteroids: asteroidConfigFor(hazards, pace), encounters: encounterBiasForTags(hazards, waveOrder, pace) },
      rewards: { resourceMultiplier: 1.5, chestIntervalMultiplier: 0.75, upgradeSignalBonusChance: 0.15 },
      objective: 'Beat the final stand and extract to win the run.',
      readout: 'Final stand. Maximum pressure.',
      notes: ['Maximum pressure. Few safe planets and no route station after this node.']
    }
  }
  const pace: SectorNodePace = random() < 0.45 ? 'standard' : 'intense'
  const waveOrder: SectorWaveOrder = random() < 0.5 ? 'swarm' : 'ambush'
  const hazards: SectorHazardTag[] = random() < 0.55 ? ['hunterWing'] : ['asteroids']
  return {
    pace,
    theme: hazards.includes('asteroids') ? 'asteroidBelt' : 'openSpace',
    waveOrder,
    hazards,
    planets: planetConfig(1, 3, 'normal', { hostile: 1.4, cache: 1 }),
    enemies: enemyConfig(['shooter', 'razor'], { shooter: 1.2, razor: 1, skimmer: 0.9 }, 1.14 * pacePressureFor(pace), 1.05),
    waves: [
      { atSeconds: 25, label: 'Hostile screen', enemies: { shooter: 3, chaser: 5 } },
      { atSeconds: 80, label: 'Ambush wing', enemies: { razor: 3, skimmer: 2 } }
    ],
    hazardConfig: { asteroids: asteroidConfigFor(hazards, pace), encounters: encounterBiasForTags(hazards, waveOrder, pace) },
    rewards: { resourceMultiplier: 1.2, chestIntervalMultiplier: 0.95, upgradeSignalBonusChance: 0.08 },
    objective: 'Clear hostile space and dock at the route station.',
    readout: 'Hostile route. Enemy-forward combat node.',
    notes: ['Baseline combat route. Strong enemy bias with average planet access.']
  }
}

const kindFor = (column: number, row: number, random: () => number): SectorNodeKind => {
  if (column === 0) return 'mothership'
  if (column === 5) return 'final'
  if (column === 4 && row % 2 === 0) return 'boss'
  if ((column === 2 && row === 1) || (column === 4 && row === 3)) return 'station'
  return pick(['hostile', 'planet', 'anomaly', 'hostile', 'planet'] as const, random)
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
      config: configFor('mothership', random)
    }
  ]

  for (let column = 1; column < columns - 1; column += 1) {
    for (const row of nodeRows) {
      const kind = kindFor(column, row, random)
      nodes.push({
        id: nodeId(column, row),
        column,
        row,
        kind,
        label: labelFor(kind, column, row),
        description: descriptionFor(kind),
        completed: false,
        stationServices: kind === 'station' ? ['repair', 'workbench', 'trade', 'scan'] : [],
        config: configFor(kind, random)
      })
    }
  }

  nodes.push({
    id: 'final',
    column: columns - 1,
    row: 1,
    kind: 'final',
    label: 'THE LAST STAND',
    description: descriptionFor('final'),
    completed: false,
    stationServices: [],
    config: configFor('final', random)
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
