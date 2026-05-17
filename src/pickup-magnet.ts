export type PickupMagnetKind = 'xp' | 'repair' | 'magnet' | 'core' | 'chest'

interface PickupMagnetInput {
  magnetLevel: number
  limitMagnet: number
  hasHungryCompass: boolean
}

export const pickupMagnetRange = (kind: PickupMagnetKind, input: PickupMagnetInput) => {
  const compass = input.hasHungryCompass ? 120 : 0
  const base = 105 + input.magnetLevel * 62 + input.limitMagnet * 12 + compass
  if (kind !== 'xp') return base
  return base + 64 + input.magnetLevel * 16 + input.limitMagnet * 4
}

export const pickupMagnetStrength = (kind: PickupMagnetKind) => {
  if (kind === 'xp') return 980
  return 540
}
