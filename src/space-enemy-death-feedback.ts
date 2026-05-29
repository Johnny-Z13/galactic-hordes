import type { ExplosionSoundKind } from './audio/audio-director'
import { isGiantEnemyKind, type SpaceEnemyKind } from './space-enemies'

export interface SpaceEnemyDeathFeedbackInput {
  kind: SpaceEnemyKind
  highLoad: boolean
  collisionFxCooldown: number
}

export interface SpaceEnemyDeathFeedbackProfile {
  big: boolean
  playFx: boolean
  boomKind: ExplosionSoundKind
  cameraShake: number
  burstCount: number
  burstSpeed: number
  collisionCooldownSeconds: number
}

export function resolveSpaceEnemyDeathFeedback(input: SpaceEnemyDeathFeedbackInput): SpaceEnemyDeathFeedbackProfile {
  const big = input.kind === 'warden' || input.kind === 'brute' || input.kind === 'bulwark' || isGiantEnemyKind(input.kind)
  return {
    big,
    playFx: big || !input.highLoad || input.collisionFxCooldown <= 0,
    boomKind: big ? 'heavy' : 'small',
    cameraShake: big ? 16 : input.highLoad ? 2 : 5,
    burstCount: big ? 42 : input.highLoad ? 4 : 12,
    burstSpeed: big ? 330 : input.highLoad ? 120 : 150,
    collisionCooldownSeconds: input.highLoad ? 0.04 : 0
  }
}
