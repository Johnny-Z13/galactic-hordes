import { expect, test } from '@playwright/test'
import { createSectorMap } from '../src/sector-map'
import { buildRouteStationDockReport, buildServiceStationDockReport, stationFictionForNode } from '../src/station-dock-report'
import { buildStationVisitRecord, journeyDistanceLy, stationContactForNode, stationNameForNode } from '../src/station-memory'

test('station names and contacts are deterministic per sector node', () => {
  const node = createSectorMap(42).nodes.find((candidate) => candidate.kind === 'station')!

  expect(stationNameForNode(node)).toBe(stationNameForNode(node))
  expect(stationNameForNode(node)).not.toMatch(/^SPACE STATION [0-9]+$/)
  expect(stationNameForNode(node)).toMatch(/^[A-Z][A-Z ]+$/)
  expect(stationContactForNode(node)).toEqual(stationContactForNode(node))
  expect(stationContactForNode(node).name.length).toBeGreaterThan(4)
})

test('station visit records preserve service results and rumor text', () => {
  const node = createSectorMap(77).nodes.find((candidate) => candidate.kind === 'station')!
  const record = buildStationVisitRecord({
    node,
    dockedAtSeconds: 128,
    repaired: 22,
    workbenchSignals: 1,
    scrap: 35,
    crystal: 1
  })

  expect(record.nodeId).toBe(node.id)
  expect(record.stationName).toBe(stationNameForNode(node))
  expect(record.services).toEqual(node.stationServices)
  expect(record.rumor.length).toBeGreaterThan(20)
})

test('station dock reports keep route and service copy deterministic', () => {
  const node = createSectorMap(77).nodes.find((candidate) => candidate.kind === 'station')!
  const visit = buildStationVisitRecord({
    node,
    dockedAtSeconds: 128,
    repaired: 22,
    workbenchSignals: 1,
    scrap: 35,
    crystal: 1
  })

  expect(stationFictionForNode(node, visit.stationName, false)).toBe(stationFictionForNode(node, visit.stationName, false))
  expect(stationFictionForNode(node, visit.stationName, true)).not.toBe(stationFictionForNode(node, visit.stationName, false))
  expect(buildRouteStationDockReport({ node, visit, pendingUpgrades: 2 }).serviceLine).toBe('2 mutation signals banked in the station buffer.')
  expect(buildRouteStationDockReport({ node, visit, pendingUpgrades: 0 }).serviceLine).toBe('No mutation signals are waiting in the station buffer.')
  expect(buildServiceStationDockReport({ node, visit, repaired: 22, workbenchSignals: 1, scrap: 35, crystal: 1 }).serviceLine)
    .toBe('Station services are run-only. Hull +22, workbench +1 signal, scrap +35, crystal +1.')
})

test('journey distance rewards nodes planets stations and skipped stations', () => {
  expect(journeyDistanceLy({ nodesCleared: 3, planetsVisited: 2, stationsDocked: 1, skippedStations: 1 })).toBe(137)
})
