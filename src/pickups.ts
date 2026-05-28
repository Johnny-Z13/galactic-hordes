import { dist2, norm } from './math-utils'
import { pickupMagnetRange, pickupMagnetStrength, type PickupMagnetKind } from './pickup-magnet'

export type PickupKind = PickupMagnetKind

export interface Pickup {
  kind: PickupKind
  x: number
  y: number
  vx: number
  vy: number
  value: number
  radius: number
  life: number
  color: string
  /** Frames spent in magnet pull range; drives glint emit cadence. */
  glintFrame?: number
}

interface PickupPlayer {
  x: number
  y: number
  radius: number
}

interface PickupMagnetInput {
  magnetLevel: number
  limitMagnet: number
  hasHungryCompass: boolean
}

interface UpdatePickupsPhysicsInput {
  pickups: Pickup[]
  dt: number
  player: PickupPlayer
  magnetInput: PickupMagnetInput
  glintEvery: number
}

export interface UpdatePickupsPhysicsResult {
  collected: Pickup[]
  glints: Array<{ x: number; y: number }>
}

export function updatePickupsPhysics(input: UpdatePickupsPhysicsInput): UpdatePickupsPhysicsResult {
  const collected: Pickup[] = []
  const glints: Array<{ x: number; y: number }> = []

  for (let i = input.pickups.length - 1; i >= 0; i -= 1) {
    const pickup = input.pickups[i]
    pickup.life -= input.dt
    const d = Math.sqrt(dist2(pickup, input.player))
    const magnet = pickupMagnetRange(pickup.kind, input.magnetInput)
    if (d < magnet || pickup.kind === 'magnet') {
      const pull = norm(input.player.x - pickup.x, input.player.y - pickup.y)
      const strength = pickupMagnetStrength(pickup.kind)
      pickup.vx += pull.x * strength * input.dt
      pickup.vy += pull.y * strength * input.dt
      pickup.glintFrame = (pickup.glintFrame ?? 0) + 1
      if (pickup.glintFrame % input.glintEvery === 0) glints.push({ x: pickup.x, y: pickup.y })
    }
    pickup.x += pickup.vx * input.dt
    pickup.y += pickup.vy * input.dt
    pickup.vx *= Math.pow(0.08, input.dt)
    pickup.vy *= Math.pow(0.08, input.dt)
    const rr = pickup.radius + input.player.radius + 6
    if (d < rr || pickup.life <= 0) {
      if (d < rr) collected.push(pickup)
      input.pickups.splice(i, 1)
    }
  }

  return { collected: collected.reverse(), glints: glints.reverse() }
}
