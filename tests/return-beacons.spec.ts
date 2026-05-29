import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  BEACON_HOLD_SECONDS,
  RETURN_BEACON_ASSIST_SECONDS,
  RETURN_BEACON_REMINDER_SECONDS,
  RETURN_BEACON_SKIP_DISTANCE,
  advanceReturnBeacon,
  beaconExtractionBonus,
  beaconSpawnDistance,
  createReturnBeacon,
  nextBeaconWindow,
  returnBeaconAutopilotVector,
  returnBeaconEligible,
  returnBeaconReadyForRoute
} from '../src/return-beacons'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
const hudSource = () => readFileSync(resolve(process.cwd(), 'src/ui/hud.ts'), 'utf8')
const returnBeaconSource = () => readFileSync(resolve(process.cwd(), 'src/return-beacons.ts'), 'utf8')
const occurrences = (sourceText: string, text: string) => sourceText.split(text).length - 1

test('blocks first beacon before four minutes or before first planet', () => {
  expect(returnBeaconEligible({ time: 239, planetsVisited: 1, activeBeacon: false, nextBeaconAt: 0 })).toBe(false)
  expect(returnBeaconEligible({ time: 360, planetsVisited: 0, activeBeacon: false, nextBeaconAt: 0 })).toBe(false)
})

test('allows first beacon after four minutes and one planet', () => {
  expect(returnBeaconEligible({ time: 240, planetsVisited: 1, activeBeacon: false, nextBeaconAt: 0 })).toBe(true)
})

test('blocks beacon while another beacon is active', () => {
  expect(returnBeaconEligible({ time: 600, planetsVisited: 3, activeBeacon: true, nextBeaconAt: 0 })).toBe(false)
})

test('uses a later next beacon window after a skipped beacon', () => {
  expect(returnBeaconEligible({ time: 500, planetsVisited: 2, activeBeacon: false, nextBeaconAt: 530 })).toBe(false)
  expect(returnBeaconEligible({ time: 530, planetsVisited: 2, activeBeacon: false, nextBeaconAt: 530 })).toBe(true)
})

test('route-aware beacon readiness lets intro nodes use their authored early station window', () => {
  expect(returnBeaconReadyForRoute({
    time: 89,
    planetsVisited: 0,
    activeBeacon: false,
    nextBeaconAt: 90,
    introNode: true
  })).toBe(false)
  expect(returnBeaconReadyForRoute({
    time: 90,
    planetsVisited: 0,
    activeBeacon: false,
    nextBeaconAt: 90,
    introNode: true
  })).toBe(true)
})

test('route-aware beacon readiness preserves normal route station gates after intro', () => {
  expect(returnBeaconReadyForRoute({
    time: 300,
    planetsVisited: 0,
    activeBeacon: false,
    nextBeaconAt: 90,
    introNode: false
  })).toBe(false)
  expect(returnBeaconReadyForRoute({
    time: 300,
    planetsVisited: 1,
    activeBeacon: true,
    nextBeaconAt: 90,
    introNode: true
  })).toBe(false)
})

test('caps skipped beacon extraction bonus', () => {
  expect(beaconExtractionBonus(0)).toBe(1)
  expect(beaconExtractionBonus(2)).toBe(1.2)
  expect(beaconExtractionBonus(9)).toBe(1.3)
})

test('schedules the next beacon three and a half minutes later', () => {
  expect(nextBeaconWindow(320)).toBe(530)
})

test('station docking prompts are tuned to be hard to miss', () => {
  expect(BEACON_HOLD_SECONDS).toBeLessThan(3)
  expect(RETURN_BEACON_REMINDER_SECONDS).toBeLessThan(RETURN_BEACON_ASSIST_SECONDS)
  expect(RETURN_BEACON_ASSIST_SECONDS).toBeLessThan(24)
  expect(RETURN_BEACON_SKIP_DISTANCE).toBeGreaterThan(3000)
})

test('spawns the first beacon close enough to read as an offer', () => {
  expect(beaconSpawnDistance(0)).toBe(640)
  expect(beaconSpawnDistance(3)).toBe(910)
})

test('creates route beacon state from player heading and skipped beacon count', () => {
  const beacon = createReturnBeacon({
    player: { x: 100, y: 200, angle: 0 },
    skippedBeacons: 2,
    randomRange: () => 0
  })

  expect(beacon).toEqual({
    x: 100 + beaconSpawnDistance(2),
    y: 200,
    radius: 132,
    hold: 0,
    phase: 0,
    age: 0,
    reminded: false,
    assistTriggered: false
  })
})

test('route station is reinforced by HUD distance reminder and docking assist', () => {
  const main = source()
  const hud = hudSource()
  const beacons = returnBeaconSource()

  expect(main).toContain('SPACE STATION AVAILABLE - TAP DOCK TO LOCK')
  expect(main).toContain('SPACE STATION WAITING - TAP DOCK TO LOCK')
  expect(main).toContain('DOCKING COURSE SET - NUDGE AWAY TO SKIP')
  expect(hud).toContain('STATION ${Math.floor(Math.sqrt(dist2(runtime.returnBeacon, runtime.player)))}')
  expect(main).toContain('advanceReturnBeacon({')
  expect(beacons).toContain('RETURN_BEACON_ASSIST_SECONDS')
  expect(beacons).toContain('RETURN_BEACON_SKIP_DISTANCE')
  expect(main).toContain('createReturnBeacon({')
})

test('route station docking course setup is shared by assist and dock lock paths', () => {
  const main = source()

  expect(main).toContain('private setReturnBeaconCourse()')
  expect(occurrences(main, 'this.setReturnBeaconCourse()')).toBe(2)
  expect(occurrences(main, 'this.autoNavTargetBeacon = true')).toBe(1)
  expect(main).toContain('DOCKING COURSE SET - NUDGE AWAY TO SKIP')
  expect(main).toContain('DOCKING COURSE LOCKED')
})

test('route station docking course clearing is centralized', () => {
  const main = source()

  expect(main).toContain('private clearReturnBeaconCourse()')
  expect(occurrences(main, 'this.clearReturnBeaconCourse()')).toBe(6)
  expect(occurrences(main, 'this.autoNavTargetBeacon = false')).toBe(1)
})

test('route station renders as a large octagonal docking structure', () => {
  const renderStation = readFileSync('src/render/navigation-aids.ts', 'utf8')

  expect(renderStation).toContain('for (let i = 0; i < 8; i += 1)')
  expect(renderStation).toContain('ctx.lineTo(Math.cos(a) * stationRadius')
  expect(renderStation).toContain('DOCKING')
})

test('beacon autopilot brakes inside the extraction ring instead of flying through', () => {
  const approach = returnBeaconAutopilotVector({ dx: 600, dy: 0, vx: 0, vy: 0, radius: 96 })
  expect(approach.x).toBeGreaterThan(0.9)
  expect(Math.abs(approach.y)).toBeLessThan(0.01)

  const brake = returnBeaconAutopilotVector({ dx: 20, dy: 0, vx: 230, vy: 0, radius: 96 })
  expect(brake.x).toBeLessThan(-0.9)
  expect(Math.abs(brake.y)).toBeLessThan(0.01)
})

test('advances return beacon timers and emits docking events in gameplay order', () => {
  const beacon = createReturnBeacon({
    player: { x: 0, y: 0, angle: 0 },
    skippedBeacons: 0,
    randomRange: () => 0
  })

  beacon.age = RETURN_BEACON_ASSIST_SECONDS + 0.1
  const assisted = advanceReturnBeacon({
    beacon,
    dt: 0.2,
    distance: beacon.radius * 2,
    autoNavTargetBeacon: false
  })

  expect(assisted.events).toEqual(['reminder', 'assist'])
  expect(beacon.reminded).toBe(true)
  expect(beacon.assistTriggered).toBe(true)
  expect(beacon.phase).toBeCloseTo(0.2)
  expect(beacon.age).toBeCloseTo(RETURN_BEACON_ASSIST_SECONDS + 0.3)

  const completing = advanceReturnBeacon({
    beacon,
    dt: BEACON_HOLD_SECONDS,
    distance: beacon.radius * 0.5,
    autoNavTargetBeacon: true
  })
  expect(completing.events).toEqual(['complete'])

  const skipped = advanceReturnBeacon({
    beacon,
    dt: 0.1,
    distance: RETURN_BEACON_SKIP_DISTANCE + 1,
    autoNavTargetBeacon: true
  })
  expect(skipped.events).toEqual(['skip'])
})
