import type { Vec } from './main-types'

export interface SpawnEntryPing {
  x: number
  y: number
  color: string
  giant: boolean
  life: number
  maxLife: number
  radius: number
}

export function createSpawnEntryPing(input: {
  x: number
  y: number
  color: string
  giant: boolean
}): SpawnEntryPing {
  const maxLife = input.giant ? 1.05 : 0.58
  return {
    x: input.x,
    y: input.y,
    color: input.color,
    giant: input.giant,
    life: maxLife,
    maxLife,
    radius: input.giant ? 62 : 34
  }
}

export function advanceSpawnEntryPings(input: {
  pings: SpawnEntryPing[]
  dt: number
}) {
  for (let i = input.pings.length - 1; i >= 0; i -= 1) {
    input.pings[i].life -= input.dt
    if (input.pings[i].life <= 0) input.pings.splice(i, 1)
  }
}

export function spawnEntryPingScreenPoint(input: {
  screen: Vec
  width: number
  height: number
  margin: number
}): Vec & { offscreen: boolean } {
  const x = clamp(input.screen.x, input.margin, input.width - input.margin)
  const y = clamp(input.screen.y, input.margin, input.height - input.margin)
  return {
    x,
    y,
    offscreen: x !== input.screen.x || y !== input.screen.y
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
