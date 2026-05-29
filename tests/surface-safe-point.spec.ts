import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { surfaceRunBalance } from '../src/surface-balance'
import { safeSurfaceResourcePoint } from '../src/surface/safe-point'

test('safe surface resource point stays inside configured resource bounds', () => {
  const point = safeSurfaceResourcePoint(
    { x: -1000, y: 99999 },
    () => 0,
    210
  )

  expect(point.x).toBeGreaterThanOrEqual(surfaceRunBalance.world.resourceSafeMinX)
  expect(point.x).toBeLessThanOrEqual(surfaceRunBalance.world.resourceSafeMaxX)
  expect(point.y).toBeGreaterThanOrEqual(surfaceRunBalance.world.resourceSafeMinY)
  expect(point.y).toBeLessThanOrEqual(surfaceRunBalance.world.resourceSafeMaxY)
})

test('safe surface resource point pushes away from ship and pilot anchors', () => {
  const world = surfaceRunBalance.world
  const point = safeSurfaceResourcePoint(
    { ...world.ship },
    (min, max) => (min + max) / 2,
    210
  )

  for (const anchor of [world.ship, world.pilotStart]) {
    expect(Math.hypot(point.x - anchor.x, point.y - anchor.y)).toBeGreaterThanOrEqual(210)
  }
})

test('main delegates surface resource safe placement to a focused surface module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const safePoint = readFileSync('src/surface/safe-point.ts', 'utf8')

  expect(safePoint).toContain('export function safeSurfaceResourcePoint')
  expect(main).toContain("from './surface/safe-point'")
  expect(main).toContain('return safeSurfaceResourcePoint(point, rand, minDistance)')
})
