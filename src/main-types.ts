import type { SpaceEnemyKind } from './game-balance'

export type EnemyKind = SpaceEnemyKind

export interface Vec {
  x: number
  y: number
}

export interface Bullet {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  damage: number
  radius: number
  color: string
  pierce: number
  rail?: boolean
  hostile?: boolean
  chain?: number
  mine?: boolean
  option?: boolean
}

export interface Enemy {
  id: number
  kind: EnemyKind
  x: number
  y: number
  vx: number
  vy: number
  hp: number
  maxHp: number
  radius: number
  speed: number
  value: number
  phase: number
  cd: number
  color: string
  flash: number
}
