import type { SectorNode, SectorStationService } from './sector-map'
import type { StationVisitRecord } from './station-memory'

export interface StationDockReport {
  nodeId: string
  stationName: string
  nodeLabel: string
  fiction: string
  serviceLine: string
  repaired: number
  workbenchSignals: number
  scrap: number
  crystal: number
  services: SectorStationService[]
  contactName: string
  contactRole: string
  rumor: string
  routeStatus: string
}

interface ServiceStationDockReportInput {
  node: SectorNode
  visit: StationVisitRecord
  repaired: number
  workbenchSignals: number
  scrap: number
  crystal: number
}

interface RouteStationDockReportInput {
  node: SectorNode
  visit: StationVisitRecord
  pendingUpgrades: number
}

const hashString = (value: string, salt = 0) => {
  let h = 2166136261 ^ salt
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function stationFictionForNode(node: SectorNode, stationName: string, serviceDock: boolean) {
  const lines = serviceDock
    ? [
        `${stationName} answers with a warm carrier tone. Docking arms fold around the hull and a tired traffic officer stamps your route charter.`,
        `${stationName} smells of hot coolant, recycled coffee, and old jump maps. The berth crew patch the hull while the route board blinks awake.`,
        `${stationName} rotates under your canopy like a brass compass. Service crews swarm the scorch marks and the station AI opens a temporary workbench lane.`
      ]
    : [
        `Welcome to ${stationName}. The docking collar seals with a low magnetic thud while the station master reads your route clearance aloud.`,
        `${stationName} catches the ship on a green-lit gantry. Beyond the glass, freight drones cut silent lanes through the dark.`,
        `A cracked sign over the airlock flickers: WELCOME TO ${stationName}. Your ship settles into the berth and the sector map spools back online.`
      ]
  return lines[hashString(node.id, serviceDock ? 91 : 47) % lines.length]
}

export function buildServiceStationDockReport({
  node,
  visit,
  repaired,
  workbenchSignals,
  scrap,
  crystal
}: ServiceStationDockReportInput): StationDockReport {
  return {
    nodeId: node.id,
    stationName: visit.stationName,
    nodeLabel: node.label,
    fiction: stationFictionForNode(node, visit.stationName, true),
    serviceLine: `Station services are run-only. Hull +${repaired}, workbench ${workbenchSignals > 0 ? `+${workbenchSignals} signal` : 'signal already staged'}, scrap +${scrap}, crystal +${crystal}.`,
    repaired,
    workbenchSignals,
    scrap,
    crystal,
    services: [...node.stationServices],
    contactName: visit.contactName,
    contactRole: visit.contactRole,
    rumor: visit.rumor,
    routeStatus: 'Service berth clear. Route traffic control is holding your next jump.'
  }
}

export function buildRouteStationDockReport({
  node,
  visit,
  pendingUpgrades
}: RouteStationDockReportInput): StationDockReport {
  return {
    nodeId: node.id,
    stationName: visit.stationName,
    nodeLabel: node.label,
    fiction: stationFictionForNode(node, visit.stationName, false),
    serviceLine: pendingUpgrades > 0
      ? `${pendingUpgrades} mutation signal${pendingUpgrades === 1 ? '' : 's'} banked in the station buffer.`
      : 'No mutation signals are waiting in the station buffer.',
    repaired: 0,
    workbenchSignals: 0,
    scrap: 0,
    crystal: 0,
    services: [...node.stationServices],
    contactName: visit.contactName,
    contactRole: visit.contactRole,
    rumor: visit.rumor,
    routeStatus: `${node.label} logged complete. Departure control is ready to hand you back to the sector map.`
  }
}
