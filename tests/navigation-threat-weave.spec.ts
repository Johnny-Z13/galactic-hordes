import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { navigationThreatWeaveVector } from '../src/navigation-threat-weave'

test('navigation threat weave returns null when no enemy creates meaningful pressure', () => {
  expect(navigationThreatWeaveVector({
    player: { x: 0, y: 0 },
    enemies: [{ x: 1000, y: 0, kind: 'chaser' }],
    navRank: 4
  })).toBeNull()
})

test('navigation threat weave points away from nearby enemies', () => {
  const vector = navigationThreatWeaveVector({
    player: { x: 100, y: 100 },
    enemies: [{ x: 40, y: 100, kind: 'chaser' }],
    navRank: 4
  })

  expect(vector).not.toBeNull()
  expect(vector!.x).toBeGreaterThan(0)
  expect(Math.abs(vector!.y)).toBeLessThan(0.01)
})

test('navigation threat weave weights heavy threats more strongly', () => {
  const vector = navigationThreatWeaveVector({
    player: { x: 0, y: 0 },
    enemies: [
      { x: -80, y: 0, kind: 'chaser' },
      { x: 80, y: 0, kind: 'brute' }
    ],
    navRank: 5
  })

  expect(vector).not.toBeNull()
  expect(vector!.x).toBeLessThan(0)
})

test('main delegates navigation threat weave math to focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const helper = readFileSync('src/navigation-threat-weave.ts', 'utf8')

  expect(helper).toContain('export function navigationThreatWeaveVector')
  expect(main).toContain("from './navigation-threat-weave'")
  expect(main).toContain('const avoidance = navigationThreatWeaveVector({')
  expect(main).not.toContain('const radius = 230 + level * 38')
  expect(main).not.toContain("enemy.kind === 'brute' || enemy.kind === 'warden'")
})
