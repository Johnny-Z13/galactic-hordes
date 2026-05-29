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

test('names the journey and summarizes player-readable run highlights', () => {
  const report = buildDebriefReport({
    outcome: 'deepExtraction',
    earnedResources: resources(260, 38, 3),
    recoveredResources: resources(286, 41, 3),
    discoveries: [
      { id: 'planet:red-ossuary', kind: 'planet', title: 'RED OSSUARY' },
      { id: 'lore:choir', kind: 'lore', title: 'CHOIR GRAVE' },
      { id: 'relic:mirror', kind: 'relic', title: 'MIRROR KEEL' }
    ],
    nodesCleared: 4,
    planetsVisited: 2,
    skippedBeacons: 2,
    stationVisits: [
      {
        nodeId: 'node-a',
        nodeLabel: 'A',
        stationName: 'LATHE RELAY',
        dockedAtSeconds: 180,
        services: ['repair'],
        repaired: 12,
        workbenchSignals: 0,
        scrap: 0,
        crystal: 0,
        contactName: 'Mara Venn',
        contactRole: 'Dockmaster',
        rumor: 'Quiet lane ahead.'
      }
    ]
  })

  expect(report.journeyTitle).toBe('LATHE RELAY DEEP ROUTE')
  expect(report.highlights).toEqual([
    '187 LY travelled across 4 route nodes.',
    '2 planets surveyed with 3 discoveries logged.',
    'Docked at LATHE RELAY.',
    'Skipped 2 station beacons for deep-route recovery.'
  ])
})
