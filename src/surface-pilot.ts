export const SURFACE_PILOT_SIZE_SCALE = 0.65
export const SURFACE_PILOT_BASE_COLLISION_RADIUS = 13
export const SURFACE_PILOT_BASE_SPAWN_KEEPOUT = 26
export const SURFACE_PILOT_BASE_MUZZLE_OFFSET = 19

export const surfacePilotSpriteScale = (baseScale: number) => baseScale * SURFACE_PILOT_SIZE_SCALE
export const surfacePilotCollisionRadius = () => Math.round(SURFACE_PILOT_BASE_COLLISION_RADIUS * SURFACE_PILOT_SIZE_SCALE)
export const surfacePilotSpawnKeepout = () => Math.round(SURFACE_PILOT_BASE_SPAWN_KEEPOUT * SURFACE_PILOT_SIZE_SCALE)
export const surfacePilotMuzzleOffset = () => Math.round(SURFACE_PILOT_BASE_MUZZLE_OFFSET * SURFACE_PILOT_SIZE_SCALE)
