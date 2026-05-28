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
    surfaceEvent: null,
    pendingUpgrades: 0
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
    surfaceEvent: null,
    pendingUpgrades: 0
  })).toEqual({
    label: 'DOCK',
    text: 'Station signal 734m'
  })
})

test('run objective readout surfaces banked mutation signals during flight', () => {
  expect(runObjectiveReadout({
    state: 'playing',
    routeObjective: 'Recover, scout, and reach the next route branch.',
    elapsed: 44,
    nextReturnBeaconAt: 90,
    returnBeaconDistance: null,
    surfaceEvent: null,
    pendingUpgrades: 2
  })).toEqual({
    label: 'SIGNAL',
    text: '2 mutation signals ready // dock or land to install'
  })
})

test('run objective readout surfaces imminent sector waves as the next threat beat', () => {
  expect(runObjectiveReadout({
    state: 'playing',
    routeObjective: 'Recover, scout, and reach the next route branch.',
    elapsed: 58,
    nextReturnBeaconAt: 120,
    returnBeaconDistance: null,
    surfaceEvent: null,
    pendingUpgrades: 0,
    waveWarning: {
      id: 'node-a:Knife wing:65',
      label: 'Knife wing',
      secondsUntil: 6.2,
      enemyTotal: 4,
      progress: 0.48
    }
  })).toEqual({
    label: 'WAVE',
    text: 'Knife wing in 7s // 4 contacts'
  })
})

test('run objective readout turns near station timing into a decision beat', () => {
  expect(runObjectiveReadout({
    state: 'playing',
    routeObjective: 'Recover, scout, and reach the next route branch.',
    elapsed: 96,
    nextReturnBeaconAt: 120,
    returnBeaconDistance: null,
    surfaceEvent: null,
    pendingUpgrades: 0
  })).toEqual({
    label: 'STATION',
    text: 'Station signal in 24s // hold route or prepare to dock'
  })
})

test('run objective readout keeps dock guidance while noting ready mutation signals', () => {
  expect(runObjectiveReadout({
    state: 'playing',
    routeObjective: 'Clear a hunter patrol lane and cash in combat rewards.',
    elapsed: 125,
    nextReturnBeaconAt: 90,
    returnBeaconDistance: 734,
    surfaceEvent: null,
    pendingUpgrades: 1
  })).toEqual({
    label: 'DOCK',
    text: 'Station signal 734m // 1 signal ready'
  })
})

test('run objective readout switches to surface objective while on foot', () => {
  expect(runObjectiveReadout({
    state: 'surface',
    routeObjective: 'Scout planet-rich space and land for discoveries.',
    elapsed: 160,
    nextReturnBeaconAt: 220,
    returnBeaconDistance: null,
    surfaceEvent: 'cache',
    pendingUpgrades: 3
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
  expect(hud).toContain("import { nextSpaceWaveWarning } from '../space-wave-director'")
  expect(hud).toContain("const objective = chip('ROUTE', self['ui'].objective, 'objective wide')")
  expect(hud).toContain('const objectiveReadout = runObjectiveReadout({')
  expect(hud).toContain('waveWarning: self[\'state\'] === \'playing\' ? nextSpaceWaveWarning({')
  expect(hud).toContain("pendingUpgrades: self['pendingUpgrades']")
  expect(hud).toContain("self['ui'].objective.parentElement?.querySelector('.hud-label')")
  expect(hud).toContain("classList.toggle('signal-ready', objectiveReadout.label === 'SIGNAL')")
  expect(hud).toContain("classList.toggle('threat-inbound', objectiveReadout.label === 'WAVE')")
  expect(hud).toContain("classList.toggle('station-soon', objectiveReadout.label === 'STATION')")
  expect(css).toContain('.hud-chip.objective')
  expect(css).toContain('.hud-chip.objective.signal-ready')
  expect(css).toContain('.hud-chip.objective.threat-inbound')
  expect(css).toContain('.hud-chip.objective.station-soon')
  expect(css).toContain('.hud-chip.objective .hud-value')
  expect(css).toContain('@media (max-width: 920px)')
  expect(css).toContain('.hud-chip.objective {')
  expect(css).toContain('display: none')
})
