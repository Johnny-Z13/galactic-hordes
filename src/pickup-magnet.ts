import { powerupBalance } from './powerup-balance'

export type PickupMagnetKind = 'xp' | 'repair' | 'magnet' | 'core' | 'chest'

export interface PickupMagnetInput {
  magnetLevel: number
  limitMagnet: number
  hasHungryCompass: boolean
  elapsed?: number
}

const hasOpeningXpAssist = (input?: PickupMagnetInput) => input?.elapsed !== undefined && input.elapsed <= powerupBalance.pickupMagnet.openingXpAssistSeconds

export const pickupMagnetRange = (kind: PickupMagnetKind, input: PickupMagnetInput) => {
  const balance = powerupBalance.pickupMagnet
  const compass = input.hasHungryCompass ? balance.hungryCompassBonus : 0
  const base = balance.baseRange + input.magnetLevel * balance.rangePerMagnetRank + input.limitMagnet * balance.rangePerLimitRank + compass
  if (kind !== 'xp') return base
  const openingAssist = hasOpeningXpAssist(input) ? balance.openingXpRangeBonus : 0
  return base + balance.xpBaseBonus + openingAssist + input.magnetLevel * balance.xpRangePerMagnetRank + input.limitMagnet * balance.xpRangePerLimitRank
}

export const pickupMagnetStrength = (kind: PickupMagnetKind, input?: PickupMagnetInput) => {
  if (kind === 'xp') {
    const openingAssist = hasOpeningXpAssist(input) ? powerupBalance.pickupMagnet.openingXpStrengthBonus : 0
    return powerupBalance.pickupMagnet.xpStrength + openingAssist
  }
  if (kind === 'repair') return powerupBalance.pickupMagnet.repairStrength
  return powerupBalance.pickupMagnet.defaultStrength
}
