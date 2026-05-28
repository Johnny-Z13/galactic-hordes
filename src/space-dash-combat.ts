import { damageFeedbackConfig } from './combat/damage-feedback'
import type { Enemy } from './main-types'
import { powerupBalance } from './powerup-balance'

export interface DashRamPlayerState {
  dashTime: number
  dashX: number
  dashY: number
}

export interface DashRamInput {
  enemy: Enemy
  player: DashRamPlayerState
  phaseRank: number
  engineRank: number
}

export interface DashRamResult {
  killed: boolean
  damage: number
  force: number
  burst: {
    x: number
    y: number
    color: string
    count: number
    speed: number
  }
}

export function applyDashRam(input: DashRamInput): DashRamResult | null {
  if (input.player.dashTime <= 0 || input.phaseRank <= 0) return null

  const force = powerupBalance.dash.ramForceBase + input.phaseRank * powerupBalance.dash.ramForcePerPhaseRank
  const damage = powerupBalance.dash.ramDamageBase
    + input.phaseRank * powerupBalance.dash.ramDamagePerPhaseRank
    + input.engineRank * powerupBalance.dash.ramDamagePerEngineRank

  input.enemy.hp -= damage
  input.enemy.flash = Math.max(input.enemy.flash, damageFeedbackConfig.hitFlash.dashRamDurationSeconds)
  input.enemy.vx += input.player.dashX * force
  input.enemy.vy += input.player.dashY * force

  return {
    killed: input.enemy.hp <= 0,
    damage,
    force,
    burst: {
      x: input.enemy.x,
      y: input.enemy.y,
      color: '#b990ff',
      count: 5 + input.phaseRank,
      speed: 130 + input.phaseRank * 20
    }
  }
}
