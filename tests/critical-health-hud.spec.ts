import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { vitalCriticalClass } from '../src/ui/vital-meter'

test('vital critical class applies at low health only', () => {
  expect(vitalCriticalClass(0.31)).toBe('')
  expect(vitalCriticalClass(0.3)).toBe('critical')
  expect(vitalCriticalClass(0.05)).toBe('critical')
})

test('main toggles critical health on ship and surface hud fills', () => {
  const source = readFileSync('src/main.ts', 'utf8')

  expect(source).toContain('vitalCriticalClass')
  expect(source).toContain('this.ui.hullFill.classList.toggle(')
  expect(source).toContain('this.surface.pilot.health / this.surface.pilot.maxHealth')
  expect(source).toContain('Math.max(0, this.player.hull) / this.player.maxHull')
})

test('main toggles critical oxygen on the surface o2 hud fill', () => {
  const source = readFileSync('src/main.ts', 'utf8')

  expect(source).toContain('const oxygenRatio = this.surface.pilot.oxygen / this.surface.pilot.maxOxygen')
  expect(source).toContain("this.ui.xpFill.classList.toggle('critical', vitalCriticalClass(oxygenRatio) === 'critical')")
  expect(source).toContain("this.ui.xpFill.classList.toggle('critical', false)")
})

test('css styles critical health fill as a persistent warning', () => {
  const css = readFileSync('src/style.css', 'utf8')

  expect(css).toContain('.hud-meter-fill.health.critical')
  expect(css).toContain('.hud-meter:has(.hud-meter-fill.health.critical)')
  expect(css).toContain('@keyframes critical-health-pulse')
})

test('css styles critical oxygen fill as a persistent warning', () => {
  const css = readFileSync('src/style.css', 'utf8')

  expect(css).toContain('.hud-meter-fill.xp.critical')
  expect(css).toContain('.hud-meter:has(.hud-meter-fill.xp.critical)')
  expect(css).toContain('@keyframes critical-oxygen-pulse')
})
