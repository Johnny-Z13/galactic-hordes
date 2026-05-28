import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('main wires the weapon hud readout into the gameplay hud', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const hud = readFileSync('src/ui/hud.ts', 'utf8')

  expect(main).toContain("import { makeHud as uiMakeHud, updateHud as uiUpdateHud } from './ui/hud'")
  expect(main).toContain('uiMakeHud(this)')
  expect(main).toContain('uiUpdateHud(this)')
  expect(hud).toContain("weaponHudReadout")
  expect(main).toContain('weapon: document.createElement')
  expect(main).not.toContain('private chip(')
  expect(hud).toContain("const weapon = chip('WEAPON', self['ui'].weapon, 'weapon wide')")
  expect(hud).toContain('const weaponReadout = weaponHudReadout({')
  expect(hud).toContain("self['ui'].weapon.textContent = weaponReadout.text")
})

test('css keeps the weapon readout compact in the hud', () => {
  const css = readFileSync('src/style.css', 'utf8')

  expect(css).toContain('.hud-chip.weapon')
  expect(css).toContain('.hud-chip.weapon .hud-value')
})
