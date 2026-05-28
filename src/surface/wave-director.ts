import { surfaceWaveDirectorBalance } from '../surface-balance'
import type { SurfaceEventKind, SurfaceScenarioKind } from '../surface-encounters'

export interface SurfaceWaveState {
  elapsed: number
  timer: number
  waveIndex: number
}

export interface SurfaceWaveTelegraphRequest {
  spawnCount: number
  warningSeconds: number
}

export interface SurfaceWaveResult {
  spawnCount: number
  telegraph: SurfaceWaveTelegraphRequest | null
}

export interface SurfaceWaveTelegraph {
  x: number
  y: number
  spawnCount: number
  life: number
  maxLife: number
}

export interface SurfaceWaveSpawnAnchor {
  x: number
  y: number
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
  if (input.o2Returning) return noSurfaceWaveSpawn()

  const cap = activeThreatCapFor(input.event, input.scenario)
  if (input.activeThreats >= cap) return noSurfaceWaveSpawn()

  input.wave.timer -= input.dt
  if (input.wave.timer > 0) return noSurfaceWaveSpawn()

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

  return {
    spawnCount: 0,
    telegraph: {
      spawnCount,
      warningSeconds: surfaceWaveDirectorBalance.telegraph.warningSeconds
    }
  }
}

export function advanceSurfaceWaveTelegraphs(input: {
  telegraphs: SurfaceWaveTelegraph[]
  dt: number
}): SurfaceWaveSpawnAnchor[] {
  const ready: SurfaceWaveSpawnAnchor[] = []
  for (let i = input.telegraphs.length - 1; i >= 0; i -= 1) {
    const telegraph = input.telegraphs[i]
    telegraph.life -= input.dt
    if (telegraph.life > 0) continue
    ready.push({ x: telegraph.x, y: telegraph.y, spawnCount: telegraph.spawnCount })
    input.telegraphs.splice(i, 1)
  }
  ready.reverse()
  return ready
}

function noSurfaceWaveSpawn(): SurfaceWaveResult {
  return { spawnCount: 0, telegraph: null }
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
