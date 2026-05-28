import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { runBalance } from '../src/run-balance'
import { resolveStationServices } from '../src/station-services'

test('station service resolver applies repair workbench and trade as run-only effects', () => {
  const result = resolveStationServices({
    services: ['repair', 'workbench', 'trade'],
    hull: 42,
    maxHull: 100,
    pendingUpgrades: 1,
    workbenchRerolls: 0
  })

  expect(result.repaired).toBe(runBalance.station.repairHull)
  expect(result.workbenchSignals).toBe(runBalance.station.workbenchSignals - 1)
  expect(result.scrap).toBe(runBalance.station.tradeScrap)
  expect(result.crystal).toBe(runBalance.station.tradeCrystal)
  expect(result.nextHull).toBe(42 + runBalance.station.repairHull)
  expect(result.nextPendingUpgrades).toBe(runBalance.station.workbenchSignals)
  expect(result.nextWorkbenchRerolls).toBe(runBalance.station.rerolls)
})

test('station repair and workbench services never report more than changed state', () => {
  const result = resolveStationServices({
    services: ['repair', 'workbench'],
    hull: 94,
    maxHull: 100,
    pendingUpgrades: 5,
    workbenchRerolls: 3
  })

  expect(result.repaired).toBe(6)
  expect(result.workbenchSignals).toBe(0)
  expect(result.nextHull).toBe(100)
  expect(result.nextPendingUpgrades).toBe(5)
  expect(result.nextWorkbenchRerolls).toBe(3)
  expect(result.scrap).toBe(0)
  expect(result.crystal).toBe(0)
})

test('main and station sim delegate station service math to shared resolver', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const simStations = readFileSync('src/sim/sim-stations.ts', 'utf8')
  const runSystems = readFileSync('tests/run-systems-balance.spec.ts', 'utf8')

  expect(main).toContain("from './station-services'")
  expect(main).toContain('resolveStationServices({')
  expect(simStations).toContain("from '../station-services'")
  expect(simStations).toContain('resolveStationServices({')
  expect(runSystems).toContain("src/station-services.ts")
  expect(main).not.toContain('const before = this.player.hull')
})
