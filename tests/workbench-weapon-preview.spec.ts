import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import type { VectorShooter, WorkbenchChoice } from '../src/main'
import { evolutions, upgrades } from '../src/powerup-balance'
import { choiceWeaponPreview } from '../src/ui/workbench'

function fakeSelf(build: Record<string, number>, evolved = new Set<string>()) {
  return {
    build,
    evolved
  } as unknown as VectorShooter
}

test('workbench weapon preview shows the next weapon identity for branch upgrades', () => {
  const split = upgrades.find((upgrade) => upgrade.id === 'split')!

  expect(choiceWeaponPreview(fakeSelf({ split: 0 }), { kind: 'upgrade', upgrade: split })).toBe('NEXT: Prism Barrel // ONLINE')
})

test('workbench weapon preview shows evolved weapon identity', () => {
  const rapidEvolution = evolutions.find((evolution) => evolution.weapon === 'rapid')!

  expect(choiceWeaponPreview(
    fakeSelf({ rapid: 8 }, new Set()),
    { kind: 'evolution', evolution: rapidEvolution }
  )).toBe('NEXT: Choir Cannon // EVOLVED VOLLEY')
})

test('workbench weapon preview suppresses non-weapon and no-change choices', () => {
  const engine = upgrades.find((upgrade) => upgrade.id === 'engine')!
  const rapid = upgrades.find((upgrade) => upgrade.id === 'rapid')!

  expect(choiceWeaponPreview(fakeSelf({ engine: 0 }), { kind: 'upgrade', upgrade: engine })).toBe('')
  expect(choiceWeaponPreview(fakeSelf({ rapid: 8 }), { kind: 'upgrade', upgrade: rapid })).toBe('')
})

test('workbench renderer wires weapon previews into choice cards', () => {
  const source = readFileSync('src/ui/workbench.ts', 'utf8')
  const css = readFileSync('src/style.css', 'utf8')

  expect(source).toContain('export function choiceWeaponPreview(')
  expect(source).toContain("from '../weapon-signatures'")
  expect(source).toContain('workbench-weapon-preview')
  expect(source).toContain('choiceWeaponPreview(self, choice)')
  expect(source).toContain("choiceWeaponPreview(self, { kind: 'upgrade', upgrade })")
  expect(css).toContain('.workbench-weapon-preview')
})
