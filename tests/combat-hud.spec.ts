import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('desktop hud surfaces kill count as combat progress', () => {
  const hud = readFileSync('src/ui/hud.ts', 'utf8')

  expect(hud).toContain("self['ui'].wave.textContent = self['stats'].kills.toString()")
  expect(hud).toContain("chip('KILLS', self['ui'].wave, 'kills')")
})

test('css keeps kill count compact and off the mobile combat hud', () => {
  const css = readFileSync('src/style.css', 'utf8')

  expect(css).toContain('.hud-chip.kills')
  expect(css).toContain('@media (max-width: 920px)')
  expect(css).toContain('.hud-chip.kills {')
  expect(css).toContain('display: none')
})
