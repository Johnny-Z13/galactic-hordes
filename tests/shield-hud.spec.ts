import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const mainSource = () => readFileSync('src/main.ts', 'utf8')
const hudSource = () => readFileSync('src/ui/hud.ts', 'utf8')
const cssSource = () => readFileSync('src/style.css', 'utf8')

test('hud owns a shield fill and attaches it to the hull meter', () => {
  const main = mainSource()
  const hud = hudSource()

  expect(main).toContain('shieldFill: document.createElement')
  expect(main).toContain("import { makeHud as uiMakeHud, updateHud as uiUpdateHud } from './ui/hud'")
  expect(main).toContain('uiMakeHud(this)')
  expect(main).not.toContain('private meter(')
  expect(hud).toContain('interface HudView')
  expect(hud).toContain('export function makeHud(self: HudView)')
  expect(hud).not.toContain("from '../main'")
  expect(hud).toContain("meter('HULL', runtime.ui.hull, runtime.ui.hullFill, 'health', runtime.ui.hullLabel, runtime.ui.shieldFill)")
  expect(hud).toContain("shieldFill.className = 'hud-meter-shield-fill'")
})

test('hud updates shield strip only during ship flight', () => {
  const main = mainSource()
  const hud = hudSource()

  expect(main).toContain("import { makeHud as uiMakeHud, updateHud as uiUpdateHud } from './ui/hud'")
  expect(main).toContain('uiUpdateHud(this)')
  expect(hud).toContain('export function updateHud(self: HudView)')
  expect(hud).toContain('runtime.ui.shieldFill.style.width =')
  expect(hud).toContain('const shieldRatio = runtime.player.maxShield > 0 ? runtime.player.shield / runtime.player.maxShield : 0')
  expect(hud).toContain("runtime.ui.shieldFill.classList.toggle('visible', runtime.player.maxShield > 0)")
  expect(hud).toContain("runtime.ui.shieldFill.classList.toggle('depleted', runtime.player.maxShield > 0 && runtime.player.shield <= 0)")
  expect(hud).toContain("runtime.ui.shieldFill.classList.toggle('recharging', runtime.player.maxShield > 0 && runtime.player.shieldDelay > 0)")
  expect(hud).toContain("runtime.ui.shieldFill.classList.toggle('visible', false)")
  expect(hud).toContain("runtime.ui.shieldFill.classList.toggle('recharging', false)")
})

test('css renders shield as a compact cyan buffer strip', () => {
  const css = cssSource()

  expect(css).toContain('.hud-meter-shield-fill')
  expect(css).toContain('.hud-meter-shield-fill.visible')
  expect(css).toContain('.hud-meter-shield-fill.depleted')
  expect(css).toContain('.hud-meter-shield-fill.recharging')
  expect(css).toContain('@keyframes shield-recharge-wait')
})
