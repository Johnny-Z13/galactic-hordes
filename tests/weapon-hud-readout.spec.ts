import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('main wires the weapon hud readout into the gameplay hud', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain("weaponHudReadout")
  expect(main).toContain('weapon: document.createElement')
  expect(main).toContain("this.chip('WEAPON', this.ui.weapon, 'weapon wide')")
  expect(main).toContain('const weaponReadout = weaponHudReadout({')
  expect(main).toContain('this.ui.weapon.textContent = weaponReadout.text')
})

test('css keeps the weapon readout compact in the hud', () => {
  const css = readFileSync('src/style.css', 'utf8')

  expect(css).toContain('.hud-chip.weapon')
  expect(css).toContain('.hud-chip.weapon .hud-value')
})
