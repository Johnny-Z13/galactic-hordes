import './style.css'
import { AudioDirector, type PlanetAudioMood } from './audio/audio-director'
import { sfxSamples } from './audio/sfx-samples'
import { uiClickSoundForButton } from './audio/ui-click-cues'
import { damageFeedbackConfig } from './combat/damage-feedback'
import { advanceImpactPulses, appendImpactPulse, createImpactPulse, createImpactSparkParticle, type ImpactPulse } from './combat/impact-feedback'
import { damageShipPlayer, damageSurfacePilot as damageSuitPilot } from './combat/player-damage-resolution'
import { advancePlayerDamageFlash, type PlayerDamageFlash } from './combat/player-damage-feedback'
import { weaponSoundKindFor } from './combat/weapon-sound'
import collectionIconAtlasUrl from './assets/collection-icon-atlas.png'
import glassMiteOracleSheetUrl from './assets/glass-mite-oracle-sheet-alpha.png'
import planetAlienCatalogUrl from './assets/planet-alien-catalog-alpha.png'
import planetBossCatalogUrl from './assets/planet-boss-catalog-alpha.png'
import spaceEnemyCatalogUrl from './assets/space-enemy-catalog-alpha.png'
import surfaceSpacemanSheetUrl from './assets/surface-spaceman-sheet-alpha.png'
import {
  artifactColor as archiveArtifactColor,
  collectionSlug as archiveCollectionSlug,
  currentRunArchiveRecords as archiveRecordsFromArtifacts,
  orderArtifactArchiveCards,
  recordArtifactDiscovery,
  type ArtifactKind,
  type ArtifactRecord
} from './artifact-archive'
import { collectionCatalog, collectionIconAtlasColumns, collectionIconAtlasRows } from './collection-catalog'
import type { DebriefReport } from './debrief-report'
import {
  activeBalanceProfile,
  balancedSpaceEnemyDefinition,
  pickSpaceEnemyKind,
  scaledBossTimer,
  scaledSpawnTimer,
  spaceSpawnBalance,
  spawnPressureMinutes
} from './game-balance'
import { resolveDashStats } from './dash-stats'
import { navigationCruiseScalar, navigationTrailProfile } from './navigation-cruise'
import { bestNavigationPickup } from './navigation-pickups'
import { canLockPlanetCourse, nearestPlanetCourseTarget, planetCourseLockToast } from './navigation-planet-lock'
import { blendedNavigationMove, isManualNavigationActive } from './navigation-steering'
import { navigationThreatWeaveVector } from './navigation-threat-weave'
import { applyMutationXp } from './mutation-progress'
import { createChunkPlanet, type GeneratedPlanet } from './planet-generation'
import { collectPickup, dropPickup, updatePickupsPhysics, type Pickup, type PickupKind } from './pickups'
import { runBalance } from './run-balance'
import { resolveFinishedRun } from './run/finish-run'
import type { ScoreEntry } from './score-history'
import {
  loadScoreEntries,
  sanitizeScoreName,
  saveScoreEntry
} from './score-storage'
import {
  GRAPHICS_STORAGE_KEY,
  LEGACY_GRAPHICS_STORAGE_KEYS,
  clearPersistentProgressStorage as clearStoredPersistentProgress,
  storageValueWithFallback
} from './persistent-progress-storage'
import { advanceScorePopups, appendScorePopup, createInstallPopup, createScorePopup, createSignalPopup, type ScorePopupModel } from './score-popups'
import { resolveShipFlightStats } from './ship-flight-stats'
import { rollWorkbenchChoices, type WorkbenchChoice } from './workbench-choices'
import {
  pickupBalance,
  powerupBalance,
  relics,
  upgradeMaxRank,
  upgrades,
  workbenchBalance,
  type Evolution,
  type LimitId,
  type Relic,
  type RelicId,
  type Upgrade,
  type UpgradeBucket,
  type UpgradeCategory,
  type UpgradeId
} from './powerup-balance'
import {
  availableSectorChoices,
  completeSectorNode,
  createSectorMap,
  currentSectorNode,
  sectorNodeRunProfile,
  selectSectorNode,
  type SectorMap,
  type SectorNode,
  type SectorNodeRunProfile
} from './sector-map'
import { pressurePackSize, shouldRecycleEnemy } from './spawn-pressure'
import { buildStationVisitRecord, type StationVisitRecord } from './station-memory'
import { buildRouteStationDockReport, buildServiceStationDockReport, type StationDockReport } from './station-dock-report'
import { resolveStationServices } from './station-services'
import { advanceSpawnEntryPings, createSpawnEntryPing, type SpawnEntryPing } from './spawn-entry-feedback'
import {
  cameraTargetFor,
  screenToWorld as spaceScreenToWorld,
  spaceViewportScale,
  worldToScreen as spaceWorldToScreen
} from './space-camera'
import { applyOptionOrbDamage, deployMineWake as deployMineWakeWeapon, fireOptionOrbs as fireOptionOrbWeapons, firePrimaryWeapon, fireRearGun as fireRearGunWeapons, optionOrbAngle, optionOrbWorldPosition, spawnChainBolt as spawnChainBoltWeapon } from './space-player-weapons'
import { applyDashRam } from './space-dash-combat'
import { createDashWakeEffects } from './space-dash-wake'
import { createSpaceEnemy, createSplitChildEnemy } from './space-enemy-factory'
import { createEnemyTrailParticle } from './space-enemy-trails'
import { EnemySpatialGrid } from './space-enemy-grid'
import { resolveSpaceEnemyDeathFeedback } from './space-enemy-death-feedback'
import {
  resolveSpaceEnemyBonusDrops,
  resolveSpaceEnemyKillReward,
  resolveSpaceEnemySplitChildSpawnCount
} from './space-enemy-rewards'
import { damageSpaceHazard as damageSpaceHazardCombat } from './space-hazard-combat'
import { isGiantEnemyKind, isSpriteEnemyKind, spaceEnemyDefinitions, spaceEnemySpawnPoint, spriteEnemyKinds, type SpaceEnemyKind } from './space-enemies'
import type { Vec, Enemy, Bullet, EnemyKind } from './main-types'
import { clamp, norm, dist2, hash32, hashString, len, rngFrom, TAU } from './math-utils'
export { clamp } from './math-utils'
import { resolvePlayerAim } from './player-aim'
import { resolvePlayerInputAxes } from './player-input'
import { renderScorePopups as drawScorePopups } from './render/score-popups'
import { renderSectorWaveWarning as drawSectorWaveWarning } from './render/sector-wave-warning'
import { renderSpaceBackground as drawSpaceBackground } from './render/space-background'
import { renderDerelictSignals as drawDerelictSignals, renderSpaceHazards as drawSpaceHazards } from './render/space-hazards'
import { renderLandingPrompt as drawLandingPrompt } from './render/landing-prompt'
import { renderMinimap as drawMinimap } from './render/minimap'
import { renderDeathOverlay as drawDeathOverlay, renderTransitionOverlay as drawTransitionOverlay } from './render/overlays'
import { renderSpacePlanets as drawSpacePlanets } from './render/space-planets'
import { renderSurfaceHud as drawSurfaceHud } from './surface/render-hud'
import { renderSurfaceAliens as drawSurfaceAliens, renderSurfaceLoreSites as drawSurfaceLoreSites, renderSurfaceResources as drawSurfaceResources } from './surface/render-interactables'
import { renderSurfacePilot as drawSurfacePilot } from './surface/render-pilot'
import { renderSurfaceBullets as drawSurfaceBullets, renderSurfaceWaveTelegraphs as drawSurfaceWaveTelegraphs } from './surface/render-projectiles'
import { renderSurfaceShip as drawSurfaceShip } from './surface/render-ship'
import { renderSurfaceThreats } from './surface/render-threats'
import { renderSurfaceWorld as drawSurfaceWorld } from './surface/render-world'
import { alienGiftOfferCopy, createBadAlienGiftThreats, isAlienGiftGood } from './surface/alien-gifts'
import { createSurfaceCacheArtifact, resolveSurfaceCacheReward, surfaceCacheAmbushChance } from './surface/cache-rewards'
import { createSurfaceBullet, findSurfaceTarget as pickSurfaceTarget, updateSurfaceBulletsAndThreatDamage } from './surface/bullet-combat'
import { initialSurfaceCamera as createInitialSurfaceCamera } from './surface/camera'
import { advanceSurfaceOxygen, surfaceExtractionScore, surfaceInteractionAction, surfaceTakeoffRequest, surfaceTransitionProgress } from './surface/lifecycle'
import { surfaceRunInterest } from './surface/interest'
import { findNearbySurfaceAlien, findNearbySurfaceLoreSite } from './surface/interaction-targets'
import { resolveSurfaceLoreReward } from './surface/lore-rewards'
import { collectTouchedSurfaceResources, createSurfaceBossCacheDrops, createSurfaceCacheAmbushThreats, shouldPromptSurfaceReturn } from './surface/objectives'
import { createSurfaceResourceNodes, surfaceEventMessage } from './surface/run-setup'
import { resolveSurfaceResourcePickup } from './surface/resource-pickup'
import { safeSurfaceResourcePoint } from './surface/safe-point'
import { resolveSurfaceSignalBank, surfaceSignalCap } from './surface/signal-buffer'
import { surfaceGunCooldown, surfaceGunDamage, surfaceGunSpeed, surfaceLowOxygenRatio, surfaceMaxHealth, surfaceMaxOxygen } from './surface/suit-stats'
import { createSurfaceAliens as createSurfaceAliensFactory, createSurfaceLoreSites as createSurfaceLoreSitesFactory, type SurfaceAlienModel, type SurfaceLoreSiteModel } from './surface/discovery-factory'
import { createGenericSurfaceThreat as createGenericSurfaceThreatFactory, createGlassMiteOracleThreat as createGlassMiteOracleThreatFactory, createPlanetBossThreat as createPlanetBossThreatFactory } from './surface/threat-factory'
import { safeSurfaceThreatPoint, surfaceThreatKeepouts } from './surface/threat-placement'
import { spawnSurfaceSplitterChildren, updateSurfaceThreatMotion } from './surface/threat-behavior'
import { advanceSurfaceWaveTelegraphs, createSurfaceWaveState, surfaceWaveSpawnPoints, surfaceWaveTelegraphPoint, updateSurfaceWaveDirector, type SurfaceWaveState, type SurfaceWaveTelegraph } from './surface/wave-director'
import { renderPlayer as drawPlayer } from './render/player'
import { renderEnemies as drawEnemies } from './render/enemies'
import { renderThreatIndicators as drawThreatIndicators } from './render/threat-indicators'
import { renderSpawnEntryPings as drawSpawnEntryPings } from './render/spawn-entry-pings'
import { renderImpactPulses as drawImpactPulses } from './render/impact-pulses'
import { renderPickups as drawPickups } from './render/pickups'
import { renderParticles as drawParticles, renderParticlesSimple as drawParticlesSimple } from './render/particles'
import { renderShockwaves as drawShockwaves } from './render/shockwaves'
import { renderOrbitals as drawOrbitals } from './render/orbitals'
import { renderBullets as drawBullets, renderBulletsSimple as drawBulletsSimple } from './render/bullets'
import { renderAutopilot as drawAutopilot, renderReturnBeacon as drawReturnBeacon } from './render/navigation-aids'
import { enemyBehaviors, type EnemyBehaviorContext } from './enemy-behaviors'
import { fireCathedralLattice, fireDreadnoughtBroadside, fireHelixSpikes, firePrismFan, fireSiphonVortex, type SpaceEnemyAttackContext } from './space-enemy-attacks'
import { spaceEnemyBehavior } from './space-enemy-behavior'
import {
  alienBloomFormation,
  asteroidFieldAsteroids,
  chooseSpaceEncounter,
  derelictCacheSignal,
  hunterWingFormation,
  meteorFrontAsteroids,
  nextSpaceEncounterTime,
  type MeteorAsteroidPlan,
  type SpaceEncounterKind
} from './space-encounters'
import { nextSpaceWaveWarning, spaceWaveId } from './space-wave-director'
import { surfacePilotMuzzleOffset } from './surface-pilot'
import {
  surfaceEventPoint as plannedSurfaceEventPoint,
  surfaceRunBalance,
  type SurfaceResourceKind,
  type SurfaceThreatBehavior
} from './surface-balance'
import { planSurfaceEncounter, type PlanetArchetype, type SurfaceEventKind, type SurfaceScenarioKind } from './surface-encounters'
import { dashVector, touchActionLabel } from './mobile-controls'
import {
  defaultMothershipState,
  isMothershipDepartmentUnlocked,
  mothershipDepartments,
  mothershipDepartmentUnlockText,
  purchaseMothershipTier,
  type MothershipDepartmentId,
  type MothershipState,
  type PersistentArchiveRecord,
  type RunOutcomeKind
} from './mothership-progression'
import {
  BEACON_HOLD_SECONDS,
  RETURN_BEACON_ASSIST_SECONDS,
  RETURN_BEACON_REMINDER_SECONDS,
  RETURN_BEACON_SKIP_DISTANCE,
  createReturnBeacon,
  nextBeaconWindow,
  returnBeaconAutopilotVector,
  returnBeaconReadyForRoute,
  type ReturnBeaconState
} from './return-beacons'
import {
  loadMothershipState,
  saveMothershipState
} from './mothership-storage'
import { resolveMothershipLaunchLoadout } from './mothership-launch-loadout'
import {
  workbenchUnlockEdges,
  workbenchUpgradeRows,
  type WorkbenchUpgradeRow
} from './workbench-rolls'
import { workbenchBayDefinitions, workbenchBayForUpgrade, type WorkbenchBayDefinition, type WorkbenchBayId } from './workbench-bays'
import { optionOrbProfile, starterSignatureFlags, weaponMilestonePulse } from './weapon-signatures'
import {
  renderLevelUp as uiRenderLevelUp,
  currentLevelUpScrollTop as uiCurrentLevelUpScrollTop,
  restoreLevelUpScroll as uiRestoreLevelUpScroll,
  canApplyWorkbenchChoice as uiCanApplyWorkbenchChoice,
  choiceTitle as uiChoiceTitle,
  renderManifestSummary as uiRenderManifestSummary,
  renderManifestRelicLine as uiRenderManifestRelicLine,
  workbenchExtraUnlockedIds as uiWorkbenchExtraUnlockedIds,
  installCueFor as uiInstallCueFor
} from './ui/workbench'
import { showCollection as uiShowCollection, showPowerUps as uiShowPowerUps } from './ui/front-subscreens'
import { showMothership as uiShowMothership } from './ui/mothership-console'
import { renderDebrief as uiRenderDebrief } from './ui/debrief'
import { showScores as uiShowScores } from './ui/scores'
import { showTitle as uiShowTitle } from './ui/title-screen'
import { makeHud as uiMakeHud, updateHud as uiUpdateHud } from './ui/hud'
import { makeScreens as uiMakeScreens, showOnly as uiShowOnly } from './ui/screens'
import { renderPlanet as uiRenderPlanet } from './ui/planet-screen'
import { showSectorMap as uiShowSectorMap } from './ui/sector-map-screen'
import { showStationDock as uiShowStationDock } from './ui/station-dock'
import { renderIntroArrow } from './ui/intro-waypoint'
import {
  introHookConfig,
  introSafeDriftSpawnMultiplier,
  introSafeDriftStartingSpawns,
  isFirstEverRun,
  pickWaypointTarget
} from './intro-hook'
import { installPlaytestHarnessIfRequested } from './playtest-harness'
import type { StateHandlers } from './game-states'

export type { AudioUpgradeCue } from './audio/audio-director'
export type { ArtifactKind, ArtifactRecord } from './artifact-archive'

export type GameState = 'title' | 'mothership' | 'collection' | 'powerups' | 'sectorMap' | 'station' | 'playing' | 'paused' | 'levelup' | 'planet' | 'landing' | 'surface' | 'alien' | 'lore' | 'takeoff' | 'dying' | 'debrief' | 'gameover' | 'scores'
type GraphicsMode = 'LOW' | 'MED' | 'GLOW'
export type MothershipConsoleView = 'workbench' | 'manifest'
export type MothershipCollectionFilter = 'all' | 'found' | 'locked' | ArtifactKind

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  angle?: number
  spin?: number
  sides?: number
  length?: number
  glow?: number
}

interface Shockwave {
  x: number
  y: number
  radius: number
  speed: number
  life: number
  maxLife: number
  color: string
  jag: number
}

export type Planet = GeneratedPlanet

interface SpaceChunk {
  key: string
  x: number
  y: number
  stars: Vec[]
  planets: Planet[]
}

interface SurfaceResource {
  kind: SurfaceResourceKind
  x: number
  y: number
  radius: number
  value: number
  color: string
  collected: boolean
}

interface SurfaceThreat {
  x: number
  y: number
  vx: number
  vy: number
  hp: number
  radius: number
  phase: number
  color: string
  hit: number
  sprite?: 'glassMiteOracle' | 'bossCatalog'
  spriteRow?: number
  boss?: boolean
  behavior?: SurfaceThreatBehavior
  behaviorCooldown?: number
  splitChild?: boolean
}

interface SurfaceBullet {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  radius: number
  damage: number
  color: string
}

type SurfaceAlien = SurfaceAlienModel
type SurfaceLoreSite = SurfaceLoreSiteModel

interface SurfaceRun {
  planet: Planet
  event: SurfaceEventKind
  scenario: SurfaceScenarioKind
  width: number
  height: number
  pilot: {
    x: number
    y: number
    vx: number
    vy: number
    facing: number
    gunCd: number
    invuln: number
    health: number
    maxHealth: number
    oxygen: number
    maxOxygen: number
  }
  ship: Vec
  camera: Vec
  resources: SurfaceResource[]
  threats: SurfaceThreat[]
  bullets: SurfaceBullet[]
  aliens: SurfaceAlien[]
  loreSites: SurfaceLoreSite[]
  wave: SurfaceWaveState
  waveTelegraphs: SurfaceWaveTelegraph[]
  collected: number
  pendingUpgrade: boolean
  bankedSignals: number
  overflowSignals: number
  bossCacheCount: number
  o2Returning: boolean
  message: string
}

type ReturnBeacon = ReturnBeaconState

interface PlayerState {
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  aimAngle: number
  radius: number
  hull: number
  maxHull: number
  shield: number
  maxShield: number
  shieldDelay: number
  invuln: number
  fireCd: number
  dashCd: number
  dashTime: number
  dashX: number
  dashY: number
  dashSpeed: number
  pickupAbsorbPulse: number
  speed: number
  landedCd: number
}

interface RunStats {
  time: number
  kills: number
  level: number
  xp: number
  nextXp: number
  highScore: number
  planets: number
  score: number
}

interface SpaceHazardAsteroid extends MeteorAsteroidPlan {
  phase: number
  hitCooldown: number
  damageMultiplier: number
}

interface DerelictSignal {
  x: number
  y: number
  phase: number
  life: number
}

interface PerfStats {
  updateMs: number
  renderMs: number
  frameMs: number
  fps: number
}

const CHUNK_SIZE = 3600
const CHUNK_LOAD_RADIUS = 1
const CHUNK_KEEP_RADIUS = 3
const MAX_PARTICLES = 300
const MAX_SHOCKWAVES = 12
const MAX_BULLETS = 220
const MAX_ENEMIES = 320
const MAX_PICKUPS = 220
const ENEMY_RECYCLE_RADIUS = 2200
const ENEMY_PRESSURE_RADIUS = 1250

const rand = (min: number, max: number) => min + Math.random() * (max - min)

const savedGraphicsMode = (): GraphicsMode => (storageValueWithFallback(localStorage, GRAPHICS_STORAGE_KEY, LEGACY_GRAPHICS_STORAGE_KEYS) as GraphicsMode | null) || 'LOW'
const angleLerp = (a: number, b: number, t: number) => {
  const diff = Math.atan2(Math.sin(b - a), Math.cos(b - a))
  return a + diff * t
}
export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export class VectorShooter {
  private app = document.querySelector<HTMLDivElement>('#app')!
  private canvas: HTMLCanvasElement
  private mini: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private miniCtx: CanvasRenderingContext2D
  private dpr = window.devicePixelRatio || 1
  private width = 1280
  private height = 720
  private last = performance.now()
  private state: GameState = 'title'
  private previousState: GameState = 'title'
  private readonly stateHandlers: StateHandlers = {
    landing: {
      update: (dt) => this.updateLanding(dt),
      render: (ctx) => {
        const t = clamp(this.transitionTimer / this.transitionDuration, 0, 1)
        if (t < 0.58) this.renderSpaceScene(ctx)
        else this.renderSurface(ctx)
        drawTransitionOverlay({ ctx, width: this.width, height: this.height, t, label: 'LANDING' })
      }
    },
    surface: {
      update: (dt) => this.updateSurface(dt),
      render: (ctx) => {
        this.mini.style.display = 'none'
        this.renderSurface(ctx)
      }
    },
    takeoff: {
      update: (dt) => this.updateTakeoff(dt),
      render: (ctx) => {
        const t = clamp(this.transitionTimer / this.transitionDuration, 0, 1)
        if (t < 0.5) this.renderSurface(ctx)
        else this.renderSpaceScene(ctx)
        drawTransitionOverlay({ ctx, width: this.width, height: this.height, t, label: 'TAKEOFF' })
      }
    },
    dying: {
      update: (dt) => this.updateDying(dt),
      render: (ctx) => {
        this.renderSpaceScene(ctx)
        drawDeathOverlay({
          ctx,
          width: this.width,
          height: this.height,
          deathTimer: this.deathTimer,
          playerScreen: this.worldToScreen(this.player.x, this.player.y)
        })
      }
    }
  }
  private graphicsMode: GraphicsMode = savedGraphicsMode()
  private perf: PerfStats = { updateMs: 0, renderMs: 0, frameMs: 16.7, fps: 60 }
  private keys = new Set<string>()
  private pressed = new Set<string>()
  private mouse = { x: 0, y: 0, down: false }
  private touchStick = { active: false, id: -1, startX: 0, startY: 0, x: 0, y: 0 }
  private mobileActionQueued = false
  private mobileDashQueued = false
  private mobileFireQueued = false
  private audio = new AudioDirector()
  private uiClickSampleIndex = 0
  private camera = { x: 0, y: 0, shake: 0 }
  private glassMiteOracleSheet = new Image()
  private planetAlienCatalog = new Image()
  private planetBossCatalog = new Image()
  private spaceEnemyCatalog = new Image()
  private surfaceSpacemanSheet = new Image()
  private scoreSaved = false
  private scoreName = 'ACE'
  private toastTimer = 0
  private toastText = ''
  private mothership: MothershipState = defaultMothershipState()
  private debrief: DebriefReport | null = null
  // Activated once per first-ever run; deactivated by timer expiry or first landing.
  private introWaypoint: { active: boolean; timer: number; targetPlanetId: string | null } | null = null
  private upgradeChoices: WorkbenchChoice[] = []
  private workbenchInstalling = false
  private surfaceInstallCompleted = false
  private workbenchRerolls = 0
  private selectedWorkbenchBay: WorkbenchBayId = 'weapons'
  private expandedWorkbenchBay: WorkbenchBayId | null = null
  private levelUpTitle = 'SHIPBOARD WORKBENCH'
  private levelUpCopy = 'Spend one banked mutation signal before takeoff.'
  private selectedMothershipDepartment: MothershipDepartmentId = 'scanner'
  private expandedMothershipDepartment: MothershipDepartmentId | null = null
  private returnToSectorMapAfterWorkbench = false
  private discoverySuitOffer = false
  private summonReturnBeaconAfterTakeoff = false
  private mothershipConsoleView: MothershipConsoleView = 'workbench'
  private mothershipCollectionFilter: MothershipCollectionFilter = 'all'
  private selectedCollectionId: string | null = null
  private sectorMap: SectorMap = createSectorMap()
  private sectorNodeProfile: SectorNodeRunProfile = sectorNodeRunProfile(currentSectorNode(this.sectorMap))
  private stationDockReport: StationDockReport | null = null
  private stationVisits: StationVisitRecord[] = []
  private sectorNodeStartedAt = 0
  private firedSectorWaves = new Set<string>()
  private planetChoice: Planet | null = null
  private alienChoice: SurfaceAlien | null = null
  private orbitReturnPoint: Vec | null = null
  private transitionTimer = 0
  private transitionDuration = 1.25
  private deathTimer = 0
  private surface: SurfaceRun | null = null
  private returnBeacon: ReturnBeacon | null = null
  private nextReturnBeaconAt = 0
  private skippedReturnBeacons = 0
  private collisionFxCooldown = 0
  private bulletImpactCooldown = 0
  private quietFieldTimer = 0
  private pendingUpgrades = 0
  private takeoffAfterWorkbench = false
  private enemyId = 0
  private fireSerial = 0
  private spawnTimer = 0
  private bossTimer: number = runBalance.timers.startingBossSeconds
  private chestTimer: number = runBalance.timers.defaultChestSeconds
  private hitstopUntil = 0
  private nextSpaceEncounterAt = nextSpaceEncounterTime(0)
  private chunks = new Map<string, SpaceChunk>()
  private stars: Vec[] = []
  private activeChunkKey = ''
  private autoNavHeading = 0
  private autoNavActive = false
  private autoNavTargetPlanetId: string | null = null
  private autoNavTargetBeacon = false
  private highs: ScoreEntry[] = []
  private resources = { scrap: 0, crystal: 0, cores: 0 }
  private relics = new Set<RelicId>()
  private evolved = new Set<UpgradeId>()
  private artifacts = new Map<string, ArtifactRecord>()
  private limitBreaks: Record<LimitId, number> = { might: 0, cooldown: 0, amount: 0, speed: 0, magnet: 0, hull: 0 }

  private player: PlayerState = this.makePlayer()
  private bullets: Bullet[] = []
  private enemies: Enemy[] = []
  private enemyGrid = new EnemySpatialGrid()
  // Reused per-frame context for the extracted enemy-behaviors strategy table.
  // playerX/playerY/time/hunger are refreshed once at the top of updateEnemies
  // (mutable backing fields) to avoid per-enemy allocation; the rest are stable
  // arrow delegates to the real private methods.
  private enemyBehaviorCtx: EnemyBehaviorContext = {
    playerX: 0,
    playerY: 0,
    playerPos: { x: 0, y: 0 },
    time: 0,
    hunger: 1,
    spawnHostileBullet: (b) => { this.bullets.push({ ...b, pierce: 0, hostile: true }) },
    burst: (x, y, color, count, speed) => this.burst(x, y, color, count, speed),
    emitEnemyTrail: (e, color, intensity) => this.emitEnemyTrail(e, color, intensity),
    fireHelixSpikes: (e, def, toP) => fireHelixSpikes(this.spaceEnemyAttackContext(), e, def, toP),
    firePrismFan: (e, def, toP) => firePrismFan(this.spaceEnemyAttackContext(), e, def, toP),
    fireSiphonVortex: (e, def) => fireSiphonVortex(this.spaceEnemyAttackContext(), e, def),
    fireDreadnoughtBroadside: (e, def, toP) => fireDreadnoughtBroadside(this.spaceEnemyAttackContext(), e, def, toP),
    fireCathedralLattice: (e, def, toP) => fireCathedralLattice(this.spaceEnemyAttackContext(), e, def, toP),
    damagePlayer: (amount) => this.damagePlayer(amount),
    killEnemy: (e, reward) => this.killEnemy(e, reward)
  }
  private pickups: Pickup[] = []
  private particles: Particle[] = []
  private scorePopups: ScorePopupModel[] = []
  private shockwaves: Shockwave[] = []
  private impactPulses: ImpactPulse[] = []
  private playerDamageFlash: PlayerDamageFlash | null = null
  private spawnEntryPings: SpawnEntryPing[] = []
  private spaceHazards: SpaceHazardAsteroid[] = []
  private asteroidFieldTimer = 0
  private asteroidFieldSpawnTimer = 0
  private derelictSignals: DerelictSignal[] = []
  private planets: Planet[] = []
  private visitedPlanets = new Set<string>()

  private stats: RunStats = {
    time: 0,
    kills: 0,
    level: 1,
    xp: 0,
    nextXp: runBalance.xp.startingNext,
    highScore: 0,
    planets: 0,
    score: 0
  }

  private build: Record<UpgradeId, number> = {
    rapid: 0,
    split: 0,
    pierce: 0,
    rear: 0,
    mine: 0,
    chain: 0,
    rift: 0,
    engine: 0,
    nav: 0,
    magnet: 0,
    shield: 0,
    repair: 0,
    orbit: 0,
    rail: 0,
    echo: 0,
    vampire: 0,
    survey: 0,
    luck: 0,
    cargo: 0,
    heat: 0,
    phase: 0,
    suitO2: 0,
    suitHealth: 0,
    suitBlaster: 0
  }

  private ui = {
    score: document.createElement('span'),
    time: document.createElement('span'),
    hullLabel: document.createElement('span'),
    level: document.createElement('span'),
    xpLabel: document.createElement('span'),
    hull: document.createElement('span'),
    wave: document.createElement('span'),
    high: document.createElement('span'),
    resources: document.createElement('span'),
    objective: document.createElement('span'),
    weapon: document.createElement('span'),
    hullFill: document.createElement('div'),
    shieldFill: document.createElement('div'),
    xpFill: document.createElement('div'),
    toast: document.createElement('div'),
    perf: document.createElement('div'),
    touchControls: document.createElement('div'),
    touchStick: document.createElement('div'),
    touchKnob: document.createElement('div'),
    touchAction: document.createElement('button'),
    touchDash: document.createElement('button'),
    title: document.createElement('section'),
    collection: document.createElement('section'),
    powerups: document.createElement('section'),
    sectorMap: document.createElement('section'),
    station: document.createElement('section'),
    levelup: document.createElement('section'),
    planet: document.createElement('section'),
    gameover: document.createElement('section'),
    scores: document.createElement('section')
  }

  constructor() {
    this.app.innerHTML = ''
    const shell = document.createElement('div')
    shell.className = 'game-shell'
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    this.mini = document.createElement('canvas')
    this.mini.className = 'minimap'
    this.miniCtx = this.mini.getContext('2d')!
    shell.append(this.canvas)
    shell.append(this.mini)
    shell.append(this.makeHud())
    shell.append(this.makeScreens())
    this.app.append(shell)
    this.resize()
    this.bind()
    this.glassMiteOracleSheet.src = glassMiteOracleSheetUrl
    this.planetAlienCatalog.src = planetAlienCatalogUrl
    this.planetBossCatalog.src = planetBossCatalogUrl
    this.spaceEnemyCatalog.src = spaceEnemyCatalogUrl
    this.surfaceSpacemanSheet.src = surfaceSpacemanSheetUrl
    this.audio.registerSamples(sfxSamples)
    this.resetProgressFromUrl()
    this.highs = this.loadScores()
    this.mothership = this.loadMothership()
    this.stats.highScore = this.highs[0]?.score ?? 0
    this.updateSpaceChunks()
    this.showTitle()
    this.installHarnessIfRequested()
    requestAnimationFrame((t) => this.frame(t))
  }

  private makePlayer(): PlayerState {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      aimAngle: -Math.PI / 2,
      radius: runBalance.player.radius,
      hull: runBalance.player.baseHull,
      maxHull: runBalance.player.baseHull,
      shield: 0,
      maxShield: 0,
      shieldDelay: 0,
      invuln: 0,
      fireCd: 0,
      dashCd: 0,
      dashTime: 0,
      dashX: 0,
      dashY: -1,
      dashSpeed: 0,
      pickupAbsorbPulse: 0,
      speed: runBalance.player.baseSpeed,
      landedCd: 0
    }
  }

  private makeHud() {
    return uiMakeHud(this)
  }

  private makeTouchControls() {
    this.ui.touchControls.className = 'touch-controls'
    this.ui.touchStick.className = 'touch-stick'
    this.ui.touchKnob.className = 'touch-knob'
    this.ui.touchStick.append(this.ui.touchKnob)
    const buttons = document.createElement('div')
    buttons.className = 'touch-buttons'
    this.ui.touchAction.className = 'touch-button action'
    this.ui.touchAction.type = 'button'
    this.ui.touchAction.textContent = 'ACTION'
    this.ui.touchDash.className = 'touch-button dash'
    this.ui.touchDash.type = 'button'
    this.ui.touchDash.textContent = 'DASH'
    this.ui.touchAction.addEventListener('pointerdown', (event) => {
      event.preventDefault()
      this.audio.unlock()
      this.mobileActionQueued = true
    })
    this.ui.touchDash.addEventListener('pointerdown', (event) => {
      event.preventDefault()
      this.audio.unlock()
      if (this.state === 'surface') this.mobileFireQueued = true
      else this.mobileDashQueued = true
    })
    buttons.append(this.ui.touchAction, this.ui.touchDash)
    this.ui.touchControls.append(this.ui.touchStick, buttons)
    return this.ui.touchControls
  }

  private chunkKey(x: number, y: number) {
    return `${x},${y}`
  }

  private currentChunk() {
    return { x: Math.floor(this.player.x / CHUNK_SIZE), y: Math.floor(this.player.y / CHUNK_SIZE) }
  }

  private updateSpaceChunks(force = false) {
    const center = this.currentChunk()
    const centerKey = this.chunkKey(center.x, center.y)
    if (!force && centerKey === this.activeChunkKey && this.planets.length) return
    this.activeChunkKey = centerKey
    for (let x = center.x - CHUNK_LOAD_RADIUS; x <= center.x + CHUNK_LOAD_RADIUS; x += 1) {
      for (let y = center.y - CHUNK_LOAD_RADIUS; y <= center.y + CHUNK_LOAD_RADIUS; y += 1) {
        const key = this.chunkKey(x, y)
        if (!this.chunks.has(key)) this.chunks.set(key, this.generateChunk(x, y))
      }
    }
    for (const [key, chunk] of this.chunks) {
      if (Math.abs(chunk.x - center.x) > CHUNK_KEEP_RADIUS || Math.abs(chunk.y - center.y) > CHUNK_KEEP_RADIUS) this.chunks.delete(key)
    }
    this.stars = []
    this.planets = []
    for (const chunk of this.chunks.values()) {
      if (Math.abs(chunk.x - center.x) <= CHUNK_LOAD_RADIUS && Math.abs(chunk.y - center.y) <= CHUNK_LOAD_RADIUS) {
        this.stars.push(...chunk.stars)
        this.planets.push(...chunk.planets)
      }
    }
  }

  private generateChunk(x: number, y: number): SpaceChunk {
    const key = this.chunkKey(x, y)
    const rng = rngFrom(hash32(x, y, 17))
    const stars: Vec[] = []
    const starCount = 120 + Math.floor(rng() * 90)
    for (let i = 0; i < starCount; i += 1) {
      stars.push({ x: x * CHUNK_SIZE + rng() * CHUNK_SIZE, y: y * CHUNK_SIZE + rng() * CHUNK_SIZE })
    }
    const planets: Planet[] = []
    const planetCount = this.sectorPlanetCount(rng)
    for (let i = 0; i < planetCount; i += 1) planets.push(this.generatePlanet(x, y, i, rng, planets))
    return { key, x, y, stars, planets }
  }

  private sectorPlanetCount(rng: () => number) {
    const planets = this.sectorNodeProfile.config.planets
    return planets.countMin + Math.floor(rng() * (planets.countMax - planets.countMin + 1))
  }

  private generatePlanet(chunkX: number, chunkY: number, index: number, rng: () => number, existing: Planet[] = []): Planet {
    return createChunkPlanet({
      chunkX,
      chunkY,
      index,
      rng,
      existing,
      visitedPlanetIds: this.visitedPlanets,
      archetypeBias: this.sectorNodeProfile.config.planets.archetypeBias,
      chunkSize: CHUNK_SIZE
    })
  }

  private makeScreens() {
    return uiMakeScreens(this)
  }

  private bind() {
    window.addEventListener('resize', () => this.resize())
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null
      const button = target?.closest('button') as HTMLButtonElement | null
      if (!button || button.disabled) return
      // First click on the title screen is the user gesture that unlocks Web Audio.
      // Without this, the very first menu clicks make no sound because unlock()
      // is only otherwise called from in-game input paths.
      this.audio.unlock()
      const cue = uiClickSoundForButton(button, this.uiClickSampleIndex)
      this.uiClickSampleIndex += 1
      this.audio.playSample(cue.sample, { gain: cue.gain, rate: cue.rate })
    }, true)
    const preventBrowserGesture = (event: Event) => event.preventDefault()
    document.addEventListener('gesturestart', preventBrowserGesture, { passive: false } as AddEventListenerOptions)
    document.addEventListener('gesturechange', preventBrowserGesture, { passive: false } as AddEventListenerOptions)
    document.addEventListener('gestureend', preventBrowserGesture, { passive: false } as AddEventListenerOptions)
    document.addEventListener('touchmove', (event) => {
      if (event.touches.length > 1) event.preventDefault()
    }, { passive: false })
    let lastTouchEnd = 0
    document.addEventListener('touchend', (event) => {
      const target = event.target instanceof HTMLElement ? event.target : null
      if (target?.closest('button, input')) return
      const now = performance.now()
      if (now - lastTouchEnd < 320) event.preventDefault()
      lastTouchEnd = now
    }, { passive: false })
    window.addEventListener('keydown', (e) => {
      this.audio.unlock()
      if (!this.keys.has(e.code)) this.pressed.add(e.code)
      this.keys.add(e.code)
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault()
      if (e.code === 'Escape') this.togglePause()
      if (e.code === 'Enter' && this.state === 'title') this.showMothership()
      if (e.code === 'Enter' && this.state === 'mothership') this.start()
      if (e.code === 'Enter' && this.state === 'sectorMap') {
        const firstChoice = availableSectorChoices(this.sectorMap)[0]
        if (firstChoice) this.launchSectorNode(firstChoice.id)
      }
      if (e.code === 'Enter' && this.state === 'gameover') this.returnToTitleFromGameOver()
    })
    window.addEventListener('keyup', (e) => this.keys.delete(e.code))
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') {
        if (this.touchStick.active && e.pointerId === this.touchStick.id) {
          this.touchStick.x = e.clientX
          this.touchStick.y = e.clientY
          e.preventDefault()
        }
        return
      }
      this.mouse.x = e.clientX
      this.mouse.y = e.clientY
    })
    window.addEventListener('pointerdown', (e) => {
      this.audio.unlock()
      if (e.pointerType === 'touch') {
        const target = e.target instanceof HTMLElement ? e.target : null
        if (target?.closest('button, input')) return
        if (this.canStartTouchMove(e.clientX, e.clientY)) {
          this.touchStick = { active: true, id: e.pointerId, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY }
          this.ui.touchStick.style.left = `${e.clientX}px`
          this.ui.touchStick.style.top = `${e.clientY}px`
          this.ui.touchStick.style.setProperty('--touch-line', '0px')
          this.ui.touchStick.style.setProperty('--touch-angle', '0rad')
          this.ui.touchStick.classList.add('active')
          e.preventDefault()
        }
        return
      }
      this.mouse.down = true
    })
    window.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch') {
        if (e.pointerId === this.touchStick.id) this.clearTouchStick()
        return
      }
      this.mouse.down = false
    })
    window.addEventListener('pointercancel', (e) => {
      if (e.pointerType === 'touch' && e.pointerId === this.touchStick.id) this.clearTouchStick()
    })
    window.addEventListener('gamepadconnected', () => this.toast('GAMEPAD SIGNAL LOCKED: LEFT STICK MOVE, RIGHT STICK FIRE'))
  }

  private resize() {
    const modeCap = this.graphicsMode === 'LOW' ? 1 : this.graphicsMode === 'MED' ? 1.25 : 1.75
    this.dpr = Math.min(window.devicePixelRatio || 1, modeCap)
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.canvas.width = Math.floor(this.width * this.dpr)
    this.canvas.height = Math.floor(this.height * this.dpr)
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.mini.width = 154 * this.dpr
    this.mini.height = 154 * this.dpr
    this.miniCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
  }

  private clearTouchStick() {
    this.touchStick.active = false
    this.touchStick.id = -1
    this.ui.touchStick.classList.remove('active')
  }

  private canStartTouchMove(x: number, y: number) {
    if (this.state !== 'playing' && this.state !== 'surface') return false
    if (y < Math.max(82, this.height * 0.13)) return false
    if (x > this.width - 118 && y > this.height - 250) return false
    return true
  }

  private frame(now: number) {
    const dt = clamp((now - this.last) / 1000, 0, 0.033)
    const frameMs = now - this.last
    this.last = now
    const updateStart = performance.now()
    this.update(dt)
    const renderStart = performance.now()
    this.render()
    const renderEnd = performance.now()
    this.perf.updateMs = this.perf.updateMs * 0.9 + (renderStart - updateStart) * 0.1
    this.perf.renderMs = this.perf.renderMs * 0.9 + (renderEnd - renderStart) * 0.1
    this.perf.frameMs = this.perf.frameMs * 0.9 + frameMs * 0.1
    this.perf.fps = 1000 / Math.max(1, this.perf.frameMs)
    this.pressed.clear()
    requestAnimationFrame((t) => this.frame(t))
  }

  private update(dt: number) {
    const intensity = this.state === 'surface' ? 0.18 : clamp(this.stats.time / 360 + this.enemies.length / 120, 0, 1)
    this.audio.update(dt, intensity, this.audioMood())
    // hitstop: freeze gameplay update for the configured duration; audio + render continue
    if (performance.now() / 1000 < this.hitstopUntil) return
    if ((this.state === 'alien' || this.state === 'lore') && this.surface) {
      this.stats.time += dt * 0.08
      this.toastTimer -= dt
      if (this.toastTimer <= 0) this.ui.toast.classList.remove('visible')
      this.updateParticles(dt)
      this.updateHud()
      return
    }
    const handler = this.stateHandlers[this.state]
    if (handler?.update) {
      handler.update(dt)
      return
    }
    if (this.state !== 'playing') {
      if (this.freezesGameplayCamera()) {
        this.updateGameplayOverlay(dt)
        return
      }
      this.drawTitleDrift(dt)
      return
    }
    this.updatePlaying(dt)
  }

  private updatePlaying(dt: number) {
    this.tryStartIntroWaypoint()
    this.tickIntroWaypoint(dt)
    this.stats.time += dt
    this.spawnTimer -= dt
    this.bossTimer -= dt
    this.chestTimer -= dt
    this.collisionFxCooldown -= dt
    this.bulletImpactCooldown -= dt
    this.quietFieldTimer -= dt
    this.player.fireCd -= dt
    this.player.dashCd -= dt
    this.player.dashTime -= dt
    this.player.invuln -= dt
    this.player.pickupAbsorbPulse = Math.max(0, this.player.pickupAbsorbPulse - dt)
    this.player.shieldDelay -= dt
    this.player.landedCd -= dt
    this.toastTimer -= dt
    if (this.toastTimer <= 0) this.ui.toast.classList.remove('visible')

    if (this.player.maxShield > 0 && this.player.shieldDelay <= 0) {
      const reactorPenalty = this.relics.has('glassReactor') ? powerupBalance.ship.glassReactorShieldRegenMultiplier : 1
      const shieldRegen = powerupBalance.ship.shieldBaseRegenPerSecond + this.build.shield * powerupBalance.ship.shieldRegenPerRank
      this.player.shield = clamp(this.player.shield + dt * shieldRegen * reactorPenalty, 0, this.player.maxShield)
    }

    this.updatePlayer(dt)
    this.updateBullets(dt)
    this.updateEnemies(dt)
    this.updateSpaceEncounters(dt)
    this.updatePickups(dt)
    this.updateParticles(dt)
    advanceScorePopups(this.scorePopups, dt)
    this.updateOrbitals(dt)
    this.updateSpawning()
    this.updateSectorWaves()
    this.updateReturnBeacon(dt)
    this.updateCamera(dt)
    this.updateHud()
    if (this.player.hull <= 0) this.gameOver()
  }

  private tryStartIntroWaypoint() {
    if (this.introWaypoint !== null) return
    if (!isFirstEverRun({ planets: this.stats.planets, hasDebrief: this.debrief !== null })) return
    const target = pickWaypointTarget(this.planets, this.player)
    if (!target) return
    this.introWaypoint = {
      active: true,
      timer: introHookConfig.waypoint.durationSeconds,
      targetPlanetId: target.id
    }
  }

  private tickIntroWaypoint(dt: number) {
    const wp = this.introWaypoint
    if (!wp || !wp.active) return
    wp.timer -= dt
    if (wp.timer <= 0) {
      wp.timer = introHookConfig.waypoint.durationSeconds
    }
    // If the target planet has been chunk-unloaded, try to re-pick.
    const stillExists = this.planets.some((p) => p.id === wp.targetPlanetId)
    if (!stillExists) {
      const next = pickWaypointTarget(this.planets, this.player)
      wp.targetPlanetId = next ? next.id : null
      if (!next) wp.active = false
    }
  }

  private stopIntroWaypoint() {
    if (this.introWaypoint?.active) this.introWaypoint.active = false
  }

  private freezesGameplayCamera() {
    return this.state === 'levelup' || this.state === 'planet' || this.state === 'paused'
  }

  private updateGameplayOverlay(dt: number) {
    this.toastTimer -= dt
    if (this.toastTimer <= 0) this.ui.toast.classList.remove('visible')
    this.updateParticles(dt)
    this.updateHud()
  }

  private audioMood(): PlanetAudioMood {
    if (this.state === 'title' || this.state === 'mothership' || this.state === 'scores' || this.state === 'dying' || this.state === 'debrief' || this.state === 'gameover') return 'title'
    if (this.surface) return this.surface.planet.archetype
    if (this.planetChoice) return this.planetChoice.archetype
    let best: Planet | null = null
    let bestD = Number.POSITIVE_INFINITY
    for (const planet of this.planets) {
      const d = dist2(planet, this.player)
      if (d < bestD) {
        bestD = d
        best = planet
      }
    }
    if (best && bestD < (best.radius + 760) ** 2) return best.archetype
    return 'deepSpace'
  }

  private drawTitleDrift(dt: number) {
    this.stats.time += dt * 0.08
    this.updateParticles(dt)
    this.camera.x = -this.width / 2 + Math.cos(performance.now() / 8000) * 80
    this.camera.y = -this.height / 2 + Math.sin(performance.now() / 9000) * 80
    this.updateSpaceChunks()
    this.updateHud()
  }

  private updatePlayer(dt: number) {
    const input = this.getInput()
    const move = this.resolveNavigationMove(input.move, input.moveActive, dt)
    const flightStats = resolveShipFlightStats({
      baseSpeed: this.player.speed,
      engine: this.build.engine,
      nav: this.build.nav
    })
    const accel = flightStats.acceleration * dt
    const maxSpeed = flightStats.maxSpeed
    this.player.vx += move.x * accel
    this.player.vy += move.y * accel
    const speed = len(this.player.vx, this.player.vy)
    if (speed > maxSpeed) {
      this.player.vx = (this.player.vx / speed) * maxSpeed
      this.player.vy = (this.player.vy / speed) * maxSpeed
    }
    if (input.dash && this.player.dashCd <= 0) {
      const d = dashVector({
        vx: this.player.vx,
        vy: this.player.vy,
        speed,
        aimAngle: this.player.aimAngle,
        move,
        moveActive: input.moveActive
      })
      this.player.dashTime = this.dashDuration()
      this.player.dashX = d.x
      this.player.dashY = d.y
      this.player.dashSpeed = this.dashSpeed()
      this.player.vx = d.x * this.player.dashSpeed
      this.player.vy = d.y * this.player.dashSpeed
      this.player.dashCd = this.dashCooldown()
      this.player.invuln = this.dashInvulnerability()
      this.camera.shake = Math.max(this.camera.shake, 8)
      this.burst(this.player.x, this.player.y, '#70a8ff', 14 + this.build.phase * 3, 180 + this.build.phase * 24)
      this.emitDashWake(d, 1.35)
      deployMineWakeWeapon({
        bullets: this.bullets,
        player: this.player,
        direction: d,
        mineRank: this.build.mine,
        evolvedMine: this.evolved.has('mine'),
        limitMight: this.limitBreaks.might,
        maxBullets: MAX_BULLETS
      })
    }
    if (this.player.dashTime > 0) {
      this.player.vx = this.player.dashX * this.player.dashSpeed
      this.player.vy = this.player.dashY * this.player.dashSpeed
      this.emitDashWake({ x: this.player.dashX, y: this.player.dashY }, 0.42)
    }
    const damping = this.player.dashTime > 0 ? 0.34 : 0.06
    this.player.vx *= Math.pow(damping, dt)
    this.player.vy *= Math.pow(damping, dt)
    this.player.x += this.player.vx * dt
    this.player.y += this.player.vy * dt
    this.updateSpaceChunks()

    if (input.aiming) this.player.aimAngle = input.aimAngle
    if (speed > 20) this.player.angle = angleLerp(this.player.angle, Math.atan2(this.player.vy, this.player.vx), 0.12)
    this.player.angle = angleLerp(this.player.angle, this.player.aimAngle, input.firing ? 0.2 : 0.04)

    if (input.firing && this.player.fireCd <= 0) this.fire()
    if (input.interact) this.tryLand()
  }

  private dashDuration() {
    return resolveDashStats(this.build).duration
  }

  private dashSpeed() {
    return resolveDashStats(this.build).speed
  }

  private dashCooldown() {
    return resolveDashStats(this.build).cooldown
  }

  private dashInvulnerability() {
    return resolveDashStats(this.build).invulnerability
  }

  private resolveNavigationMove(move: Vec, moveActive: boolean, dt: number): Vec {
    const level = this.navigationCruiseLevel()

    const manualActive = isManualNavigationActive({ move, moveActive })
    if (manualActive) {
      const target = Math.atan2(move.y, move.x)
      this.autoNavHeading = this.autoNavActive ? angleLerp(this.autoNavHeading, target, clamp(dt * (3.6 + level * 0.42), 0, 0.38)) : target
      this.autoNavActive = true
      this.autoNavTargetPlanetId = null
      this.autoNavTargetBeacon = false
    } else if (!this.autoNavActive) {
      const speed = len(this.player.vx, this.player.vy)
      this.autoNavHeading = speed > 20 ? Math.atan2(this.player.vy, this.player.vx) : this.player.angle
      this.autoNavActive = true
    }

    const targetPlanet = this.autoNavTargetPlanetId ? this.planets.find((planet) => planet.id === this.autoNavTargetPlanetId) : null
    const beaconTarget = this.autoNavTargetBeacon ? this.returnBeacon : null
    if (targetPlanet) {
      const targetAngle = Math.atan2(targetPlanet.y - this.player.y, targetPlanet.x - this.player.x)
      this.autoNavHeading = angleLerp(this.autoNavHeading, targetAngle, clamp(dt * (1.7 + level * 0.24), 0, 0.22))
      if (Math.sqrt(dist2(targetPlanet, this.player)) < targetPlanet.radius + 108) {
        this.autoNavTargetPlanetId = null
        this.toast('LANDING BEACON IN RANGE')
      }
    } else if (beaconTarget) {
      const targetAngle = Math.atan2(beaconTarget.y - this.player.y, beaconTarget.x - this.player.x)
      this.autoNavHeading = angleLerp(this.autoNavHeading, targetAngle, clamp(dt * 1.9, 0, 0.24))
    } else if (!manualActive && level >= 5) {
      const pickup = this.bestNavigationPickup()
      if (pickup) {
        const targetAngle = Math.atan2(pickup.y - this.player.y, pickup.x - this.player.x)
        this.autoNavHeading = angleLerp(this.autoNavHeading, targetAngle, clamp(dt * 0.82, 0, 0.12))
      }
    }

    if (level >= 4) this.applyThreatWeave(dt, level)

    if (beaconTarget && !manualActive) {
      const beaconMove = returnBeaconAutopilotVector({
        dx: beaconTarget.x - this.player.x,
        dy: beaconTarget.y - this.player.y,
        vx: this.player.vx,
        vy: this.player.vy,
        radius: beaconTarget.radius
      })
      if (Math.abs(beaconMove.x) + Math.abs(beaconMove.y) > 0.01) {
        this.autoNavHeading = Math.atan2(beaconMove.y, beaconMove.x)
      }
      return beaconMove
    }

    const cruise = navigationCruiseScalar({ navRank: this.build.nav, targetLocked: !!targetPlanet })
    const ghost = { x: Math.cos(this.autoNavHeading) * cruise, y: Math.sin(this.autoNavHeading) * cruise }
    return blendedNavigationMove({ ghost, move, manualActive, navRank: level })
  }

  private navigationCruiseLevel() {
    return this.build.nav
  }

  private bestNavigationPickup() {
    return bestNavigationPickup({
      pickups: this.pickups,
      player: this.player,
      navRank: this.build.nav,
      magnetRank: this.build.magnet
    })
  }

  private updateReturnBeacon(dt: number) {
    if (this.state !== 'playing') return
    if (!this.returnBeacon && this.returnBeaconReady()) {
      this.spawnReturnBeacon()
    }
    if (!this.returnBeacon) return
    this.returnBeacon.phase += dt
    this.returnBeacon.age += dt
    const distance = Math.sqrt(dist2(this.returnBeacon, this.player))
    if (this.returnBeacon.age > RETURN_BEACON_REMINDER_SECONDS && !this.returnBeacon.reminded) {
      this.returnBeacon.reminded = true
      this.toast('SPACE STATION WAITING - TAP DOCK TO LOCK')
      this.audio.pickup('nav')
    }
    if (this.returnBeacon.age > RETURN_BEACON_ASSIST_SECONDS && !this.returnBeacon.assistTriggered && !this.autoNavTargetBeacon) {
      this.returnBeacon.assistTriggered = true
      this.autoNavTargetPlanetId = null
      this.autoNavTargetBeacon = true
      this.autoNavActive = true
      this.autoNavHeading = Math.atan2(this.returnBeacon.y - this.player.y, this.returnBeacon.x - this.player.x)
      this.toast('DOCKING COURSE SET - NUDGE AWAY TO SKIP')
      this.audio.pickup('nav')
    }
    if (distance > RETURN_BEACON_SKIP_DISTANCE) {
      this.skipReturnBeacon()
      return
    }
    if (distance < this.returnBeacon.radius) {
      this.returnBeacon.hold += dt
      if (this.returnBeacon.hold >= BEACON_HOLD_SECONDS) {
        this.completeSectorNodeViaBeacon()
        return
      }
    } else {
      this.returnBeacon.hold = Math.max(0, this.returnBeacon.hold - dt * 1.5)
    }
  }

  private spawnReturnBeacon() {
    this.returnBeacon = createReturnBeacon({
      player: this.player,
      skippedBeacons: this.skippedReturnBeacons,
      randomRange: rand
    })
    this.toast('SPACE STATION AVAILABLE - TAP DOCK TO LOCK')
    this.audio.pickup('nav')
  }

  private returnBeaconReady() {
    const node = currentSectorNode(this.sectorMap)
    return returnBeaconReadyForRoute({
      time: this.stats.time,
      planetsVisited: this.stats.planets,
      activeBeacon: Boolean(this.returnBeacon),
      nextBeaconAt: this.nextReturnBeaconAt,
      introNode: this.isIntroSectorNode(node)
    })
  }

  private isIntroSectorNode(node: SectorNode) {
    return node.column === 1
  }

  private skipReturnBeacon() {
    if (!this.returnBeacon) return
    this.returnBeacon = null
    this.autoNavTargetBeacon = false
    this.skippedReturnBeacons += 1
    this.nextReturnBeaconAt = nextBeaconWindow(this.stats.time)
    this.toast('SPACE STATION SKIPPED. DEEP ROUTE BONUS RISING.')
  }

  private lockReturnBeacon() {
    if (!this.returnBeacon) return false
    this.autoNavTargetPlanetId = null
    this.autoNavTargetBeacon = true
    this.autoNavActive = true
    this.autoNavHeading = Math.atan2(this.returnBeacon.y - this.player.y, this.returnBeacon.x - this.player.x)
    this.toast('DOCKING COURSE LOCKED')
    this.audio.pickup('nav')
    return true
  }

  private applyThreatWeave(dt: number, level: number) {
    const avoidance = navigationThreatWeaveVector({
      player: this.player,
      enemies: this.enemies,
      navRank: level
    })
    if (!avoidance) return
    const avoidAngle = Math.atan2(avoidance.y, avoidance.x)
    this.autoNavHeading = angleLerp(this.autoNavHeading, avoidAngle, clamp(dt * (0.72 + level * 0.08), 0, 0.14))
  }

  private updateLanding(dt: number) {
    this.transitionTimer += dt
    this.toastTimer -= dt
    this.updateParticles(dt)
    this.updateCamera(dt)
    this.updateHud()
    if (this.transitionTimer >= this.transitionDuration) {
      this.transitionTimer = 0
      this.state = 'surface'
      this.audio.startAmbientLoop('planet-amb-loop', 0.4)
      this.toast('SURFACE TEAM DEPLOYED: COLLECT SIGNALS, RETURN TO SHIP')
    }
  }

  private updateTakeoff(dt: number) {
    this.transitionTimer += dt
    this.toastTimer -= dt
    this.updateParticles(dt)
    this.updateHud()
    const progress = surfaceTransitionProgress({ timer: this.transitionTimer, duration: this.transitionDuration })
    if (progress.snapToOrbit) this.snapToOrbitReturnPoint()
    if (progress.complete) this.finishTakeoff()
  }

  private updateDying(dt: number) {
    this.deathTimer += dt
    this.toastTimer -= dt
    if (this.toastTimer <= 0) this.ui.toast.classList.remove('visible')
    this.player.vx *= Math.pow(0.02, dt)
    this.player.vy *= Math.pow(0.02, dt)
    this.player.x += this.player.vx * dt
    this.player.y += this.player.vy * dt
    this.camera.shake = Math.max(this.camera.shake, 18 * Math.max(0, 1 - this.deathTimer / 1.6))
    this.updateBullets(dt)
    this.updateEnemies(dt)
    this.updatePickups(dt)
    this.updateParticles(dt)
    this.updateOrbitals(dt)
    this.updateCamera(dt)
    this.updateHud()
    if (this.deathTimer >= 2.35) this.finishRun('destroyed')
  }

  private snapToOrbitReturnPoint() {
    if (!this.orbitReturnPoint) return
    this.player.x = this.orbitReturnPoint.x
    this.player.y = this.orbitReturnPoint.y
    this.player.vx = 0
    this.player.vy = 0
    const target = cameraTargetFor(this.player, this.width, this.height, this.spaceScale())
    this.camera.x = target.x
    this.camera.y = target.y
    this.updateSpaceChunks(true)
  }

  private updateSurface(dt: number) {
    if (!this.surface) return
    const input = this.getInput()
    this.stats.time += dt * 0.25
    this.toastTimer -= dt
    if (this.toastTimer <= 0) this.ui.toast.classList.remove('visible')
    this.surface.pilot.gunCd -= dt
    this.surface.pilot.invuln -= dt
    const oxygen = advanceSurfaceOxygen({
      oxygen: this.surface.pilot.oxygen,
      maxOxygen: this.surface.pilot.maxOxygen,
      o2Returning: this.surface.o2Returning,
      dt,
      lowOxygenRatio: this.surfaceLowOxygenRatio()
    })
    this.surface.pilot.oxygen = oxygen.oxygen
    this.surface.o2Returning = oxygen.o2Returning
    if (oxygen.lowTriggered) {
      this.surface.message = 'O2 LOW - RETURNING TO SHIP'
      this.toast('O2 LOW - RETURNING TO SHIP')
    }
    if (oxygen.depleted) this.startTakeoff()
    if (this.state !== 'surface' || !this.surface) return

    const accel = powerupBalance.ship.surfaceAcceleration * dt
    this.surface.pilot.vx += input.move.x * accel
    this.surface.pilot.vy += input.move.y * accel
    if (this.surface.o2Returning) {
      const toShip = norm(this.surface.ship.x - this.surface.pilot.x, this.surface.ship.y - this.surface.pilot.y)
      this.surface.pilot.vx += toShip.x * powerupBalance.ship.surfaceReturnAcceleration * dt
      this.surface.pilot.vy += toShip.y * powerupBalance.ship.surfaceReturnAcceleration * dt
      this.surface.pilot.facing = Math.atan2(toShip.y, toShip.x)
    }
    const speed = len(this.surface.pilot.vx, this.surface.pilot.vy)
    const maxSpeed = powerupBalance.ship.surfaceMaxSpeedBase + this.build.engine * powerupBalance.ship.surfaceMaxSpeedPerEngineRank
    if (speed > maxSpeed) {
      this.surface.pilot.vx = (this.surface.pilot.vx / speed) * maxSpeed
      this.surface.pilot.vy = (this.surface.pilot.vy / speed) * maxSpeed
    }
    this.surface.pilot.vx *= Math.pow(0.04, dt)
    this.surface.pilot.vy *= Math.pow(0.04, dt)
    this.surface.pilot.x = clamp(this.surface.pilot.x + this.surface.pilot.vx * dt, 40, this.surface.width - 40)
    this.surface.pilot.y = clamp(this.surface.pilot.y + this.surface.pilot.vy * dt, 40, this.surface.height - 40)
    if (Math.abs(input.move.x) + Math.abs(input.move.y) > 0.05) this.surface.pilot.facing = Math.atan2(input.move.y, input.move.x)

    if (this.surface.pilot.gunCd <= 0 && this.findSurfaceTarget()) this.fireSurfaceGun()
    this.collectSurfaceResources()
    this.updateSurfaceBullets(dt)
    this.updateSurfaceThreats(dt)
    this.updateSurfaceWaves(dt)

    const nearShip = Math.sqrt(dist2(this.surface.pilot, this.surface.ship)) < 64
    const lore = this.findNearbyLoreSite()
    const alien = this.findNearbyAlien()
    const action = surfaceInteractionAction({
      o2Returning: this.surface.o2Returning,
      nearShip,
      interact: input.interact,
      nearbyLore: lore !== null,
      nearbyAlien: alien !== null
    })
    if (action === 'takeoff') this.startTakeoff()
    else if (action === 'inspectLore' && lore) this.inspectLoreSite(lore)
    else if (action === 'openAlien' && alien) this.openAlienEncounter(alien)
    if (shouldPromptSurfaceReturn({ collected: this.surface.collected, total: this.surface.resources.length, nearShip })) {
      this.surface.message = 'CACHE CLEARED. RETURN TO SHIP.'
    }

    this.surface.camera.x += (this.surface.pilot.x - this.width / 2 - this.surface.camera.x) * clamp(dt * 7, 0, 1)
    this.surface.camera.y += (this.surface.pilot.y - this.height / 2 - this.surface.camera.y) * clamp(dt * 7, 0, 1)
    this.surface.camera.x = clamp(this.surface.camera.x, 0, Math.max(0, this.surface.width - this.width))
    this.surface.camera.y = clamp(this.surface.camera.y, 0, Math.max(0, this.surface.height - this.height))

    this.updateParticles(dt)
    this.updateHud()
    if (this.player.hull <= 0) this.gameOver()
  }

  private getInput() {
    const gamepad = navigator.getGamepads?.().find((pad): pad is Gamepad => Boolean(pad))
    const inputAxes = resolvePlayerInputAxes({ keys: this.keys, touchStick: this.touchStick, gamepad })
    if (inputAxes.gamepadInteract) this.pressed.add('KeyE')

    const { move, moveActive, aimX, aimY, gamepadFire, gamepadDash } = inputAxes

    const directAimActive = Math.abs(aimX) + Math.abs(aimY) > 0
    const mouseWorld = this.mouse.down ? this.screenToWorld(this.mouse.x, this.mouse.y) : null
    const aim = resolvePlayerAim({
      aimX,
      aimY,
      previousAimAngle: this.player.aimAngle,
      player: this.player,
      mouseWorld,
      autoTarget: !directAimActive && !mouseWorld && this.state === 'playing' ? this.findAutoTarget() : null,
      isPlaying: this.state === 'playing'
    })
    return {
      move,
      moveActive,
      aiming: aim.aiming,
      aimAngle: aim.aimAngle,
      firing: this.keys.has('Space') || this.mouse.down || gamepadFire || aim.aiming || aim.autoFire || this.consumeMobileFire(),
      dash: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || gamepadDash || this.consumeMobileDash(),
      interact: this.consume('KeyE') || this.consume('Enter') || this.consumeMobileAction()
    }
  }

  private consumeMobileAction() {
    const queued = this.mobileActionQueued
    this.mobileActionQueued = false
    return queued
  }

  private consumeMobileDash() {
    const queued = this.mobileDashQueued
    this.mobileDashQueued = false
    return queued
  }

  private consumeMobileFire() {
    const queued = this.mobileFireQueued
    this.mobileFireQueued = false
    return queued
  }

  private findAutoTarget() {
    let best: Enemy | null = null
    let bestD = 900 * 900
    for (const enemy of this.enemies) {
      const d = (enemy.x - this.player.x) ** 2 + (enemy.y - this.player.y) ** 2
      if (d < bestD) {
        bestD = d
        best = enemy
      }
    }
    return best
  }

  private consume(code: string) {
    const has = this.pressed.has(code)
    if (has) this.pressed.delete(code)
    return has
  }

  private emitDashWake(direction: Vec, intensity = 1) {
    const wake = createDashWakeEffects({
      origin: this.player,
      direction,
      engineRank: this.build.engine,
      phaseRank: this.build.phase,
      intensity,
      highLoad: this.isHighLoad(),
      glowEnabled: this.allowGlow(),
      canAddShockwave: this.shockwaves.length < MAX_SHOCKWAVES
    })

    this.shockwaves.push(...wake.shockwaves)
    for (const particle of wake.particles) {
      if (this.particles.length >= MAX_PARTICLES) this.particles.shift()
      this.particles.push(particle)
    }
  }

  private fire() {
    const glassRisk = this.relics.has('glassReactor') ? 1.12 : 1
    const primaryFire = firePrimaryWeapon({
      bullets: this.bullets,
      player: this.player,
      build: this.build,
      evolved: this.evolved,
      limitBreaks: this.limitBreaks,
      statsLevel: this.stats.level,
      fireSerial: this.fireSerial,
      width: this.width,
      height: this.height,
      scale: this.spaceScale(),
      maxBullets: MAX_BULLETS,
      glassRisk
    })
    this.player.fireCd = primaryFire.fireCooldown
    this.fireSerial = primaryFire.nextFireSerial
    fireOptionOrbWeapons({
      bullets: this.bullets,
      player: this.player,
      orbitRank: this.build.orbit,
      fireSerial: primaryFire.fireSerial,
      evolvedOrbit: this.evolved.has('orbit'),
      evolvedChain: this.evolved.has('chain'),
      damage: primaryFire.damage,
      speed: primaryFire.speed,
      width: this.width,
      height: this.height,
      scale: this.spaceScale(),
      time: this.stats.time,
      maxBullets: MAX_BULLETS
    })
    fireRearGunWeapons({
      bullets: this.bullets,
      player: this.player,
      rearRank: this.build.rear,
      damage: primaryFire.damage,
      speed: primaryFire.speed,
      width: this.width,
      height: this.height,
      scale: this.spaceScale(),
      maxBullets: MAX_BULLETS
    })
    this.audio.fire(weaponSoundKindFor({
      rail: primaryFire.rail,
      needle: primaryFire.needle,
      count: primaryFire.rayCount,
      splitRank: this.build.split
    }), this.stats.level + primaryFire.rapid)
  }

  private updateBullets(dt: number) {
    this.rebuildEnemyGrid()
    for (let i = this.bullets.length - 1; i >= 0; i -= 1) {
      const b = this.bullets[i]
      b.life -= dt
      b.x += b.vx * dt
      b.y += b.vy * dt
      const bulletExpired = !b.hostile && b.life <= 0
      const bulletOffscreen =
        Math.abs(b.x - this.player.x) > spaceEnemyBehavior.global.bulletDespawnDistance ||
        Math.abs(b.y - this.player.y) > spaceEnemyBehavior.global.bulletDespawnDistance
      if (bulletExpired || bulletOffscreen) {
        this.bullets.splice(i, 1)
        continue
      }
      if (b.hostile) {
        const rr = this.player.radius + b.radius
        if ((this.player.x - b.x) ** 2 + (this.player.y - b.y) ** 2 < rr * rr) {
          this.damagePlayer(b.damage)
          this.bullets.splice(i, 1)
        }
        continue
      }
      const candidates = this.getNearbyEnemies(b.x, b.y)
      let hitAsteroid = false
      for (let h = this.spaceHazards.length - 1; h >= 0; h -= 1) {
        const hazard = this.spaceHazards[h]
        if (Math.abs(hazard.x - b.x) > hazard.radius + b.radius || Math.abs(hazard.y - b.y) > hazard.radius + b.radius) continue
        const rr = hazard.radius + b.radius
        if ((hazard.x - b.x) ** 2 + (hazard.y - b.y) ** 2 < rr * rr) {
          this.playBulletImpact(b.rail ? 1.25 : 0.9)
          const hazardDamage = damageSpaceHazardCombat({
            hazards: this.spaceHazards,
            hazard,
            amount: b.damage,
            color: b.color
          })
          this.burst(hazardDamage.burst.x, hazardDamage.burst.y, hazardDamage.burst.color, hazardDamage.burst.count, hazardDamage.burst.speed)
          this.stats.score += hazardDamage.score
          b.pierce -= 1
          hitAsteroid = true
          if (b.pierce < 0) {
            this.bullets.splice(i, 1)
            break
          }
        }
      }
      if (hitAsteroid && b.pierce < 0) continue
      for (let j = candidates.length - 1; j >= 0; j -= 1) {
        const e = candidates[j]
        if (e.hp <= 0) continue
        if (Math.abs(e.x - b.x) > e.radius + b.radius || Math.abs(e.y - b.y) > e.radius + b.radius) continue
        const rr = e.radius + b.radius
        if ((e.x - b.x) ** 2 + (e.y - b.y) ** 2 < rr * rr) {
          this.playBulletImpact(b.rail ? 1.3 : 1)
          this.damageEnemy(e, b.damage, b.rail ? '#fff27a' : '#57fff3')
          if (b.chain && b.chain > 0) {
            spawnChainBoltWeapon({
              bullets: this.bullets,
              enemies: this.enemies,
              source: b,
              hit: e,
              chainRank: this.build.chain,
              evolvedChain: this.evolved.has('chain'),
              maxBullets: MAX_BULLETS
            })
          }
          if (b.mine) this.burst(b.x, b.y, b.color, this.evolved.has('mine') ? 10 : 5, 120)
          b.pierce -= 1
          if (b.pierce < 0) {
            this.bullets.splice(i, 1)
            break
          }
        }
      }
    }
  }

  private playBulletImpact(power = 1) {
    if (this.bulletImpactCooldown > 0) return
    this.audio.impact(power)
    this.bulletImpactCooldown = this.isHighLoad() ? 0.075 : 0.032
  }

  private rebuildEnemyGrid() {
    this.enemyGrid.rebuild(this.enemies)
  }

  private getNearbyEnemies(x: number, y: number) {
    return this.enemyGrid.nearby(x, y)
  }

  private updateEnemies(dt: number) {
    const hunger = this.relics.has('hungryCompass') ? 1.08 : 1
    const behavior = spaceEnemyBehavior
    const ctx = this.enemyBehaviorCtx as { -readonly [K in 'playerX' | 'playerY' | 'time' | 'hunger']: number }
    ctx.playerX = this.player.x
    ctx.playerY = this.player.y
    ctx.time = this.stats.time
    ctx.hunger = hunger
    this.enemyBehaviorCtx.playerPos.x = this.player.x
    this.enemyBehaviorCtx.playerPos.y = this.player.y
    for (let i = this.enemies.length - 1; i >= 0; i -= 1) {
      const e = this.enemies[i]
      const enemyBalance = balancedSpaceEnemyDefinition(e.kind)
      e.phase += dt
      e.cd -= dt
      e.flash -= dt
      const toP = norm(this.player.x - e.x, this.player.y - e.y)
      const behaviorFn = enemyBehaviors[e.kind]
      if (behaviorFn) {
        const result = behaviorFn(e, this.enemyBehaviorCtx, dt, enemyBalance)
        if (result === 'consumed') continue
      }
      const max = enemyBalance.maxSpeed ?? (e.kind === 'brute' ? e.speed * behavior.brute.maxSpeedMultiplier : e.speed)
      const s = len(e.vx, e.vy)
      if (s > max) {
        e.vx = (e.vx / s) * max
        e.vy = (e.vy / s) * max
      }
      e.vx *= Math.pow(behavior.global.velocityDamping, dt)
      e.vy *= Math.pow(behavior.global.velocityDamping, dt)
      e.x += e.vx * dt
      e.y += e.vy * dt
      if (isSpriteEnemyKind(e.kind)) this.emitEnemyTrail(e, e.color, e.kind === 'shard' ? 2.2 : e.kind === 'razor' ? 1.6 : 1)

      const rr = e.radius + this.player.radius
      if (dist2(e, this.player) < rr * rr) {
        const dashRam = applyDashRam({
          enemy: e,
          player: this.player,
          phaseRank: this.build.phase,
          engineRank: this.build.engine
        })
        if (dashRam) {
          this.burst(dashRam.burst.x, dashRam.burst.y, dashRam.burst.color, dashRam.burst.count, dashRam.burst.speed)
          if (dashRam.killed) this.killEnemy(e, true)
          continue
        }
        this.damagePlayer(enemyBalance.contactDamage)
        if (e.kind === 'brute' || e.kind === 'bulwark' || isGiantEnemyKind(e.kind)) {
          e.vx -= toP.x * behavior.global.contactKnockback
          e.vy -= toP.y * behavior.global.contactKnockback
        } else if (e.kind !== 'warden') this.killEnemy(e, false)
      }
    }
  }

  private updatePickups(dt: number) {
    const result = updatePickupsPhysics({
      pickups: this.pickups,
      dt,
      player: this.player,
      magnetInput: {
        magnetLevel: this.build.magnet,
        limitMagnet: this.limitBreaks.magnet,
        hasHungryCompass: this.relics.has('hungryCompass'),
        elapsed: this.stats.time
      },
      glintEvery: introHookConfig.magnetGlint.frameInterval
    })
    for (const glint of result.glints) this.burst(glint.x, glint.y, introHookConfig.magnetGlint.color, 1, introHookConfig.magnetGlint.particleSpeed)
    for (const pickup of result.collected) this.collect(pickup)
  }

  private updateParticles(dt: number) {
    for (let i = this.shockwaves.length - 1; i >= 0; i -= 1) {
      const w = this.shockwaves[i]
      w.life -= dt
      w.radius += w.speed * dt
      if (w.life <= 0) this.shockwaves.splice(i, 1)
    }
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i]
      p.life -= dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.angle = (p.angle ?? 0) + (p.spin ?? 0) * dt
      p.vx *= Math.pow(0.12, dt)
      p.vy *= Math.pow(0.12, dt)
      if (p.life <= 0) this.particles.splice(i, 1)
    }
    advanceSpawnEntryPings({ pings: this.spawnEntryPings, dt })
    advanceImpactPulses({ pulses: this.impactPulses, dt })
    this.playerDamageFlash = advancePlayerDamageFlash(this.playerDamageFlash, dt)
  }

  private emitEnemyTrail(e: Enemy, color: string, intensity = 1) {
    if (this.isHighLoad() || this.particles.length >= MAX_PARTICLES) return
    const trail = createEnemyTrailParticle({ enemy: e, color, intensity, glowEnabled: this.allowGlow() })
    if (trail) this.particles.push(trail)
  }

  private spaceEnemyAttackContext(): SpaceEnemyAttackContext {
    return {
      time: this.stats.time,
      spawnHostileBullet: (bullet) => { this.bullets.push({ ...bullet, pierce: 0, hostile: true }) },
      burst: (x, y, color, count, speed) => this.burst(x, y, color, count, speed),
      shakeCamera: (amount) => { this.camera.shake = Math.max(this.camera.shake, amount) }
    }
  }

  private updateOrbitals(dt: number) {
    const result = applyOptionOrbDamage({
      enemies: this.enemies,
      player: this.player,
      orbitRank: this.build.orbit,
      fireSerial: this.fireSerial,
      evolvedOrbit: this.evolved.has('orbit'),
      limitMight: this.limitBreaks.might,
      time: this.stats.time,
      dt
    })
    for (const hit of result.hits) this.damageEnemy(hit.enemy, hit.damage, hit.color)
  }

  private updateSpawning() {
    this.recycleDistantEnemies()
    if (this.quietFieldTimer <= 0) {
      this.reinforceQuietField()
      this.quietFieldTimer = spaceSpawnBalance.quietField.reinforcementCooldownSeconds
    }
    const pressure = spawnPressureMinutes(this.stats.time)
    const sectorPressure = this.sectorNodeProfile.spawnMultiplier
    if (this.spawnTimer <= 0) {
      const cooldown = spaceSpawnBalance.spawnCooldown
      const packBalance = spaceSpawnBalance.pack
      this.spawnTimer = scaledSpawnTimer(clamp(
        cooldown.maxSeconds - pressure * cooldown.pressureReductionPerMinute - this.stats.planets * cooldown.planetReduction,
        cooldown.minSeconds,
        cooldown.maxSeconds
      )) / sectorPressure
      const pack = Math.ceil((packBalance.base + Math.floor(pressure * packBalance.pressurePerMinute) + (Math.random() < packBalance.bonusChance ? packBalance.bonusCount : 0)) * sectorPressure)
      const room = Math.max(0, MAX_ENEMIES - this.enemies.length)
      for (let i = 0; i < Math.min(pack, room); i += 1) this.spawnEnemy(this.pickEnemyKind())
    }
    if (this.bossTimer <= 0) {
      const boss = spaceSpawnBalance.boss
      this.bossTimer = scaledBossTimer(clamp(boss.maxSeconds - this.stats.time / boss.timeReductionDivisor, boss.minSeconds, boss.maxSeconds))
      this.spawnEnemy('warden')
      if (this.stats.time > boss.reinforcementTimeSeconds && this.enemies.length < MAX_ENEMIES - 2) this.spawnEnemy(Math.random() < boss.reinforcementChance ? 'brute' : 'shooter')
      this.toast('WARDEN VECTOR ENTERING THE FIELD')
    }
    if (this.chestTimer <= 0) {
      this.chestTimer = runBalance.spaceChest.respawnMinSeconds + Math.random() * runBalance.spaceChest.respawnRandomSeconds
      const p = this.randomNearPlayer(runBalance.spaceChest.spawnMinDistance, runBalance.spaceChest.spawnMaxDistance)
      this.pickups.push({ kind: 'chest', x: p.x, y: p.y, vx: 0, vy: 0, value: 1, radius: pickupBalance.chestRadius, life: pickupBalance.persistentLifeSeconds, color: '#fff27a' })
      this.toast('A TREASURE CORE IS BROADCASTING NEARBY')
    }
  }

  private updateSectorWaves() {
    if (this.state !== 'playing') return
    const elapsed = this.stats.time - this.sectorNodeStartedAt
    for (const wave of this.sectorNodeProfile.config.waves) {
      const id = spaceWaveId(this.sectorMap.currentNodeId, wave)
      if (this.firedSectorWaves.has(id) || elapsed < wave.atSeconds) continue
      this.firedSectorWaves.add(id)
      for (const [kind, count] of Object.entries(wave.enemies) as Array<[SpaceEnemyKind, number]>) {
        for (let i = 0; i < count; i += 1) this.spawnEnemy(kind)
      }
      if (wave.notes) this.toast(`${wave.label.toUpperCase()}: ${wave.notes.toUpperCase()}`)
    }
  }

  private updateSpaceEncounters(dt: number) {
    if (this.stats.time >= this.nextSpaceEncounterAt) {
      const kind = chooseSpaceEncounter({
        time: this.stats.time,
        planetsVisited: this.stats.planets,
        nearbyPlanetArchetype: this.nearbyPlanetArchetype(),
        encounterBias: this.sectorNodeProfile.encounterBias
      })
      this.triggerSpaceEncounter(kind)
      this.nextSpaceEncounterAt = this.nextSectorSpaceEncounterTime(this.stats.time)
    }

    if (this.asteroidFieldTimer > 0) {
      this.asteroidFieldTimer -= dt
      this.asteroidFieldSpawnTimer -= dt
      if (this.asteroidFieldSpawnTimer <= 0) {
        this.asteroidFieldSpawnTimer = 2.2
        this.seedAsteroidField(0.38)
      }
    }

    for (let i = this.spaceHazards.length - 1; i >= 0; i -= 1) {
      const hazard = this.spaceHazards[i]
      hazard.life -= dt
      hazard.phase += hazard.spin * dt
      hazard.hitCooldown -= dt
      hazard.x += hazard.vx * dt
      hazard.y += hazard.vy * dt
      if (hazard.life <= 0 || Math.abs(hazard.x - this.player.x) > 2600 || Math.abs(hazard.y - this.player.y) > 2600) {
        this.spaceHazards.splice(i, 1)
        continue
      }

      if (dist2(hazard, this.player) < (hazard.radius + this.player.radius) ** 2 && hazard.hitCooldown <= 0) {
        hazard.hitCooldown = 0.72
        this.damagePlayer(18 * hazard.damageMultiplier)
        this.camera.shake = Math.max(this.camera.shake, 14)
        this.burst(hazard.x, hazard.y, '#fff27a', 10, 170)
      }

      for (const enemy of this.enemies) {
        if (enemy.hp <= 0) continue
        if (dist2(hazard, enemy) < (hazard.radius + enemy.radius) ** 2) {
          this.damageEnemy(enemy, 54 * dt, '#fff27a')
          enemy.vx += hazard.vx * 0.18 * dt
          enemy.vy += hazard.vy * 0.18 * dt
        }
      }
    }

    for (let i = this.derelictSignals.length - 1; i >= 0; i -= 1) {
      const signal = this.derelictSignals[i]
      signal.life -= dt
      signal.phase += dt
      if (signal.life <= 0) this.derelictSignals.splice(i, 1)
    }
  }

  private triggerSpaceEncounter(kind: SpaceEncounterKind) {
    if (kind === 'meteorFront') {
      this.spaceHazards.push(...meteorFrontAsteroids({ player: this.player }).map((hazard) => ({
        ...hazard,
        phase: Math.random() * TAU,
        hitCooldown: 0,
        damageMultiplier: this.sectorNodeProfile.config.hazardConfig.asteroids?.damageMultiplier ?? 1
      })))
      this.toast('METEOR FRONT CROSSING')
      this.audio.pickup('nav')
      return
    }

    if (kind === 'asteroidField') {
      this.asteroidFieldTimer = 24
      this.asteroidFieldSpawnTimer = 1.4
      this.seedAsteroidField(1)
      this.toast('ASTEROID FIELD: WEAVE THROUGH')
      this.audio.pickup('nav')
      return
    }

    if (kind === 'hunterWing') {
      for (const point of hunterWingFormation({ player: this.player })) {
        if (this.enemies.length >= MAX_ENEMIES) break
        this.spawnEnemyAt(point.kind, point.x, point.y)
      }
      this.toast('HUNTER WING VECTORING IN')
      this.audio.level()
      return
    }

    if (kind === 'alienBloom') {
      for (const point of alienBloomFormation({ player: this.player })) {
        if (this.enemies.length >= MAX_ENEMIES) break
        this.spawnEnemyAt(point.kind, point.x, point.y)
      }
      this.toast('ALIEN BLOOM UNFURLING')
      this.audio.level()
      return
    }

    const signal = derelictCacheSignal({ player: this.player })
    this.derelictSignals.push({ x: signal.x, y: signal.y, phase: 0, life: 34 })
    if (this.pickups.length >= MAX_PICKUPS) this.pickups.shift()
    this.pickups.push({ kind: signal.pickupKind, x: signal.x, y: signal.y, vx: 0, vy: 0, value: 1, radius: 18, life: pickupBalance.persistentLifeSeconds, color: '#fff27a' })
    for (const [index, guardian] of signal.guardians.entries()) {
      if (this.enemies.length >= MAX_ENEMIES) break
      const angle = (index / signal.guardians.length) * TAU
      this.spawnEnemyAt(guardian, signal.x + Math.cos(angle) * 155, signal.y + Math.sin(angle) * 155)
    }
    this.toast('DERELICT CACHE BROADCASTING OFF ROUTE')
    this.audio.pickup('chest')
  }

  private seedAsteroidField(densityScale: number) {
    const asteroidConfig = this.sectorNodeProfile.config.hazardConfig.asteroids
    const density = Math.max(0.45, (asteroidConfig?.density ?? 1) * densityScale)
    const maxAsteroids = Math.round(22 + density * 18)
    if (this.spaceHazards.length >= maxAsteroids) return
    const room = maxAsteroids - this.spaceHazards.length
    const plans = asteroidFieldAsteroids({
      player: this.player,
      density,
      drift: asteroidConfig?.drift ?? 'slow'
    }).slice(0, room)
    const damageMultiplier = asteroidConfig?.damageMultiplier ?? 1
    this.spaceHazards.push(...plans.map((hazard) => ({
      ...hazard,
      phase: Math.random() * TAU,
      hitCooldown: 0,
      damageMultiplier
    })))
  }

  private nearbyPlanetArchetype(): PlanetArchetype | undefined {
    let best: Planet | null = null
    let bestD = spaceEnemyBehavior.global.nearbyPlanetArchetypeRadius * spaceEnemyBehavior.global.nearbyPlanetArchetypeRadius
    for (const planet of this.planets) {
      const d = dist2(planet, this.player)
      if (d < bestD) {
        bestD = d
        best = planet
      }
    }
    return best?.archetype
  }

  private nextSectorSpaceEncounterTime(now: number) {
    const scheduled = nextSpaceEncounterTime(now)
    return now + (scheduled - now) * this.sectorNodeProfile.encounterGapMultiplier
  }

  private recycleDistantEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i -= 1) {
      if (shouldRecycleEnemy(this.enemies[i], this.player, ENEMY_RECYCLE_RADIUS)) this.enemies.splice(i, 1)
    }
  }

  private reinforceQuietField() {
    const pressure = spawnPressureMinutes(this.stats.time)
    const quiet = spaceSpawnBalance.quietField
    const nearby = this.countNearbyEnemies(ENEMY_PRESSURE_RADIUS)
    const targetNearbyEnemies = clamp(quiet.targetNearbyBase + Math.floor(pressure * quiet.targetNearbyPerMinute) + this.stats.planets, quiet.targetNearbyMin, quiet.targetNearbyMax)
    const maxPack = clamp(quiet.maxPackBase + Math.floor(pressure * quiet.maxPackPerMinute), quiet.maxPackMin, quiet.maxPackMax)
    const room = Math.max(0, MAX_ENEMIES - this.enemies.length)
    const pack = Math.min(room, Math.floor(pressurePackSize({ nearbyEnemies: nearby, targetNearbyEnemies, maxPack }) * activeBalanceProfile.spawnRateMultiplier))
    for (let i = 0; i < pack; i += 1) this.spawnEnemy(this.pickEnemyKind())
  }

  private countNearbyEnemies(radius: number) {
    const r2 = radius * radius
    let count = 0
    for (const enemy of this.enemies) {
      if (dist2(enemy, this.player) <= r2) count += 1
    }
    return count
  }

  private pickEnemyKind(): EnemyKind {
    const bias = this.sectorNodeProfile.enemyBias
    if (bias.length && Math.random() < spaceEnemyBehavior.global.sectorBiasChance) return bias[Math.floor(Math.random() * bias.length)]
    return pickSpaceEnemyKind(this.stats.time)
  }

  private spawnEnemy(kind: EnemyKind) {
    if (this.enemies.length >= MAX_ENEMIES) return
    const p = spaceEnemySpawnPoint(kind, this.player, spaceEnemyBehavior.global.spawnMinRadius, spaceEnemyBehavior.global.spawnMaxRadius)
    this.spawnEnemyAt(kind, p.x, p.y)
  }

  private spawnEnemyAt(kind: EnemyKind, x: number, y: number) {
    if (this.enemies.length >= MAX_ENEMIES) return
    const color = balancedSpaceEnemyDefinition(kind).color
    this.recordEnemyDiscovery(`enemy:space:${kind}`, `${this.enemyDisplayName(kind)} Vector`, `Encountered in open space after ${formatTime(this.stats.time)}.`, 'Space horde telemetry', color)
    if (isGiantEnemyKind(kind)) {
      this.audio.playSample(Math.random() < 0.5 ? 'alienship-scan-high' : 'alienship-scan-low', { gain: 0.6 })
    }
    const enemy = createSpaceEnemy({
      id: this.enemyId++,
      kind,
      x,
      y,
      time: this.stats.time,
      planets: this.stats.planets
    })
    this.enemies.push(enemy)
    this.spawnEntryPings.push(createSpawnEntryPing({
      x,
      y,
      color: enemy.color,
      giant: isGiantEnemyKind(kind)
    }))
    if (this.spawnEntryPings.length > 96) this.spawnEntryPings.shift()
  }

  private enemyDisplayName(kind: EnemyKind) {
    return kind.replace(/([A-Z])/g, ' $1').replace(/^./, (ch) => ch.toUpperCase())
  }

  private randomNearPlayer(minR: number, maxR: number): Vec {
    const a = Math.random() * TAU
    const r = rand(minR, maxR)
    return {
      x: this.player.x + Math.cos(a) * r,
      y: this.player.y + Math.sin(a) * r
    }
  }

  private damageEnemy(e: Enemy, amount: number, color: string) {
    e.hp -= amount
    e.flash = damageFeedbackConfig.hitFlash.durationSeconds
    const highLoad = this.isHighLoad()
    const pulse = createImpactPulse({
      kind: 'hit',
      x: e.x,
      y: e.y,
      color,
      amount,
      giant: isGiantEnemyKind(e.kind),
      highLoad
    })
    appendImpactPulse({ pulses: this.impactPulses, pulse, cap: 96 })
    const spark = createImpactSparkParticle({
      x: e.x,
      y: e.y,
      color,
      highLoad,
      particleCount: this.particles.length,
      maxParticles: MAX_PARTICLES,
      random: Math.random
    })
    if (spark) this.particles.push(spark)
    if (e.hp <= 0) this.killEnemy(e, true)
  }

  private killEnemy(e: Enemy, reward: boolean) {
    this.removeEnemy(e)
    const highLoad = this.isHighLoad()
    const feedback = resolveSpaceEnemyDeathFeedback({
      kind: e.kind,
      highLoad,
      collisionFxCooldown: this.collisionFxCooldown
    })
    const pulse = createImpactPulse({
      kind: 'kill',
      x: e.x,
      y: e.y,
      color: e.color,
      amount: e.value,
      giant: feedback.big,
      highLoad
    })
    appendImpactPulse({ pulses: this.impactPulses, pulse, cap: 96 })
    if (feedback.playFx) {
      this.audio.boom(feedback.boomKind)
      this.camera.shake = Math.max(this.camera.shake, feedback.cameraShake)
      this.burst(e.x, e.y, e.color, feedback.burstCount, feedback.burstSpeed)
      this.collisionFxCooldown = feedback.collisionCooldownSeconds
    }
    if (reward) {
      appendScorePopup(this.scorePopups, createScorePopup({
        x: e.x,
        y: e.y,
        value: e.value,
        layer: 'space',
        riseSpeed: introHookConfig.popup.riseSpeed,
        lifeSeconds: introHookConfig.popup.lifeSeconds
      }), introHookConfig.popup.cap)
      if (introHookConfig.hitstop.giantKindsOnly && isGiantEnemyKind(e.kind)) {
        this.hitstopUntil = performance.now() / 1000 + introHookConfig.hitstop.durationSeconds
      }
      this.stats.kills += 1
      this.stats.score += e.value
      const killReward = resolveSpaceEnemyKillReward({ kind: e.kind, highLoad })
      for (let i = 0; i < killReward.xpDrops; i += 1) this.drop('xp', e.x, e.y, killReward.xpValue)
      if (killReward.chest) this.drop('chest', e.x, e.y, 1)
      const splitChildCount = resolveSpaceEnemySplitChildSpawnCount({
        kind: e.kind,
        enemyCount: this.enemies.length,
        maxEnemies: MAX_ENEMIES,
        random: Math.random
      })
      for (let k = 0; k < splitChildCount; k += 1) {
        const child = this.spawnChild(e.x, e.y)
        this.enemies.push(child)
      }
      const bonusDrops = resolveSpaceEnemyBonusDrops({
        vampireRank: this.build.vampire,
        elapsedSeconds: this.stats.time,
        random: Math.random
      })
      for (const drop of bonusDrops) this.drop(drop.kind, e.x, e.y, drop.value)
    }
  }

  private removeEnemy(e: Enemy) {
    const idx = this.enemies.indexOf(e)
    if (idx < 0) return
    const last = this.enemies.pop()
    if (last && idx < this.enemies.length) this.enemies[idx] = last
  }

  private spawnChild(x: number, y: number): Enemy {
    return createSplitChildEnemy({
      id: this.enemyId++,
      x,
      y,
      time: this.stats.time
    })
  }

  private damagePlayer(amount: number) {
    if (this.state === 'surface' && this.surface) {
      this.damageSurfacePilot(amount)
      return
    }
    const damage = damageShipPlayer({
      player: this.player,
      amount,
      phaseRank: this.build.phase
    })
    if (!damage) return
    this.playerDamageFlash = damage.flash
    this.audio.hit()
    this.camera.shake = Math.max(this.camera.shake, 12)
    this.burst(this.player.x, this.player.y, '#ff5d73', 16, 210)
  }

  private damageSurfacePilot(amount: number) {
    if (!this.surface) return
    const pilot = this.surface.pilot
    const damage = damageSuitPilot({
      pilot,
      amount,
      phaseRank: this.build.phase
    })
    if (!damage) return
    this.playerDamageFlash = damage.flash
    this.audio.hit()
    this.camera.shake = Math.max(this.camera.shake, 10)
    this.burst(pilot.x, pilot.y, '#ff5d73', 12, 180)
    if (damage.suitCritical) {
      this.surface.message = 'SUIT CRITICAL - RETURNING TO SHIP'
      this.toast('SUIT CRITICAL - RETURNING TO SHIP')
      this.startTakeoff()
    }
  }

  private drop(kind: PickupKind, x: number, y: number, value: number) {
    dropPickup({
      pickups: this.pickups,
      kind,
      x,
      y,
      value,
      highLoad: this.isHighLoad(),
      maxPickups: MAX_PICKUPS
    })
  }

  private collect(p: Pickup) {
    this.audio.pickup(p.kind)
    const collection = collectPickup({
      pickup: p,
      stats: this.stats,
      player: this.player,
      magnetRank: this.build.magnet,
      maxMagnetRank: upgradeMaxRank('magnet')
    })
    this.stats.score = collection.stats.score
    this.stats.level = collection.stats.level
    this.stats.xp = collection.stats.xp
    this.stats.nextXp = collection.stats.nextXp
    this.player.hull = collection.player.hull
    this.player.pickupAbsorbPulse = collection.player.pickupAbsorbPulse
    this.build.magnet = collection.magnetRank
    if (collection.extendPickupLifeSeconds !== undefined) {
      for (const drop of this.pickups) drop.life = Math.max(drop.life, collection.extendPickupLifeSeconds)
    }
    if (collection.toast) this.toast(collection.toast)
    if (collection.artifact) this.recordArtifact(collection.artifact)
    for (let i = 0; i < collection.bankedSignals; i += 1) this.bankUpgrade(collection.bankMessage)
  }

  private bankUpgrade(message?: string) {
    this.pendingUpgrades += 1
    const signalAnchor = this.state === 'surface' && this.surface
      ? { x: this.surface.pilot.x, y: this.surface.pilot.y - 42, layer: 'surface' as const }
      : { x: this.player.x, y: this.player.y - 42, layer: 'space' as const }
    appendScorePopup(this.scorePopups, createSignalPopup({
      x: signalAnchor.x,
      y: signalAnchor.y,
      layer: signalAnchor.layer,
      riseSpeed: introHookConfig.popup.riseSpeed,
      lifeSeconds: introHookConfig.popup.lifeSeconds
    }), introHookConfig.popup.cap)
    if (message) this.toast(message)
    return true
  }

  private surfaceSignalCap(surface = this.surface) {
    return surfaceSignalCap(surface?.event ?? null)
  }

  private bankSurfaceUpgrade(message?: string) {
    if (!this.surface) return this.bankUpgrade(message)
    const result = resolveSurfaceSignalBank({
      event: this.surface.event,
      bankedSignals: this.surface.bankedSignals,
      overflowSignals: this.surface.overflowSignals
    })
    this.surface.bankedSignals = result.nextBankedSignals
    this.surface.overflowSignals = result.nextOverflowSignals
    this.resources.scrap += result.scrap
    this.resources.crystal += result.crystal
    if (result.toast) this.toast(result.toast)
    if (!result.banked) {
      return false
    }
    if (result.pendingUpgrade) this.surface.pendingUpgrade = true
    return this.bankUpgrade(message)
  }

  private openLevelUp(title = 'SHIPBOARD WORKBENCH', copy = 'Spend one banked mutation signal before takeoff.', rare = false) {
    this.state = 'levelup'
    this.audio.level()
    this.workbenchInstalling = false
    this.upgradeChoices = []
    this.renderLevelUp(title, copy)
  }

  private refreshLevelUp(title = 'SHIPBOARD WORKBENCH', copy = 'Spend one banked mutation signal before takeoff.') {
    const scrollTop = this.currentLevelUpScrollTop()
    this.state = 'levelup'
    this.workbenchInstalling = false
    this.renderLevelUp(title, copy)
    this.restoreLevelUpScroll(scrollTop)
  }

  private openChest() {
    this.recordArtifact({
      id: 'cache:treasure-core',
      kind: 'cache',
      title: 'Treasure Core',
      detail: 'A space broadcast cache carrying concentrated rewards.',
      source: 'Space cache telemetry',
      color: '#70a8ff',
      icon: 73
    })
    this.bankUpgrade('TREASURE CORE BANKED. INSTALL IT WHEN YOU BOARD.')
    this.stats.score += runBalance.scoring.treasureCoreBase + this.stats.level * runBalance.scoring.treasureCorePerLevel
  }

  private rollUpgrades(count: number, rare = false): WorkbenchChoice[] {
    return rollWorkbenchChoices({
      count,
      rare,
      build: this.build,
      relics: this.relics,
      evolved: this.evolved,
      workbenchTier: this.mothership.departments.workbench,
      discoverySuitOffer: this.discoverySuitOffer,
      extraUnlockedIds: uiWorkbenchExtraUnlockedIds(this)
    })
  }

  private applyWorkbenchChoice(choice: WorkbenchChoice) {
    this.workbenchInstalling = false
    if (!this.canApplyWorkbenchChoice(choice)) {
      this.toast('SIGNAL REJECTED: SYSTEM ALREADY MAXED')
      this.refreshLevelUp('SHIPBOARD WORKBENCH', `${this.pendingUpgrades} mutation signal${this.pendingUpgrades === 1 ? '' : 's'} remain before takeoff.`)
      return
    }
    const rare = choice.kind !== 'upgrade' || choice.upgrade.rarity < workbenchBalance.rareInstallRarityThreshold
    this.audio.upgrade(uiInstallCueFor(this, choice), rare)
    if (choice.kind === 'upgrade') this.applyUpgrade(choice.upgrade)
    else if (choice.kind === 'evolution') this.applyEvolution(choice.evolution)
    else if (choice.kind === 'relic') this.acquireRelic(choice.relic, 'WORKBENCH RELIC INSTALLED')
    else this.applyLimitBreak(choice)
    const anchor = this.fxAnchor()
    appendScorePopup(this.scorePopups, createInstallPopup({
      x: anchor.x,
      y: anchor.y - 42,
      label: uiChoiceTitle(this, choice),
      layer: this.surface ? 'surface' : 'space',
      riseSpeed: introHookConfig.popup.riseSpeed,
      lifeSeconds: introHookConfig.popup.lifeSeconds
    }), introHookConfig.popup.cap)
    if (choice.kind === 'upgrade' && choice.upgrade.bucket === 'spacesuit') this.discoverySuitOffer = false
    this.pendingUpgrades = Math.max(0, this.pendingUpgrades - 1)
    if (this.pendingUpgrades > 0) {
      this.refreshLevelUp('SHIPBOARD WORKBENCH', `${this.pendingUpgrades} mutation signal${this.pendingUpgrades === 1 ? '' : 's'} remain before takeoff.`)
      return
    }
    this.showOnly(null)
    if (this.takeoffAfterWorkbench) {
      this.surfaceInstallCompleted = true
      this.takeoffAfterWorkbench = false
      this.startTakeoff()
    } else if (this.returnToSectorMapAfterWorkbench) {
      this.returnToSectorMapAfterWorkbench = false
      this.showSectorMap('Station workbench complete. Choose the next jump.')
    } else {
      this.state = 'playing'
    }
  }

  private applyUpgrade(upgrade: Upgrade) {
    const nextLevel = Math.min(this.build[upgrade.id] + 1, upgrade.max)
    if (nextLevel === this.build[upgrade.id]) {
      this.toast(`${upgrade.name.toUpperCase()} ALREADY MAXED`)
      return
    }
    this.build[upgrade.id] = nextLevel
    if (upgrade.id === 'engine') this.player.speed += powerupBalance.upgradeApply.engineSpeedPerRank
    if (upgrade.id === 'nav') {
      this.autoNavActive = true
      this.autoNavHeading = len(this.player.vx, this.player.vy) > 20 ? Math.atan2(this.player.vy, this.player.vx) : this.player.angle
      if (nextLevel === 1) this.toast('NAV GHOST TUNED TO YOUR DRIFT')
    }
    if (upgrade.id === 'shield') {
      this.player.maxShield += powerupBalance.upgradeApply.shieldCapacityPerRank
      this.player.shield = this.player.maxShield
    }
    if (upgrade.id === 'repair') {
      this.player.maxHull += powerupBalance.upgradeApply.repairHullPerRank
      this.player.hull = this.player.maxHull
    }
    if (upgrade.id === 'suitHealth' && this.surface) {
      this.surface.pilot.maxHealth = this.surfaceMaxHealth()
      this.surface.pilot.health = this.surface.pilot.maxHealth
    }
    if (upgrade.id === 'suitO2' && this.surface) {
      this.surface.pilot.maxOxygen = this.surfaceMaxOxygen()
      this.surface.pilot.oxygen = this.surface.pilot.maxOxygen
    }
    if (upgrade.id === 'magnet') this.stats.score += powerupBalance.upgradeApply.magnetInstallScore
    const anchor = this.fxAnchor()
    const color = this.upgradeFxColor(upgrade)
    this.upgradeSurge(anchor.x, anchor.y, color, upgrade.category === 'weapon' ? '#ffffff' : '#d7fff7', upgrade.category === 'weapon' ? 1.1 : 0.92)
    const nextRank = nextLevel
    const milestone = weaponMilestonePulse({ upgrade, nextRank })
    if (milestone) {
      this.burst(this.player.x, this.player.y, milestone.color, milestone.count, milestone.speed)
      this.toast(milestone.label)
    } else {
      this.toast(`${upgrade.name.toUpperCase()} ONLINE`)
    }
  }

  private applyEvolution(evolution: Evolution) {
    this.evolved.add(evolution.weapon)
    this.audio.level()
    const anchor = this.fxAnchor()
    this.upgradeSurge(anchor.x, anchor.y, '#fff27a', '#ffffff', 1.75)
    this.toast(`${evolution.name.toUpperCase()} EVOLVED`)
  }

  private acquireRelic(relic: Relic, message = 'PLANET RELIC FOUND') {
    if (this.relics.has(relic.id)) {
      this.resources.cores += 1
      this.stats.score += runBalance.scoring.duplicateRelicScore
      this.toast('DUPLICATE RELIC CONVERTED TO CORE')
      return
    }
    this.relics.add(relic.id)
    this.recordArtifact({
      id: `relic:${relic.id}`,
      kind: 'relic',
      title: relic.name,
      detail: relic.description,
      source: message,
      color: this.artifactColor('relic', relic.id),
      icon: hashString(relic.id, 41) % 16
    })
    this.stats.score += runBalance.scoring.relicBaseScore + this.relics.size * runBalance.scoring.relicScorePerOwned
    this.audio.level()
    const anchor = this.fxAnchor()
    this.upgradeSurge(anchor.x, anchor.y, '#fff27a', '#b990ff', 1.25)
    this.toast(`${message}: ${relic.name.toUpperCase()}`)
  }

  private applyLimitBreak(choice: Extract<WorkbenchChoice, { kind: 'limit' }>) {
    this.limitBreaks[choice.id] += 1
    if (choice.id === 'hull') {
      this.player.maxHull += powerupBalance.upgradeApply.limitHullMaxPerRank
      this.player.hull = clamp(this.player.hull + powerupBalance.upgradeApply.limitHullRepairPerRank, 0, this.player.maxHull)
    }
    const anchor = this.fxAnchor()
    this.upgradeSurge(anchor.x, anchor.y, '#70a8ff', '#d7fff7', 0.72)
    this.toast(choice.name.toUpperCase())
  }

  private fxAnchor(): Vec {
    return this.surface?.ship ?? this.player
  }

  private upgradeFxColor(upgrade: Upgrade) {
    if (upgrade.category === 'weapon') return '#57fff3'
    return {
      weapons: '#57fff3',
      navigation: '#70a8ff',
      survival: '#8fff7d',
      economy: '#fff27a',
      planetcraft: '#fff27a',
      spacesuit: '#70a8ff',
      control: '#b990ff'
    }[upgrade.bucket] ?? '#8fff7d'
  }

  private upgradeSurge(x: number, y: number, color: string, accent: string, intensity: number) {
    const baseCount = Math.floor(18 + intensity * 18)
    const baseSpeed = 190 + intensity * 85
    this.burst(x, y, color, baseCount, baseSpeed)
    if (intensity > 0.9) this.burst(x, y, accent, Math.floor(baseCount * 0.45), baseSpeed * 0.72)
    const spokes = Math.floor(8 + intensity * 6)
    const ring = 30 + intensity * 18
    for (let i = 0; i < spokes; i += 1) {
      if (this.particles.length >= MAX_PARTICLES) this.particles.shift()
      const a = (i / spokes) * TAU + rand(-0.08, 0.08)
      const speed = rand(baseSpeed * 0.62, baseSpeed * 1.25)
      const life = rand(0.45, 0.82 + intensity * 0.12)
      this.particles.push({
        x: x + Math.cos(a) * ring,
        y: y + Math.sin(a) * ring,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life,
        maxLife: life,
        color: i % 3 === 0 ? accent : color,
        size: rand(2.5, 6 + intensity * 4),
        angle: a,
        spin: rand(-10, 10),
        sides: i % 2 ? 4 : 3,
        glow: this.allowGlow() ? 34 : 16
      })
    }
    if (this.shockwaves.length < MAX_SHOCKWAVES) {
      this.shockwaves.push({
        x,
        y,
        radius: 24 + intensity * 10,
        speed: 150 + intensity * 70,
        life: 0.5 + intensity * 0.12,
        maxLife: 0.5 + intensity * 0.12,
        color: accent,
        jag: rand(0, TAU)
      })
    }
  }

  private recordPlanetArtifact(planet: Planet, source: string) {
    this.recordArtifact({
      id: `planet:${planet.archetype}`,
      kind: 'planet',
      title: `${planet.archetype.toUpperCase()} WORLD`,
      detail: `Planet archetype surveyed from ${planet.name}.`,
      source: 'Planet survey',
      color: planet.color,
      icon: hashString(planet.archetype, 19) % 80
    })
    this.recordArtifact({
      id: `planet:${planet.id}`,
      kind: 'planet',
      title: planet.name,
      detail: `${planet.biome.label}. ${planet.reward}`,
      source: `${source} // ${planet.archetype.toUpperCase()}`,
      color: planet.biome.baseColor,
      icon: hashString(planet.id, 19) % 16
    })
  }

  private tryLand() {
    if (this.player.landedCd > 0) return
    const planet = this.planets.find((p) => Math.sqrt(dist2(p, this.player)) < p.radius + 86)
    if (!planet) {
      if (this.lockReturnBeacon()) return
      if (canLockPlanetCourse({
        navRank: this.build.nav,
        pendingUpgrades: this.pendingUpgrades,
        navPlanetLockRank: powerupBalance.ship.navPlanetLockRank,
        hasLockedPlanet: Boolean(this.autoNavTargetPlanetId),
        stationAvailable: Boolean(this.returnBeacon),
        planetCount: this.planets.length
      })) {
        const target = nearestPlanetCourseTarget(this.planets, this.player)
        if (target) {
          this.autoNavTargetPlanetId = target.id
          this.autoNavActive = true
          this.autoNavHeading = Math.atan2(target.y - this.player.y, target.x - this.player.x)
          this.toast(planetCourseLockToast({ pendingUpgrades: this.pendingUpgrades, planetName: target.name }))
          this.audio.pickup('nav')
          return
        }
      }
      this.toast('NO LANDING SIGNAL IN RANGE')
      return
    }
    this.startLanding(planet)
  }

  private startLanding(planet: Planet) {
    this.stopIntroWaypoint()
    this.state = 'landing'
    this.planetChoice = planet
    this.autoNavTargetPlanetId = null
    this.orbitReturnPoint = { x: this.player.x, y: this.player.y }
    this.transitionTimer = 0
    this.transitionDuration = 1.35
    this.showOnly(null)
    this.audio.land()
    this.audio.planetSignal(planet.archetype)
    this.surface = this.createSurfaceRun(planet)
    this.player.vx *= 0.1
    this.player.vy *= 0.1
    this.toast(`DESCENDING TO ${planet.name}`)
  }

  private createSurfaceRun(planet: Planet): SurfaceRun {
    const world = surfaceRunBalance.world
    const pilot = {
      x: world.pilotStart.x,
      y: world.pilotStart.y,
      vx: 0,
      vy: 0,
      facing: 0,
      gunCd: 0,
      invuln: 0,
      health: this.surfaceMaxHealth(),
      maxHealth: this.surfaceMaxHealth(),
      oxygen: this.surfaceMaxOxygen(),
      maxOxygen: this.surfaceMaxOxygen()
    }
    const ship = { ...world.ship }
    const threatKeepouts = this.surfaceThreatKeepouts(pilot, ship)
    const first = !planet.visited
    const openingLanding = this.visitedPlanets.size === 0 && this.stats.planets === 0
    const profile = planSurfaceEncounter({
      planetArchetype: planet.archetype,
      firstRunLanding: openingLanding,
      firstVisitToPlanet: first,
      interest: this.surfaceInterest(),
      time: this.stats.time,
      luck: this.build.luck,
      survey: this.build.survey,
      random: Math.random
    })
    const event = profile.event
    const scenario = profile.scenario
    const count = profile.resourceCount
    const resources = createSurfaceResourceNodes({
      count,
      event,
      firstVisit: first,
      openingLanding,
      planetColor: planet.color,
      roll: Math.random,
      eventPoint: (i, total) => this.surfaceEventPoint(event, i, total),
      safePoint: (point, minDistance) => this.surfaceSafePoint(point, minDistance)
    })
    const threats: SurfaceThreat[] = []
    const threatCount = profile.threatCount + (planet.name === 'NULL CATHEDRAL' && event !== 'horde' ? 1 : 0)
    for (let i = 0; i < threatCount; i += 1) {
      threats.push(this.createGenericSurfaceThreat(planet, event, i, threatCount, threatKeepouts))
    }
    for (let i = 0; i < profile.bossCount; i += 1) {
      threats.push(this.createPlanetBossThreat(planet, scenario === 'mixed' || scenario === 'horde', threatKeepouts))
    }
    if (profile.bossCount === 0 && (scenario === 'boss' || scenario === 'mixed')) {
      threats.push(this.createPlanetBossThreat(planet, scenario === 'mixed', threatKeepouts))
    } else if (event === 'volatile' && first && Math.random() < 0.18) {
      threats.push(this.createGlassMiteOracleThreat(threatKeepouts))
    }
    const aliens = this.createSurfaceAliens(planet, event, threatCount, scenario, profile.alienCount)
    const loreSites = this.createSurfaceLoreSites(planet, scenario, event, profile.loreSiteCount)
    return {
      planet,
      event,
      scenario,
      width: world.width,
      height: world.height,
      pilot,
      ship,
      camera: this.initialSurfaceCamera(pilot, world),
      resources,
      threats,
      bullets: [],
      aliens,
      loreSites,
      wave: createSurfaceWaveState({ event, scenario }),
      waveTelegraphs: [],
      collected: 0,
      pendingUpgrade: false,
      bankedSignals: 0,
      overflowSignals: 0,
      bossCacheCount: profile.bossCacheCount,
      o2Returning: false,
      message: surfaceEventMessage(event, first, scenario)
    }
  }

  private initialSurfaceCamera(pilot: Vec, world: typeof surfaceRunBalance.world) {
    return createInitialSurfaceCamera({ pilot, world, viewWidth: this.width, viewHeight: this.height })
  }

  private surfaceInterest() {
    return surfaceRunInterest(this.stats)
  }

  private surfaceMaxHealth() {
    return surfaceMaxHealth(this.build)
  }

  private surfaceMaxOxygen() {
    return surfaceMaxOxygen(this.build)
  }

  private surfaceLowOxygenRatio() {
    return surfaceLowOxygenRatio(this.build)
  }

  private surfaceGunDamage() {
    return surfaceGunDamage(this.build)
  }

  private surfaceGunCooldown() {
    return surfaceGunCooldown(this.build)
  }

  private surfaceGunSpeed() {
    return surfaceGunSpeed(this.build)
  }

  private surfaceThreatKeepouts(pilot: Vec, ship: Vec) {
    return surfaceThreatKeepouts(pilot, ship)
  }

  private safeSurfaceThreatPoint(candidate: Vec, keepouts: ReturnType<VectorShooter['surfaceThreatKeepouts']>, clearance: number = surfaceRunBalance.threatPlacement.safeDefaultClearance, fallbackAngle = 0) {
    return safeSurfaceThreatPoint(candidate, keepouts, clearance, fallbackAngle)
  }

  private createGenericSurfaceThreat(planet: Planet, event: SurfaceEventKind, i: number, total: number, keepouts: ReturnType<VectorShooter['surfaceThreatKeepouts']>): SurfaceThreat {
    const { threat, discovery } = createGenericSurfaceThreatFactory({
      planet,
      event,
      index: i,
      total,
      keepouts,
      time: this.stats.time,
      randomRange: rand
    })
    this.recordEnemyDiscovery(discovery.id, discovery.title, discovery.detail, discovery.source, discovery.color)
    return threat
  }

  private createPlanetBossThreat(planet: Planet, crowded: boolean, keepouts: ReturnType<VectorShooter['surfaceThreatKeepouts']>): SurfaceThreat {
    const { threat, discovery } = createPlanetBossThreatFactory({
      planet,
      crowded,
      keepouts,
      time: this.stats.time,
      level: this.stats.level,
      planetsVisited: this.stats.planets,
      randomRange: rand
    })
    this.recordEnemyDiscovery(discovery.id, discovery.title, discovery.detail, discovery.source, discovery.color)
    return threat
  }

  private createGlassMiteOracleThreat(keepouts: ReturnType<VectorShooter['surfaceThreatKeepouts']>): SurfaceThreat {
    const { threat, discovery } = createGlassMiteOracleThreatFactory({
      keepouts,
      time: this.stats.time,
      randomRange: rand
    })
    this.recordEnemyDiscovery(discovery.id, discovery.title, discovery.detail, discovery.source, discovery.color)
    return threat
  }

  private createSurfaceAliens(planet: Planet, event: SurfaceEventKind, threatCount: number, scenario: SurfaceScenarioKind, forcedCount?: number): SurfaceAlien[] {
    return createSurfaceAliensFactory({
      planet,
      event,
      threatCount,
      scenario,
      forcedCount,
      surfaceInterest: this.surfaceInterest(),
      time: this.stats.time,
      random: Math.random,
      randomRange: rand
    })
  }

  private createSurfaceLoreSites(planet: Planet, scenario: SurfaceScenarioKind, event: SurfaceEventKind, forcedCount?: number): SurfaceLoreSite[] {
    return createSurfaceLoreSitesFactory({
      planet,
      scenario,
      event,
      forcedCount,
      planetsVisited: this.stats.planets,
      random: Math.random,
      randomRange: rand,
      safePoint: (point, minDistance) => this.surfaceSafePoint(point, minDistance)
    })
  }

  private surfaceEventPoint(event: SurfaceEventKind, i: number, count: number): Vec {
    return plannedSurfaceEventPoint(event, i, count, rand)
  }

  private surfaceSafePoint(point: Vec, minDistance = 210): Vec {
    return safeSurfaceResourcePoint(point, rand, minDistance)
  }

  private confirmLanding() {
    this.stopIntroWaypoint()
    if (!this.planetChoice) return
    const p = this.planetChoice
    const first = !p.visited
    p.visited = true
    this.visitedPlanets.add(p.id)
    this.stats.planets = this.visitedPlanets.size
    this.stats.score += first
      ? runBalance.landing.firstVisitScoreBase + this.stats.planets * runBalance.landing.firstVisitScorePerPlanet
      : runBalance.landing.revisitScore
    if (first) this.recordPlanetArtifact(p, 'Docked from orbit')
    this.player.hull = clamp(this.player.hull + (first ? runBalance.landing.firstVisitHullRepair : runBalance.landing.revisitHullRepair), 0, this.player.maxHull)
    if (p.name === 'NULL CATHEDRAL' && first) this.spawnEnemy('warden')
    if (p.name === 'SAINT STATIC' && first) this.drop('chest', p.x, p.y, 1)
    if (p.name === 'GREEN CHOIR' && first) {
      this.build.shield = clamp(this.build.shield + runBalance.landing.greenChoirShieldRanks, 0, upgradeMaxRank('shield'))
      this.player.maxShield += runBalance.landing.greenChoirShieldCapacity
      this.player.shield = this.player.maxShield
    }
    this.player.landedCd = runBalance.landing.landedCooldownSeconds
    this.state = 'playing'
    this.toast(first ? `${p.name}: ${p.reward.toUpperCase()}` : `${p.name}: QUIET DOCKING COMPLETE`)
    if (first) this.openLevelUp()
    else this.showOnly(null)
  }

  private collectSurfaceResources() {
    if (!this.surface) return
    const collectedResources = collectTouchedSurfaceResources({
      resources: this.surface.resources,
      pilot: this.surface.pilot
    })
    for (const resource of collectedResources) {
      this.surface.collected += 1
      this.audio.pickup(resource.kind)
      this.burst(resource.x, resource.y, resource.color, resource.kind === 'cache' ? 22 : 10, resource.kind === 'cache' ? 240 : 140)
      const pickup = resolveSurfaceResourcePickup({ resource, build: this.build })
      this.resources.crystal += pickup.crystal
      this.resources.scrap += pickup.scrap
      this.stats.score += pickup.score
      if (pickup.mutationXp > 0) {
        const levelsGained = applyMutationXp(this.stats, pickup.mutationXp)
        for (let i = 0; i < levelsGained; i += 1) this.bankSurfaceUpgrade()
      }
      if (pickup.repair > 0) {
        this.surface.pilot.health = clamp(this.surface.pilot.health + pickup.repair, 0, this.surface.pilot.maxHealth)
      }
      if (pickup.cache) {
        this.resolvePlanetCache(resource)
      }
    }
  }

  private resolvePlanetCache(resource: SurfaceResource) {
    if (!this.surface) return
    const artifactColor = this.artifactColor('cache', `${this.surface.planet.id}:${resource.x}:${resource.y}`)
    this.recordArtifact(createSurfaceCacheArtifact({
      event: this.surface.event,
      planet: this.surface.planet,
      resource,
      color: artifactColor
    }))
    const missingRelics = relics.filter((relic) => !this.relics.has(relic.id))
    const reward = resolveSurfaceCacheReward({
      level: this.stats.level,
      build: this.build,
      missingRelicCount: missingRelics.length,
      random: Math.random,
      randomRange: rand
    })
    this.stats.score += reward.score
    this.resources.scrap += reward.scrap
    this.resources.crystal += reward.crystal
    this.resources.cores += reward.cores
    if (reward.relicIndex !== null) {
      const relic = missingRelics[reward.relicIndex]
      this.acquireRelic(relic)
      this.surface.message = `${relic.name.toUpperCase()} RECOVERED. GET BACK TO THE SHIP.`
    } else {
      const banked = this.bankSurfaceUpgrade()
      this.surface.message = banked
        ? 'MUTATION CACHE SECURED. GET BACK TO THE SHIP.'
        : 'SIGNAL BUFFER FULL. CACHE CONVERTED TO CARGO.'
    }
    if (reward.extraSignal) {
      this.bankSurfaceUpgrade('BONUS MUTATION SIGNAL FOUND IN CACHE')
    }
    const cacheMessage = this.surface.message
    const ambushChance = surfaceCacheAmbushChance({ surveyRank: this.build.survey, hasStaticIdol: this.relics.has('staticIdol') })
    if (Math.random() < ambushChance) {
      const keepouts = this.surfaceThreatKeepouts(this.surface.pilot, this.surface.ship)
      const ambush = surfaceRunBalance.cacheAmbush
      this.surface.threats.push(...createSurfaceCacheAmbushThreats({
        resource,
        time: this.stats.time,
        count: ambush.baseCount + Math.floor(this.stats.time / ambush.timeDivisor),
        random: Math.random,
        safeThreatPoint: (point, clearance, fallbackAngle) => this.safeSurfaceThreatPoint(point, keepouts, clearance, fallbackAngle)
      }))
      this.surface.message = `${cacheMessage} CACHE WAS WIRED.`
    }
  }

  private updateSurfaceThreats(dt: number) {
    if (!this.surface) return
    for (let i = this.surface.threats.length - 1; i >= 0; i -= 1) {
      const threat = this.surface.threats[i]
      const motion = updateSurfaceThreatMotion({
        threat,
        pilot: this.surface.pilot,
        surface: { width: this.surface.width, height: this.surface.height },
        dt
      })
      if (motion.blinkBurst) this.burst(motion.blinkBurst.x, motion.blinkBurst.y, motion.blinkBurst.color, motion.blinkBurst.count, motion.blinkBurst.speed)
      if (motion.contactDamage !== null) {
        this.damagePlayer(motion.contactDamage)
        this.burst(this.surface.pilot.x, this.surface.pilot.y, '#ff5d73', 10, 160)
      }
      if (threat.hp <= 0) {
        const scoreValue = threat.boss ? runBalance.scoring.surfaceBossScore : runBalance.scoring.surfaceThreatScore
        this.burst(threat.x, threat.y, threat.color, threat.boss ? 42 : 24, threat.boss ? 360 : 260)
        this.audio.boom(threat.boss ? 'heavy' : 'surface')
        this.stats.kills += 1
        this.stats.score += scoreValue
        appendScorePopup(this.scorePopups, createScorePopup({
          x: threat.x,
          y: threat.y,
          value: scoreValue,
          layer: 'surface',
          riseSpeed: introHookConfig.popup.riseSpeed,
          lifeSeconds: introHookConfig.popup.lifeSeconds
        }), introHookConfig.popup.cap)
        if (threat.behavior === 'splitter' && !threat.splitChild) {
          this.surface.threats.push(...spawnSurfaceSplitterChildren({
            threat,
            surface: { width: this.surface.width, height: this.surface.height },
            time: this.stats.time
          }))
        }
        if (threat.boss) this.dropSurfaceBossCache(threat)
        this.surface.threats.splice(i, 1)
      }
    }
  }

  private updateSurfaceWaves(dt: number) {
    if (!this.surface) return
    const readyWaves = advanceSurfaceWaveTelegraphs({ telegraphs: this.surface.waveTelegraphs, dt })
    for (const anchor of readyWaves) {
      this.spawnSurfaceWaveThreats(anchor)
    }

    const queuedWaveThreats = this.surface.waveTelegraphs.reduce((total, telegraph) => total + telegraph.spawnCount, 0)
    const result = updateSurfaceWaveDirector({
      wave: this.surface.wave,
      event: this.surface.event,
      scenario: this.surface.scenario,
      dt,
      activeThreats: this.surface.threats.length + queuedWaveThreats,
      o2Returning: this.surface.o2Returning,
      collected: this.surface.collected,
      totalResources: this.surface.resources.length
    })
    if (result.telegraph) {
      const point = this.surfaceWaveTelegraphPoint()
      this.surface.waveTelegraphs.push({
        x: point.x,
        y: point.y,
        spawnCount: result.telegraph.spawnCount,
        life: result.telegraph.warningSeconds,
        maxLife: result.telegraph.warningSeconds
      })
      return
    }

    if (result.spawnCount > 0) this.spawnSurfaceWaveThreats({
      ...this.surfaceWaveTelegraphPoint(),
      spawnCount: result.spawnCount
    })
  }

  private surfaceWaveTelegraphPoint(): Vec {
    if (!this.surface) return { x: 0, y: 0 }
    const keepouts = this.surfaceThreatKeepouts(this.surface.pilot, this.surface.ship)
    return surfaceWaveTelegraphPoint({
      event: this.surface.event,
      waveIndex: this.surface.wave.waveIndex,
      time: this.stats.time,
      pilot: this.surface.pilot,
      safeThreatPoint: (point, clearance, fallbackAngle) => this.safeSurfaceThreatPoint(point, keepouts, clearance, fallbackAngle)
    })
  }

  private spawnSurfaceWaveThreats(anchor: { x: number; y: number; spawnCount: number }) {
    if (!this.surface) return
    const keepouts = this.surfaceThreatKeepouts(this.surface.pilot, this.surface.ship)
    const start = this.surface.threats.length
    const total = Math.max(1, start + anchor.spawnCount)
    const points = surfaceWaveSpawnPoints({
      anchor,
      elapsed: this.surface.wave.elapsed,
      safeThreatPoint: (point, clearance, fallbackAngle) => this.safeSurfaceThreatPoint(point, keepouts, clearance, fallbackAngle)
    })
    for (let i = 0; i < points.length; i += 1) {
      const point = points[i]
      const threat = this.createGenericSurfaceThreat(this.surface.planet, this.surface.event, start + i, total, keepouts)
      threat.x = point.x
      threat.y = point.y
      this.surface.threats.push(threat)
    }
    this.burst(anchor.x, anchor.y, '#ff5d73', 8 + anchor.spawnCount * 2, 170)
  }

  private dropSurfaceBossCache(threat: SurfaceThreat) {
    if (!this.surface) return
    const result = createSurfaceBossCacheDrops({
      count: this.surface.bossCacheCount,
      scenario: this.surface.scenario,
      level: this.stats.level,
      threat,
      random: Math.random,
      safePoint: (point, minDistance) => this.surfaceSafePoint(point, minDistance)
    })
    this.surface.resources.push(...result.resources)
    this.surface.message = result.message
    this.camera.shake = Math.max(this.camera.shake, 10)
  }

  private findNearbyAlien() {
    if (!this.surface) return null
    return findNearbySurfaceAlien({
      aliens: this.surface.aliens,
      pilot: this.surface.pilot
    })
  }

  private findNearbyLoreSite() {
    if (!this.surface) return null
    return findNearbySurfaceLoreSite({
      loreSites: this.surface.loreSites,
      pilot: this.surface.pilot
    })
  }

  private inspectLoreSite(site: SurfaceLoreSite) {
    if (!this.surface || site.resolved) return
    this.state = 'lore'
    site.resolved = true
    this.surface.message = `${site.title}: ${site.copy}`
    const reward = resolveSurfaceLoreReward({
      level: this.stats.level,
      surveyRank: this.build.survey,
      random: Math.random
    })
    this.stats.score += reward.score
    this.resources.crystal += reward.crystal
    this.recordArtifact({
      id: `lore:${site.kind}`,
      kind: 'lore',
      title: site.title,
      detail: site.copy,
      source: this.surface.planet.name,
      color: this.artifactColor('lore', `${this.surface.planet.id}:${site.kind}`),
      icon: hashString(`${site.kind}:${site.title}`, 31) % 16
    })
    let decodedSignal = false
    if (reward.signalDecoded) {
      decodedSignal = this.bankSurfaceUpgrade('OLD SIGNAL DECODED: MUTATION SIGNAL BANKED')
    } else {
      this.toast(`${site.title} INSPECTED`)
    }
    this.audio.level()
    this.burst(site.x, site.y, '#d7fff7', 18, 210)
    this.surface.pilot.vx = 0
    this.surface.pilot.vy = 0
    this.ui.planet.innerHTML = ''
    const panel = document.createElement('div')
    panel.className = 'panel planet-panel'
    const h = document.createElement('h1')
    h.className = 'title'
    h.textContent = site.title
    const copy = document.createElement('p')
    copy.className = 'copy'
    copy.textContent = site.copy
    const rewardLine = document.createElement('p')
    rewardLine.className = 'copy'
    rewardLine.textContent = decodedSignal
      ? `Recovered ${reward.crystal} crystal, ${reward.score} score, and a mutation signal.`
      : `Recovered ${reward.crystal} crystal and ${reward.score} score.`
    const row = document.createElement('div')
    row.className = 'button-row'
    const close = document.createElement('button')
    close.className = 'vector-button'
    close.textContent = 'Continue'
    close.addEventListener('click', () => {
      this.state = 'surface'
      this.showOnly(null)
    })
    row.append(close)
    panel.append(h, copy, rewardLine, row)
    this.ui.planet.append(panel)
    this.showOnly('planet')
  }

  private openAlienEncounter(alien: SurfaceAlien) {
    if (!this.surface || alien.resolved) return
    this.state = 'alien'
    this.alienChoice = alien
    this.surface.pilot.vx = 0
    this.surface.pilot.vy = 0
    this.ui.planet.innerHTML = ''
    const panel = document.createElement('div')
    panel.className = 'panel planet-panel'
    const h = document.createElement('h1')
    h.className = 'title'
    h.textContent = alien.name
    const copy = document.createElement('p')
    copy.className = 'copy'
    copy.textContent = alienGiftOfferCopy(alien.gift)
    const row = document.createElement('div')
    row.className = 'button-row'
    const take = document.createElement('button')
    take.className = 'vector-button'
    take.textContent = 'Take Gift'
    take.addEventListener('click', () => this.resolveAlienGift(true))
    const leave = document.createElement('button')
    leave.className = 'vector-button secondary'
    leave.textContent = 'Leave It'
    leave.addEventListener('click', () => this.resolveAlienGift(false))
    row.append(take, leave)
    panel.append(h, copy, row)
    this.ui.planet.append(panel)
    this.showOnly('planet')
  }

  private resolveAlienGift(take: boolean) {
    if (!this.surface || !this.alienChoice) return
    const alien = this.alienChoice
    alien.resolved = true
    this.alienChoice = null
    this.recordArtifact({
      id: `alien:${this.collectionSlug(alien.name)}`,
      kind: 'alien',
      title: alien.name,
      detail: `${take ? 'Accepted' : 'Refused'} ${alien.gift.toUpperCase()} gift.`,
      source: this.surface.planet.name,
      color: alien.color,
      icon: hashString(`${alien.name}:${alien.gift}`, 53) % 16
    })
    this.state = 'surface'
    this.showOnly(null)
    if (!take) {
      this.surface.message = `${alien.name} FADES WITHOUT OFFENCE.`
      this.toast('ALIEN GIFT REFUSED')
      return
    }
    const good = isAlienGiftGood({
      luckRank: this.build.luck,
      surveyRank: this.build.survey,
      random: Math.random
    })
    if (good) this.applyGoodAlienGift(alien)
    else this.applyBadAlienGift(alien)
  }

  private applyGoodAlienGift(alien: SurfaceAlien) {
    if (!this.surface) return
    const gift = surfaceRunBalance.alien.goodGift
    if (alien.gift === 'herb') {
      this.player.hull = clamp(this.player.hull + gift.herbHullRepair, 0, this.player.maxHull)
      this.resources.crystal += gift.herbCrystals
      this.surface.message = 'THE HERB IS SWEET. HULL KNITS SHUT.'
    } else if (alien.gift === 'idol') {
      const missingRelics = relics.filter((relic) => !this.relics.has(relic.id))
      if (missingRelics.length && Math.random() < powerupBalance.upgradeApply.alienIdolRelicBaseChance + this.build.luck * powerupBalance.upgradeApply.alienIdolRelicLuckChancePerRank) {
        this.acquireRelic(missingRelics[Math.floor(Math.random() * missingRelics.length)], 'ALIEN ARTEFACT CLAIMED')
        this.surface.message = 'THE IDOL OPENS INTO A RARE ARTEFACT.'
      } else {
        const banked = this.bankSurfaceUpgrade('ALIEN IDOL BANKED A MUTATION SIGNAL')
        this.resources.cores += gift.idolCores
        this.surface.message = banked ? 'THE IDOL HUMS IN TUNE WITH THE SHIP.' : 'THE IDOL OVERLOADS THE BUFFER AND HARDENS INTO CARGO.'
      }
    } else if (alien.gift === 'map') {
      this.build.survey = clamp(this.build.survey + powerupBalance.upgradeApply.alienMapSurveyRanks, 0, upgradeMaxRank('survey'))
      this.stats.score += gift.mapScore
      this.surface.message = 'THE MAP BURNS A BETTER PLANET SENSE INTO YOUR HUD.'
    } else if (alien.gift === 'coin') {
      this.resources.scrap += gift.coinScrap
      this.resources.cores += gift.coinCores
      this.stats.score += gift.coinScore
      this.surface.message = 'THE COIN LANDS EDGE-UP. IMPOSSIBLE. PROFITABLE.'
    } else {
      this.resources.crystal += gift.beaconCrystals
      const banked = this.bankSurfaceUpgrade('STATION WIDOW BANKED A MUTATION SIGNAL')
      this.summonReturnBeaconAfterTakeoff = true
      this.stats.score += gift.beaconScore
      this.surface.message = banked
        ? 'THE STATION STARTS LISTENING FROM ORBIT. GET BACK TO THE SHIP.'
        : 'THE STATION WAKES ORBIT, BUT THE EXTRA SIGNAL BECOMES CARGO.'
    }
    this.audio.pickup('gift')
    this.burst(alien.x, alien.y, alien.color, 22, 220)
    this.toast('ALIEN GIFT ACCEPTED')
  }

  private applyBadAlienGift(alien: SurfaceAlien) {
    if (!this.surface) return
    const gift = surfaceRunBalance.alien.badGift
    if (alien.gift === 'herb') {
      this.damagePlayer(gift.herbDamage)
      this.surface.message = 'THE HERB BITES BACK. YOUR SUIT HATES IT.'
    } else if (alien.gift === 'idol') {
      this.damagePlayer(gift.idolDamage)
      this.surface.threats.push(...createBadAlienGiftThreats({
        gift: alien.gift,
        origin: alien,
        surface: this.surface,
        time: this.stats.time,
        randomRange: rand
      }))
      this.surface.message = 'THE IDOL OPENS. SMALL HUNGRY THINGS FALL OUT.'
    } else if (alien.gift === 'map') {
      this.resources.crystal = Math.max(0, this.resources.crystal - gift.mapCrystalLoss)
      this.surface.message = 'THE MAP IS A MOUTH. IT EATS YOUR CRYSTALS.'
    } else if (alien.gift === 'coin') {
      this.resources.scrap = Math.max(0, this.resources.scrap - gift.coinScrapLoss)
      this.damagePlayer(gift.coinDamage)
      this.surface.message = 'THE COIN LANDS ON A SIDE YOU DO NOT HAVE.'
    } else {
      this.damagePlayer(gift.beaconDamage)
      this.surface.pilot.oxygen = Math.max(gift.beaconMinOxygen, this.surface.pilot.oxygen - gift.beaconOxygenLoss)
      this.surface.threats.push(...createBadAlienGiftThreats({
        gift: alien.gift,
        origin: alien,
        surface: this.surface,
        time: this.stats.time,
        randomRange: rand
      }))
      this.surface.message = 'THE DOCKING CHARTER SCREAMS. SOMETHING ANSWERS FROM UNDER THE DUST.'
    }
    this.audio.boom('surface')
    this.burst(alien.x, alien.y, '#ff5d73', 24, 240)
    this.toast('ALIEN GIFT WAS BAD')
  }

  private updateSurfaceBullets(dt: number) {
    if (!this.surface) return
    const result = updateSurfaceBulletsAndThreatDamage({
      bullets: this.surface.bullets,
      threats: this.surface.threats,
      surface: { width: this.surface.width, height: this.surface.height },
      dt
    })
    for (const hit of result.hits) {
      this.playBulletImpact(0.85)
      this.surfaceHitSpark(hit.x, hit.y, hit.color)
    }
  }

  private surfaceHitSpark(x: number, y: number, color: string) {
    for (let i = 0; i < 1; i += 1) {
      if (this.particles.length >= MAX_PARTICLES) this.particles.shift()
      const a = rand(-0.45, 0.45) + (i ? Math.PI : 0)
      const speed = rand(32, 58)
      const life = rand(0.1, 0.16)
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life,
        maxLife: life,
        color,
        size: rand(0.8, 1.5),
        angle: a,
        length: rand(3, 7),
        glow: 0
      })
    }
  }

  private findSurfaceTarget() {
    if (!this.surface) return null
    return pickSurfaceTarget({ threats: this.surface.threats, pilot: this.surface.pilot })
  }

  private fireSurfaceGun() {
    if (!this.surface) return
    const target = this.findSurfaceTarget()
    if (!target) return
    const angle = Math.atan2(target.y - this.surface.pilot.y, target.x - this.surface.pilot.x)
    this.surface.pilot.facing = angle
    this.surface.pilot.gunCd = this.surfaceGunCooldown()
    this.audio.fire('surface', 1)
    const bullet = createSurfaceBullet({
      pilot: this.surface.pilot,
      target,
      speed: this.surfaceGunSpeed(),
      damage: this.surfaceGunDamage(),
      muzzleOffset: surfacePilotMuzzleOffset()
    })
    this.surface.bullets.push(bullet)
    this.burst(bullet.x, bullet.y, bullet.color, 4, 90)
  }

  private startTakeoff(options: { urgent?: boolean; skipWorkbench?: boolean } = {}) {
    if (!this.surface) return
    const request = surfaceTakeoffRequest({
      pendingUpgrades: this.pendingUpgrades,
      urgent: options.urgent,
      skipWorkbench: options.skipWorkbench
    })
    if (request.action === 'openWorkbench') {
      this.takeoffAfterWorkbench = true
      this.openLevelUp('SHIPBOARD WORKBENCH', `${this.pendingUpgrades} banked mutation signal${this.pendingUpgrades === 1 ? '' : 's'} available. Spend before takeoff.`)
      return
    }
    this.state = 'takeoff'
    this.transitionTimer = 0
    this.transitionDuration = request.duration
    this.audio.stopAmbientLoop()
    this.audio.land()
    this.toast(request.toast)
  }

  private finishTakeoff() {
    if (!this.surface) return
    this.snapToOrbitReturnPoint()
    const installedBeforeTakeoff = this.surfaceInstallCompleted
    this.surfaceInstallCompleted = false
    const first = !this.surface.planet.visited
    this.surface.planet.visited = true
    this.visitedPlanets.add(this.surface.planet.id)
    this.stats.planets = this.visitedPlanets.size
    if (this.stats.planets === 1) {
      this.chunks.clear()
      this.activeChunkKey = ''
      this.updateSpaceChunks(true)
    }
    if (first) this.recordPlanetArtifact(this.surface.planet, 'Surface expedition')
    this.stats.score += surfaceExtractionScore({ firstVisit: first, collected: this.surface.collected })
    this.player.landedCd = runBalance.landing.landedCooldownSeconds
    this.player.invuln = runBalance.landing.orbitInvulnerabilitySeconds
    const planetName = this.surface.planet.name
    this.surface = null
    this.alienChoice = null
    this.orbitReturnPoint = null
    this.state = 'playing'
    this.showOnly(null)
    if (this.summonReturnBeaconAfterTakeoff && !this.returnBeacon) {
      this.summonReturnBeaconAfterTakeoff = false
      this.spawnReturnBeacon()
      this.toast(`${planetName}: SPACE STATION WOKEN`)
    } else if (installedBeforeTakeoff) {
      this.summonReturnBeaconAfterTakeoff = false
      this.toast(`${planetName}: SIGNAL INSTALLED // ROUTE RESUMED`)
    } else {
      this.summonReturnBeaconAfterTakeoff = false
      this.toast(`${planetName}: SURFACE CACHE EXTRACTED`)
    }
    if (this.relics.has('deadSunCoin') && Math.random() < 0.75) {
      this.spawnEnemy('warden')
      this.toast('DEAD SUN HUNTER FOUND YOUR WAKE')
    }
  }

  private updateCamera(dt: number) {
    const target = cameraTargetFor(this.player, this.width, this.height, this.spaceScale())
    const targetX = target.x
    const targetY = target.y
    this.camera.x += (targetX - this.camera.x) * clamp(dt * 7, 0, 1)
    this.camera.y += (targetY - this.camera.y) * clamp(dt * 7, 0, 1)
    this.camera.shake = Math.max(0, this.camera.shake - dt * 35)
  }

  private spaceScale() {
    return spaceViewportScale(this.width, this.height)
  }

  private burst(x: number, y: number, color: string, count: number, speed: number) {
    const load = this.particles.length / MAX_PARTICLES
    const glow = this.allowGlow()
    const modeBoost = glow ? 1.65 : this.graphicsMode === 'MED' ? 1.15 : 1
    const particleCount = Math.max(3, Math.floor(count * modeBoost * clamp(1 - load * (glow ? 0.35 : 0.65), glow ? 0.5 : 0.3, 1)))
    const big = count > 24
    if (this.shockwaves.length < MAX_SHOCKWAVES) {
      this.shockwaves.push({
        x,
        y,
        radius: big ? 18 : 8,
        speed: big ? speed * 0.9 : speed * 0.72,
        life: big ? 0.62 : 0.36,
        maxLife: big ? 0.62 : 0.36,
        color,
        jag: rand(0, TAU)
      })
      if (big && this.shockwaves.length < MAX_SHOCKWAVES) {
        this.shockwaves.push({
          x,
          y,
          radius: 4,
          speed: speed * 1.35,
          life: 0.42,
          maxLife: 0.42,
          color: '#ffffff',
          jag: rand(0, TAU)
        })
      }
      if (glow && this.shockwaves.length < MAX_SHOCKWAVES) {
        this.shockwaves.push({
          x,
          y,
          radius: big ? 30 : 14,
          speed: speed * 0.46,
          life: big ? 0.82 : 0.52,
          maxLife: big ? 0.82 : 0.52,
          color: '#57fff3',
          jag: rand(0, TAU)
        })
      }
    }
    for (let i = 0; i < particleCount; i += 1) {
      if (this.particles.length >= MAX_PARTICLES) this.particles.shift()
      const a = Math.random() * TAU
      const s = rand(speed * 0.35, speed)
      const shard = i % 3 === 0
      const life = rand(big ? 0.42 : 0.28, big ? 1.05 : 0.72)
      this.particles.push({
        x: x + Math.cos(a) * rand(0, 12),
        y: y + Math.sin(a) * rand(0, 12),
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life,
        maxLife: life,
        color: i % 7 === 0 ? '#ffffff' : color,
        size: shard ? rand(4, big ? 12 : 8) : rand(1, 4),
        angle: a,
        spin: rand(-8, 8),
        sides: shard ? Math.floor(rand(3, 6)) : undefined,
        length: shard ? undefined : rand(glow ? 22 : 14, big ? (glow ? 72 : 46) : (glow ? 42 : 30)),
        glow: glow ? (shard ? 32 : 24) : shard ? 18 : 12
      })
    }
  }

  private screenToWorld(x: number, y: number): Vec {
    return spaceScreenToWorld({ x, y }, this.camera, this.spaceScale())
  }

  private worldToScreen(x: number, y: number): Vec {
    const shakeX = this.camera.shake > 0 ? rand(-this.camera.shake, this.camera.shake) : 0
    const shakeY = this.camera.shake > 0 ? rand(-this.camera.shake, this.camera.shake) : 0
    const p = spaceWorldToScreen({ x, y }, this.camera, this.spaceScale())
    return { x: p.x + shakeX, y: p.y + shakeY }
  }

  private render() {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)
    ctx.fillStyle = '#020305'
    ctx.fillRect(0, 0, this.width, this.height)
    if ((this.state === 'levelup' || this.state === 'alien' || this.state === 'lore') && this.surface) {
      this.mini.style.display = 'none'
      this.renderSurface(ctx)
      return
    }
    const handler = this.stateHandlers[this.state]
    if (handler?.render) {
      handler.render(ctx)
      this.renderPlayerDamageFlash(ctx)
      return
    }
    this.renderSpaceScene(ctx)
    this.renderPlayerDamageFlash(ctx)
  }

  private renderSpaceScene(ctx: CanvasRenderingContext2D) {
    this.mini.style.display = this.state === 'dying' ? 'none' : ''
    drawSpaceBackground({
      ctx,
      width: this.width,
      height: this.height,
      camera: this.camera,
      stars: this.stars,
      sector: this.currentChunk(),
      chunkSize: CHUNK_SIZE,
      spaceScale: this.spaceScale(),
      glow: this.allowGlow(),
      worldToScreen: (x, y) => this.worldToScreen(x, y)
    })
    drawSpacePlanets({
      ctx,
      planets: this.planets,
      width: this.width,
      height: this.height,
      time: this.stats.time,
      scale: this.spaceScale(),
      glow: this.allowGlow(),
      worldToScreen: (x, y) => this.worldToScreen(x, y)
    })
    drawSpaceHazards({
      ctx,
      hazards: this.spaceHazards,
      width: this.width,
      height: this.height,
      scale: this.spaceScale(),
      glow: this.allowGlow(),
      worldToScreen: (x, y) => this.worldToScreen(x, y)
    })
    drawDerelictSignals({
      ctx,
      signals: this.derelictSignals,
      width: this.width,
      height: this.height,
      scale: this.spaceScale(),
      glow: this.allowGlow(),
      worldToScreen: (x, y) => this.worldToScreen(x, y)
    })
    this.renderReturnBeacon(ctx)
    this.renderPickups(ctx)
    this.renderBullets(ctx)
    this.renderEnemies(ctx)
    this.renderThreatIndicators(ctx)
    this.renderSpawnEntryPings(ctx)
    this.renderOrbitals(ctx)
    this.renderAutopilot(ctx)
    if (this.state !== 'dying' || this.deathTimer < 0.16) this.renderPlayer(ctx)
    this.renderShockwaves(ctx)
    this.renderParticles(ctx)
    this.renderImpactPulses(ctx)
    if (this.state === 'playing') {
      const landingPlanet = this.planets.find((planet) => Math.sqrt(dist2(planet, this.player)) < planet.radius + 86)
      if (landingPlanet) {
        drawLandingPrompt({
          ctx,
          width: this.width,
          planetName: landingPlanet.name,
          anchor: this.worldToScreen(landingPlanet.x, landingPlanet.y - landingPlanet.radius - 42)
        })
      }
    }
    this.renderSectorWaveWarning(ctx)
    drawMinimap({
      ctx: this.miniCtx,
      player: this.player,
      planets: this.planets,
      enemies: this.enemies,
      chunkSize: CHUNK_SIZE,
      chunkLoadRadius: CHUNK_LOAD_RADIUS
    })
    this.renderIntroWaypoint(ctx)
    this.renderScorePopups(ctx)
  }

  private renderPlayerDamageFlash(ctx: CanvasRenderingContext2D) {
    const flash = this.playerDamageFlash
    if (!flash) return
    const alpha = clamp(flash.life / flash.maxLife, 0, 1) * flash.alpha
    const edge = Math.max(this.width, this.height) * (flash.kind === 'critical' ? 0.22 : 0.16)
    const color = flash.kind === 'shield' ? '87,255,243' : '255,93,115'
    const gradient = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      Math.max(24, Math.min(this.width, this.height) * 0.32),
      this.width / 2,
      this.height / 2,
      Math.max(this.width, this.height) * 0.72
    )
    gradient.addColorStop(0, 'rgba(0,0,0,0)')
    gradient.addColorStop(0.55, 'rgba(0,0,0,0)')
    gradient.addColorStop(1, `rgba(${color},${alpha})`)
    ctx.save()
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, this.width, this.height)
    ctx.globalAlpha = alpha * 0.72
    ctx.strokeStyle = flash.color
    ctx.lineWidth = edge
    ctx.strokeRect(-edge / 2, -edge / 2, this.width + edge, this.height + edge)
    ctx.restore()
  }

  private renderIntroWaypoint(ctx: CanvasRenderingContext2D) {
    const wp = this.introWaypoint
    if (!wp || !wp.active || !wp.targetPlanetId) return
    const target = this.planets.find((p) => p.id === wp.targetPlanetId)
    if (!target) return
    const screen = this.worldToScreen(target.x, target.y)
    renderIntroArrow({
      ctx,
      width: this.width,
      height: this.height,
      targetScreen: screen,
      planetName: target.name
    })
  }

  private renderSectorWaveWarning(ctx: CanvasRenderingContext2D) {
    if (this.state !== 'playing') return
    const warning = nextSpaceWaveWarning({
      nodeId: this.sectorMap.currentNodeId,
      waves: this.sectorNodeProfile.config.waves,
      firedWaveIds: this.firedSectorWaves,
      elapsed: this.stats.time - this.sectorNodeStartedAt,
      warningSeconds: spaceSpawnBalance.sectorWaveWarningSeconds
    })
    if (!warning) return
    drawSectorWaveWarning({
      ctx,
      width: this.width,
      glow: this.allowGlow(),
      warning
    })
  }

  private renderScorePopups(ctx: CanvasRenderingContext2D) {
    drawScorePopups({
      ctx,
      popups: this.scorePopups,
      worldToScreen: (x, y) => this.worldToScreen(x, y),
      surfaceToScreen: (x, y) => this.surfaceToScreen(x, y)
    })
  }

  private surfaceToScreen(x: number, y: number): Vec {
    if (!this.surface) return { x, y }
    return { x: x - this.surface.camera.x, y: y - this.surface.camera.y }
  }

  private effectToScreen(x: number, y: number): Vec {
    if (this.surface && (this.state === 'surface' || this.state === 'takeoff' || (this.state === 'landing' && this.transitionTimer / this.transitionDuration > 0.58))) {
      return this.surfaceToScreen(x, y)
    }
    return this.worldToScreen(x, y)
  }

  private isHighLoad() {
    return this.graphicsMode === 'LOW' || this.particles.length > 170 || this.enemies.length > 120 || this.bullets.length > 130 || this.pickups.length > 150
  }

  private allowGlow() {
    return this.graphicsMode === 'GLOW' && !this.isHighLoad()
  }

  private setGraphicsMode(mode: GraphicsMode) {
    this.graphicsMode = mode
    localStorage.setItem(GRAPHICS_STORAGE_KEY, mode)
    this.resize()
    this.toast(`GRAPHICS ${mode}`)
  }

  private cycleGraphicsMode() {
    const modes: GraphicsMode[] = ['LOW', 'MED', 'GLOW']
    const next = modes[(modes.indexOf(this.graphicsMode) + 1) % modes.length]
    this.setGraphicsMode(next)
  }

  private renderSurface(ctx: CanvasRenderingContext2D) {
    if (!this.surface) return
    const s = this.surface
    const biome = s.planet.biome
    ctx.save()
    drawSurfaceWorld({
      ctx,
      biome,
      seed: hashString(s.planet.id, 83),
      glow: this.allowGlow(),
      camera: s.camera,
      surfaceWidth: s.width,
      surfaceHeight: s.height,
      viewWidth: this.width,
      viewHeight: this.height,
      surfaceToScreen: (x, y) => this.surfaceToScreen(x, y)
    })

    drawSurfaceShip({
      ctx,
      ship: s.ship,
      time: this.stats.time,
      surfaceToScreen: (x, y) => this.surfaceToScreen(x, y)
    })
    drawSurfaceResources({
      ctx,
      resources: s.resources,
      time: this.stats.time,
      surfaceToScreen: (x, y) => this.surfaceToScreen(x, y)
    })
    drawSurfaceLoreSites({
      ctx,
      loreSites: s.loreSites,
      time: this.stats.time,
      allowGlow: this.allowGlow(),
      surfaceToScreen: (x, y) => this.surfaceToScreen(x, y)
    })
    drawSurfaceAliens({
      ctx,
      aliens: s.aliens,
      time: this.stats.time,
      allowGlow: this.allowGlow(),
      planetAlienCatalog: this.planetAlienCatalog,
      surfaceToScreen: (x, y) => this.surfaceToScreen(x, y)
    })
    drawSurfaceBullets({
      ctx,
      bullets: s.bullets,
      time: this.stats.time,
      allowGlow: this.allowGlow(),
      surfaceToScreen: (x, y) => this.surfaceToScreen(x, y)
    })
    drawSurfaceWaveTelegraphs({
      ctx,
      telegraphs: s.waveTelegraphs,
      time: this.stats.time,
      allowGlow: this.allowGlow(),
      surfaceToScreen: (x, y) => this.surfaceToScreen(x, y)
    })
    renderSurfaceThreats({
      ctx,
      threats: s.threats,
      time: this.stats.time,
      allowGlow: this.allowGlow(),
      glassMiteOracleSheet: this.glassMiteOracleSheet,
      planetBossCatalog: this.planetBossCatalog,
      surfaceToScreen: (x, y) => this.surfaceToScreen(x, y)
    })
    drawSurfacePilot({
      ctx,
      pilot: s.pilot,
      time: this.stats.time,
      allowGlow: this.allowGlow(),
      surfaceSpacemanSheet: this.surfaceSpacemanSheet,
      surfaceToScreen: (x, y) => this.surfaceToScreen(x, y)
    })
    this.renderShockwaves(ctx)
    this.renderParticles(ctx)
    const nearLore = this.findNearbyLoreSite()
    const nearAlien = this.findNearbyAlien()
    drawSurfaceHud({
      ctx,
      width: this.width,
      height: this.height,
      planetName: s.planet.name,
      scenario: s.scenario,
      event: s.event,
      collected: s.collected,
      resourceCount: s.resources.length,
      message: s.message,
      nearShip: Math.sqrt(dist2(s.pilot, s.ship)) < 64,
      nearLoreTitle: nearLore?.title ?? null,
      nearAlienName: nearAlien?.name ?? null,
      wave: s.wave,
      waveTelegraphs: s.waveTelegraphs,
      activeThreats: s.threats.length,
      o2Returning: s.o2Returning,
      allowGlow: this.allowGlow()
    })
    this.renderScorePopups(ctx)
    ctx.restore()
  }

  private renderReturnBeacon(ctx: CanvasRenderingContext2D) {
    drawReturnBeacon({
      ctx,
      beacon: this.returnBeacon,
      player: this.player,
      width: this.width,
      height: this.height,
      glow: this.allowGlow(),
      scale: this.spaceScale(),
      holdSeconds: BEACON_HOLD_SECONDS,
      worldToScreen: (x, y) => this.worldToScreen(x, y)
    })
  }

  private renderAutopilot(ctx: CanvasRenderingContext2D) {
    const target = this.autoNavTargetPlanetId ? this.planets.find((planet) => planet.id === this.autoNavTargetPlanetId) ?? null : null
    const beaconTarget = this.autoNavTargetBeacon ? this.returnBeacon : null
    const level = this.navigationCruiseLevel()
    const scale = this.spaceScale()
    const color = beaconTarget ? '#fff27a' : this.build.nav <= 0 ? '#57fff3' : this.build.nav >= 6 ? '#fff27a' : '#70a8ff'
    drawAutopilot({
      ctx,
      active: this.state === 'playing' && this.autoNavActive,
      player: this.player,
      target,
      beaconTarget,
      level,
      scale,
      color,
      glow: this.graphicsMode !== 'LOW',
      alpha: this.build.nav <= 0 ? 0.34 : 0.62,
      heading: this.autoNavHeading,
      worldToScreen: (x, y) => this.worldToScreen(x, y),
      time: this.stats.time
    })
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    drawPlayer({
      ctx,
      player: this.player,
      build: this.build,
      limitBreaks: this.limitBreaks,
      evolvedSize: this.evolved.size,
      graphicsMode: this.graphicsMode,
      allowGlow: this.allowGlow(),
      time: this.stats.time,
      scale: this.spaceScale(),
      worldToScreen: (x, y) => this.worldToScreen(x, y)
    })
  }

  private renderBullets(ctx: CanvasRenderingContext2D) {
    if (this.isHighLoad()) {
      this.renderBulletsSimple(ctx)
      return
    }
    const scale = this.spaceScale()
    const signature = starterSignatureFlags(this.build)
    drawBullets({
      ctx,
      bullets: this.bullets,
      width: this.width,
      height: this.height,
      glow: this.allowGlow(),
      scale,
      signature,
      worldToScreen: (x, y) => this.worldToScreen(x, y)
    })
  }

  private renderBulletsSimple(ctx: CanvasRenderingContext2D) {
    const scale = this.spaceScale()
    drawBulletsSimple({
      ctx,
      bullets: this.bullets,
      width: this.width,
      height: this.height,
      scale,
      worldToScreen: (x, y) => this.worldToScreen(x, y)
    })
  }

  private renderEnemies(ctx: CanvasRenderingContext2D) {
    drawEnemies({
      ctx,
      enemies: this.enemies,
      width: this.width,
      height: this.height,
      playerX: this.player.x,
      playerY: this.player.y,
      isHighLoad: this.isHighLoad(),
      allowGlow: this.allowGlow(),
      scale: this.spaceScale(),
      spriteSheet: this.spaceEnemyCatalog,
      worldToScreen: (x, y) => this.worldToScreen(x, y)
    })
  }

  private renderSpawnEntryPings(ctx: CanvasRenderingContext2D) {
    drawSpawnEntryPings({
      ctx,
      pings: this.spawnEntryPings,
      width: this.width,
      height: this.height,
      glow: this.allowGlow(),
      scale: this.spaceScale(),
      worldToScreen: (x, y) => this.worldToScreen(x, y)
    })
  }

  private renderThreatIndicators(ctx: CanvasRenderingContext2D) {
    drawThreatIndicators({
      ctx,
      targets: this.enemies,
      player: this.player,
      width: this.width,
      height: this.height,
      glow: this.allowGlow(),
      worldToScreen: (x, y) => this.worldToScreen(x, y)
    })
  }

  private renderImpactPulses(ctx: CanvasRenderingContext2D) {
    drawImpactPulses({
      ctx,
      pulses: this.impactPulses,
      width: this.width,
      height: this.height,
      glow: this.allowGlow(),
      scale: this.spaceScale(),
      worldToScreen: (x, y) => this.worldToScreen(x, y)
    })
  }

  private renderPickups(ctx: CanvasRenderingContext2D) {
    drawPickups({
      ctx,
      pickups: this.pickups,
      width: this.width,
      height: this.height,
      highLoad: this.isHighLoad(),
      glow: this.allowGlow(),
      scale: this.spaceScale(),
      time: this.stats.time,
      worldToScreen: (x, y) => this.worldToScreen(x, y)
    })
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    const highLoad = this.isHighLoad()
    if (highLoad) {
      this.renderParticlesSimple(ctx)
      return
    }
    const surfaceMode = this.surface && (this.state === 'surface' || this.state === 'takeoff' || (this.state === 'landing' && this.transitionTimer / this.transitionDuration > 0.58))
    drawParticles({
      ctx,
      particles: this.particles,
      width: this.width,
      height: this.height,
      glow: this.allowGlow(),
      surfaceMode: Boolean(surfaceMode),
      scale: this.spaceScale(),
      visibleBudget: MAX_PARTICLES,
      effectToScreen: (x, y) => this.effectToScreen(x, y)
    })
  }

  private renderParticlesSimple(ctx: CanvasRenderingContext2D) {
    const surfaceMode = this.surface && (this.state === 'surface' || this.state === 'takeoff' || (this.state === 'landing' && this.transitionTimer / this.transitionDuration > 0.58))
    const camX = surfaceMode ? this.surface!.camera.x : this.camera.x
    const camY = surfaceMode ? this.surface!.camera.y : this.camera.y
    drawParticlesSimple({
      ctx,
      particles: this.particles,
      width: this.width,
      height: this.height,
      surfaceMode: Boolean(surfaceMode),
      scale: this.spaceScale(),
      cameraX: camX,
      cameraY: camY,
      worldToScreen: (x, y) => this.worldToScreen(x, y)
    })
  }

  private renderShockwaves(ctx: CanvasRenderingContext2D) {
    const surfaceMode = this.surface && (this.state === 'surface' || this.state === 'takeoff' || (this.state === 'landing' && this.transitionTimer / this.transitionDuration > 0.58))
    const highLoad = this.isHighLoad()
    const glow = this.allowGlow()
    drawShockwaves({
      ctx,
      shockwaves: this.shockwaves,
      width: this.width,
      height: this.height,
      glow,
      highLoad,
      surfaceMode: Boolean(surfaceMode),
      scale: this.spaceScale(),
      effectToScreen: (x, y) => this.effectToScreen(x, y)
    })
  }

  private renderOrbitals(ctx: CanvasRenderingContext2D) {
    const evolved = this.evolved.has('orbit')
    const profile = optionOrbProfile({ orbitRank: this.build.orbit, fireSerial: this.fireSerial, evolved })
    const count = profile.count
    if (count <= 0) return
    const center = this.worldToScreen(this.player.x, this.player.y)
    const scale = this.spaceScale()
    const worldRadius = powerupBalance.orbit.radiusBase + this.build.orbit * powerupBalance.orbit.radiusPerRank
    const radius = worldRadius * scale
    const glow = this.allowGlow()
    drawOrbitals({
      ctx,
      center,
      count,
      radius,
      scale,
      evolved,
      glow,
      highLoad: this.isHighLoad(),
      angleForOrb: (index, total) => optionOrbAngle(this.stats.time, index, total)
    })
  }

  private updateHud() {
    uiUpdateHud(this)
  }

  private updatePerfHud() {
    this.ui.perf.textContent = ''
  }

  private updateTouchHud() {
    const show = this.state === 'playing' || this.state === 'surface'
    this.ui.touchControls.classList.toggle('visible', show)
    if (this.touchStick.active) {
      const rawDx = this.touchStick.x - this.touchStick.startX
      const rawDy = this.touchStick.y - this.touchStick.startY
      const length = Math.hypot(rawDx, rawDy)
      const scale = length > 82 ? 82 / length : 1
      const dx = rawDx * scale
      const dy = rawDy * scale
      this.ui.touchKnob.style.transform = `translate(${dx}px, ${dy}px)`
      this.ui.touchStick.style.setProperty('--touch-line', `${Math.min(82, length)}px`)
      this.ui.touchStick.style.setProperty('--touch-angle', `${Math.atan2(dy, dx)}rad`)
    } else {
      this.ui.touchKnob.style.transform = 'translate(0, 0)'
      this.ui.touchStick.style.setProperty('--touch-line', '0px')
    }
    if (this.state === 'surface') {
      const lore = this.findNearbyLoreSite()
      const alien = this.findNearbyAlien()
      const nearShip = Boolean(this.surface && Math.sqrt(dist2(this.surface.pilot, this.surface.ship)) < 64)
      const action = touchActionLabel({ state: 'surface', nearLore: Boolean(lore), nearAlien: Boolean(alien), nearShip })
      this.ui.touchAction.classList.toggle('hidden', !action)
      this.ui.touchAction.classList.remove('urgent')
      this.ui.touchAction.textContent = action ?? ''
      this.ui.touchDash.classList.add('hidden')
      return
    }
    const planet = this.planets.find((p) => Math.sqrt(dist2(p, this.player)) < p.radius + 86)
    const stationAvailable = Boolean(this.returnBeacon)
    const action = touchActionLabel({
      state: 'playing',
      planetNearby: Boolean(planet),
      returnBeaconAvailable: stationAvailable,
      canPlanetLock: canLockPlanetCourse({
        navRank: this.build.nav,
        pendingUpgrades: this.pendingUpgrades,
        navPlanetLockRank: powerupBalance.ship.navPlanetLockRank,
        hasLockedPlanet: Boolean(this.autoNavTargetPlanetId),
        stationAvailable,
        planetCount: this.planets.length
      })
    })
    this.ui.touchAction.classList.toggle('hidden', !action)
    this.ui.touchAction.classList.toggle('urgent', stationAvailable)
    this.ui.touchAction.textContent = action ?? ''
    this.ui.touchDash.classList.remove('hidden')
    this.ui.touchDash.textContent = 'DASH'
  }

  private renderLevelUp(title: string, copy: string) {
    uiRenderLevelUp(this, title, copy)
  }

  private currentLevelUpScrollTop() {
    return uiCurrentLevelUpScrollTop(this)
  }

  private restoreLevelUpScroll(scrollTop: number) {
    uiRestoreLevelUpScroll(this, scrollTop)
  }

  private canApplyWorkbenchChoice(choice: WorkbenchChoice) {
    return uiCanApplyWorkbenchChoice(this, choice)
  }

  private renderManifestSummary() {
    return uiRenderManifestSummary(this)
  }

  private renderManifestRelicLine() {
    return uiRenderManifestRelicLine(this)
  }

  private recordArtifact(record: Omit<ArtifactRecord, 'count'>) {
    const result = recordArtifactDiscovery(this.artifacts, record)
    if (result.unlocksSuitOffer) this.discoverySuitOffer = true
  }

  private recordEnemyDiscovery(id: string, title: string, detail: string, source: string, color: string) {
    this.recordArtifact({
      id,
      kind: 'enemy',
      title,
      detail,
      source,
      color,
      icon: hashString(id, 83) % 80
    })
  }

  private collectionSlug(value: string) {
    return archiveCollectionSlug(value)
  }

  private artifactColor(kind: ArtifactKind, key: string) {
    return archiveArtifactColor(kind, key)
  }

  private choiceMarkup(choice: WorkbenchChoice) {
    if (choice.kind === 'upgrade') {
      const level = this.build[choice.upgrade.id] + 1
      const detail = this.upgradeLevelDetail(choice.upgrade, level)
      const systemLabel = choice.upgrade.bucket === 'spacesuit' ? 'SUIT' : choice.upgrade.category === 'weapon' ? 'WEAPON' : 'SHIP'
      const tag = `${this.bucketLabel(choice.upgrade.bucket)} // ${systemLabel}`
      return `<strong>${this.escape(choice.upgrade.name)}</strong><em>INSTALL RANK ${level}/${choice.upgrade.max} // ${tag}</em><span>${this.escape(detail)}</span>`
    }
    if (choice.kind === 'evolution') {
      return `<strong>${this.escape(choice.evolution.name)}</strong><em>EVOLUTION</em><span>${this.escape(choice.evolution.description)}</span>`
    }
    if (choice.kind === 'relic') {
      const downside = choice.relic.downside ? ` Risk: ${choice.relic.downside}` : ''
      return `<strong>${this.escape(choice.relic.name)}</strong><em>RELIC</em><span>${this.escape(choice.relic.description + downside)}</span>`
    }
    return `<strong>${this.escape(choice.name)}</strong><em>LIMIT BREAK</em><span>${this.escape(choice.description)}</span>`
  }

  private upgradeLevelDetail(upgrade: Upgrade, level: number) {
    return upgrade.levels[level - 1] ?? upgrade.description
  }

  private bucketLabel(bucket: UpgradeBucket) {
    const labels: Record<UpgradeBucket, string> = {
      weapons: 'WEAPONS',
      navigation: 'NAVIGATION',
      survival: 'SURVIVAL',
      economy: 'ECONOMY',
      planetcraft: 'PLANETCRAFT',
      spacesuit: 'SPACESUIT',
      control: 'CONTROL'
    }
    return labels[bucket]
  }

  private renderPlanet(p: Planet) {
    uiRenderPlanet(this, p)
  }

  private showTitle() {
    uiShowTitle(this)
  }

  private showMothership(options: { scrollTop?: number } = {}) {
    uiShowMothership(this, options)
  }

  private currentFrontScreenScrollTop(screen: 'collection' | 'powerups') {
    const root = screen === 'collection' ? this.ui.collection : this.ui.powerups
    return root.querySelector<HTMLElement>('.front-subscreen')?.scrollTop ?? 0
  }

  private restoreFrontScreenScroll(screen: 'collection' | 'powerups', scrollTop?: number) {
    if (scrollTop === undefined) return
    const root = screen === 'collection' ? this.ui.collection : this.ui.powerups
    const shell = root.querySelector<HTMLElement>('.front-subscreen')
    if (!shell) return
    const restore = () => {
      shell.scrollTop = clamp(scrollTop, 0, Math.max(0, shell.scrollHeight - shell.clientHeight))
    }
    restore()
    requestAnimationFrame(restore)
  }

  private showCollection(options: { scrollTop?: number } = {}) {
    uiShowCollection(this, options)
  }

  private showPowerUps(options: { scrollTop?: number } = {}) {
    uiShowPowerUps(this, options)
  }

  private showScores() {
    uiShowScores(this)
  }

  private resetPersistentProgress() {
    this.clearPersistentProgressStorage()
    this.highs = []
    this.mothership = defaultMothershipState()
    this.debrief = null
    this.scoreSaved = false
    this.scoreName = 'ACE'
    this.stats.highScore = 0
    this.reset()
    this.showTitle()
  }

  private gameOver() {
    if (this.state === 'dying' || this.state === 'debrief') return
    this.state = 'dying'
    this.deathTimer = 0
    this.player.hull = 0
    this.showOnly(null)
    this.audio.boom('gameover')
    this.camera.shake = Math.max(this.camera.shake, 28)
    this.burst(this.player.x, this.player.y, '#ff5d73', 46, 360)
    this.burst(this.player.x, this.player.y, '#fff27a', 32, 300)
    this.toast('SCOUT DESTROYED')
  }

  private finishRun(outcome: RunOutcomeKind) {
    if (this.state === 'debrief') return
    const archiveRecords = this.currentRunArchiveRecords()
    const nodesCleared = this.sectorMap.nodes.filter((node) => node.completed && node.kind !== 'mothership').length
    const finished = resolveFinishedRun({
      mothership: this.mothership,
      outcome,
      earnedResources: this.resources,
      archiveRecords,
      nodesCleared,
      planetsVisited: this.stats.planets,
      skippedBeacons: this.skippedReturnBeacons,
      stationVisits: this.stationVisits
    })
    this.mothership = finished.mothership
    this.saveMothership()
    this.debrief = finished.debrief
    this.returnBeacon = null
    this.autoNavTargetBeacon = false
    this.state = 'debrief'
    this.renderDebrief()
  }

  private currentRunArchiveRecords(): Record<string, PersistentArchiveRecord> {
    return archiveRecordsFromArtifacts(this.artifacts.values())
  }

  private renderDebrief() {
    uiRenderDebrief(this)
  }

  private showSectorMap(message = 'Choose the next jump. Route progress resets on death; mothership upgrades persist.') {
    uiShowSectorMap(this, message)
  }

  private launchSectorNode(nodeId: string) {
    const node = availableSectorChoices(this.sectorMap).find((choice) => choice.id === nodeId)
    if (!node) return
    this.sectorMap = selectSectorNode(this.sectorMap, nodeId)
    const selected = currentSectorNode(this.sectorMap)
    this.sectorNodeProfile = sectorNodeRunProfile(selected)
    if (selected.kind === 'station') {
      const report = this.applySectorStationServices(selected)
      this.sectorMap = completeSectorNode(this.sectorMap)
      this.showStationDock(report)
      return
    }
    this.prepareSectorNode(selected)
    this.state = 'playing'
    this.showOnly(null)
    this.updateHud()
    this.toast(`${selected.label}: ${selected.config.objective}`)
  }

  private recordStationVisit(node: SectorNode, repaired: number, workbenchSignals: number, scrap: number, crystal: number) {
    const existing = this.stationVisits.find((visit) => visit.nodeId === node.id)
    if (existing) return existing
    const visit = buildStationVisitRecord({
      node,
      dockedAtSeconds: this.stats.time,
      repaired,
      workbenchSignals,
      scrap,
      crystal
    })
    this.stationVisits.push(visit)
    return visit
  }

  private applySectorStationServices(node: SectorNode) {
    // Station services are run-only; permanent mothership meta upgrades remain game-over/mothership decisions.
    const result = resolveStationServices({
      services: node.stationServices,
      hull: this.player.hull,
      maxHull: this.player.maxHull,
      pendingUpgrades: this.pendingUpgrades,
      workbenchRerolls: this.workbenchRerolls
    })
    this.player.hull = result.nextHull
    this.pendingUpgrades = result.nextPendingUpgrades
    this.workbenchRerolls = result.nextWorkbenchRerolls
    this.resources.scrap += result.scrap
    this.resources.crystal += result.crystal
    this.audio.pickup('nav')
    const visit = this.recordStationVisit(node, result.repaired, result.workbenchSignals, result.scrap, result.crystal)
    return buildServiceStationDockReport({
      node,
      visit,
      repaired: result.repaired,
      workbenchSignals: result.workbenchSignals,
      scrap: result.scrap,
      crystal: result.crystal
    })
  }

  private routeStationDockReport(node: SectorNode): StationDockReport {
    const visit = this.recordStationVisit(node, 0, 0, 0, 0)
    return buildRouteStationDockReport({ node, visit, pendingUpgrades: this.pendingUpgrades })
  }

  private showStationDock(report: StationDockReport) {
    uiShowStationDock(this, report)
  }

  private openStationWorkbench() {
    if (!this.stationDockReport || this.pendingUpgrades <= 0) {
      this.toast('STATION WORKBENCH BUFFER EMPTY')
      return
    }
    this.returnToSectorMapAfterWorkbench = true
    this.openLevelUp(`${this.stationDockReport.stationName} WORKBENCH`, `${this.stationDockReport.serviceLine} Spend ${this.pendingUpgrades} banked mutation signal${this.pendingUpgrades === 1 ? '' : 's'}, then choose the next route through the sector.`, true)
  }

  private leaveStationForSectorMap() {
    const report = this.stationDockReport
    this.stationDockReport = null
    this.showSectorMap(report ? `${report.stationName}: Departure lane open. Choose the next jump.` : 'Choose the next jump.')
  }

  private prepareSectorNode(node: SectorNode) {
    this.bullets = []
    this.enemies = []
    this.enemyGrid.clear()
    this.pickups = []
    this.particles = []
    this.shockwaves = []
    this.impactPulses = []
    this.playerDamageFlash = null
    this.spawnEntryPings = []
    this.spaceHazards = []
    this.asteroidFieldTimer = 0
    this.asteroidFieldSpawnTimer = 0
    this.derelictSignals = []
    this.firedSectorWaves.clear()
    this.chunks.clear()
    this.stars = []
    this.planets = []
    this.activeChunkKey = ''
    this.returnBeacon = null
    this.autoNavActive = false
    this.autoNavTargetPlanetId = null
    this.autoNavTargetBeacon = false
    this.player.x = 0
    this.player.y = 0
    this.player.vx = 0
    this.player.vy = 0
    this.player.angle = -Math.PI / 2
    this.player.aimAngle = -Math.PI / 2
    this.sectorNodeStartedAt = this.stats.time
    this.quietFieldTimer = 0
    this.spawnTimer = node.kind === 'final' ? runBalance.timers.finalSectorSpawnSeconds : runBalance.timers.sectorSpawnSeconds
    this.bossTimer = this.sectorNodeProfile.bossRequired ? runBalance.timers.requiredBossSeconds : runBalance.timers.sectorBossSeconds
    this.chestTimer = node.kind === 'planet' ? runBalance.timers.planetNodeChestSeconds : runBalance.timers.startingChestSeconds
    this.nextReturnBeaconAt = this.isIntroSectorNode(node)
      ? this.stats.time + runBalance.timers.introSectorBeaconSeconds
      : nextBeaconWindow(Math.max(0, this.stats.time - 14))
    this.nextSpaceEncounterAt = this.nextSectorSpaceEncounterTime(this.stats.time)
    const target = cameraTargetFor(this.player, this.width, this.height, this.spaceScale())
    this.camera.x = target.x
    this.camera.y = target.y
    this.updateSpaceChunks(true)
    const introSafeDrift =
      node.config.templateId === 'safeDrift'
      && this.isIntroSectorNode(node)
      && isFirstEverRun({ planets: this.stats.planets, hasDebrief: this.debrief !== null })
      && this.stats.time === 0
    if (introSafeDrift) {
      this.sectorNodeProfile = {
        ...this.sectorNodeProfile,
        spawnMultiplier: introSafeDriftSpawnMultiplier(this.sectorNodeProfile.spawnMultiplier)
      }
    }
    const startingSpawns = introSafeDrift
      ? introSafeDriftStartingSpawns(this.sectorNodeProfile.config.enemies.startingSpawns)
      : this.sectorNodeProfile.config.enemies.startingSpawns
    for (const kind of startingSpawns) this.spawnEnemy(kind)
  }

  private completeSectorNodeViaBeacon() {
    const node = currentSectorNode(this.sectorMap)
    if (node.kind === 'final') {
      this.finishRun('cleanExtraction')
      return
    }
    this.sectorMap = completeSectorNode(this.sectorMap)
    this.returnBeacon = null
    this.autoNavTargetBeacon = false
    this.autoNavActive = false
    this.showStationDock(this.routeStationDockReport(node))
  }

  private start() {
    this.audio.unlock()
    this.reset()
    this.showSectorMap()
  }

  private returnToTitleFromGameOver(input?: HTMLInputElement) {
    if (input) this.saveScoreFromInput(input)
    this.debrief = null
    this.reset()
    this.showTitle()
  }

  private saveScoreFromInput(input: HTMLInputElement) {
    this.scoreName = sanitizeScoreName(input.value)
    input.value = this.scoreName
    this.saveScore()
  }

  private reset() {
    this.sectorMap = createSectorMap(Date.now())
    this.sectorNodeProfile = sectorNodeRunProfile(currentSectorNode(this.sectorMap))
    this.player = this.makePlayer()
    const launchLoadout = resolveMothershipLaunchLoadout(this.mothership)
    this.player.maxHull += launchLoadout.hullBonus
    this.player.hull = this.player.maxHull
    this.player.speed += launchLoadout.speedBonus
    this.bullets = []
    this.enemies = []
    this.enemyGrid.clear()
    this.pickups = []
    this.particles = []
    this.shockwaves = []
    this.impactPulses = []
    this.playerDamageFlash = null
    this.spawnEntryPings = []
    this.spaceHazards = []
    this.asteroidFieldTimer = 0
    this.asteroidFieldSpawnTimer = 0
    this.derelictSignals = []
    this.chunks.clear()
    this.stars = []
    this.planets = []
    this.visitedPlanets.clear()
    this.activeChunkKey = ''
    this.autoNavHeading = 0
    this.sectorNodeStartedAt = 0
    this.firedSectorWaves.clear()
    this.autoNavActive = false
    this.autoNavTargetPlanetId = null
    this.autoNavTargetBeacon = false
    this.orbitReturnPoint = null
    this.surface = null
    this.returnBeacon = null
    this.stationDockReport = null
    this.stationVisits = []
    this.nextReturnBeaconAt = 0
    this.skippedReturnBeacons = 0
    this.transitionTimer = 0
    this.collisionFxCooldown = 0
    this.bulletImpactCooldown = 0
    this.quietFieldTimer = 0
    this.pendingUpgrades = 0
    this.workbenchInstalling = false
    this.takeoffAfterWorkbench = false
    this.surfaceInstallCompleted = false
    this.returnToSectorMapAfterWorkbench = false
    this.discoverySuitOffer = false
    this.summonReturnBeaconAfterTakeoff = false
    this.workbenchRerolls = launchLoadout.workbenchRerolls
    this.resources = { ...launchLoadout.resources }
    this.relics.clear()
    this.evolved.clear()
    this.artifacts.clear()
    this.limitBreaks = { might: 0, cooldown: 0, amount: 0, speed: 0, magnet: 0, hull: 0 }
    this.stats = { time: 0, kills: 0, level: 1, xp: 0, nextXp: runBalance.xp.startingNext, highScore: this.highs[0]?.score ?? 0, planets: 0, score: 0 }
    for (const k of Object.keys(this.build) as UpgradeId[]) this.build[k] = 0
    this.spawnTimer = runBalance.timers.startingSpawnSeconds
    this.bossTimer = runBalance.timers.startingBossSeconds
    this.chestTimer = runBalance.timers.startingChestSeconds
    this.nextSpaceEncounterAt = this.nextSectorSpaceEncounterTime(0)
    this.scoreSaved = false
    const target = cameraTargetFor(this.player, this.width, this.height, this.spaceScale())
    this.camera.x = target.x
    this.camera.y = target.y
    this.updateSpaceChunks(true)
  }

  private togglePause() {
    if (this.state === 'playing' || this.state === 'surface') {
      this.previousState = this.state
      this.state = 'paused'
      this.toast('PAUSED')
    } else if (this.state === 'paused') {
      this.state = this.previousState
      this.toast('SIGNAL RESUMED')
    } else if (this.state === 'levelup' || this.state === 'planet') {
      return
    }
  }

  private toast(message: string) {
    this.toastText = message
    this.toastTimer = 3.2
    this.ui.toast.textContent = message
    this.ui.toast.classList.add('visible')
  }

  private showOnly(which: GameState | null) {
    uiShowOnly(this, which)
  }

  private installHarnessIfRequested() {
    installPlaytestHarnessIfRequested(this)
  }

  private debugSpawnSingleEnemy(kind: EnemyKind, dx: number, dy: number) {
    this.enemies.length = 0 // clear without side-effects (no killEnemy fx) — debug only
    this.spawnEnemyAt(kind, this.player.x + dx, this.player.y + dy)
    this.rebuildEnemyGrid()
  }

  private debugPlayerPosition() { return { x: this.player.x, y: this.player.y } }

  private debugNearestEnemyDistance() {
    let best = Infinity
    for (const e of this.enemies) best = Math.min(best, Math.sqrt(dist2(e, this.player)))
    return best
  }

  private debugStepEnemies(dt: number) { this.updateEnemies(dt); this.rebuildEnemyGrid() }

  private debugEnemyCount() { return this.enemies.length }

  private loadScores(): ScoreEntry[] {
    return loadScoreEntries(localStorage)
  }

  private resetProgressFromUrl() {
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#\??/, ''))
    const requested = params.get('resetProgress') ?? hashParams.get('resetProgress') ?? ''
    if (!['1', 'true', 'yes'].includes(requested.toLowerCase())) return
    this.clearPersistentProgressStorage()
  }

  private clearPersistentProgressStorage() {
    clearStoredPersistentProgress(localStorage)
  }

  private loadMothership() {
    return loadMothershipState(localStorage)
  }

  private saveMothership() {
    saveMothershipState(localStorage, this.mothership)
  }

  private saveScore() {
    if (this.scoreSaved) return
    this.scoreSaved = true
    this.highs = saveScoreEntry(localStorage, this.highs, {
      name: this.scoreName,
      score: this.stats.score,
      time: this.stats.time,
      level: this.stats.level,
      kills: this.stats.kills,
      date: new Date().toISOString(),
      debrief: this.debrief
    })
  }

  private escape(value: string) {
    return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[ch]!)
  }
}

declare global {
  interface Window {
    __galacticHordes?: VectorShooter
    __vectorShooter?: VectorShooter
    __galacticHarness?: {
      snapshot: () => {
        state: GameState
        time: number
        kills: number
        level: number
        xp: number
        nextXp: number
        hull: number
        maxHull: number
        score: number
        planets: number
        pendingUpgrades: number
        lockedPlanetId: string | null
        objective: { label: string; text: string }
        resources: { scrap: number; crystal: number; cores: number }
        enemies: number
        pickups: number
        currentNode: string
        perf: PerfStats
      }
    }
    debugSpawnSingleEnemy?: (kind: EnemyKind, dx: number, dy: number) => void
    debugPlayerPosition?: () => { x: number; y: number }
    debugNearestEnemyDistance?: () => number
    debugStepEnemies?: (dt: number) => void
    debugEnemyCount?: () => number
    debugForceFirstEverRun?: () => void
    debugIntroWaypointState?: () => { active: boolean; timer: number; targetPlanetId: string | null } | null
    debugLandOnNearestPlanet?: () => boolean
    debugScorePopupsSnapshot?: () => { count: number; texts: string[] }
    debugStepScorePopups?: (dt: number) => void
    debugHitstopUntil?: () => number
    debugForceKillNearestEnemy?: (giant: boolean) => boolean
  }
}

window.__galacticHordes = new VectorShooter()
window.__vectorShooter = window.__galacticHordes
