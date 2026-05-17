export interface SurfaceSpawnPoint {
  x: number
  y: number
}

export interface SurfaceSpawnKeepout extends SurfaceSpawnPoint {
  radius: number
}

export interface SurfaceSpawnBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const surfaceThreatSpawnPoint = (
  candidate: SurfaceSpawnPoint,
  keepouts: SurfaceSpawnKeepout[],
  bounds: SurfaceSpawnBounds,
  clearance: number,
  fallbackAngle = 0
): SurfaceSpawnPoint => {
  let x = clamp(candidate.x, bounds.minX, bounds.maxX)
  let y = clamp(candidate.y, bounds.minY, bounds.maxY)

  for (let pass = 0; pass < 4; pass += 1) {
    let adjusted = false
    for (let i = 0; i < keepouts.length; i += 1) {
      const keepout = keepouts[i]
      const required = keepout.radius + clearance + 0.001
      const dx = x - keepout.x
      const dy = y - keepout.y
      const distance = Math.hypot(dx, dy)
      if (distance >= required) continue
      const angle = distance > 0.001 ? Math.atan2(dy, dx) : fallbackAngle + i * 0.71
      x = clamp(keepout.x + Math.cos(angle) * required, bounds.minX, bounds.maxX)
      y = clamp(keepout.y + Math.sin(angle) * required, bounds.minY, bounds.maxY)
      adjusted = true
    }
    if (!adjusted) break
  }

  return { x, y }
}
