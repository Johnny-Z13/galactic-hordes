import type { Vec } from './main-types'

// Shared math helpers relocated verbatim from main.ts so that extracted modules
// (e.g. enemy-behaviors.ts) can use them without importing from main.ts (which
// would create a circular import). main.ts now imports these from here.
export const TAU = Math.PI * 2

export const dist2 = (a: Vec, b: Vec) => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

export const len = (x: number, y: number) => Math.hypot(x, y)

export const norm = (x: number, y: number): Vec => {
  const l = len(x, y) || 1
  return { x: x / l, y: y / l }
}
