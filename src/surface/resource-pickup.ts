import { powerupBalance } from '../powerup-balance'
import type { SurfaceResourceKind } from '../surface-balance'

export interface SurfacePickupBuild {
  cargo: number
  suitHealth: number
}

export interface SurfacePickupResource {
  kind: SurfaceResourceKind
  value: number
}

export interface SurfacePickupResult {
  scrap: number
  crystal: number
  score: number
  mutationXp: number
  repair: number
  cache: boolean
}

export function resolveSurfaceResourcePickup(input: {
  resource: SurfacePickupResource
  build: SurfacePickupBuild
}): SurfacePickupResult {
  const result: SurfacePickupResult = {
    scrap: 0,
    crystal: 0,
    score: 0,
    mutationXp: 0,
    repair: 0,
    cache: false
  }

  if (input.resource.kind === 'crystal') {
    result.crystal = cargoScaledValue(input.resource.value, input.build.cargo)
    result.score = input.resource.value * 12
    result.mutationXp = input.resource.value
  } else if (input.resource.kind === 'scrap') {
    result.scrap = cargoScaledValue(input.resource.value, input.build.cargo)
    result.score = result.scrap
  } else if (input.resource.kind === 'repair') {
    result.repair = input.resource.value * (1 + input.build.suitHealth * powerupBalance.upgradeApply.suitRepairBonusPerRank)
  } else if (input.resource.kind === 'cache') {
    result.cache = true
  }

  return result
}

function cargoScaledValue(value: number, cargoRank: number) {
  return Math.ceil(value * (1 + cargoRank * powerupBalance.upgradeApply.cargoResourceBonusPerRank))
}
