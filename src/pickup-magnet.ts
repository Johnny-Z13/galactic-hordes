import { powerupBalance } from './powerup-balance'

export type PickupMagnetKind = 'xp' | 'repair' | 'magnet' | 'core' | 'chest'

interface PickupMagnetInput {
  magnetLevel: number
  limitMagnet: number
  hasHungryCompass: boolean
}

export const pickupMagnetRange = (kind: PickupMagnetKind, input: PickupMagnetInput) => {
  const balance = powerupBalance.pickupMagnet
  const compass = input.hasHungryCompass ? balance.hungryCompassBonus : 0
  const base = balance.baseRange + input.magnetLevel * balance.rangePerMagnetRank + input.limitMagnet * balance.rangePerLimitRank + compass
  if (kind !== 'xp') return base
  return base + balance.xpBaseBonus + input.magnetLevel * balance.xpRangePerMagnetRank + input.limitMagnet * balance.xpRangePerLimitRank
}

export const pickupMagnetStrength = (kind: PickupMagnetKind) => {
  if (kind === 'xp') return powerupBalance.pickupMagnet.xpStrength
  return powerupBalance.pickupMagnet.defaultStrength
}
