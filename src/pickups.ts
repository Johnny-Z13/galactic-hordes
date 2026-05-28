import { pickupBalance } from './powerup-balance'
import { clamp, dist2, norm, TAU } from './math-utils'
import { pickupMagnetRange, pickupMagnetStrength, type PickupMagnetInput, type PickupMagnetKind } from './pickup-magnet'

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

export interface DropPickupInput {
  pickups: Pickup[]
  kind: PickupKind
  x: number
  y: number
  value: number
  highLoad: boolean
  maxPickups: number
  random?: () => number
}

const pickupColor = (kind: PickupKind) => (
  kind === 'xp' ? '#57fff3' : kind === 'repair' ? '#8fff7d' : kind === 'chest' ? '#fff27a' : '#b990ff'
)

const pickupRadius = (kind: PickupKind) => (
  kind === 'chest' ? pickupBalance.chestRadius : kind === 'xp' ? pickupBalance.xp.radius : pickupBalance.defaultRadius
)

const randomBetween = (min: number, max: number, random: () => number) => min + random() * (max - min)

export function dropPickup(input: DropPickupInput) {
  const random = input.random ?? Math.random
  if (input.kind === 'xp' && input.highLoad) {
    for (const pickup of input.pickups) {
      if (pickup.kind !== 'xp') continue
      const dx = pickup.x - input.x
      const dy = pickup.y - input.y
      if (dx * dx + dy * dy > pickupBalance.xp.mergeDistance * pickupBalance.xp.mergeDistance) continue
      pickup.value += input.value
      pickup.life = Math.max(pickup.life, 22)
      pickup.radius = clamp(pickup.radius + pickupBalance.xp.mergeRadiusStep, pickupBalance.xp.radius, pickupBalance.xp.mergeRadiusMax)
      pickup.vx += randomBetween(-18, 18, random)
      pickup.vy += randomBetween(-18, 18, random)
      return
    }
  }

  if (input.pickups.length >= input.maxPickups) {
    const xpIndex = input.pickups.findIndex((pickup) => pickup.kind === 'xp')
    if (xpIndex >= 0) input.pickups.splice(xpIndex, 1)
    else input.pickups.shift()
  }

  const angle = random() * TAU
  const speed = randomBetween(pickupBalance.scatterSpeedMin, pickupBalance.scatterSpeedMax, random)
  input.pickups.push({
    kind: input.kind,
    x: input.x,
    y: input.y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    value: input.value,
    radius: pickupRadius(input.kind),
    life: input.kind === 'xp' ? pickupBalance.xp.lifeSeconds : pickupBalance.persistentLifeSeconds,
    color: pickupColor(input.kind)
  })
}

interface PickupPlayer {
  x: number
  y: number
  radius: number
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
      const strength = pickupMagnetStrength(pickup.kind, input.magnetInput)
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
