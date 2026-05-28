import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { damageFeedbackConfig } from '../src/combat/damage-feedback'
import { enemyHealthReadout, isPriorityEnemyHealthTarget } from '../src/render/enemy-health-readout'
import type { EnemyKind } from '../src/main-types'

function enemy(kind: EnemyKind, hp: number, maxHp = 100) {
  return {
    kind,
    hp,
    maxHp,
    radius: 24,
    color: '#ff9d5c'
  }
}

test('enemy health readout appears only for damaged priority targets', () => {
  const readout = enemyHealthReadout({ enemy: enemy('brute', 50), highLoad: false, scale: 1 })

  expect(readout).toMatchObject({
    fillRatio: 0.5,
    fillColor: '#ff9d5c',
    height: 4
  })
  expect(readout?.width).toBeGreaterThan(38)
  expect(enemyHealthReadout({ enemy: enemy('brute', 100), highLoad: false, scale: 1 })).toBeNull()
  expect(enemyHealthReadout({ enemy: enemy('chaser', 50), highLoad: false, scale: 1 })).toBeNull()
})

test('enemy health readout keeps boss targets under load and suppresses brutes', () => {
  expect(isPriorityEnemyHealthTarget('brute', false)).toBe(true)
  expect(isPriorityEnemyHealthTarget('brute', true)).toBe(false)
  expect(isPriorityEnemyHealthTarget('siphon', true)).toBe(true)

  const giant = enemyHealthReadout({ enemy: enemy('siphon', 40), highLoad: true, scale: 1.25 })

  expect(giant).not.toBeNull()
  expect(giant!.height).toBe(5)
  expect(giant!.strokeColor).toBe('#ffedf1')
  expect(enemyHealthReadout({ enemy: enemy('brute', 40), highLoad: true, scale: 1 })).toBeNull()
})

test('enemy health readout uses red fill for critical health', () => {
  const readout = enemyHealthReadout({ enemy: enemy('warden', 12), highLoad: false, scale: 1 })

  expect(readout?.fillRatio).toBeCloseTo(0.12)
  expect(readout?.fillColor).toBe(damageFeedbackConfig.hitFlash.color)
})

test('render enemies wires priority health readouts in normal and high-load paths', () => {
  const source = readFileSync('src/render/enemies.ts', 'utf8')

  expect(source).toContain("from './enemy-health-readout'")
  expect(source).toContain('renderEnemyHealthReadouts(view)')
  expect(source).toContain('enemyHealthReadout({')
  expect(source).toContain('ctx.roundRect(')
})
