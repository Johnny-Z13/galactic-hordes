import type { Vec } from './main-types'

export interface PlayerAimInput {
  aimX: number
  aimY: number
  previousAimAngle: number
  player: Vec
  mouseWorld?: Vec | null
  autoTarget?: Vec | null
  isPlaying: boolean
}

export interface PlayerAimResult {
  aiming: boolean
  aimAngle: number
  autoFire: boolean
}

export const resolvePlayerAim = ({
  aimX,
  aimY,
  previousAimAngle,
  player,
  mouseWorld,
  autoTarget,
  isPlaying
}: PlayerAimInput): PlayerAimResult => {
  let aiming = Math.abs(aimX) + Math.abs(aimY) > 0
  let aimAngle = aiming ? Math.atan2(aimY, aimX) : previousAimAngle

  if (!aiming && mouseWorld) {
    aimAngle = Math.atan2(mouseWorld.y - player.y, mouseWorld.x - player.x)
    aiming = true
  }

  let autoFire = false
  if (!aiming && isPlaying && autoTarget) {
    aimAngle = Math.atan2(autoTarget.y - player.y, autoTarget.x - player.x)
    aiming = true
    autoFire = true
  }

  return { aiming, aimAngle, autoFire }
}
