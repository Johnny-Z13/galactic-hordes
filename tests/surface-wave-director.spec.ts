import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { surfaceRunBalance, surfaceWaveDirectorBalance } from '../src/surface-balance'
import {
  advanceSurfaceWaveTelegraphs,
  createSurfaceWaveState,
  surfaceWavePressureReadout,
  surfaceWaveSpawnPoints,
  surfaceWaveTelegraphPoint,
  updateSurfaceWaveDirector
} from '../src/surface/wave-director'

test('friendly surface waves wait through the opening grace window', () => {
  const wave = createSurfaceWaveState({ event: 'relic', scenario: 'friendly' })

  const result = updateSurfaceWaveDirector({
    wave,
    event: 'relic',
    scenario: 'friendly',
    dt: surfaceWaveDirectorBalance.initialDelay.friendly - 1,
    activeThreats: 0,
    o2Returning: false,
    collected: 0,
    totalResources: 10
  })

  expect(result.spawnCount).toBe(0)
})

test('horde waves spawn faster and larger than standard waves', () => {
  const horde = createSurfaceWaveState({ event: 'horde', scenario: 'horde' })
  const standard = createSurfaceWaveState({ event: 'standard', scenario: 'salvage' })

  const hordeResult = updateSurfaceWaveDirector({
    wave: horde,
    event: 'horde',
    scenario: 'horde',
    dt: surfaceWaveDirectorBalance.initialDelay.horde,
    activeThreats: 0,
    o2Returning: false,
    collected: 10,
    totalResources: 30
  })
  const standardResult = updateSurfaceWaveDirector({
    wave: standard,
    event: 'standard',
    scenario: 'salvage',
    dt: surfaceWaveDirectorBalance.initialDelay.default,
    activeThreats: 0,
    o2Returning: false,
    collected: 0,
    totalResources: 10
  })

  expect(hordeResult.telegraph?.spawnCount).toBeGreaterThan(standardResult.telegraph?.spawnCount ?? 0)
})

test('surface wave director emits a telegraph before spawning', () => {
  const wave = createSurfaceWaveState({ event: 'standard', scenario: 'salvage' })

  const result = updateSurfaceWaveDirector({
    wave,
    event: 'standard',
    scenario: 'salvage',
    dt: surfaceWaveDirectorBalance.initialDelay.default,
    activeThreats: 0,
    o2Returning: false,
    collected: 0,
    totalResources: 10
  })

  expect(result.spawnCount).toBe(0)
  expect(result.telegraph).toEqual({
    spawnCount: 1,
    warningSeconds: surfaceWaveDirectorBalance.telegraph.warningSeconds
  })
})

test('surface wave director respects active threat cap and oxygen return pause', () => {
  const capped = createSurfaceWaveState({ event: 'swarm', scenario: 'boss' })
  const returning = createSurfaceWaveState({ event: 'swarm', scenario: 'boss' })

  expect(updateSurfaceWaveDirector({
    wave: capped,
    event: 'swarm',
    scenario: 'boss',
    dt: surfaceWaveDirectorBalance.initialDelay.swarm,
    activeThreats: surfaceWaveDirectorBalance.activeThreatCap.swarm,
    o2Returning: false,
    collected: 0,
    totalResources: 12
  }).spawnCount).toBe(0)

  expect(updateSurfaceWaveDirector({
    wave: returning,
    event: 'swarm',
    scenario: 'boss',
    dt: surfaceWaveDirectorBalance.initialDelay.swarm,
    activeThreats: 0,
    o2Returning: true,
    collected: 0,
    totalResources: 12
  }).spawnCount).toBe(0)
})

test('surface wave telegraphs expire into spawn anchors', () => {
  const telegraphs = [
    { x: 100, y: 200, spawnCount: 2, life: 0.2, maxLife: 1 },
    { x: 400, y: 500, spawnCount: 1, life: 1.2, maxLife: 1.2 }
  ]

  const ready = advanceSurfaceWaveTelegraphs({ telegraphs, dt: 0.25 })

  expect(ready).toEqual([{ x: 100, y: 200, spawnCount: 2 }])
  expect(telegraphs).toEqual([{ x: 400, y: 500, spawnCount: 1, life: 0.95, maxLife: 1.2 }])
})

test('surface wave pressure readout rises as the next wave approaches', () => {
  const wave = createSurfaceWaveState({ event: 'standard', scenario: 'salvage' })
  wave.timer = surfaceWaveDirectorBalance.interval.default * 0.25

  const readout = surfaceWavePressureReadout({
    wave,
    event: 'standard',
    scenario: 'salvage',
    activeThreats: 2,
    queuedThreats: 0,
    o2Returning: false
  })

  expect(readout.label).toBe('RISING')
  expect(readout.progress).toBeCloseTo(0.75)
  expect(readout.threatCap).toBe(surfaceWaveDirectorBalance.activeThreatCap.default)
})

test('surface wave pressure readout distinguishes queued and capped states', () => {
  const queued = createSurfaceWaveState({ event: 'swarm', scenario: 'boss' })
  const capped = createSurfaceWaveState({ event: 'swarm', scenario: 'boss' })

  expect(surfaceWavePressureReadout({
    wave: queued,
    event: 'swarm',
    scenario: 'boss',
    activeThreats: 3,
    queuedThreats: 2,
    o2Returning: false
  }).label).toBe('INCOMING')

  expect(surfaceWavePressureReadout({
    wave: capped,
    event: 'swarm',
    scenario: 'boss',
    activeThreats: surfaceWaveDirectorBalance.activeThreatCap.swarm,
    queuedThreats: 0,
    o2Returning: false
  }).label).toBe('SATURATED')
})

test('surface wave director ramps pack size as surface time and collection pressure rise', () => {
  const early = createSurfaceWaveState({ event: 'volatile', scenario: 'mixed' })
  const late = createSurfaceWaveState({ event: 'volatile', scenario: 'mixed' })
  late.elapsed = surfaceWaveDirectorBalance.pack.rampEverySeconds * 2

  const earlyResult = updateSurfaceWaveDirector({
    wave: early,
    event: 'volatile',
    scenario: 'mixed',
    dt: surfaceWaveDirectorBalance.initialDelay.default,
    activeThreats: 0,
    o2Returning: false,
    collected: 0,
    totalResources: 18
  })
  const lateResult = updateSurfaceWaveDirector({
    wave: late,
    event: 'volatile',
    scenario: 'mixed',
    dt: surfaceWaveDirectorBalance.initialDelay.default,
    activeThreats: 0,
    o2Returning: false,
    collected: 12,
    totalResources: 18
  })

  expect(lateResult.telegraph?.spawnCount).toBeGreaterThan(earlyResult.telegraph?.spawnCount ?? 0)
})

test('surface wave telegraph point places pressure around the pilot by event intensity', () => {
  const calls: Array<{ point: { x: number; y: number }; clearance?: number; fallbackAngle?: number }> = []
  const point = surfaceWaveTelegraphPoint({
    event: 'horde',
    waveIndex: 2,
    time: 30,
    pilot: { x: 1000, y: 900 },
    safeThreatPoint: (candidate, clearance, fallbackAngle) => {
      calls.push({ point: candidate, clearance, fallbackAngle })
      return candidate
    }
  })
  const angle = 2 * 1.618 + 30 * 0.13

  expect(point.x).toBeCloseTo(1000 + Math.cos(angle) * 460)
  expect(point.y).toBeCloseTo(900 + Math.sin(angle) * 460)
  expect(calls[0].clearance).toBe(surfaceRunBalance.threatPlacement.swarmClearance)
  expect(calls[0].fallbackAngle).toBeCloseTo(angle)
})

test('surface wave telegraph point keeps standard and swarm waves closer than horde waves', () => {
  const safeThreatPoint = (point: { x: number; y: number }) => point
  const standard = surfaceWaveTelegraphPoint({
    event: 'standard',
    waveIndex: 0,
    time: 0,
    pilot: { x: 100, y: 100 },
    safeThreatPoint
  })
  const swarm = surfaceWaveTelegraphPoint({
    event: 'swarm',
    waveIndex: 0,
    time: 0,
    pilot: { x: 100, y: 100 },
    safeThreatPoint
  })

  expect(standard.x).toBe(460)
  expect(swarm.x).toBe(520)
})

test('surface wave spawn points scatter around multi-threat anchors', () => {
  const calls: Array<{ point: { x: number; y: number }; clearance?: number; fallbackAngle?: number }> = []
  const points = surfaceWaveSpawnPoints({
    anchor: { x: 800, y: 600, spawnCount: 2 },
    elapsed: 0,
    safeThreatPoint: (candidate, clearance, fallbackAngle) => {
      calls.push({ point: candidate, clearance, fallbackAngle })
      return candidate
    }
  })

  expect(points[0]).toEqual({ x: 854, y: 600 })
  expect(points[1].x).toBeCloseTo(746)
  expect(points[1].y).toBeCloseTo(600)
  expect(calls.every((call) => call.clearance === surfaceRunBalance.threatPlacement.swarmClearance)).toBe(true)
  expect(calls[0].fallbackAngle).toBeCloseTo(0)
  expect(calls[1].fallbackAngle).toBeCloseTo(Math.PI)
})

test('single surface wave spawn point stays on its anchor before keepout adjustment', () => {
  const points = surfaceWaveSpawnPoints({
    anchor: { x: 420, y: 360, spawnCount: 1 },
    elapsed: 99,
    safeThreatPoint: (candidate) => candidate
  })

  expect(points).toEqual([{ x: 420, y: 360 }])
})

test('main delegates surface wave timing to the surface module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const director = readFileSync('src/surface/wave-director.ts', 'utf8')
  const hudRenderer = readFileSync('src/surface/render-hud.ts', 'utf8')
  const renderer = readFileSync('src/surface/render-projectiles.ts', 'utf8')

  expect(main).toContain("from './surface/wave-director'")
  expect(main).toContain('createSurfaceWaveState({')
  expect(main).toContain('updateSurfaceWaveDirector({')
  expect(main).toContain('advanceSurfaceWaveTelegraphs({')
  expect(main).toContain('surfaceWaveTelegraphPoint({')
  expect(main).toContain('surfaceWaveSpawnPoints({')
  expect(main).toContain('drawSurfaceWaveTelegraphs({')
  expect(main).toContain('private updateSurfaceWaves(')
  expect(main).not.toContain('private renderSurfaceWaveTelegraphs(')
  expect(main).not.toContain('private renderSurfacePressureHud(')
  expect(director).toContain('surfaceWaveDirectorBalance')
  expect(director).toContain('export function surfaceWaveTelegraphPoint')
  expect(director).toContain('export function surfaceWaveSpawnPoints')
  expect(hudRenderer).toContain('surfaceWavePressureReadout({')
  expect(renderer).toContain('surfaceWaveDirectorBalance.telegraph.radius')
})
