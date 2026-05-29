import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { defaultMothershipState } from '../src/mothership-progression'
import { resolveFinishedRun } from '../src/run/finish-run'
import type { StationVisitRecord } from '../src/station-memory'

const stationVisit: StationVisitRecord = {
  nodeId: 'station-1',
  nodeLabel: 'SAFE DOCK',
  stationName: 'HALO FREEPORT',
  dockedAtSeconds: 90,
  services: ['repair'],
  repaired: 30,
  workbenchSignals: 0,
  scrap: 0,
  crystal: 0,
  contactName: 'Mara Venn',
  contactRole: 'Dockmaster',
  rumor: 'Clear lanes ahead.'
}

test('finished run helper applies recovery and builds the debrief payload', () => {
  const mothership = defaultMothershipState()
  mothership.resources.scrap = 10

  const result = resolveFinishedRun({
    mothership,
    outcome: 'deepExtraction',
    earnedResources: { scrap: 100, crystal: 20, cores: 1 },
    archiveRecords: {
      'planet:test': { id: 'planet:test', kind: 'planet', title: 'LUX MORGUE' }
    },
    nodesCleared: 2,
    planetsVisited: 1,
    skippedBeacons: 1,
    stationVisits: [stationVisit]
  })

  expect(result.mothership.resources).toEqual({ scrap: 125, crystal: 23, cores: 1 })
  expect(result.recoveredResources).toEqual({ scrap: 115, crystal: 23, cores: 1 })
  expect(result.debrief.resources.earned).toEqual({ scrap: 100, crystal: 20, cores: 1 })
  expect(result.debrief.resources.recovered).toEqual(result.recoveredResources)
  expect(result.debrief.discoveries.map((record) => record.title)).toEqual(['LUX MORGUE'])
  expect(result.debrief.stationVisits).toEqual([stationVisit])
  expect(result.debrief.skippedBeacons).toBe(1)
})

test('main delegates finished run recovery to a focused run module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const finishRun = readFileSync('src/run/finish-run.ts', 'utf8')

  expect(finishRun).toContain('export function resolveFinishedRun')
  expect(main).toContain("from './run/finish-run'")
  expect(main).toContain('const finished = resolveFinishedRun({')
  expect(main).toContain('this.mothership = finished.mothership')
  expect(main).toContain('this.debrief = finished.debrief')
})
