import { norm } from '../math-utils'

export interface SurfaceBulletModel {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  radius: number
  damage: number
  color: string
}

export interface SurfaceBulletThreatModel {
  x: number
  y: number
  vx: number
  vy: number
  hp: number
  radius: number
  hit: number
}

export interface SurfaceGunPilotModel {
  x: number
  y: number
}

export interface SurfaceBulletHit {
  x: number
  y: number
  color: string
}

export function updateSurfaceBulletsAndThreatDamage(input: {
  bullets: SurfaceBulletModel[]
  threats: SurfaceBulletThreatModel[]
  surface: { width: number; height: number }
  dt: number
}): { hits: SurfaceBulletHit[] } {
  const hits: SurfaceBulletHit[] = []
  for (let i = input.bullets.length - 1; i >= 0; i -= 1) {
    const bullet = input.bullets[i]
    bullet.life -= input.dt
    bullet.x += bullet.vx * input.dt
    bullet.y += bullet.vy * input.dt
    if (bullet.life <= 0 || bullet.x < -20 || bullet.y < -20 || bullet.x > input.surface.width + 20 || bullet.y > input.surface.height + 20) {
      input.bullets.splice(i, 1)
      continue
    }
    for (const threat of input.threats) {
      const rr = threat.radius + bullet.radius
      if ((threat.x - bullet.x) ** 2 + (threat.y - bullet.y) ** 2 > rr * rr) continue
      threat.hp -= bullet.damage
      threat.hit = 0.035
      const push = norm(threat.x - bullet.x, threat.y - bullet.y)
      threat.vx += push.x * 70
      threat.vy += push.y * 70
      hits.push({ x: bullet.x, y: bullet.y, color: bullet.color })
      input.bullets.splice(i, 1)
      break
    }
  }
  return { hits }
}

export function findSurfaceTarget<T extends { x: number; y: number }>(input: {
  threats: readonly T[]
  pilot: SurfaceGunPilotModel
  range?: number
}): T | null {
  let best: T | null = null
  let bestD = (input.range ?? 420) ** 2
  for (const threat of input.threats) {
    const d = (threat.x - input.pilot.x) ** 2 + (threat.y - input.pilot.y) ** 2
    if (d < bestD) {
      bestD = d
      best = threat
    }
  }
  return best
}

export function createSurfaceBullet(input: {
  pilot: SurfaceGunPilotModel
  target: { x: number; y: number }
  speed: number
  damage: number
  muzzleOffset: number
}): SurfaceBulletModel {
  const angle = Math.atan2(input.target.y - input.pilot.y, input.target.x - input.pilot.x)
  return {
    x: input.pilot.x + Math.cos(angle) * input.muzzleOffset,
    y: input.pilot.y + Math.sin(angle) * input.muzzleOffset,
    vx: Math.cos(angle) * input.speed,
    vy: Math.sin(angle) * input.speed,
    life: 0.62,
    radius: 4,
    damage: input.damage,
    color: '#fff27a'
  }
}
