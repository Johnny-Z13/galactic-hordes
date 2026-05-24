export const runBalance = {
  player: {
    radius: 18,
    baseHull: 100,
    baseSpeed: 270
  },
  xp: {
    startingNext: 42,
    growthMultiplier: 1.24,
    growthFlat: 18
  },
  timers: {
    startingSpawnSeconds: 0.8,
    startingBossSeconds: 86,
    startingChestSeconds: 28,
    defaultChestSeconds: 38,
    sectorSpawnSeconds: 0.7,
    finalSectorSpawnSeconds: 0.08,
    sectorBossSeconds: 76,
    requiredBossSeconds: 8,
    planetNodeChestSeconds: 26,
    introSectorBeaconSeconds: 43
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
    firstVisitHullRepair: 30,
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
