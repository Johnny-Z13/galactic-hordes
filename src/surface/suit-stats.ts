import { clamp } from '../math-utils'
import { powerupBalance } from '../powerup-balance'

export interface SurfaceSuitBuild {
  suitHealth: number
  suitO2: number
  suitBlaster: number
}

export function surfaceMaxHealth(build: SurfaceSuitBuild) {
  return powerupBalance.surface.baseHealth + build.suitHealth * powerupBalance.surface.healthPerSuitRank
}

export function surfaceMaxOxygen(build: SurfaceSuitBuild) {
  return powerupBalance.surface.baseOxygen + build.suitO2 * powerupBalance.surface.oxygenPerSuitRank
}

export function surfaceLowOxygenRatio(build: SurfaceSuitBuild) {
  return build.suitO2 >= powerupBalance.surface.lowOxygenSuitThreshold
    ? powerupBalance.surface.lowOxygenRatioUpgraded
    : powerupBalance.surface.lowOxygenRatioBase
}

export function surfaceGunDamage(build: SurfaceSuitBuild) {
  return powerupBalance.surface.baseGunDamage + build.suitBlaster * powerupBalance.surface.gunDamagePerBlasterRank
}

export function surfaceGunCooldown(build: SurfaceSuitBuild) {
  return clamp(
    powerupBalance.surface.baseGunCooldown - build.suitBlaster * powerupBalance.surface.gunCooldownPerBlasterRank,
    powerupBalance.surface.minGunCooldown,
    powerupBalance.surface.baseGunCooldown
  )
}

export function surfaceGunSpeed(build: SurfaceSuitBuild) {
  return powerupBalance.surface.baseGunSpeed + build.suitBlaster * powerupBalance.surface.gunSpeedPerBlasterRank
}
