import type { SpaceEnemyKind } from './game-balance'

export const spaceEnemyBehavior = {
  global: {
    spawnMinRadius: 620,
    spawnMaxRadius: 980,
    sectorBiasChance: 0.38,
    initialCooldownRandomSeconds: 2,
    velocityDamping: 0.2,
    contactKnockback: 260,
    bulletDespawnDistance: 1900,
    nearbyPlanetArchetypeRadius: 1500
  },
  rewards: {
    xpCount: {
      default: 1,
      advanced: 2,
      brute: 3,
      bulwark: 5,
      warden: 9,
      giant: 11
    },
    xpValue: {
      default: 3,
      highLoadPerDrop: 3,
      brute: 4,
      bulwark: 5,
      warden: 8,
      giant: 9
    }
  },
  splitChild: {
    chance: 0.55,
    count: 3,
    spawnOffset: 24,
    launchSpeed: 160,
    hpBase: 12,
    hpTimeDivisor: 18,
    radius: 10,
    speed: 185,
    value: 3
  },
  chaser: {
    pursuit: 3.4
  },
  splinter: {
    pursuit: 3.4
  },
  brute: {
    pursuit: 2.15,
    maxSpeedMultiplier: 0.84
  },
  shooter: {
    farDistance: 560,
    nearDistance: 360,
    farPull: 1,
    nearPull: -1.35,
    holdPull: 0.1,
    strafe: 0.55,
    spreadUnlockSeconds: 210,
    spreadRadians: 0.18,
    projectileLife: 1.8,
    projectileRadius: 4
  },
  razor: {
    strafe: 5.4,
    pursuit: 0.7,
    dashSideImpulse: 220,
    dashForwardImpulse: 90,
    trailIntensity: 2
  },
  skimmer: {
    farDistance: 650,
    nearDistance: 390,
    farPull: 0.72,
    nearPull: -1.15,
    holdPull: -0.04,
    strafe: 1.28,
    waveFrequency: 3.6,
    waveScale: 0.35,
    spreadRadians: 0.24,
    projectileLife: 1.55,
    projectileRadius: 4.5
  },
  bulwark: {
    farDistance: 620,
    nearDistance: 460,
    farPull: 0.95,
    nearPull: -1.25,
    holdPull: -0.1,
    driftFrequency: 1.6,
    driftScale: 0.65,
    shotCount: 10,
    spinScale: 0.55,
    projectileLife: 1.45,
    projectileRadius: 4
  },
  siphon: {
    farDistance: 720,
    nearDistance: 510,
    farPull: 0.72,
    nearPull: -1.05,
    holdPull: -0.08,
    strafe: 0.95,
    swirlFrequency: 2.4,
    swirlScale: 0.52,
    vortexArms: 2,
    vortexShotsPerArm: 7,
    vortexAngleStep: 0.34,
    vortexSpeedBase: 0.62,
    vortexSpeedStep: 0.055,
    vortexProjectileLife: 2.15,
    vortexProjectileRadius: 5
  },
  dreadnought: {
    farDistance: 800,
    nearDistance: 620,
    farPull: 0.75,
    nearPull: -0.8,
    holdPull: -0.04,
    driftFrequency: 1.1,
    driftScale: 0.38,
    broadsideSpreadRadians: 0.13,
    broadsideSideSpeedLoss: 0.035,
    broadsideLife: 2.25,
    broadsideCenterRadius: 7,
    broadsideSideRadius: 5.2,
    rearOffsets: [-0.62, 0.62],
    rearSpeedMultiplier: 0.72,
    rearDamageMultiplier: 0.75,
    rearLife: 2.7,
    rearRadius: 4.8
  },
  cathedral: {
    farDistance: 850,
    nearDistance: 650,
    farPull: 0.58,
    nearPull: -0.9,
    holdPull: -0.02,
    orbitFrequency: 0.9,
    orbitScale: 0.42,
    latticeRings: 3,
    latticeShotsPerRing: 6,
    latticeSpinScale: 1.35,
    latticeRingAngleStep: 0.17,
    latticeSpawnRadiusBase: 0.52,
    latticeSpawnRadiusStep: 0.18,
    latticeSpeedBase: 0.58,
    latticeSpeedStep: 0.16,
    latticeLife: 2.35,
    latticeOuterDamageMultiplier: 1,
    latticeInnerDamageMultiplier: 0.72,
    latticeOuterRadius: 5.4,
    latticeInnerRadius: 4.2,
    aimedOffsets: [-0.2, 0, 0.2],
    aimedSpeedMultiplier: 1.05,
    aimedDamageMultiplier: 1.05,
    aimedLife: 1.8,
    aimedRadius: 4.8
  },
  lancer: {
    chargeRange: 520,
    chargeSpeedBase: 520,
    chargeSpeedPerSecond: 1.2,
    wobbleXFrequency: 3,
    wobbleYFrequency: 2.5,
    wobbleForce: 14
  },
  mine: {
    wobbleXFrequency: 2.1,
    wobbleYFrequency: 1.7,
    wobbleForce: 28,
    triggerRadius: 74
  },
  warden: {
    desiredDistance: 380,
    approachForce: 120,
    retreatForce: -70,
    shotCount: 12,
    projectileLife: 1.2,
    projectileRadius: 4
  }
} as const

export const advancedRewardEnemyKinds: readonly SpaceEnemyKind[] = ['razor', 'skimmer', 'shooter', 'lancer'] as const
