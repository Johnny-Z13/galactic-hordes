import { surfaceWaveDirectorBalance } from '../surface-balance'
import type { SurfaceEventKind, SurfaceScenarioKind } from '../surface-encounters'

export interface SurfaceWaveState {
  elapsed: number
  timer: number
  waveIndex: number
}

export interface SurfaceWaveResult {
  spawnCount: number
}

export function createSurfaceWaveState(input: {
  event: SurfaceEventKind
  scenario: SurfaceScenarioKind
}): SurfaceWaveState {
  return {
    elapsed: 0,
    timer: initialDelayFor(input.event, input.scenario),
    waveIndex: 0
  }
}

export function updateSurfaceWaveDirector(input: {
  wave: SurfaceWaveState
  event: SurfaceEventKind
  scenario: SurfaceScenarioKind
  dt: number
  activeThreats: number
  o2Returning: boolean
  collected: number
  totalResources: number
}): SurfaceWaveResult {
  input.wave.elapsed += input.dt
  if (input.o2Returning) return { spawnCount: 0 }

  const cap = activeThreatCapFor(input.event, input.scenario)
  if (input.activeThreats >= cap) return { spawnCount: 0 }

  input.wave.timer -= input.dt
  if (input.wave.timer > 0) return { spawnCount: 0 }

  const budget = cap - input.activeThreats
  const spawnCount = Math.min(budget, packSizeFor({
    event: input.event,
    scenario: input.scenario,
    elapsed: input.wave.elapsed,
    collected: input.collected,
    totalResources: input.totalResources
  }))
  input.wave.waveIndex += 1
  input.wave.timer += intervalFor(input.event, input.scenario)
  if (input.wave.timer <= 0) input.wave.timer = intervalFor(input.event, input.scenario)

  return { spawnCount }
}

function initialDelayFor(event: SurfaceEventKind, scenario: SurfaceScenarioKind): number {
  if (scenario === 'friendly') return surfaceWaveDirectorBalance.initialDelay.friendly
  if (scenario === 'lore') return surfaceWaveDirectorBalance.initialDelay.lore
  if (event === 'horde' || scenario === 'horde') return surfaceWaveDirectorBalance.initialDelay.horde
  if (event === 'swarm') return surfaceWaveDirectorBalance.initialDelay.swarm
  return surfaceWaveDirectorBalance.initialDelay.default
}

function intervalFor(event: SurfaceEventKind, scenario: SurfaceScenarioKind): number {
  if (scenario === 'friendly') return surfaceWaveDirectorBalance.interval.friendly
  if (scenario === 'lore') return surfaceWaveDirectorBalance.interval.lore
  if (event === 'horde' || scenario === 'horde') return surfaceWaveDirectorBalance.interval.horde
  if (event === 'swarm') return surfaceWaveDirectorBalance.interval.swarm
  return surfaceWaveDirectorBalance.interval.default
}

function activeThreatCapFor(event: SurfaceEventKind, scenario: SurfaceScenarioKind): number {
  if (scenario === 'friendly') return surfaceWaveDirectorBalance.activeThreatCap.friendly
  if (scenario === 'lore') return surfaceWaveDirectorBalance.activeThreatCap.lore
  if (event === 'horde' || scenario === 'horde') return surfaceWaveDirectorBalance.activeThreatCap.horde
  if (event === 'swarm') return surfaceWaveDirectorBalance.activeThreatCap.swarm
  return surfaceWaveDirectorBalance.activeThreatCap.default
}

function packSizeFor(input: {
  event: SurfaceEventKind
  scenario: SurfaceScenarioKind
  elapsed: number
  collected: number
  totalResources: number
}): number {
  const base = input.event === 'horde' || input.scenario === 'horde'
    ? surfaceWaveDirectorBalance.pack.hordeBase
    : input.event === 'swarm'
      ? surfaceWaveDirectorBalance.pack.swarmBase
      : surfaceWaveDirectorBalance.pack.defaultBase
  const timeRamp = Math.floor(input.elapsed / surfaceWaveDirectorBalance.pack.rampEverySeconds)
  const collectionRamp = input.totalResources > 0
    ? Math.floor(input.collected / surfaceWaveDirectorBalance.pack.collectedPressureEvery)
    : 0
  return Math.min(surfaceWaveDirectorBalance.pack.max, base + timeRamp + collectionRamp)
}
