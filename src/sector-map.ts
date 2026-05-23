import type { PlanetArchetype } from './surface-encounters'
import type { SpaceEnemyKind } from './game-balance'
import type { SpaceEncounterKind } from './space-encounters'

export type SectorNodeKind = 'mothership' | 'hostile' | 'planet' | 'station' | 'anomaly' | 'boss' | 'final'
export type SectorStationService = 'repair' | 'workbench' | 'trade' | 'scan'
export type SectorNodePace = 'safe' | 'mild' | 'standard' | 'intense' | 'boss'
export type SectorWaveOrder = 'scouts' | 'swarm' | 'ambush' | 'bulwark' | 'cathedral'
export type SectorHazardTag = 'clear' | 'asteroids' | 'hunterWing' | 'derelictCache' | 'nebula'

export interface SectorNodeConfig {
  pace: SectorNodePace
  waveOrder: SectorWaveOrder
  hazards: SectorHazardTag[]
  objective: string
  readout: string
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

const configFor = (kind: SectorNodeKind, random: () => number): SectorNodeConfig => {
  if (kind === 'mothership') {
    return {
      pace: 'safe',
      waveOrder: 'scouts',
      hazards: ['clear'],
      objective: 'Launch the run and commit to a route.',
      readout: 'Safe start. Pick a branch.'
    }
  }
  if (kind === 'station') {
    return {
      pace: 'safe',
      waveOrder: 'scouts',
      hazards: ['clear', 'derelictCache'],
      objective: 'Take run-only repairs and workbench services.',
      readout: 'Safe station. Repair, trade, workbench.'
    }
  }
  if (kind === 'planet') {
    return {
      pace: random() < 0.55 ? 'mild' : 'standard',
      waveOrder: 'swarm',
      hazards: random() < 0.5 ? ['derelictCache'] : ['clear'],
      objective: 'Scout planet-rich space and land for discoveries.',
      readout: 'Planet route. More landings, moderate pressure.'
    }
  }
  if (kind === 'anomaly') {
    return {
      pace: random() < 0.5 ? 'standard' : 'intense',
      waveOrder: 'ambush',
      hazards: ['nebula', random() < 0.6 ? 'asteroids' : 'hunterWing'],
      objective: 'Survive unstable space weather for richer rewards.',
      readout: 'Anomaly route. Volatile hazards, higher payoff.'
    }
  }
  if (kind === 'boss') {
    return {
      pace: 'boss',
      waveOrder: 'bulwark',
      hazards: ['hunterWing', 'asteroids'],
      objective: 'Break an elite guardian gate before the final sector.',
      readout: 'Boss gate. Heavy wave order and hazards.'
    }
  }
  if (kind === 'final') {
    return {
      pace: 'boss',
      waveOrder: 'cathedral',
      hazards: ['hunterWing', 'asteroids', 'nebula'],
      objective: 'Beat the final stand and extract to win the run.',
      readout: 'Final stand. Maximum pressure.'
    }
  }
  return {
    pace: random() < 0.45 ? 'standard' : 'intense',
    waveOrder: random() < 0.5 ? 'swarm' : 'ambush',
    hazards: random() < 0.55 ? ['hunterWing'] : ['asteroids'],
    objective: 'Clear hostile space and dock at the route station.',
    readout: 'Hostile route. Enemy-forward combat node.'
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

const encounterBiasFor = (config: SectorNodeConfig): Partial<Record<SpaceEncounterKind, number>> => ({
  meteorFront: config.hazards.includes('asteroids') ? 2.4 : config.hazards.includes('clear') ? 0.72 : 1,
  hunterWing: config.hazards.includes('hunterWing') ? 2.25 : config.waveOrder === 'ambush' ? 1.45 : 0.95,
  derelictCache: config.hazards.includes('derelictCache') ? 2.1 : config.pace === 'safe' || config.pace === 'mild' ? 1.25 : 0.78
})

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

export const sectorNodeRunProfile = (node: SectorNode): SectorNodeRunProfile => {
  const pacePressure = pacePressureFor(node.config.pace)
  const common = {
    encounterBias: encounterBiasFor(node.config),
    encounterGapMultiplier: encounterGapFor(node.config.pace),
    config: node.config,
    stationServices: node.stationServices,
    allowsMetaUpgrades: false
  }
  if (node.kind === 'station') {
    return { ...common, enemyBias: ['chaser'], planetBias: ['repair', 'cache'], spawnMultiplier: 0.45, rewardMultiplier: 0.8, bossRequired: false }
  }
  if (node.kind === 'planet') {
    return { ...common, enemyBias: ['chaser', 'splinter', 'lancer'], planetBias: ['cache', 'relic', 'repair', 'lore'], spawnMultiplier: 0.86 * pacePressure, rewardMultiplier: 1.15, bossRequired: false }
  }
  if (node.kind === 'anomaly') {
    return { ...common, enemyBias: ['mine', 'skimmer', 'siphon'], planetBias: ['strange', 'relic', 'horde'], spawnMultiplier: 1.08 * pacePressure, rewardMultiplier: 1.28, bossRequired: false }
  }
  if (node.kind === 'boss') {
    return { ...common, enemyBias: ['bulwark', 'dreadnought', 'shooter'], planetBias: ['hostile', 'horde', 'cache'], spawnMultiplier: 1.18 * pacePressure, rewardMultiplier: 1.35, bossRequired: true }
  }
  if (node.kind === 'final') {
    return { ...common, enemyBias: ['cathedral', 'dreadnought', 'siphon'], planetBias: ['horde', 'strange', 'lore'], spawnMultiplier: 1.32 * pacePressure, rewardMultiplier: 1.5, bossRequired: true }
  }
  if (node.kind === 'hostile') {
    return { ...common, enemyBias: ['shooter', 'razor', 'skimmer'], planetBias: ['hostile', 'cache'], spawnMultiplier: 1.14 * pacePressure, rewardMultiplier: 1.2, bossRequired: false }
  }
  return { ...common, enemyBias: ['chaser', 'splinter'], planetBias: ['repair'], spawnMultiplier: 1, rewardMultiplier: 1, bossRequired: false }
}
