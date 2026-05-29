import { dist2 } from '../math-utils'
import { surfaceRunBalance } from '../surface-balance'
import type { Vec } from '../main-types'
import type { SurfaceAlienModel, SurfaceLoreSiteModel } from './discovery-factory'

export function findNearbySurfaceAlien(input: {
  aliens: SurfaceAlienModel[]
  pilot: Vec
}): SurfaceAlienModel | null {
  return input.aliens.find((alien) => (
    !alien.resolved
    && Math.sqrt(dist2(alien, input.pilot)) < alien.radius + surfaceRunBalance.alien.interactionRadiusBonus
  )) ?? null
}

export function findNearbySurfaceLoreSite(input: {
  loreSites: SurfaceLoreSiteModel[]
  pilot: Vec
}): SurfaceLoreSiteModel | null {
  return input.loreSites.find((site) => (
    !site.resolved
    && Math.sqrt(dist2(site, input.pilot)) < site.radius + surfaceRunBalance.lore.interactionRadiusBonus
  )) ?? null
}
