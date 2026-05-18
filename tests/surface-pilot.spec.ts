import { expect, test } from '@playwright/test'
import {
  SURFACE_PILOT_BASE_COLLISION_RADIUS,
  SURFACE_PILOT_BASE_SPAWN_KEEPOUT,
  SURFACE_PILOT_SIZE_SCALE,
  surfacePilotCollisionRadius,
  surfacePilotSpawnKeepout,
  surfacePilotSpriteScale
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
