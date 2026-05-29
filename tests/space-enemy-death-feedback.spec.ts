import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolveSpaceEnemyDeathFeedback } from '../src/space-enemy-death-feedback'

test('space enemy death feedback gives ordinary kills a small unthrottled profile', () => {
  expect(resolveSpaceEnemyDeathFeedback({
    kind: 'chaser',
    highLoad: false,
    collisionFxCooldown: 0.2
  })).toEqual({
    big: false,
    playFx: true,
    boomKind: 'small',
    cameraShake: 5,
    burstCount: 12,
    burstSpeed: 150,
    collisionCooldownSeconds: 0
  })
})

test('space enemy death feedback throttles ordinary high-load kills while cooldown is active', () => {
  expect(resolveSpaceEnemyDeathFeedback({
    kind: 'shooter',
    highLoad: true,
    collisionFxCooldown: 0.01
  })).toEqual({
    big: false,
    playFx: false,
    boomKind: 'small',
    cameraShake: 2,
    burstCount: 4,
    burstSpeed: 120,
    collisionCooldownSeconds: 0.04
  })
})

test('space enemy death feedback keeps heavyweight kills loud under high load', () => {
  expect(resolveSpaceEnemyDeathFeedback({
    kind: 'bulwark',
    highLoad: true,
    collisionFxCooldown: 1
  })).toEqual({
    big: true,
    playFx: true,
    boomKind: 'heavy',
    cameraShake: 16,
    burstCount: 42,
    burstSpeed: 330,
    collisionCooldownSeconds: 0.04
  })
})

test('main delegates space enemy death feedback profile decisions', () => {
  const main = readFileSync('src/main.ts', 'utf8')

  expect(main).toContain("from './space-enemy-death-feedback'")
  expect(main).toContain('const feedback = resolveSpaceEnemyDeathFeedback({')
  expect(main).toContain('this.audio.boom(feedback.boomKind)')
  expect(main).not.toContain("e.kind === 'warden' || e.kind === 'brute' || e.kind === 'bulwark'")
  expect(main).not.toContain("this.audio.boom(big ? 'heavy' : 'small')")
  expect(main).not.toContain('big ? 16 : highLoad ? 2 : 5')
  expect(main).not.toContain('big ? 42 : highLoad ? 4 : 12')
})
