import type { SectorNode, SectorStationService } from './sector-map'

export interface StationContact {
  name: string
  role: string
}

export interface StationVisitRecord {
  nodeId: string
  nodeLabel: string
  stationName: string
  dockedAtSeconds: number
  services: SectorStationService[]
  repaired: number
  workbenchSignals: number
  scrap: number
  crystal: number
  contactName: string
  contactRole: string
  rumor: string
}

export interface StationVisitInput {
  node: SectorNode
  dockedAtSeconds: number
  repaired: number
  workbenchSignals: number
  scrap: number
  crystal: number
}

export interface JourneyDistanceInput {
  nodesCleared: number
  planetsVisited: number
  stationsDocked: number
  skippedStations: number
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

const contacts: readonly StationContact[] = [
  { name: 'Mara Venn', role: 'Dockmaster' },
  { name: 'Oris Kade', role: 'Route Cartographer' },
  { name: 'Sella Quon', role: 'Signal Clerk' },
  { name: 'Jun Vale', role: 'Berth Mechanic' },
  { name: 'Tamsin Row', role: 'Freeport Trader' },
  { name: 'Ivo Saint', role: 'Archive Listener' },
  { name: 'Nera Coil', role: 'Traffic Watch' },
  { name: 'Pax Meridian', role: 'Old Map Broker' }
]

const stationPrefixes = [
  'LATHE',
  'CINDER',
  'PALE',
  'UMBER',
  'GLASS',
  'ORCHID',
  'HALO',
  'VIOLET',
  'EMBER',
  'TIDE',
  'MIRROR',
  'NEON'
] as const

const stationSuffixes = [
  'RELAY',
  'FREEPORT',
  'ANCHORAGE',
  'CITADEL',
  'LOCK',
  'ARRAY',
  'HAVEN',
  'EXCHANGE',
  'GATE',
  'KEEP',
  'DRIFT',
  'BASTION'
] as const

const rumorByTemplate: Partial<Record<SectorNode['config']['templateId'], readonly string[]>> = {
  safeDrift: [
    'A quiet lane ahead is hiding an old repair cache.',
    'The next calm route has a planet with a clean docking collar.'
  ],
  planetCluster: [
    'One of the cluster worlds is singing under the crust.',
    'A planet-rich branch ahead has a relic trace buried in its weather.'
  ],
  asteroidBelt: [
    'The belt is moving wrong; follow the slow rocks if you want to live.',
    'A miner left coordinates for a cache between two asteroid fronts.'
  ],
  hunterLane: [
    'Hunter wings are tracking hot engines, but they leave rich wreckage.',
    'A gunline patrol has been avoiding one unnamed moon.'
  ],
  derelictField: [
    'A derelict cache is broadcasting a station prayer on repeat.',
    'The wreck field pays well if you leave before the wardens wake.'
  ],
  nebulaAnomaly: [
    'The nebula hides a glass signal that only appears after a hard burn.',
    'A strange world in the fog has already learned your transponder.'
  ],
  freeport: [
    'Freeport traffic says the next station will remember your charter.',
    'A trader marked one route as safe, which usually means expensive.'
  ],
  bossGate: [
    'The gate guardian is old military hardware with a damaged left vector.',
    'Break the gate fast; the second wave carries the real teeth.'
  ],
  finalStand: [
    'No berth waits past the last stand.',
    'Departure control has no maps beyond the final signal.'
  ]
}

export const stationNameForNode = (node: SectorNode) => {
  const key = `${node.id}:${node.label}`
  return `${pick(stationPrefixes, key, 27)} ${pick(stationSuffixes, key, 83)}`
}

export const stationContactForNode = (node: SectorNode): StationContact => (
  pick(contacts, `${node.id}:${node.label}`, 61)
)

export const stationRumorForNode = (node: SectorNode) => {
  const rumors = rumorByTemplate[node.config.templateId] ?? [
    'Route traffic is thin, but the station board still has one live mark.',
    'Someone paid to keep the next route half-erased.'
  ]
  return pick(rumors, `${node.id}:${node.config.readout}`, 113)
}

export const buildStationVisitRecord = ({
  node,
  dockedAtSeconds,
  repaired,
  workbenchSignals,
  scrap,
  crystal
}: StationVisitInput): StationVisitRecord => {
  const contact = stationContactForNode(node)
  return {
    nodeId: node.id,
    nodeLabel: node.label,
    stationName: stationNameForNode(node),
    dockedAtSeconds: Math.max(0, Math.floor(dockedAtSeconds)),
    services: [...node.stationServices],
    repaired: Math.max(0, Math.round(repaired)),
    workbenchSignals: Math.max(0, Math.round(workbenchSignals)),
    scrap: Math.max(0, Math.round(scrap)),
    crystal: Math.max(0, Math.round(crystal)),
    contactName: contact.name,
    contactRole: contact.role,
    rumor: stationRumorForNode(node)
  }
}

export const journeyDistanceLy = ({
  nodesCleared,
  planetsVisited,
  stationsDocked,
  skippedStations
}: JourneyDistanceInput) => (
  Math.max(0, nodesCleared) * 31 +
  Math.max(0, planetsVisited) * 7 +
  Math.max(0, stationsDocked) * 11 +
  Math.max(0, skippedStations) * 19
)
