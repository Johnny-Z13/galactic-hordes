import { powerupBalance } from '../powerup-balance'
import { createPlayerDamageFlash, type PlayerDamageFlash } from './player-damage-feedback'

export interface ShipDamagePlayer {
  hull: number
  maxHull: number
  shield: number
  shieldDelay: number
  invuln: number
}

export interface SurfaceDamagePilot {
  health: number
  maxHealth: number
  invuln: number
}

export interface DamageResult {
  hullDamage: number
  shieldDamage: number
  flash: PlayerDamageFlash
}

export interface SurfaceDamageResult extends DamageResult {
  suitCritical: boolean
}

export function damageShipPlayer(input: {
  player: ShipDamagePlayer
  amount: number
  phaseRank: number
}): DamageResult | null {
  const { player, amount, phaseRank } = input
  if (player.invuln > 0) return null

  player.invuln = 0.42
  player.shieldDelay = 2.4
  let remaining = Math.max(1, amount * (1 - phaseRank * powerupBalance.upgradeApply.phaseShipDamageReductionPerRank))
  let shieldDamage = 0
  if (player.shield > 0) {
    const used = Math.min(player.shield, remaining)
    player.shield -= used
    remaining -= used
    shieldDamage = used
  }
  const hullDamage = remaining
  player.hull -= hullDamage

  return {
    hullDamage,
    shieldDamage,
    flash: createPlayerDamageFlash({
      hullRatio: player.hull / player.maxHull,
      hullDamage,
      shieldDamage,
      surface: false
    })
  }
}

export function damageSurfacePilot(input: {
  pilot: SurfaceDamagePilot
  amount: number
  phaseRank: number
}): SurfaceDamageResult | null {
  const { pilot, amount, phaseRank } = input
  if (pilot.invuln > 0) return null

  pilot.invuln = 0.65
  const hullDamage = Math.max(1, amount * (1 - phaseRank * powerupBalance.upgradeApply.phaseSurfaceDamageReductionPerRank))
  pilot.health = Math.max(0, pilot.health - hullDamage)

  return {
    hullDamage,
    shieldDamage: 0,
    suitCritical: pilot.health <= 0,
    flash: createPlayerDamageFlash({
      hullRatio: pilot.health / pilot.maxHealth,
      hullDamage,
      shieldDamage: 0,
      surface: true
    })
  }
}
