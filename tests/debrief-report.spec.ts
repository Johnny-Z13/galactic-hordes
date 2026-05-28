import { test, expect } from '@playwright/test'

import { buildDebriefReport } from '../src/debrief-report'
import type { PersistentArchiveRecord, ResourceBundle } from '../src/mothership-progression'

const resources = (scrap: number, crystal: number, cores: number): ResourceBundle => ({ scrap, crystal, cores })

test('builds a destroyed-run debrief from recovery and journey inputs', () => {
  const discoveries: PersistentArchiveRecord[] = [
    { id: 'planet:ember', kind: 'planet', title: 'EMBER VAULT' },
    { id: 'relic:choir', kind: 'relic', title: 'CHOIR LENS' }
  ]

  const report = buildDebriefReport({
    outcome: 'destroyed',
    earnedResources: resources(100, 20, 2),
    recoveredResources: resources(45, 9, 0),
    discoveries,
    nodesCleared: 2,
    planetsVisited: 1,
    skippedBeacons: 1,
    stationVisits: []
  })

  expect(report.title).toBe('BLACK BOX RECOVERED')
  expect(report.copy).toBe('The scout ship was lost. The mothership recovered partial cargo and all transmitted discoveries.')
  expect(report.resources.earned).toEqual(resources(100, 20, 2))
  expect(report.resources.recovered).toEqual(resources(45, 9, 0))
  expect(report.discoveries).toEqual(discoveries)
  expect(report.stationVisits).toEqual([])
  expect(report.lightYears).toBe(88)
})
