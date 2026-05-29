import { TAU } from './math-utils'

export interface SpaceHazardAsteroid {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  spin: number
  life: number
  phase: number
  hitCooldown: number
  damageMultiplier: number
}

export interface SpaceHazardDamageInput {
  hazards: SpaceHazardAsteroid[]
  hazard: SpaceHazardAsteroid
  amount: number
  color: string
  random?: () => number
}

export interface SpaceHazardDamageResult {
  score: number
  splitsCreated: number
  burst: {
    x: number
    y: number
    color: string
    count: number
    speed: number
  }
}

const randomBetween = (min: number, max: number, random: () => number) => min + random() * (max - min)

export function damageSpaceHazard(input: SpaceHazardDamageInput): SpaceHazardDamageResult {
  const random = input.random ?? Math.random
  const previousRadius = input.hazard.radius
  input.hazard.radius -= input.amount * 0.72
  input.hazard.vx += randomBetween(-18, 18, random)
  input.hazard.vy += randomBetween(-18, 18, random)

  const result: SpaceHazardDamageResult = {
    score: 0,
    splitsCreated: 0,
    burst: {
      x: input.hazard.x,
      y: input.hazard.y,
      color: input.color,
      count: previousRadius > 42 ? 8 : 4,
      speed: previousRadius > 42 ? 145 : 90
    }
  }

  if (input.hazard.radius > 22) return result

  const index = input.hazards.indexOf(input.hazard)
  if (index >= 0) input.hazards.splice(index, 1)
  result.score = Math.max(2, Math.round(previousRadius / 12))
  if (previousRadius <= 46 || input.hazards.length > 70) return result

  for (let split = 0; split < 2; split += 1) {
    const angle = random() * TAU
    const speed = randomBetween(70, 135, random)
    input.hazards.push({
      x: input.hazard.x + Math.cos(angle) * previousRadius * 0.32,
      y: input.hazard.y + Math.sin(angle) * previousRadius * 0.32,
      vx: input.hazard.vx * 0.55 + Math.cos(angle) * speed,
      vy: input.hazard.vy * 0.55 + Math.sin(angle) * speed,
      radius: previousRadius * 0.44,
      spin: randomBetween(-2.2, 2.2, random),
      life: Math.max(9, input.hazard.life * 0.72),
      phase: random() * TAU,
      hitCooldown: 0,
      damageMultiplier: input.hazard.damageMultiplier
    })
    result.splitsCreated += 1
  }

  return result
}
