import { scaledSurfaceDamage, scaledSurfaceHp, scaledSurfaceSpeed, surfaceThreatBalance } from '../game-balance'
import { clamp, len, norm, TAU } from '../math-utils'
import { surfacePilotCollisionRadius } from '../surface-pilot'
import { surfaceThreatMotionBalance, type SurfaceThreatBehavior } from '../surface-balance'

export interface SurfaceThreatBehaviorModel {
  x: number
  y: number
  vx: number
  vy: number
  hp: number
  radius: number
  phase: number
  color: string
  hit: number
  boss?: boolean
  behavior?: SurfaceThreatBehavior
  behaviorCooldown?: number
  splitChild?: boolean
}

export interface SurfacePilotThreatTarget {
  x: number
  y: number
  invuln?: number
}

export interface SurfaceThreatBounds {
  width: number
  height: number
}

export interface SurfaceThreatMotionResult {
  contactDamage: number | null
  blinkBurst: { x: number; y: number; color: string; count: number; speed: number } | null
}

export function updateSurfaceThreatMotion(input: {
  threat: SurfaceThreatBehaviorModel
  pilot: SurfacePilotThreatTarget
  surface: SurfaceThreatBounds
  dt: number
  random?: () => number
}): SurfaceThreatMotionResult {
  const { threat, pilot, surface, dt } = input
  const random = input.random ?? Math.random
  threat.phase += dt
  threat.hit -= dt
  const toPilot = norm(pilot.x - threat.x, pilot.y - threat.y)
  const blinkBurst = steerSurfaceThreat(threat, pilot, toPilot, dt, random)
  threat.vx *= Math.pow(surfaceThreatMotionBalance.frictionBase, dt)
  threat.vy *= Math.pow(surfaceThreatMotionBalance.frictionBase, dt)
  threat.x = clamp(threat.x + threat.vx * dt, surfaceThreatMotionBalance.edgePadding, surface.width - surfaceThreatMotionBalance.edgePadding)
  threat.y = clamp(threat.y + threat.vy * dt, surfaceThreatMotionBalance.edgePadding, surface.height - surfaceThreatMotionBalance.edgePadding)
  const rr = threat.radius + surfacePilotCollisionRadius()
  const contactDamage =
    (threat.x - pilot.x) ** 2 + (threat.y - pilot.y) ** 2 < rr * rr && (pilot.invuln ?? 0) <= 0
      ? scaledSurfaceDamage(threat.boss ? surfaceThreatBalance.boss.contactDamage : surfaceThreatBalance.generic.contactDamage)
      : null
  return { contactDamage, blinkBurst }
}

function steerSurfaceThreat(
  threat: SurfaceThreatBehaviorModel,
  pilot: SurfacePilotThreatTarget,
  toPilot: { x: number; y: number },
  dt: number,
  random: () => number
) {
  const accel = scaledSurfaceSpeed(threat.boss ? surfaceThreatBalance.boss.acceleration : surfaceThreatBalance.generic.acceleration)
  const maxSpeed = scaledSurfaceSpeed(threat.boss ? surfaceThreatBalance.boss.maxSpeed : surfaceThreatBalance.generic.maxSpeed)
  const behavior = threat.behavior ?? 'chaser'
  let blinkBurst: SurfaceThreatMotionResult['blinkBurst'] = null
  if (behavior === 'orbiter') {
    const distance = len(pilot.x - threat.x, pilot.y - threat.y)
    const radial =
      distance > surfaceThreatMotionBalance.orbit.outerDistance ? surfaceThreatMotionBalance.orbit.pull :
      distance < surfaceThreatMotionBalance.orbit.innerDistance ? surfaceThreatMotionBalance.orbit.repel :
      surfaceThreatMotionBalance.orbit.hold
    threat.vx += (toPilot.x * radial - toPilot.y * surfaceThreatMotionBalance.orbit.tangent) * accel * dt
    threat.vy += (toPilot.y * radial + toPilot.x * surfaceThreatMotionBalance.orbit.tangent) * accel * dt
  } else if (behavior === 'blinker') {
    threat.behaviorCooldown = (threat.behaviorCooldown ?? randomRange(surfaceThreatMotionBalance.blink.cooldownMin, surfaceThreatMotionBalance.blink.cooldownMax, random)) - dt
    const distance = len(pilot.x - threat.x, pilot.y - threat.y)
    if (threat.behaviorCooldown <= 0 && distance > surfaceThreatMotionBalance.blink.minDistance) {
      threat.vx += (toPilot.x * surfaceThreatMotionBalance.blink.dashSpeedScale - toPilot.y * surfaceThreatMotionBalance.blink.sideSpeedScale) * maxSpeed
      threat.vy += (toPilot.y * surfaceThreatMotionBalance.blink.dashSpeedScale + toPilot.x * surfaceThreatMotionBalance.blink.sideSpeedScale) * maxSpeed
      threat.behaviorCooldown = randomRange(surfaceThreatMotionBalance.blink.cooldownMin, surfaceThreatMotionBalance.blink.cooldownMax, random)
      blinkBurst = { x: threat.x, y: threat.y, color: threat.color, count: 8, speed: 120 }
    } else {
      threat.vx += toPilot.x * accel * surfaceThreatMotionBalance.blink.driftAccelerationScale * dt
      threat.vy += toPilot.y * accel * surfaceThreatMotionBalance.blink.driftAccelerationScale * dt
    }
  } else {
    threat.vx += toPilot.x * accel * dt
    threat.vy += toPilot.y * accel * dt
  }
  limitSurfaceThreatSpeed(threat, maxSpeed)
  return blinkBurst
}

function limitSurfaceThreatSpeed(threat: SurfaceThreatBehaviorModel, maxSpeed: number): void {
  const speed = len(threat.vx, threat.vy)
  if (speed <= maxSpeed) return
  threat.vx = (threat.vx / speed) * maxSpeed
  threat.vy = (threat.vy / speed) * maxSpeed
}

export function spawnSurfaceSplitterChildren(input: {
  threat: SurfaceThreatBehaviorModel
  surface: SurfaceThreatBounds
  time: number
  random?: () => number
}): SurfaceThreatBehaviorModel[] {
  const random = input.random ?? Math.random
  const children: SurfaceThreatBehaviorModel[] = []
  for (let i = 0; i < surfaceThreatMotionBalance.splitter.childCount; i += 1) {
    const angle = (i / surfaceThreatMotionBalance.splitter.childCount) * TAU + input.threat.phase
    const x = clamp(input.threat.x + Math.cos(angle) * surfaceThreatMotionBalance.splitter.childScatter, surfaceThreatMotionBalance.edgePadding, input.surface.width - surfaceThreatMotionBalance.edgePadding)
    const y = clamp(input.threat.y + Math.sin(angle) * surfaceThreatMotionBalance.splitter.childScatter, surfaceThreatMotionBalance.edgePadding, input.surface.height - surfaceThreatMotionBalance.edgePadding)
    const childSpeed = scaledSurfaceSpeed(surfaceThreatBalance.generic.maxSpeed) * surfaceThreatMotionBalance.splitter.childSpeedScale
    children.push({
      x,
      y,
      vx: Math.cos(angle) * childSpeed,
      vy: Math.sin(angle) * childSpeed,
      hp: scaledSurfaceHp(surfaceThreatBalance.generic.swarmBaseHp + input.time * surfaceThreatBalance.generic.swarmHpPerSecond) * surfaceThreatMotionBalance.splitter.childHpScale,
      radius: surfaceThreatBalance.generic.swarmRadius,
      phase: randomRange(0, TAU, random),
      color: input.threat.color,
      hit: 0,
      behavior: 'chaser',
      splitChild: true
    })
  }
  return children
}

function randomRange(min: number, max: number, random: () => number): number {
  return min + random() * (max - min)
}
