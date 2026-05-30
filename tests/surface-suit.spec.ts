import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import { upgrades } from '../src/powerup-balance'

const source = () => fs.readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
const hudSource = () => fs.readFileSync(new URL('../src/ui/hud.ts', import.meta.url), 'utf8')
const lifecycleSource = () => fs.readFileSync(new URL('../src/surface/lifecycle.ts', import.meta.url), 'utf8')

test('surface runs track human health and oxygen instead of ship hull xp', () => {
  const main = source()
  const hud = hudSource()

  expect(main).toContain('health: this.surfaceMaxHealth()')
  expect(main).toContain('oxygen: this.surfaceMaxOxygen()')
  expect(hud).toContain("runtime.ui.hullLabel.textContent = 'HEALTH'")
  expect(hud).toContain("runtime.ui.xpLabel.textContent = 'O2'")
})

test('low oxygen auto returns the surface pilot to the ship', () => {
  const main = source()
  const lifecycle = lifecycleSource()

  expect(main).toContain("this.toast('O2 LOW - RETURNING TO SHIP')")
  expect(main).toContain('advanceSurfaceOxygen({')
  expect(lifecycle).toContain('lowTriggered')
  expect(lifecycle).toContain('depleted')
  expect(main).toContain('this.startTakeoff()')
  expect(main).not.toContain('this.startTakeoff({ urgent: true })')
})

test('surface tech upgrades improve suit timer health and gun output', () => {
  const main = source()
  const spacesuitUpgrades = upgrades.filter((upgrade) => upgrade.bucket === 'spacesuit').map((upgrade) => upgrade.id)

  expect(spacesuitUpgrades).toEqual(expect.arrayContaining(['suitO2', 'suitHealth', 'suitBlaster']))
  expect(main).toContain("spacesuit: 'SPACESUIT'")
  expect(main).toContain('private surfaceGunDamage()')
  expect(main).toContain('private surfaceGunCooldown()')
})

test('surface touch controls hide the inactive safe button', () => {
  const main = source()

  expect(main).toContain("this.ui.touchDash.classList.add('hidden')")
  expect(main).not.toContain("'SAFE'")
  expect(main).not.toContain("textContent = 'SAFE'")
})

test('surface camera starts locked to the pilot on landing', () => {
  const main = source()

  expect(main).toContain('private initialSurfaceCamera(')
  expect(main).toContain('camera: this.initialSurfaceCamera(pilot, world)')
  expect(main).not.toContain('camera: { x: 0, y: 0 }')
})
