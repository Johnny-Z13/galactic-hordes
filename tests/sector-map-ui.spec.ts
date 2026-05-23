import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const mainSource = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')

test('sector map is a first class screen between mothership and expeditions', () => {
  const main = mainSource()

  expect(main).toContain("| 'sectorMap'")
  expect(main).toContain('sectorMap: document.createElement')
  expect(main).toContain('private showSectorMap(')
  expect(main).toContain('private launchSectorNode(')
  expect(main).toContain('private completeSectorNodeViaBeacon(')
})

test('sector map choices expose wave and hazard readouts before launch', () => {
  const main = mainSource()

  expect(main).toContain('choice.config.readout')
  expect(main).toContain('WAVES ${this.sectorWaveLabel(choice.config.waveOrder)}')
  expect(main).toContain('HAZARDS ${this.sectorHazardsLabel(choice.config.hazards)}')
  expect(main).toContain('private sectorHazardsLabel(')
  expect(main).toContain('encounterBias: this.sectorNodeProfile.encounterBias')
  expect(main).toContain('private nextSectorSpaceEncounterTime(')
})

test('return beacon advances the sector map instead of always ending the run', () => {
  const main = mainSource()

  expect(main).toContain('this.completeSectorNodeViaBeacon()')
  expect(main).toContain("node.kind === 'final'")
  expect(main).toContain("this.finishRun('cleanExtraction')")
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
