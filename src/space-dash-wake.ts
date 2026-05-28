import type { Vec } from './main-types'
import { TAU } from './math-utils'

export interface DashWakeParticle {
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

export interface DashWakeShockwave {
  x: number
  y: number
  radius: number
  speed: number
  life: number
  maxLife: number
  color: string
  jag: number
}

export interface DashWakeEffects {
  particles: DashWakeParticle[]
  shockwaves: DashWakeShockwave[]
}

export interface DashWakeInput {
  origin: Vec
  direction: Vec
  engineRank: number
  phaseRank: number
  intensity: number
  highLoad: boolean
  glowEnabled: boolean
  canAddShockwave: boolean
  random?: () => number
}

const rand = (random: () => number, min: number, max: number) => min + random() * (max - min)

export function createDashWakeEffects(input: DashWakeInput): DashWakeEffects {
  const {
    origin,
    direction,
    engineRank: engine,
    phaseRank: phase,
    intensity,
    highLoad,
    glowEnabled,
    canAddShockwave,
    random = Math.random
  } = input

  if (highLoad && intensity < 1) return { particles: [], shockwaves: [] }
  if (intensity < 1 && random() > intensity) return { particles: [], shockwaves: [] }

  const color = phase >= 2 ? '#b990ff' : engine >= 4 ? '#fff27a' : '#70a8ff'
  const accent = phase > 0 ? '#d7fff7' : '#57fff3'
  const side = { x: -direction.y, y: direction.x }
  const count = Math.max(2, Math.floor((3 + engine + phase * 1.4) * intensity))
  const backDistance = 20 + engine * 4
  const particles: DashWakeParticle[] = []
  const shockwaves: DashWakeShockwave[] = []

  if (intensity >= 1 && canAddShockwave) {
    const life = 0.32 + engine * 0.025
    shockwaves.push({
      x: origin.x - direction.x * 12,
      y: origin.y - direction.y * 12,
      radius: 12 + engine * 3 + phase * 4,
      speed: 360 + engine * 34 + phase * 28,
      life,
      maxLife: life,
      color,
      jag: rand(random, 0, TAU)
    })
  }

  for (let i = 0; i < count; i += 1) {
    const lane = (i - (count - 1) / 2) * (4 + engine * 0.7)
    const jitter = rand(random, -7, 7)
    const speed = rand(random, 90 + engine * 10, 210 + engine * 28 + phase * 18)
    const life = rand(random, 0.22, 0.46 + engine * 0.035)
    particles.push({
      x: origin.x - direction.x * (backDistance + rand(random, 0, 22)) + side.x * (lane + jitter),
      y: origin.y - direction.y * (backDistance + rand(random, 0, 22)) + side.y * (lane + jitter),
      vx: -direction.x * speed + side.x * rand(random, -36, 36),
      vy: -direction.y * speed + side.y * rand(random, -36, 36),
      life,
      maxLife: life,
      color: i % 3 === 0 ? accent : color,
      size: rand(random, 2.4, 5.6 + engine * 0.45),
      angle: Math.atan2(direction.y, direction.x),
      spin: rand(random, -4, 4),
      sides: phase >= 2 && i % 4 === 0 ? 4 : undefined,
      length: rand(random, 28 + engine * 7, 58 + engine * 14 + phase * 8),
      glow: glowEnabled ? 32 : 16
    })
  }

  return { particles, shockwaves }
}
