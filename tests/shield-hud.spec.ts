import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const mainSource = () => readFileSync('src/main.ts', 'utf8')
const hudSource = () => readFileSync('src/ui/hud.ts', 'utf8')
const cssSource = () => readFileSync('src/style.css', 'utf8')

test('hud owns a shield fill and attaches it to the hull meter', () => {
  const main = mainSource()

  expect(main).toContain('shieldFill: document.createElement')
  expect(main).toContain("this.meter('HULL', this.ui.hull, this.ui.hullFill, 'health', this.ui.hullLabel, this.ui.shieldFill)")
  expect(main).toContain("shieldFill.className = 'hud-meter-shield-fill'")
})

test('hud updates shield strip only during ship flight', () => {
  const main = mainSource()
  const hud = hudSource()

  expect(main).toContain("import { updateHud as uiUpdateHud } from './ui/hud'")
  expect(main).toContain('uiUpdateHud(this)')
  expect(hud).toContain('export function updateHud(self: VectorShooter)')
  expect(hud).toContain("self['ui'].shieldFill.style.width =")
  expect(hud).toContain("const shieldRatio = self['player'].maxShield > 0 ? self['player'].shield / self['player'].maxShield : 0")
  expect(hud).toContain("self['ui'].shieldFill.classList.toggle('visible', self['player'].maxShield > 0)")
  expect(hud).toContain("self['ui'].shieldFill.classList.toggle('depleted', self['player'].maxShield > 0 && self['player'].shield <= 0)")
  expect(hud).toContain("self['ui'].shieldFill.classList.toggle('recharging', self['player'].maxShield > 0 && self['player'].shieldDelay > 0)")
  expect(hud).toContain("self['ui'].shieldFill.classList.toggle('visible', false)")
  expect(hud).toContain("self['ui'].shieldFill.classList.toggle('recharging', false)")
})

test('css renders shield as a compact cyan buffer strip', () => {
  const css = cssSource()

  expect(css).toContain('.hud-meter-shield-fill')
  expect(css).toContain('.hud-meter-shield-fill.visible')
  expect(css).toContain('.hud-meter-shield-fill.depleted')
  expect(css).toContain('.hud-meter-shield-fill.recharging')
  expect(css).toContain('@keyframes shield-recharge-wait')
})
