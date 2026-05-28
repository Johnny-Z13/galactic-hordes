import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const mainSource = () => readFileSync('src/main.ts', 'utf8')
const cssSource = () => readFileSync('src/style.css', 'utf8')

test('hud owns a shield fill and attaches it to the hull meter', () => {
  const main = mainSource()

  expect(main).toContain('shieldFill: document.createElement')
  expect(main).toContain("this.meter('HULL', this.ui.hull, this.ui.hullFill, 'health', this.ui.hullLabel, this.ui.shieldFill)")
  expect(main).toContain("shieldFill.className = 'hud-meter-shield-fill'")
})

test('hud updates shield strip only during ship flight', () => {
  const main = mainSource()

  expect(main).toContain('this.ui.shieldFill.style.width =')
  expect(main).toContain('const shieldRatio = this.player.maxShield > 0 ? this.player.shield / this.player.maxShield : 0')
  expect(main).toContain("this.ui.shieldFill.classList.toggle('visible', this.player.maxShield > 0)")
  expect(main).toContain("this.ui.shieldFill.classList.toggle('depleted', this.player.maxShield > 0 && this.player.shield <= 0)")
  expect(main).toContain("this.ui.shieldFill.classList.toggle('recharging', this.player.maxShield > 0 && this.player.shieldDelay > 0)")
  expect(main).toContain("this.ui.shieldFill.classList.toggle('visible', false)")
  expect(main).toContain("this.ui.shieldFill.classList.toggle('recharging', false)")
})

test('css renders shield as a compact cyan buffer strip', () => {
  const css = cssSource()

  expect(css).toContain('.hud-meter-shield-fill')
  expect(css).toContain('.hud-meter-shield-fill.visible')
  expect(css).toContain('.hud-meter-shield-fill.depleted')
  expect(css).toContain('.hud-meter-shield-fill.recharging')
  expect(css).toContain('@keyframes shield-recharge-wait')
})
