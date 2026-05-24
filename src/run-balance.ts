export const runBalance = {
  player: {
    radius: 18,
    baseHull: 100,
    baseSpeed: 270
  },
  xp: {
    startingNext: 24,
    growthMultiplier: 1.18,
    growthFlat: 11
  },
  timers: {
    startingSpawnSeconds: 0.4,
    startingBossSeconds: 75,
    startingChestSeconds: 28,
    defaultChestSeconds: 30,
    sectorSpawnSeconds: 0.35,
    finalSectorSpawnSeconds: 0.04,
    sectorBossSeconds: 68,
    requiredBossSeconds: 8,
    planetNodeChestSeconds: 18,
    introSectorBeaconSeconds: 37.5
  },
  spaceChest: {
    respawnMinSeconds: 38,
    respawnRandomSeconds: 20,
    spawnMinDistance: 680,
    spawnMaxDistance: 980
  },
  progression: {
    shipyardHullPerTier: 12,
    shipyardSpeedPerTier: 8,
    hangarCrewScrapPerTier: 25,
    hangarCrewCrystalUnlockTier: 2,
    hangarCrewCrystalPerTier: 2,
    hangarCrewCoreUnlockTier: 4,
    hangarCrewCores: 1
  },
  landing: {
    firstVisitScoreBase: 900,
    firstVisitScorePerPlanet: 300,
    revisitScore: 120,
    surfaceExtractScoreBase: 420,
    surfaceExtractScorePerResource: 45,
    surfaceRevisitScorePerResource: 25,
    firstVisitHullRepair: 45,
    revisitHullRepair: 14,
    landedCooldownSeconds: 2.2,
    orbitInvulnerabilitySeconds: 0.8,
    greenChoirShieldRanks: 1,
    greenChoirShieldCapacity: 22
  },
  station: {
    repairHull: 42,
    workbenchSignals: 1,
    rerolls: 1,
    tradeScrap: 35,
    tradeCrystal: 1
  },
  scoring: {
    treasureCoreBase: 250,
    treasureCorePerLevel: 35,
    duplicateRelicScore: 250,
    relicBaseScore: 500,
    relicScorePerOwned: 120,
    loreBaseScore: 260,
    loreScorePerLevel: 35,
    surfaceBossScore: 1200,
    surfaceThreatScore: 160
  }
} as const

export const nextXpThreshold = (currentThreshold: number) => (
  Math.floor(currentThreshold * runBalance.xp.growthMultiplier + runBalance.xp.growthFlat)
)
