import { TAU } from './math-utils'

export interface PickupGlintParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  angle: number
  length: number
  glow: number
}

export interface PickupGlintInput {
  x: number
  y: number
  color: string
  glow: boolean
  maxSpeed?: number
  random?: () => number
}

export function createPickupGlintParticle(input: PickupGlintInput): PickupGlintParticle {
  const random = input.random ?? Math.random
  const maxSpeed = input.maxSpeed ?? 18
  const angle = random() * TAU
  const speed = lerp(maxSpeed * 0.45, maxSpeed, random())
  const life = lerp(0.18, 0.32, random())
  return {
    x: input.x + lerp(-2, 2, random()),
    y: input.y + lerp(-2, 2, random()),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life,
    maxLife: life,
    color: input.color,
    size: lerp(1, 2, random()),
    angle,
    length: lerp(5, input.glow ? 12 : 9, random()),
    glow: input.glow ? 8 : 4
  }
}

function lerp(min: number, max: number, t: number) {
  return min + (max - min) * t
}
