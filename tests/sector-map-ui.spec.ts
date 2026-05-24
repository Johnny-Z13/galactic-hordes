import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const mainSource = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')

test('sector map is a first class screen between mothership and expeditions', () => {
  const main = mainSource()

  expect(main).toContain("| 'sectorMap'")
  expect(main).toContain("| 'station'")
  expect(main).toContain('sectorMap: document.createElement')
  expect(main).toContain('station: document.createElement')
  expect(main).toContain('private showSectorMap(')
  expect(main).toContain('private showStationDock(')
  expect(main).toContain('private launchSectorNode(')
  expect(main).toContain('private completeSectorNodeViaBeacon(')
  expect(main).toContain('private sectorNodeGlyph(')
  expect(main).toContain('private sectorKindLabel(')
})

test('sector map choices expose wave and hazard readouts before launch', () => {
  const main = mainSource()

  expect(main).toContain('choice.config.readout')
  expect(main).toContain('private sectorNodeConfigSummary(')
  expect(main).toContain('private sectorMapDebugReadout(')
  expect(main).toContain('ROUTE DEBUG')
  expect(main).toContain("const wrap = document.createElement('details')")
  expect(main).toContain("wrap.innerHTML = `<summary>ROUTE DEBUG</summary>")
  expect(main).toContain('sector-choice-kind')
  expect(main).toContain('sector-node-label')
  expect(main).toContain('node.config.templateId')
  expect(main).toContain('profile.rewardMultiplier')
  expect(main).toContain('PLANETS ${this.sectorPlanetLabel')
  expect(main).toContain('WAVES ${node.config.waves.length} ${this.sectorWaveLabel(node.config.waveOrder)}')
  expect(main).toContain('HAZARDS ${this.sectorHazardsLabel(node.config.hazards)}')
  expect(main).toContain('private sectorHazardsLabel(')
  expect(main).toContain('private updateSectorWaves(')
  expect(main).toContain('encounterBias: this.sectorNodeProfile.encounterBias')
  expect(main).toContain('private nextSectorSpaceEncounterTime(')
})

test('station docking advances the sector map instead of always ending the run', () => {
  const main = mainSource()

  expect(main).toContain('this.completeSectorNodeViaBeacon()')
  expect(main).toContain("node.kind === 'final'")
  expect(main).toContain("this.finishRun('cleanExtraction')")
  expect(main).toContain('this.showStationDock(this.routeStationDockReport(node))')
  expect(main).toContain('Departure lane open. Choose the next jump.')
})

test('station docking opens a fiction menu with workbench and route actions', () => {
  const main = mainSource()
  const css = readFileSync(resolve(process.cwd(), 'src/style.css'), 'utf8')

  expect(main).toContain('WELCOME TO ${this.escape(report.stationName)}')
  expect(main).toContain('private stationNameForNode(')
  expect(main).toContain('private stationFictionForNode(')
  expect(main).toContain('Open Workbench')
  expect(main).toContain('Cargo Manifest')
  expect(main).toContain('Route Map')
  expect(main).toContain('private openStationWorkbench(')
  expect(main).toContain('private leaveStationForSectorMap(')
  expect(css).toContain('.station-dock-panel')
  expect(css).toContain('.station-dock-actions')
})

test('sector stations offer run services but not permanent meta upgrades', () => {
  const main = mainSource()
  const methodStart = main.indexOf('private applySectorStationServices(')
  const methodEnd = main.indexOf('private prepareSectorNode(', methodStart)
  const stationMethod = main.slice(methodStart, methodEnd)

  expect(main).toContain('private applySectorStationServices(')
  expect(main).toContain('Station services are run-only')
  expect(stationMethod).not.toContain('purchaseMothershipTier')
})

test('first sector node has shorter station timing to introduce the route loop', () => {
  const main = mainSource()

  expect(main).toContain('private isIntroSectorNode(')
  expect(main).toContain('runBalance.timers.introSectorBeaconSeconds')
  expect(main).toContain('return this.stats.time >= this.nextReturnBeaconAt')
})

test('dock action stays visible and pulses while a station is available', () => {
  const main = mainSource()
  const css = readFileSync(resolve(process.cwd(), 'src/style.css'), 'utf8')

  expect(main).toContain('const stationAvailable = Boolean(this.returnBeacon)')
  expect(main).toContain('returnBeaconAvailable: stationAvailable')
  expect(main).toContain("this.ui.touchAction.classList.toggle('urgent', stationAvailable)")
  expect(css).toContain('.touch-button.urgent')
  expect(css).toContain('@keyframes dock-action-pulse')
})
