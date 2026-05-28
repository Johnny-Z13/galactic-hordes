import { expect, test } from '@playwright/test'
import { damageFeedbackConfig } from '../src/combat/damage-feedback'
import type { Enemy } from '../src/main-types'
import { applyDashRam } from '../src/space-dash-combat'

const enemy = (hp = 40): Enemy => ({
  id: 1,
  kind: 'chaser',
  x: 100,
  y: 50,
  vx: 0,
  vy: 0,
  hp,
  maxHp: hp,
  radius: 12,
  speed: 100,
  value: 1,
  phase: 0,
  cd: 0,
  color: '#57fff3',
  flash: 0
})

test('dash ram applies phase-scaled damage, knockback, and hit flash', () => {
  const target = enemy()

  const result = applyDashRam({
    enemy: target,
    player: { dashTime: 0.2, dashX: 1, dashY: 0 },
    phaseRank: 2,
    engineRank: 3
  })

  expect(result).toMatchObject({
    killed: false,
    damage: 38.5,
    force: 400,
    burst: { x: 100, y: 50, color: '#b990ff', count: 7, speed: 170 }
  })
  expect(target.hp).toBeCloseTo(1.5)
  expect(target.flash).toBe(damageFeedbackConfig.hitFlash.dashRamDurationSeconds)
  expect(target.vx).toBe(400)
  expect(target.vy).toBe(0)
})

test('dash ram is inactive without dash time or phase rank', () => {
  expect(applyDashRam({
    enemy: enemy(),
    player: { dashTime: 0, dashX: 1, dashY: 0 },
    phaseRank: 2,
    engineRank: 3
  })).toBeNull()

  expect(applyDashRam({
    enemy: enemy(),
    player: { dashTime: 0.2, dashX: 1, dashY: 0 },
    phaseRank: 0,
    engineRank: 3
  })).toBeNull()
})

test('dash ram reports kills for game-class cleanup', () => {
  const target = enemy(20)

  const result = applyDashRam({
    enemy: target,
    player: { dashTime: 0.2, dashX: 0, dashY: -1 },
    phaseRank: 1,
    engineRank: 0
  })

  expect(result?.killed).toBe(true)
  expect(target.hp).toBeLessThanOrEqual(0)
  expect(target.vy).toBeLessThan(0)
})
