import { applyMutationXp } from './mutation-progress'
import { pickupBalance, powerupBalance } from './powerup-balance'
import { runBalance } from './run-balance'
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

export interface PickupCollectionStats {
  score: number
  level: number
  xp: number
  nextXp: number
}

export interface PickupCollectionPlayer {
  hull: number
  maxHull: number
  pickupAbsorbPulse: number
}

export interface PickupCollectionArtifact {
  id: string
  kind: 'cache'
  title: string
  detail: string
  source: string
  color: string
  icon: number
}

export interface CollectPickupInput {
  pickup: Pickup
  stats: PickupCollectionStats
  player: PickupCollectionPlayer
  magnetRank: number
  maxMagnetRank: number
}

export interface CollectPickupResult {
  stats: PickupCollectionStats
  player: PickupCollectionPlayer
  magnetRank: number
  bankedSignals: number
  bankMessage?: string
  toast?: string
  extendPickupLifeSeconds?: number
  artifact?: PickupCollectionArtifact
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

export function collectPickup(input: CollectPickupInput): CollectPickupResult {
  const stats = { ...input.stats }
  const player = {
    ...input.player,
    pickupAbsorbPulse: Math.max(input.player.pickupAbsorbPulse, 0.34)
  }
  const result: CollectPickupResult = {
    stats,
    player,
    magnetRank: input.magnetRank,
    bankedSignals: 0
  }

  if (input.pickup.kind === 'xp') {
    stats.score += input.pickup.value
    result.bankedSignals = applyMutationXp(stats, input.pickup.value)
    if (result.bankedSignals > 0) result.bankMessage = 'MUTATION SIGNAL BANKED. LAND TO INSTALL IT.'
  } else if (input.pickup.kind === 'repair') {
    player.hull = clamp(player.hull + input.pickup.value, 0, player.maxHull)
  } else if (input.pickup.kind === 'magnet') {
    result.extendPickupLifeSeconds = 2
    result.magnetRank = clamp(
      input.magnetRank + powerupBalance.upgradeApply.magnetPickupRanks,
      0,
      input.maxMagnetRank
    )
    // The magnet pickup grants a permanent +1 magnet rank (capped). Toast reads honestly
    // rather than implying a temporary effect the code never reverts.
    result.toast = input.magnetRank >= input.maxMagnetRank ? 'SIGNAL MAGNET AT MAX RANGE' : 'SIGNAL MAGNET RANGE BOOSTED'
  } else if (input.pickup.kind === 'chest') {
    result.artifact = {
      id: 'cache:treasure-core',
      kind: 'cache',
      title: 'Treasure Core',
      detail: 'A space broadcast cache carrying concentrated rewards.',
      source: 'Space cache telemetry',
      color: '#70a8ff',
      icon: 73
    }
    result.bankedSignals = 1
    result.bankMessage = 'TREASURE CORE BANKED. INSTALL IT WHEN YOU BOARD.'
    stats.score += runBalance.scoring.treasureCoreBase + stats.level * runBalance.scoring.treasureCorePerLevel
  }

  return result
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
