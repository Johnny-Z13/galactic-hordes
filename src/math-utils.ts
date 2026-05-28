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

export const hash32 = (x: number, y: number, salt = 0) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(salt, 2246822519)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return (h ^ (h >>> 16)) >>> 0
}

export const rngFrom = (seed: number) => {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
