import { expect, test } from '@playwright/test'
import {
  SURFACE_PILOT_BASE_COLLISION_RADIUS,
  SURFACE_PILOT_BASE_SPAWN_KEEPOUT,
  SURFACE_PILOT_SIZE_SCALE,
  surfacePilotCollisionRadius,
  surfacePilotSpawnKeepout,
  surfacePilotSpriteScale,
  updateSurfacePilotMotion
} from '../src/surface-pilot'

test('surface astronaut renders about thirty five percent smaller', () => {
  expect(SURFACE_PILOT_SIZE_SCALE).toBeCloseTo(0.65)
  expect(surfacePilotSpriteScale(0.42)).toBeCloseTo(0.273)
  expect(surfacePilotSpriteScale(0.45)).toBeCloseTo(0.2925)
})

test('surface astronaut collision and spawn keepout shrink with visual scale', () => {
  expect(surfacePilotCollisionRadius()).toBe(Math.round(SURFACE_PILOT_BASE_COLLISION_RADIUS * SURFACE_PILOT_SIZE_SCALE))
  expect(surfacePilotSpawnKeepout()).toBe(Math.round(SURFACE_PILOT_BASE_SPAWN_KEEPOUT * SURFACE_PILOT_SIZE_SCALE))
})

test('surface pilot motion applies thrust drag facing and world bounds', () => {
  const pilot = updateSurfacePilotMotion({
    pilot: { x: 60, y: 60, vx: 0, vy: 0, facing: 0 },
    ship: { x: 300, y: 240 },
    move: { x: 1, y: 0 },
    o2Returning: false,
    engineRank: 0,
    dt: 0.5,
    world: { width: 120, height: 120 }
  })

  expect(pilot.x).toBeCloseTo(77.8)
  expect(pilot.y).toBeCloseTo(60)
  expect(pilot.vx).toBeGreaterThan(0)
  expect(pilot.vy).toBeCloseTo(0)
  expect(pilot.facing).toBeCloseTo(0)
})

test('surface pilot motion pulls toward ship while oxygen return is active', () => {
  const pilot = updateSurfacePilotMotion({
    pilot: { x: 100, y: 100, vx: 0, vy: 0, facing: 0 },
    ship: { x: 100, y: 300 },
    move: { x: 0, y: 0 },
    o2Returning: true,
    engineRank: 0,
    dt: 0.25,
    world: { width: 600, height: 600 }
  })

  expect(pilot.y).toBeGreaterThan(100)
  expect(pilot.facing).toBeCloseTo(Math.PI / 2)
})
