import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  blendedNavigationMove,
  isManualNavigationActive
} from '../src/navigation-steering'

test('manual navigation activates only for intentional movement input', () => {
  expect(isManualNavigationActive({ move: { x: 0.02, y: 0.03 }, moveActive: true })).toBe(false)
  expect(isManualNavigationActive({ move: { x: 0.05, y: 0.02 }, moveActive: true })).toBe(true)
  expect(isManualNavigationActive({ move: { x: 1, y: 0 }, moveActive: false })).toBe(false)
})

test('navigation steering returns the cruise ghost when manual input is idle', () => {
  const ghost = { x: 0.4, y: 0.3 }

  expect(blendedNavigationMove({
    ghost,
    move: { x: 1, y: 0 },
    manualActive: false,
    navRank: 5
  })).toEqual(ghost)
})

test('navigation steering blends manual input with cruise and normalizes strong input', () => {
  const move = blendedNavigationMove({
    ghost: { x: 0.8, y: 0 },
    move: { x: 1, y: 1 },
    manualActive: true,
    navRank: 6
  })

  expect(Math.hypot(move.x, move.y)).toBeCloseTo(1, 5)
  expect(move.x).toBeGreaterThan(0.85)
  expect(move.y).toBeGreaterThan(0.35)
})

test('main delegates navigation steering math to focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const helper = readFileSync('src/navigation-steering.ts', 'utf8')

  expect(helper).toContain('export function isManualNavigationActive')
  expect(helper).toContain('export function blendedNavigationMove')
  expect(main).toContain("from './navigation-steering'")
  expect(main).toContain('const manualActive = isManualNavigationActive({')
  expect(main).toContain('return blendedNavigationMove({')
  expect(main).not.toContain('const influence = manualActive ? 0.58 + level * 0.035 : 0')
  expect(main).not.toContain('const steered = { x: ghost.x + move.x * influence')
})
