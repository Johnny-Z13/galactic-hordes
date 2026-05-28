import { balancedSpaceEnemyDefinition, spaceEnemyRunScale, spaceEnemySpeedBonus } from './game-balance'
import type { Enemy, EnemyKind } from './main-types'
import { TAU } from './math-utils'
import { spaceEnemyBehavior } from './space-enemy-behavior'

export interface CreateSpaceEnemyInput {
  id: number
  kind: EnemyKind
  x: number
  y: number
  time: number
  planets: number
  random?: () => number
}

export interface CreateSplitChildEnemyInput {
  id: number
  x: number
  y: number
  time: number
  random?: () => number
}

export function createSpaceEnemy(input: CreateSpaceEnemyInput): Enemy {
  const { id, kind, x, y, time, planets, random = Math.random } = input
  const scale = spaceEnemyRunScale(time, planets)
  const base = balancedSpaceEnemyDefinition(kind)

  return {
    id,
    kind,
    x,
    y,
    vx: 0,
    vy: 0,
    hp: base.hp * scale,
    maxHp: base.hp * scale,
    radius: base.radius,
    speed: base.speed + spaceEnemySpeedBonus(time),
    value: Math.floor(base.value * scale),
    phase: random() * TAU,
    cd: random() * spaceEnemyBehavior.global.initialCooldownRandomSeconds,
    color: base.color,
    flash: 0
  }
}

export function createSplitChildEnemy(input: CreateSplitChildEnemyInput): Enemy {
  const { id, x, y, time, random = Math.random } = input
  const angle = random() * TAU
  const hp = spaceEnemyBehavior.splitChild.hpBase + time / spaceEnemyBehavior.splitChild.hpTimeDivisor

  return {
    id,
    kind: 'chaser',
    x: x + Math.cos(angle) * spaceEnemyBehavior.splitChild.spawnOffset,
    y: y + Math.sin(angle) * spaceEnemyBehavior.splitChild.spawnOffset,
    vx: Math.cos(angle) * spaceEnemyBehavior.splitChild.launchSpeed,
    vy: Math.sin(angle) * spaceEnemyBehavior.splitChild.launchSpeed,
    hp,
    maxHp: hp,
    radius: spaceEnemyBehavior.splitChild.radius,
    speed: spaceEnemyBehavior.splitChild.speed,
    value: spaceEnemyBehavior.splitChild.value,
    phase: random() * TAU,
    cd: 0,
    color: '#70a8ff',
    flash: 0
  }
}
