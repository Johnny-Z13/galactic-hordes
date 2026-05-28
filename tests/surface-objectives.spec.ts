import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  collectTouchedSurfaceResources,
  createSurfaceBossCacheDrops,
  createSurfaceCacheAmbushThreats,
  shouldPromptSurfaceReturn
} from '../src/surface/objectives'

test('collectTouchedSurfaceResources marks only touched resources and returns them', () => {
  const resources = [
    { kind: 'cache' as const, x: 100, y: 100, radius: 18, value: 1, color: '#fff27a', collected: false },
    { kind: 'scrap' as const, x: 400, y: 100, radius: 14, value: 1, color: '#70a8ff', collected: false }
  ]

  const collected = collectTouchedSurfaceResources({ resources, pilot: { x: 110, y: 100 } })

  expect(collected).toEqual([resources[0]])
  expect(resources[0].collected).toBe(true)
  expect(resources[1].collected).toBe(false)
})

test('boss cache drops preserve the first cache reward and horde message', () => {
  const result = createSurfaceBossCacheDrops({
    count: 3,
    scenario: 'horde',
    level: 4,
    threat: { x: 500, y: 500, color: '#ff61d8' },
    random: () => 0,
    safePoint: (point) => point
  })

  expect(result.resources[0].kind).toBe('cache')
  expect(result.resources[1].kind).toBe('cache')
  expect(result.message).toContain('HORDE VAULT')
})

test('cache ambush helper creates chaser threats around the resource', () => {
  const threats = createSurfaceCacheAmbushThreats({
    resource: { x: 300, y: 300 },
    time: 60,
    count: 2,
    random: () => 0.5,
    safeThreatPoint: (point) => point
  })

  expect(threats).toHaveLength(2)
  expect(threats[0]).toMatchObject({ color: '#ff5d73', hit: 0, behavior: 'chaser' })
})

test('surface return prompt only appears after objective completion away from ship', () => {
  expect(shouldPromptSurfaceReturn({ collected: 2, total: 2, nearShip: false })).toBe(true)
  expect(shouldPromptSurfaceReturn({ collected: 1, total: 2, nearShip: false })).toBe(false)
  expect(shouldPromptSurfaceReturn({ collected: 2, total: 2, nearShip: true })).toBe(false)
})

test('main delegates surface objective bookkeeping', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain("from './surface/objectives'")
  expect(main).toContain('collectTouchedSurfaceResources({')
  expect(main).toContain('createSurfaceBossCacheDrops({')
  expect(main).toContain('createSurfaceCacheAmbushThreats({')
  expect(main).toContain('shouldPromptSurfaceReturn({')
})
