import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { surfaceRunBalance } from '../src/surface-balance'
import { surfacePilotSpawnKeepout } from '../src/surface-pilot'
import { safeSurfaceThreatPoint, surfaceThreatKeepouts } from '../src/surface/threat-placement'

test('surface threat keepouts reserve space around the pilot and ship', () => {
  const keepouts = surfaceThreatKeepouts({ x: 100, y: 200 }, { x: 300, y: 400 })

  expect(keepouts).toEqual([
    { x: 100, y: 200, radius: surfacePilotSpawnKeepout() },
    { x: 300, y: 400, radius: surfaceRunBalance.threatPlacement.shipKeepoutRadius }
  ])
})

test('safe surface threat point stays inside the configured threat bounds', () => {
  const point = safeSurfaceThreatPoint(
    { x: -1000, y: -1000 },
    surfaceThreatKeepouts({ x: 100, y: 200 }, surfaceRunBalance.world.ship),
    surfaceRunBalance.threatPlacement.safeDefaultClearance,
    0
  )

  expect(point.x).toBeGreaterThanOrEqual(surfaceRunBalance.world.threatMinX)
  expect(point.x).toBeLessThanOrEqual(surfaceRunBalance.world.threatMaxX)
  expect(point.y).toBeGreaterThanOrEqual(surfaceRunBalance.world.threatMinY)
  expect(point.y).toBeLessThanOrEqual(surfaceRunBalance.world.threatMaxY)
})

test('main delegates surface threat placement to a focused surface module', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const placement = readFileSync('src/surface/threat-placement.ts', 'utf8')

  expect(placement).toContain('export function surfaceThreatKeepouts')
  expect(placement).toContain('export function safeSurfaceThreatPoint')
  expect(main).toContain("from './surface/threat-placement'")
  expect(main).toContain('type SurfaceThreatKeepout')
  expect(main).not.toContain("ReturnType<VectorShooter['surfaceThreatKeepouts']>")
  expect(main).toContain('return surfaceThreatKeepouts(pilot, ship)')
  expect(main).toContain('return safeSurfaceThreatPoint(')
})
