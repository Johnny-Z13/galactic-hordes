import type { SectorNode } from '../sector-map'
import { BEACON_INTERVAL } from '../return-beacons'
import type { SimRng } from './sim-rng'
import type { SimDeathCause, SimDifficulty } from './sim-types'
import type { SimPolicy } from './sim-policies'

export interface SimSpaceNodeResult {
  nodeSeconds: number
  kills: number
  frontLoadedKills: number
  damageTaken: number
  deathCause: Exclude<SimDeathCause, 'surface'>
}

const pacePressure = {
  safe: 0.62,
  mild: 0.82,
  standard: 1,
  intense: 1.32,
  boss: 1.72
} as const

const difficultyPressure = {
  testEasy: 0.72,
  normal: 1,
  stress: 1.34
} as const satisfies Record<SimDifficulty, number>

const postIntroStationWindowFloor = BEACON_INTERVAL - 30
const asteroidDeathAttributionChance = 0.48
const asteroidDeathRngGate = 0.55

export function simulateSpaceNode(input: {
  node: SectorNode
  policy: SimPolicy
  rng: SimRng
  seconds: number
  difficulty: SimDifficulty
  defensiveRanks: number
}): SimSpaceNodeResult {
  const { node, policy, rng } = input
  const config = node.config
  const pressure = pacePressure[config.pace]
    * config.enemies.spawnMultiplier
    * difficultyPressure[input.difficulty]
    * (1 + config.waves.length * 0.035)
  const hazardPressure = (
    (config.hazards.includes('asteroids') ? 0.32 + (config.hazardConfig.asteroids?.density ?? 0) * 0.06 : 0)
    + (config.hazards.includes('hunterWing') ? 0.2 : 0)
    + (config.hazards.includes('nebula') ? 0.16 : 0)
    + (config.hazards.includes('derelictCache') ? policy.cacheGreed * 0.16 : 0)
  )
  const defense = policy.survivalUpgradeBias * 0.22 + input.defensiveRanks * 0.025
  const riskOffset = policy.riskTolerance * 0.22
  const durationWaveCount = config.templateId === 'safeDrift'
    ? Math.min(config.waves.length, 2)
    : config.waves.length
  const baseSeconds = node.kind === 'final'
    ? 210
    : node.kind === 'boss'
      ? 165
      : node.kind === 'station'
        ? 0
        : 64 + config.depth * 86 + durationWaveCount * 12
  const nodeDurationFloor = node.kind === 'station' || input.seconds === 0 ? 0 : postIntroStationWindowFloor
  const nodeSeconds = Math.max(nodeDurationFloor, Math.round(baseSeconds * (1.04 - policy.routeRush * 0.18) + rng.range(-8, 12)))
  const rawDamage = (pressure + hazardPressure - defense - riskOffset) * rng.range(12, 24)
  const damageTaken = Math.max(0, Math.round(rawDamage))
  const earlyWaveKills = config.waves
    .filter((wave) => wave.atSeconds <= 60)
    .reduce((sum, wave) => sum + Object.values(wave.enemies).reduce((waveSum, count) => waveSum + (count ?? 0), 0), 0)
  const frontLoadedKills = input.seconds === 0
    ? Math.max(0, Math.round((config.enemies.startingSpawns.length * 1.8 + earlyWaveKills * 0.55) * difficultyPressure[input.difficulty] * (0.9 + policy.riskTolerance * 0.18)))
    : 0
  const kills = Math.max(0, Math.round(nodeSeconds * pressure * (0.24 + policy.riskTolerance * 0.1)) + frontLoadedKills)
  let deathCause: SimSpaceNodeResult['deathCause'] = 'none'
  if (damageTaken > 0) {
    const asteroidDeathEligible = config.hazards.includes('asteroids') && hazardPressure > 0.35
    const asteroidDeathRoll = asteroidDeathEligible ? rng.next() : 1
    if (asteroidDeathRoll < asteroidDeathAttributionChance) {
      deathCause = 'hazard'
    } else if (asteroidDeathRoll < asteroidDeathRngGate) {
      deathCause = 'contact'
    } else {
      deathCause = pressure > 1.45 && rng.chance(0.34) ? 'projectile' : 'contact'
    }
  }

  return { nodeSeconds, kills, frontLoadedKills, damageTaken, deathCause }
}
