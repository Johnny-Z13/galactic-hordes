import type { Enemy } from './main-types'
import { norm } from './math-utils'
import { isGiantEnemyKind } from './space-enemies'

export interface EnemyTrailParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  angle: number
  spin: number
  sides?: number
  length: number
  glow: number
}

export interface EnemyTrailInput {
  enemy: Enemy
  color: string
  intensity?: number
  glowEnabled?: boolean
  random?: () => number
}

const randomBetween = (min: number, max: number, random: () => number) => min + random() * (max - min)

export function createEnemyTrailParticle(input: EnemyTrailInput): EnemyTrailParticle | null {
  const intensity = input.intensity ?? 1
  const random = input.random ?? Math.random
  const speed = Math.hypot(input.enemy.vx, input.enemy.vy)
  if (speed < 85 || random() > 0.42 * intensity) return null

  const back = norm(-input.enemy.vx, -input.enemy.vy)
  const side = { x: -back.y, y: back.x }
  const spread = isGiantEnemyKind(input.enemy.kind) ? 24 : input.enemy.kind === 'bulwark' ? 18 : input.enemy.kind === 'skimmer' || input.enemy.kind === 'helix' ? 13 : 8
  const life = isGiantEnemyKind(input.enemy.kind) ? 0.62 : input.enemy.kind === 'shard' ? 0.28 : input.enemy.kind === 'razor' ? 0.34 : 0.46

  return {
    x: input.enemy.x + back.x * input.enemy.radius * 0.75 + side.x * randomBetween(-spread, spread, random),
    y: input.enemy.y + back.y * input.enemy.radius * 0.75 + side.y * randomBetween(-spread, spread, random),
    vx: back.x * randomBetween(30, 90, random) + side.x * randomBetween(-24, 24, random),
    vy: back.y * randomBetween(30, 90, random) + side.y * randomBetween(-24, 24, random),
    life,
    maxLife: life,
    color: input.color,
    size: isGiantEnemyKind(input.enemy.kind) ? randomBetween(4, 9, random) : input.enemy.kind === 'bulwark' ? randomBetween(3, 7, random) : randomBetween(2, 5, random),
    angle: Math.atan2(input.enemy.vy, input.enemy.vx),
    spin: randomBetween(-2, 2, random),
    sides: isGiantEnemyKind(input.enemy.kind) || input.enemy.kind === 'bulwark' ? 4 : undefined,
    length: isGiantEnemyKind(input.enemy.kind) ? randomBetween(44, 84, random) : input.enemy.kind === 'shard' ? randomBetween(42, 76, random) : input.enemy.kind === 'razor' ? randomBetween(34, 68, random) : randomBetween(20, 44, random),
    glow: input.glowEnabled ? 28 : 14
  }
}
