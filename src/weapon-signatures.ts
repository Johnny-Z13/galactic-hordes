import { powerupBalance } from './powerup-balance'

export type StarterSignatureId = 'rapid' | 'split' | 'engine' | 'magnet' | 'shield' | 'nav' | 'rail' | 'rift' | 'heat'

export interface PulseVolleyInput {
  rapidRank: number
  fireSerial: number
  evolved: boolean
}

export interface OptionOrbProfileInput {
  orbitRank: number
  fireSerial: number
  evolved: boolean
}

export interface OptionOrbProfile {
  count: number
  fires: boolean
  damageMultiplier: number
  pierce: number
}

export interface RearGunProfile {
  shots: number
  spread: number
  damageMultiplier: number
  speedMultiplier: number
  pierce: number
}

export interface StarterSignatureFlags {
  pulseWake: boolean
  prismFins: boolean
  engineChevrons: boolean
  salvageField: boolean
  shieldHalo: boolean
  eliteLance: boolean
  heatBloom: boolean
  signatureCount: number
}

export const pulseVolleyCount = ({ rapidRank, fireSerial, evolved }: PulseVolleyInput) => {
  if (evolved) return 3
  return rapidRank >= 5 && fireSerial % 5 === 0 ? 2 : 1
}

export const optionOrbProfile = (input: OptionOrbProfileInput): OptionOrbProfile => {
  const rank = Math.max(0, Math.floor(input.orbitRank))
  if (rank <= 0) return { count: 0, fires: false, damageMultiplier: 0, pierce: 0 }

  const baseCount = Math.min(3, 1 + Math.floor((rank - 1) / 2))
  const count = baseCount + (input.evolved ? 1 : 0)
  const fires = input.evolved || rank >= 2 || input.fireSerial % 2 === 0
  return {
    count,
    fires,
    damageMultiplier: 0.26 + rank * 0.05 + (input.evolved ? 0.18 : 0),
    pierce: (rank >= 4 ? 1 : 0) + (input.evolved ? 1 : 0)
  }
}

export const rearGunProfile = (rearRank: number): RearGunProfile => {
  const rank = Math.max(0, Math.floor(rearRank))
  if (rank <= 0) return { shots: 0, spread: 0, damageMultiplier: 0, speedMultiplier: 0, pierce: 0 }
  const shots = rank >= powerupBalance.rearGun.twinBarrelRank ? 2 : 1
  return {
    shots,
    spread: shots > 1 ? powerupBalance.rearGun.twinBarrelSpread : 0,
    damageMultiplier: powerupBalance.rearGun.damageMultiplierBase + rank * powerupBalance.rearGun.damageMultiplierPerRank,
    speedMultiplier: powerupBalance.rearGun.speedMultiplierBase + rank * powerupBalance.rearGun.speedMultiplierPerRank,
    pierce: rank >= powerupBalance.rearGun.pierceRank ? 1 : 0
  }
}

export const starterSignatureFlags = (build: Partial<Record<StarterSignatureId, number>>): StarterSignatureFlags => {
  const pulseWake = (build.rapid ?? 0) >= 2
  const prismFins = (build.split ?? 0) >= 1
  const engineChevrons = (build.engine ?? 0) >= 2 || (build.nav ?? 0) >= 1
  const salvageField = (build.magnet ?? 0) >= 1
  const shieldHalo = (build.shield ?? 0) >= 1
  const eliteLance = (build.rail ?? 0) >= 1 || (build.rift ?? 0) >= 1
  const heatBloom = (build.heat ?? 0) >= 1
  return {
    pulseWake,
    prismFins,
    engineChevrons,
    salvageField,
    shieldHalo,
    eliteLance,
    heatBloom,
    signatureCount: [pulseWake, prismFins, engineChevrons, salvageField, shieldHalo, eliteLance, heatBloom].filter(Boolean).length
  }
}
