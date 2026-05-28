import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { runObjectiveReadout } from '../src/run-objective-readout'

test('run objective readout keeps the current route objective visible during flight', () => {
  expect(runObjectiveReadout({
    state: 'playing',
    routeObjective: 'Recover, scout, and reach the next route branch.',
    elapsed: 42,
    nextReturnBeaconAt: 90,
    returnBeaconDistance: null,
    surfaceEvent: null
  })).toEqual({
    label: 'ROUTE',
    text: 'Recover, scout, and reach the next route branch. // STATION 48s'
  })
})

test('run objective readout prioritizes dock distance once a station beacon is active', () => {
  expect(runObjectiveReadout({
    state: 'playing',
    routeObjective: 'Clear a hunter patrol lane and cash in combat rewards.',
    elapsed: 125,
    nextReturnBeaconAt: 90,
    returnBeaconDistance: 734,
    surfaceEvent: null
  })).toEqual({
    label: 'DOCK',
    text: 'Station signal 734m'
  })
})

test('run objective readout switches to surface objective while on foot', () => {
  expect(runObjectiveReadout({
    state: 'surface',
    routeObjective: 'Scout planet-rich space and land for discoveries.',
    elapsed: 160,
    nextReturnBeaconAt: 220,
    returnBeaconDistance: null,
    surfaceEvent: 'cache'
  })).toEqual({
    label: 'SURFACE',
    text: 'Collect cache signals, then return to ship'
  })
})

test('hud wires route objective readout through a dedicated chip', () => {
  const hud = readFileSync('src/ui/hud.ts', 'utf8')
  const main = readFileSync('src/main.ts', 'utf8')
  const css = readFileSync('src/style.css', 'utf8')

  expect(main).toContain('objective: document.createElement')
  expect(hud).toContain("import { runObjectiveReadout } from '../run-objective-readout'")
  expect(hud).toContain("const objective = chip('ROUTE', self['ui'].objective, 'objective wide')")
  expect(hud).toContain('const objectiveReadout = runObjectiveReadout({')
  expect(hud).toContain("self['ui'].objective.parentElement?.querySelector('.hud-label')")
  expect(css).toContain('.hud-chip.objective')
  expect(css).toContain('.hud-chip.objective .hud-value')
  expect(css).toContain('@media (max-width: 920px)')
  expect(css).toContain('.hud-chip.objective {')
  expect(css).toContain('display: none')
})
