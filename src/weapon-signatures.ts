import { powerupBalance, type UpgradeId } from './powerup-balance'

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

export interface WeaponHudReadout {
  name: string
  tags: string[]
  text: string
}

export interface WeaponHudReadoutInput {
  build: Partial<Record<UpgradeId, number>>
  evolved: ReadonlySet<string>
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

export const weaponHudReadout = ({ build, evolved }: WeaponHudReadoutInput): WeaponHudReadout => {
  const evolvedName = evolvedWeaponName(evolved)
  const branch = evolvedName ? null : strongestWeaponBranch(build)
  const name = evolvedName ?? branch?.name ?? 'Pulse Cannon'
  const primaryTag = branch?.tag ?? null
  const tags = weaponHudTags(build, evolved, primaryTag)
  const safeTags = tags.length ? tags : [branch || evolvedName ? 'ONLINE' : 'BASE']
  return {
    name,
    tags: safeTags,
    text: `${name} // ${safeTags.join(' ')}`
  }
}

function evolvedWeaponName(evolved: ReadonlySet<string>) {
  if (evolved.has('rapid')) return 'Choir Cannon'
  if (evolved.has('rail')) return 'Solar Lance'
  if (evolved.has('rift')) return 'Black Needle'
  if (evolved.has('orbit')) return 'Gravity Halo'
  if (evolved.has('split')) return 'Shatter Prism'
  if (evolved.has('chain')) return 'Storm Liturgy'
  if (evolved.has('echo')) return 'Resonance Wake'
  if (evolved.has('mine')) return 'Comet Net'
  return null
}

function strongestWeaponBranch(build: Partial<Record<UpgradeId, number>>): { name: string; tag: string } | null {
  if ((build.rail ?? 0) > 0) return { name: 'Rail Lattice', tag: 'RAIL' }
  if ((build.rift ?? 0) > 0) return { name: 'Rift Needle', tag: 'NEEDLE' }
  if ((build.orbit ?? 0) > 0) return { name: 'Option Orbs', tag: 'ORBS' }
  if ((build.split ?? 0) > 0) return { name: 'Prism Barrel', tag: 'FAN' }
  if ((build.chain ?? 0) > 0) return { name: 'Static Arc', tag: 'ARC' }
  if ((build.rear ?? 0) > 0) return { name: 'Rear Gun', tag: 'REAR' }
  return null
}

function weaponHudTags(build: Partial<Record<UpgradeId, number>>, evolved: ReadonlySet<string>, primaryTag: string | null): string[] {
  const candidates: string[] = []
  if (evolved.size > 0) candidates.push('EVOLVED')
  if ((build.rapid ?? 0) >= 5 || evolved.has('rapid')) candidates.push('VOLLEY')
  if (evolved.has('rail')) candidates.push('RAIL')
  if (evolved.has('rift')) candidates.push('NEEDLE')
  if (evolved.has('orbit')) candidates.push('ORBS')
  if (evolved.has('split')) candidates.push('FAN')
  if (evolved.has('chain')) candidates.push('ARC')
  if ((build.split ?? 0) > 0 || evolved.has('split')) candidates.push('FAN')
  if ((build.rail ?? 0) > 0 || evolved.has('rail')) candidates.push('RAIL')
  if ((build.rift ?? 0) > 0 || evolved.has('rift')) candidates.push('NEEDLE')
  if ((build.chain ?? 0) > 0 || evolved.has('chain')) candidates.push('ARC')
  if ((build.orbit ?? 0) > 0 || evolved.has('orbit')) candidates.push('ORBS')
  if ((build.rear ?? 0) > 0) candidates.push('REAR')
  if ((build.pierce ?? 0) >= 2) candidates.push('PIERCE')
  if ((build.heat ?? 0) > 0) candidates.push('HEAT')
  if ((build.echo ?? 0) >= 2 || evolved.has('echo')) candidates.push('ECHO')
  return candidates.filter((tag, index) => tag !== primaryTag && candidates.indexOf(tag) === index).slice(0, 3)
}
