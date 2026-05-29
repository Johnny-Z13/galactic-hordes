import { powerupBalance } from './powerup-balance'

export interface ShipFlightStatBuild {
  baseSpeed: number
  engine: number
  nav: number
}

export interface ShipFlightStats {
  acceleration: number
  maxSpeed: number
}

export function resolveShipFlightStats(build: ShipFlightStatBuild): ShipFlightStats {
  return {
    acceleration: powerupBalance.ship.accelerationBase
      + build.engine * powerupBalance.ship.accelerationPerEngineRank
      + build.nav * powerupBalance.ship.accelerationPerNavRank,
    maxSpeed: build.baseSpeed
      + build.engine * powerupBalance.ship.maxSpeedPerEngineRank
      + build.nav * powerupBalance.ship.maxSpeedPerNavRank
  }
}
