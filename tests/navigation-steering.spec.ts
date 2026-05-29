import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  blendedNavigationMove,
  driftNavigationHeading,
  isManualNavigationActive,
  resolvedNavigationHeading
} from '../src/navigation-steering'

const occurrences = (sourceText: string, text: string) => sourceText.split(text).length - 1

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

test('navigation heading activates directly then steers existing heading gradually', () => {
  expect(resolvedNavigationHeading({
    active: false,
    heading: Math.PI,
    target: Math.PI / 2,
    blend: 0.2
  })).toEqual({ active: true, heading: Math.PI / 2 })

  const steered = resolvedNavigationHeading({
    active: true,
    heading: 0,
    target: Math.PI,
    blend: 0.25
  })

  expect(steered.active).toBe(true)
  expect(steered.heading).toBeCloseTo(Math.PI * 0.25)
})

test('navigation drift heading prefers ship velocity once drift is established', () => {
  expect(driftNavigationHeading({ vx: 12, vy: 0, angle: Math.PI / 3 })).toBeCloseTo(Math.PI / 3)
  expect(driftNavigationHeading({ vx: 0, vy: 48, angle: 0 })).toBeCloseTo(Math.PI / 2)
})

test('main delegates navigation steering math to focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const helper = readFileSync('src/navigation-steering.ts', 'utf8')

  expect(helper).toContain('export function isManualNavigationActive')
  expect(helper).toContain('export function blendedNavigationMove')
  expect(helper).toContain('export function resolvedNavigationHeading')
  expect(helper).toContain('export function driftNavigationHeading')
  expect(main).toContain("from './navigation-steering'")
  expect(main).toContain('const manualActive = isManualNavigationActive({')
  expect(main).toContain('this.steerAutoNavigationHeading(')
  expect(main).toContain('this.activateAutoNavigationHeading(')
  expect(main).toContain('return blendedNavigationMove({')
  expect(main).not.toContain('this.autoNavHeading = this.autoNavActive ? angleLerp(')
  expect(occurrences(main, 'this.autoNavActive = true')).toBe(0)
  expect(main).not.toContain('const influence = manualActive ? 0.58 + level * 0.035 : 0')
  expect(main).not.toContain('const steered = { x: ghost.x + move.x * influence')
})
