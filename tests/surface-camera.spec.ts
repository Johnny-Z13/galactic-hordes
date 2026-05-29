import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { surfaceRunBalance } from '../src/surface-balance'
import { initialSurfaceCamera } from '../src/surface/camera'

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

test('main delegates initial surface camera placement to a focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const camera = readFileSync('src/surface/camera.ts', 'utf8')

  expect(camera).toContain('export function initialSurfaceCamera')
  expect(main).toContain("from './surface/camera'")
  expect(main).toContain('return createInitialSurfaceCamera({')
  expect(main).not.toContain('clamp(pilot.x - this.width / 2')
})
