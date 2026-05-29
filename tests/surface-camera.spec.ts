import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { surfaceRunBalance } from '../src/surface-balance'
import { followSurfaceCamera, initialSurfaceCamera } from '../src/surface/camera'

test('initial surface camera centers the pilot when there is room', () => {
  const camera = initialSurfaceCamera({
    pilot: { x: 800, y: 600 },
    world: surfaceRunBalance.world,
    viewWidth: 900,
    viewHeight: 700
  })

  expect(camera).toEqual({ x: 350, y: 250 })
})

test('initial surface camera clamps to world edges near boundaries', () => {
  const world = surfaceRunBalance.world
  const topLeft = initialSurfaceCamera({
    pilot: { x: 20, y: 20 },
    world,
    viewWidth: 900,
    viewHeight: 700
  })
  const bottomRight = initialSurfaceCamera({
    pilot: { x: world.width + 200, y: world.height + 200 },
    world,
    viewWidth: 900,
    viewHeight: 700
  })

  expect(topLeft).toEqual({ x: 0, y: 0 })
  expect(bottomRight).toEqual({ x: world.width - 900, y: world.height - 700 })
})

test('surface follow camera eases toward the pilot and clamps to the world', () => {
  const camera = followSurfaceCamera({
    camera: { x: 0, y: 0 },
    pilot: { x: 800, y: 650 },
    world: { width: 1000, height: 800 },
    viewWidth: 400,
    viewHeight: 300,
    dt: 0.1
  })

  expect(camera.x).toBeCloseTo(420)
  expect(camera.y).toBeCloseTo(350)

  const clamped = followSurfaceCamera({
    camera: { x: 560, y: 470 },
    pilot: { x: 1400, y: 1200 },
    world: { width: 1000, height: 800 },
    viewWidth: 400,
    viewHeight: 300,
    dt: 0.5
  })

  expect(clamped).toEqual({ x: 600, y: 500 })
})

test('main delegates initial surface camera placement to a focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const camera = readFileSync('src/surface/camera.ts', 'utf8')

  expect(camera).toContain('export function initialSurfaceCamera')
  expect(camera).toContain('export function followSurfaceCamera')
  expect(main).toContain("from './surface/camera'")
  expect(main).toContain('return createInitialSurfaceCamera({')
  expect(main).toContain('followSurfaceCamera({')
  expect(main).not.toContain('clamp(pilot.x - this.width / 2')
  expect(main).not.toContain('this.surface.camera.x += (this.surface.pilot.x')
})
