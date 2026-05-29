export type Vec = { x: number; y: number }

export function spaceViewportScale(width: number, height: number) {
  if (height > width && width <= 520) return 0.65
  if (width <= 900) return 0.88
  return 1
}

export function spaceProjectileLifeScale(width: number, height: number, scale = spaceViewportScale(width, height)) {
  const visibleWorldWidth = width / scale
  return Math.min(2, Math.max(1, visibleWorldWidth / 640))
}

export function spaceProjectileLifeForOffscreenTravel(
  baseLife: number,
  projectileSpeed: number,
  width: number,
  height: number,
  scale = spaceViewportScale(width, height)
) {
  const visibleWorldWidth = width / scale
  const visibleWorldHeight = height / scale
  const halfDiagonal = Math.hypot(visibleWorldWidth, visibleWorldHeight) / 2
  const offscreenPadding = 80
  const offscreenLife = (halfDiagonal + offscreenPadding) / Math.max(1, projectileSpeed)
  return Math.max(baseLife * spaceProjectileLifeScale(width, height, scale), offscreenLife)
}

export function cameraTargetFor(center: Vec, width: number, height: number, scale: number): Vec {
  return {
    x: center.x - width / (2 * scale),
    y: center.y - height / (2 * scale)
  }
}

export interface SpaceCameraState extends Vec {
  shake: number
}

export function followSpaceCamera(input: {
  camera: SpaceCameraState
  target: Vec
  dt: number
}): SpaceCameraState {
  const ease = Math.max(0, Math.min(1, input.dt * 7))
  return {
    x: input.camera.x + (input.target.x - input.camera.x) * ease,
    y: input.camera.y + (input.target.y - input.camera.y) * ease,
    shake: Math.max(0, input.camera.shake - input.dt * 35)
  }
}

export function worldToScreen(point: Vec, camera: Vec, scale: number): Vec {
  return {
    x: (point.x - camera.x) * scale,
    y: (point.y - camera.y) * scale
  }
}

export function screenToWorld(point: Vec, camera: Vec, scale: number): Vec {
  return {
    x: point.x / scale + camera.x,
    y: point.y / scale + camera.y
  }
}
