import { expect, test } from '@playwright/test'
import { createSectorMap } from '../src/sector-map'
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

test('journey distance rewards nodes planets stations and skipped stations', () => {
  expect(journeyDistanceLy({ nodesCleared: 3, planetsVisited: 2, stationsDocked: 1, skippedStations: 1 })).toBe(137)
})
