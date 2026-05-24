import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  alienBloomFormation,
  asteroidFieldAsteroids,
  chooseSpaceEncounter,
  derelictCacheSignal,
  hunterWingFormation,
  meteorFrontAsteroids,
  nextSpaceEncounterTime,
  spaceEncounterWeights
} from '../src/space-encounters'

const source = () => readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')

test('space encounter timer leaves breathing room between surprises', () => {
  expect(nextSpaceEncounterTime(120, () => 0)).toBe(175)
  expect(nextSpaceEncounterTime(120, () => 1)).toBe(205)
})

test('nearby planet archetypes bias the encounter family without making it deterministic', () => {
  const hostile = spaceEncounterWeights({ nearbyPlanetArchetype: 'hostile', time: 180, planetsVisited: 1 })
  const cache = spaceEncounterWeights({ nearbyPlanetArchetype: 'cache', time: 180, planetsVisited: 1 })
  const strange = spaceEncounterWeights({ nearbyPlanetArchetype: 'strange', time: 180, planetsVisited: 1 })

  expect(hostile.hunterWing).toBeGreaterThan(hostile.derelictCache)
  expect(cache.derelictCache).toBeGreaterThan(cache.hunterWing)
  expect(strange.alienBloom).toBeGreaterThan(strange.derelictCache)
  expect(strange.asteroidField).toBeGreaterThan(cache.asteroidField)
  expect(chooseSpaceEncounter({ nearbyPlanetArchetype: 'hostile', time: 180, planetsVisited: 1 }, () => 0.99)).toBe('meteorFront')
})

test('meteor fronts form a drifting cross-route hazard line ahead of the player', () => {
  const asteroids = meteorFrontAsteroids({
    player: { x: 100, y: 200, vx: 240, vy: 0, angle: 0 },
    random: () => 0.5
  })

  expect(asteroids).toHaveLength(7)
  expect(asteroids[0].y).toBeLessThan(asteroids[6].y)
  expect(asteroids.every((asteroid) => asteroid.vy > 0)).toBe(true)
  expect(asteroids.every((asteroid) => asteroid.radius >= 54 && asteroid.radius <= 94)).toBe(true)
})

test('asteroid fields dot a temporary playable field around the route', () => {
  const asteroids = asteroidFieldAsteroids({
    player: { x: 100, y: 200, vx: 240, vy: 0, angle: 0 },
    density: 1.2,
    drift: 'crosswind',
    random: () => 0.5
  })

  expect(asteroids.length).toBeGreaterThanOrEqual(12)
  expect(asteroids.every((asteroid) => asteroid.radius >= 28 && asteroid.radius <= 86)).toBe(true)
  expect(asteroids.every((asteroid) => Math.hypot(asteroid.x - 100, asteroid.y - 200) > asteroid.radius + 170)).toBe(true)
  expect(Math.min(...asteroids.map((asteroid) => asteroid.y))).toBeLessThan(200)
  expect(Math.max(...asteroids.map((asteroid) => asteroid.y))).toBeGreaterThan(200)
})

test('hunter wing formation spawns ahead and fans across the travel vector', () => {
  const wing = hunterWingFormation({
    player: { x: 0, y: 0, vx: 0, vy: -260, angle: -Math.PI / 2 },
    random: () => 0.5
  })

  expect(wing.map((point) => point.kind)).toEqual(['razor', 'shard', 'lancer', 'razor', 'skimmer'])
  expect(wing.every((point) => point.y < -650)).toBe(true)
  expect(wing[0].x).toBeLessThan(wing[2].x)
  expect(wing[4].x).toBeGreaterThan(wing[2].x)
})

test('alien blooms unfold strange entities in an offset ring ahead of travel', () => {
  const bloom = alienBloomFormation({
    player: { x: 20, y: 40, vx: 280, vy: 0, angle: 0 },
    random: () => 0.5
  })

  expect(bloom).toHaveLength(6)
  expect(bloom.map((point) => point.kind)).toEqual(['helix', 'shard', 'prism', 'shard', 'helix', 'prism'])
  expect(bloom.every((point) => point.x > 610)).toBe(true)
  expect(Math.min(...bloom.map((point) => point.y))).toBeLessThan(0)
  expect(Math.max(...bloom.map((point) => point.y))).toBeGreaterThan(80)
})

test('derelict cache creates an off-route reward with guardians', () => {
  const signal = derelictCacheSignal({
    player: { x: 0, y: 0, vx: 300, vy: 0, angle: 0 },
    random: () => 0.5
  })

  expect(signal.x).toBeGreaterThan(800)
  expect(Math.abs(signal.y)).toBeGreaterThan(260)
  expect(signal.guardians).toEqual(['mine', 'shooter', 'brute'])
  expect(signal.pickupKind).toBe('chest')
})

test('main space loop wires encounter events into update render and reset', () => {
  const main = source()

  expect(main).toContain('private updateSpaceEncounters(dt: number)')
  expect(main).toContain('this.updateSpaceEncounters(dt)')
  expect(main).toContain('this.triggerSpaceEncounter(kind)')
  expect(main).toContain('alienBloomFormation')
  expect(main).toContain('asteroidFieldAsteroids')
  expect(main).toContain('this.asteroidFieldTimer = 24')
  expect(main).toContain('this.seedAsteroidField')
  expect(main).toContain('private damageSpaceHazard')
  expect(main).toContain('this.renderSpaceHazards(ctx)')
  expect(main).toContain('this.renderDerelictSignals(ctx)')
  expect(main).toContain('this.spaceHazards = []')
  expect(main).toContain('this.derelictSignals = []')
})

test('derelict cache chest persists long enough to collect after following the signal', () => {
  const main = source()

  expect(main).toContain('kind: signal.pickupKind')
  expect(main).toContain('life: pickupBalance.persistentLifeSeconds')
})
