import type { WeaponSoundKind } from '../audio/audio-director'

export interface WeaponSoundKindInput {
  rail: boolean
  needle: boolean
  count: number
  splitRank: number
}

export function weaponSoundKindFor(input: WeaponSoundKindInput): WeaponSoundKind {
  if (input.needle) return 'needle'
  if (input.rail) return 'rail'
  if (input.count > 1 || input.splitRank > 0) return 'prism'
  return 'pulse'
}
