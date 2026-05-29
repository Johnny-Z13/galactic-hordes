import { dist2 } from './math-utils'
import type { Pickup } from './pickups'
import { powerupBalance } from './powerup-balance'

export interface NavigationPickupPlayer {
  x: number
  y: number
}

export interface BestNavigationPickupInput {
  pickups: readonly Pickup[]
  player: NavigationPickupPlayer
  navRank: number
  magnetRank: number
}

function navigationPickupValue(kind: Pickup['kind']) {
  if (kind === 'chest') return 9
  if (kind === 'core') return 7
  if (kind === 'repair') return 5
  if (kind === 'magnet') return 4
  return 1
}

export function bestNavigationPickup(input: BestNavigationPickupInput) {
  let best: Pickup | null = null
  let bestScore = 0
  const reach = powerupBalance.ship.navPickupReachBase
    + input.navRank * powerupBalance.ship.navPickupReachPerNavRank
    + input.magnetRank * powerupBalance.ship.navPickupReachPerMagnetRank
  const reach2 = reach * reach
  for (const pickup of input.pickups) {
    const d = dist2(pickup, input.player)
    if (d > reach2) continue
    const score = navigationPickupValue(pickup.kind) / Math.max(powerupBalance.ship.navPickupMinScoreDistance, d)
    if (score > bestScore) {
      bestScore = score
      best = pickup
    }
  }
  return best
}
