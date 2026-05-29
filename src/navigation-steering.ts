import { angleLerp, len } from './math-utils'

export interface NavigationMove {
  x: number
  y: number
}

export interface NavigationHeading {
  active: boolean
  heading: number
}

export function isManualNavigationActive(input: {
  move: NavigationMove
  moveActive: boolean
}) {
  return input.moveActive && Math.abs(input.move.x) + Math.abs(input.move.y) > 0.06
}

export function blendedNavigationMove(input: {
  ghost: NavigationMove
  move: NavigationMove
  manualActive: boolean
  navRank: number
}) {
  if (!input.manualActive) return input.ghost
  const influence = 0.58 + input.navRank * 0.035
  const steered = {
    x: input.ghost.x + input.move.x * influence,
    y: input.ghost.y + input.move.y * influence
  }
  const magnitude = len(steered.x, steered.y)
  return magnitude > 1 ? { x: steered.x / magnitude, y: steered.y / magnitude } : steered
}

export function resolvedNavigationHeading(input: {
  active: boolean
  heading: number
  target: number
  blend: number
}): NavigationHeading {
  return {
    active: true,
    heading: input.active ? angleLerp(input.heading, input.target, input.blend) : input.target
  }
}

export function driftNavigationHeading(input: {
  vx: number
  vy: number
  angle: number
  speedThreshold?: number
}) {
  return len(input.vx, input.vy) > (input.speedThreshold ?? 20) ? Math.atan2(input.vy, input.vx) : input.angle
}
