import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { surfaceRunBalance } from '../src/surface-balance'
import { findNearbySurfaceAlien, findNearbySurfaceLoreSite } from '../src/surface/interaction-targets'
import type { SurfaceAlienModel, SurfaceLoreSiteModel } from '../src/surface/discovery-factory'

function alien(input: Partial<SurfaceAlienModel>): SurfaceAlienModel {
  return {
    x: 0,
    y: 0,
    radius: 18,
    phase: 0,
    color: '#fff',
    name: 'Visitor',
    gift: 'herb',
    resolved: false,
    ...input
  }
}

function lore(input: Partial<SurfaceLoreSiteModel>): SurfaceLoreSiteModel {
  return {
    x: 0,
    y: 0,
    radius: 24,
    phase: 0,
    kind: 'fossils',
    title: 'Old Bones',
    copy: 'A readable fossil.',
    resolved: false,
    ...input
  }
}

test('nearby surface alien lookup returns the first unresolved alien inside interaction range', () => {
  const far = alien({ x: 999, y: 999 })
  const resolved = alien({ x: 10, y: 0, resolved: true })
  const nearby = alien({ x: 18 + surfaceRunBalance.alien.interactionRadiusBonus - 1, y: 0 })

  expect(findNearbySurfaceAlien({
    aliens: [far, resolved, nearby],
    pilot: { x: 0, y: 0 }
  })).toBe(nearby)
})

test('nearby surface lore lookup ignores resolved and out-of-range sites', () => {
  const resolved = lore({ x: 10, y: 0, resolved: true })
  const nearby = lore({ x: 0, y: 24 + surfaceRunBalance.lore.interactionRadiusBonus - 1 })
  const outside = lore({ x: 0, y: 24 + surfaceRunBalance.lore.interactionRadiusBonus + 1 })

  expect(findNearbySurfaceLoreSite({
    loreSites: [resolved, outside, nearby],
    pilot: { x: 0, y: 0 }
  })).toBe(nearby)
})

test('main delegates surface interaction target lookup to focused helpers', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const helper = readFileSync('src/surface/interaction-targets.ts', 'utf8')

  expect(helper).toContain('export function findNearbySurfaceAlien')
  expect(helper).toContain('export function findNearbySurfaceLoreSite')
  expect(main).toContain("from './surface/interaction-targets'")
  expect(main).toContain('return findNearbySurfaceAlien({')
  expect(main).toContain('return findNearbySurfaceLoreSite({')
  expect(main).not.toContain('Math.sqrt(dist2(alien')
  expect(main).not.toContain('Math.sqrt(dist2(site')
})
