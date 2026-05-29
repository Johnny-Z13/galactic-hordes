import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { workbenchBalance } from '../src/powerup-balance'
import { resolveSurfaceSignalBank, surfaceSignalCap } from '../src/surface/signal-buffer'

test('surface signal cap grants reward planets one extra buffered signal', () => {
  expect(surfaceSignalCap(null)).toBe(workbenchBalance.surfaceSignalCapBase)
  expect(surfaceSignalCap('standard')).toBe(workbenchBalance.surfaceSignalCapBase)
  expect(surfaceSignalCap('horde')).toBe(workbenchBalance.surfaceSignalCapBase + workbenchBalance.surfaceSignalCapRewardEventBonus)
  expect(surfaceSignalCap('jackpot')).toBe(workbenchBalance.surfaceSignalCapBase + workbenchBalance.surfaceSignalCapRewardEventBonus)
})

test('surface signal bank accepts signals below the event cap', () => {
  const result = resolveSurfaceSignalBank({
    event: 'standard',
    bankedSignals: workbenchBalance.surfaceSignalCapBase - 1,
    overflowSignals: 0
  })

  expect(result).toEqual({
    banked: true,
    pendingUpgrade: true,
    nextBankedSignals: workbenchBalance.surfaceSignalCapBase,
    nextOverflowSignals: 0,
    scrap: 0,
    crystal: 0,
    toast: null
  })
})

test('surface signal bank converts overflow into cargo with a first-overflow toast', () => {
  const first = resolveSurfaceSignalBank({
    event: 'standard',
    bankedSignals: workbenchBalance.surfaceSignalCapBase,
    overflowSignals: 0
  })
  const repeated = resolveSurfaceSignalBank({
    event: 'standard',
    bankedSignals: workbenchBalance.surfaceSignalCapBase,
    overflowSignals: 1
  })

  expect(first).toMatchObject({
    banked: false,
    nextOverflowSignals: 1,
    scrap: workbenchBalance.overflowSignalScrap,
    crystal: workbenchBalance.overflowSignalCrystal,
    toast: 'SIGNAL BUFFER FULL: EXTRA SIGNALS CONVERT TO CARGO'
  })
  expect(repeated.toast).toBeNull()
})

test('main delegates surface signal buffer rules to focused helper', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  const helper = readFileSync('src/surface/signal-buffer.ts', 'utf8')

  expect(helper).toContain('export function surfaceSignalCap')
  expect(helper).toContain('export function resolveSurfaceSignalBank')
  expect(main).toContain("from './surface/signal-buffer'")
  expect(main).toContain('return surfaceSignalCap(surface?.event ?? null)')
  expect(main).toContain('const result = resolveSurfaceSignalBank({')
  expect(main).not.toContain('workbenchBalance.overflowSignalScrap')
  expect(main).not.toContain('workbenchBalance.surfaceSignalCapRewardEventBonus')
})
