import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { nextXpThreshold, runBalance } from '../src/run-balance'
import { applyMutationXp, mutationSignalAlmostReady, mutationXpReadout } from '../src/mutation-progress'

test('mutation xp progression banks every crossed level threshold', () => {
  const progress = {
    level: 1,
    xp: runBalance.xp.startingNext - 2,
    nextXp: runBalance.xp.startingNext
  }

  const levelsGained = applyMutationXp(progress, nextXpThreshold(runBalance.xp.startingNext) + 10)

  expect(levelsGained).toBe(2)
  expect(progress.level).toBe(3)
  expect(progress.xp).toBe(8)
  expect(progress.nextXp).toBeGreaterThan(runBalance.xp.startingNext)
})

test('main delegates mutation xp thresholds through a shared progression helper', () => {
  const main = readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8')
  const hud = readFileSync(resolve(process.cwd(), 'src/ui/hud.ts'), 'utf8')

  expect(main).toContain("import { applyMutationXp } from './mutation-progress'")
  expect(main).toContain('const levelsGained = applyMutationXp(this.stats, p.value)')
  expect(main).toContain('const levelsGained = applyMutationXp(this.stats, resource.value)')
  expect(main).not.toContain('while (this.stats.xp >= this.stats.nextXp)')
  expect(hud).toContain("import { mutationSignalAlmostReady, mutationXpReadout } from '../mutation-progress'")
  expect(hud).toContain("self['ui'].level.textContent = mutationXpReadout(self['stats'])")
  expect(hud).toContain("self['ui'].xpFill.classList.toggle('near-signal', mutationSignalAlmostReady(self['stats']))")
  expect(hud).toContain("self['ui'].xpFill.classList.toggle('near-signal', false)")
})

test('mutation xp readout shows level and next signal progress compactly', () => {
  expect(mutationXpReadout({
    level: 4,
    xp: 21.8,
    nextXp: 88
  })).toBe('LV 4 // 21/88')
})

test('mutation signal almost ready starts before the final xp sliver', () => {
  expect(mutationSignalAlmostReady({
    level: 1,
    xp: 65,
    nextXp: 80
  })).toBe(false)

  expect(mutationSignalAlmostReady({
    level: 1,
    xp: 66,
    nextXp: 80
  })).toBe(true)
})

test('css styles near-ready mutation xp as a reward cue', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/style.css'), 'utf8')

  expect(css).toContain('.hud-meter-fill.xp.near-signal')
  expect(css).toContain('.hud-meter:has(.hud-meter-fill.xp.near-signal)')
  expect(css).toContain('@keyframes mutation-signal-charge')
})
