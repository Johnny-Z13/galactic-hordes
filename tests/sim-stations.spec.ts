import { expect, test } from '@playwright/test'
import { createSectorMap } from '../src/sector-map'
import { runBalance } from '../src/run-balance'
import { simulateStationDock } from '../src/sim/sim-stations'

test('station dock repairs damage and grants workbench signals when services are present', () => {
  const station = Array.from({ length: 20 }, (_, seed) => createSectorMap(seed + 20))
    .flatMap((map) => map.nodes)
    .find((node) => node.kind === 'station' && node.stationServices.includes('repair') && node.stationServices.includes('workbench'))!
  const result = simulateStationDock({ node: station, currentDamage: 80 })

  expect(result.repaired).toBe(runBalance.station.repairHull)
  expect(result.resources.mutationSignals).toBe(runBalance.station.workbenchSignals)
})

test('station dock cannot repair more damage than the run has taken', () => {
  const station = Array.from({ length: 20 }, (_, seed) => createSectorMap(seed + 20))
    .flatMap((map) => map.nodes)
    .find((node) => node.kind === 'station' && node.stationServices.includes('repair'))!
  const result = simulateStationDock({ node: station, currentDamage: 10 })

  expect(result.repaired).toBe(10)
})

test('station dock repair remains capped when sim damage exceeds base hull', () => {
  const station = Array.from({ length: 20 }, (_, seed) => createSectorMap(seed + 20))
    .flatMap((map) => map.nodes)
    .find((node) => node.kind === 'station' && node.stationServices.includes('repair'))!
  const result = simulateStationDock({ node: station, currentDamage: runBalance.player.baseHull + 50 })

  expect(result.repaired).toBe(runBalance.station.repairHull)
})
