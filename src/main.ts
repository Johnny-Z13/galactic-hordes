import './style.css'
import { AudioDirector, type PlanetAudioMood } from './audio/audio-director'
import { sfxSamples } from './audio/sfx-samples'
import { uiClickSoundForButton } from './audio/ui-click-cues'
import { damageFeedbackConfig } from './combat/damage-feedback'
import { advanceImpactPulses, createImpactPulse, type ImpactPulse } from './combat/impact-feedback'
import { advancePlayerDamageFlash, createPlayerDamageFlash, type PlayerDamageFlash } from './combat/player-damage-feedback'
import { weaponSoundKindFor } from './combat/weapon-sound'
import collectionIconAtlasUrl from './assets/collection-icon-atlas.png'
import glassMiteOracleSheetUrl from './assets/glass-mite-oracle-sheet-alpha.png'
import planetAlienCatalogUrl from './assets/planet-alien-catalog-alpha.png'
import planetBossCatalogUrl from './assets/planet-boss-catalog-alpha.png'
import spaceEnemyCatalogUrl from './assets/space-enemy-catalog-alpha.png'
import surfaceSpacemanSheetUrl from './assets/surface-spaceman-sheet-alpha.png'
import { orderArtifactArchiveCards } from './artifact-archive'
import { collectionCatalog, collectionCatalogById, collectionIconAtlasColumns, collectionIconAtlasRows } from './collection-catalog'
import { buildDebriefReport, type DebriefReport } from './debrief-report'
import {
  activeBalanceProfile,
  balancedSpaceEnemyDefinition,
  pickSpaceEnemyKind,
  scaledBossTimer,
  scaledSpawnTimer,
  scaledSurfaceHp,
  spaceSpawnBalance,
  spawnPressureMinutes,
  surfaceThreatBalance
} from './game-balance'
import { navigationCruiseScalar, navigationTrailProfile } from './navigation-cruise'
import { canLockPlanetCourse, nearestPlanetCourseTarget, planetCourseLockToast } from './navigation-planet-lock'
import { applyMutationXp } from './mutation-progress'
import { selectPlanetBiome, type PlanetBiomeProfile } from './planet-biomes'
import { planetNameFor } from './planet-names'
import { updatePickupsPhysics, type Pickup, type PickupKind } from './pickups'
import { planetRadius } from './planet-sizing'
import { runBalance } from './run-balance'
import { scoreEntryFromRun, type ScoreEntry } from './score-history'
import { advanceScorePopups, appendScorePopup, createInstallPopup, createScorePopup, createSignalPopup, type ScorePopupModel } from './score-popups'
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
import { damageSpaceHazard as damageSpaceHazardCombat } from './space-hazard-combat'
import { isGiantEnemyKind, isSpriteEnemyKind, spaceEnemyDefinitions, spaceEnemySpawnPoint, spriteEnemyKinds, type SpaceEnemyKind } from './space-enemies'
import type { Vec, Enemy, Bullet, EnemyKind } from './main-types'
import { clamp, norm, dist2, hash32, len, rngFrom, TAU } from './math-utils'
export { clamp } from './math-utils'
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
import { createSurfaceBullet, findSurfaceTarget as pickSurfaceTarget, updateSurfaceBulletsAndThreatDamage } from './surface/bullet-combat'
import { advanceSurfaceOxygen, surfaceExtractionScore, surfaceInteractionAction, surfaceTakeoffRequest, surfaceTransitionProgress } from './surface/lifecycle'
import { collectTouchedSurfaceResources, createSurfaceBossCacheDrops, createSurfaceCacheAmbushThreats, shouldPromptSurfaceReturn } from './surface/objectives'
import { createSurfaceResourceNodes, surfaceEventMessage } from './surface/run-setup'
import { spawnSurfaceSplitterChildren, updateSurfaceThreatMotion } from './surface/threat-behavior'
import { advanceSurfaceWaveTelegraphs, createSurfaceWaveState, updateSurfaceWaveDirector, type SurfaceWaveState, type SurfaceWaveTelegraph } from './surface/wave-director'
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
import { advancedRewardEnemyKinds, spaceEnemyBehavior } from './space-enemy-behavior'
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
import { surfacePilotMuzzleOffset, surfacePilotSpawnKeepout } from './surface-pilot'
import {
  planetAlienCatalogVariants,
  planetBossCatalogVariants,
  surfaceEventPoint as plannedSurfaceEventPoint,
  surfaceRunBalance,
  surfaceThreatMotionBalance,
  type AlienGiftKind,
  type SurfaceResourceKind,
  type SurfaceThreatBehavior
} from './surface-balance'
import { planSurfaceEncounter, rollPlanetArchetype, type PlanetArchetype, type SurfaceEventKind, type SurfaceScenarioKind } from './surface-encounters'
import { surfaceThreatSpawnPoint } from './surface-spawn'
import { dashVector, touchActionLabel } from './mobile-controls'
import {
  applyRunRecovery,
  defaultMothershipState,
  isMothershipDepartmentUnlocked,
  mothershipDepartments,
  mothershipDepartmentUnlockText,
  normalizeMothershipState,
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
  beaconSpawnDistance,
  nextBeaconWindow,
  returnBeaconAutopilotVector,
  returnBeaconEligible
} from './return-beacons'
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

export type GameState = 'title' | 'mothership' | 'collection' | 'powerups' | 'sectorMap' | 'station' | 'playing' | 'paused' | 'levelup' | 'planet' | 'landing' | 'surface' | 'alien' | 'lore' | 'takeoff' | 'dying' | 'debrief' | 'gameover' | 'scores'
type GraphicsMode = 'LOW' | 'MED' | 'GLOW'
export type ArtifactKind = 'relic' | 'alien' | 'lore' | 'planet' | 'cache' | 'enemy'
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

export interface Planet {
  id: string
  name: string
  x: number
  y: number
  radius: number
  color: string
  visited: boolean
  reward: string
  chunkX: number
  chunkY: number
  archetype: PlanetArchetype
  biome: PlanetBiomeProfile
}

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

interface SurfaceAlien {
  x: number
  y: number
  radius: number
  phase: number
  color: string
  name: string
  gift: AlienGiftKind
  resolved: boolean
  sprite?: 'alienCatalog'
  spriteRow?: number
}

interface SurfaceLoreSite {
  x: number
  y: number
  radius: number
  phase: number
  kind: 'fossils' | 'pyramid' | 'grave' | 'machine' | 'choir'
  title: string
  copy: string
  resolved: boolean
}

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

export interface ArtifactRecord {
  id: string
  kind: ArtifactKind
  title: string
  detail: string
  source: string
  color: string
  icon: number
  count: number
}

interface ReturnBeacon {
  x: number
  y: number
  radius: number
  hold: number
  phase: number
  age: number
  reminded: boolean
  assistTriggered: boolean
}

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
const SCORE_STORAGE_KEY = 'galactic_hordes_high_scores_v1'
const LEGACY_SCORE_STORAGE_KEYS = ['vector_shooter_high_scores']
const GRAPHICS_STORAGE_KEY = 'galactic_hordes_graphics_v1'
const LEGACY_GRAPHICS_STORAGE_KEYS = ['vector_shooter_graphics']
const MOTHERSHIP_STORAGE_KEY = 'galactic_hordes_mothership_v2'
const MAX_PARTICLES = 300
const MAX_SHOCKWAVES = 12
const MAX_BULLETS = 220
const MAX_ENEMIES = 320
const MAX_PICKUPS = 220
const ENEMY_RECYCLE_RADIUS = 2200
const ENEMY_PRESSURE_RADIUS = 1250

const rand = (min: number, max: number) => min + Math.random() * (max - min)

const localStorageWithFallback = (primaryKey: string, legacyKeys: string[]) => (
  localStorage.getItem(primaryKey) ?? legacyKeys.map((key) => localStorage.getItem(key)).find((value) => value !== null) ?? null
)

const savedGraphicsMode = (): GraphicsMode => (localStorageWithFallback(GRAPHICS_STORAGE_KEY, LEGACY_GRAPHICS_STORAGE_KEYS) as GraphicsMode | null) || 'LOW'
const ALIEN_CATALOG_ROWS = planetAlienCatalogVariants.length
const angleLerp = (a: number, b: number, t: number) => {
  const diff = Math.atan2(Math.sin(b - a), Math.cos(b - a))
  return a + diff * t
}
export const hashString = (value: string, salt = 0) => {
  let h = 2166136261 ^ salt
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
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
    const archetype = this.pickSectorPlanetArchetype(chunkX, chunkY, index, rng)
    const biome = selectPlanetBiome(archetype, chunkX, chunkY, index)
    const color = {
      cache: '#57fff3',
      hostile: '#ff5d73',
      repair: '#8fff7d',
      relic: '#fff27a',
      strange: '#b990ff',
      lore: '#d7fff7',
      horde: '#ff61d8'
    }[archetype]
    const name = planetNameFor({ archetype, biomeId: biome.id, chunkX, chunkY, index })
    const margin = 420
    const radius = planetRadius(rng)
    let x = chunkX * CHUNK_SIZE + margin + rng() * (CHUNK_SIZE - margin * 2)
    let y = chunkY * CHUNK_SIZE + margin + rng() * (CHUNK_SIZE - margin * 2)
    let placed = false
    for (let attempt = 0; attempt < 28; attempt += 1) {
      const candidate = {
        x: chunkX * CHUNK_SIZE + margin + rng() * (CHUNK_SIZE - margin * 2),
        y: chunkY * CHUNK_SIZE + margin + rng() * (CHUNK_SIZE - margin * 2)
      }
      const clear = existing.every((planet) => Math.sqrt((planet.x - candidate.x) ** 2 + (planet.y - candidate.y) ** 2) > this.planetClearance(radius, planet.radius))
      if (clear) {
        x = candidate.x
        y = candidate.y
        placed = true
        break
      }
    }
    if (!placed) {
      const slot = this.planetFallbackSlot(index, existing.length)
      x = chunkX * CHUNK_SIZE + margin + slot.x * (CHUNK_SIZE - margin * 2)
      y = chunkY * CHUNK_SIZE + margin + slot.y * (CHUNK_SIZE - margin * 2)
    }
    const reward = {
      cache: 'Cache-heavy salvage and mutation signals.',
      hostile: 'Hostile planet. Better rewards, uglier landing.',
      repair: 'Repair-rich safe dock with quieter salvage.',
      relic: 'Relic signatures and rare cache odds.',
      strange: 'Unstable signal. Anything could be waiting.',
      lore: 'Quiet ruins, fossils, graves, and inspectable narrative signals.',
      horde: 'Vast enemy horde guarding a massive treasure vault.'
    }[archetype]
    const id = `${chunkX}:${chunkY}:${index}`
    return { id, name, x, y, radius, color, visited: this.visitedPlanets.has(id), reward, chunkX, chunkY, archetype, biome }
  }

  private planetClearance(a: number, b: number) {
    return Math.max(520, a + b + 300)
  }

  private pickSectorPlanetArchetype(chunkX: number, chunkY: number, index: number, rng: () => number) {
    const bias = this.sectorNodeProfile.config.planets.archetypeBias
    const total = Object.values(bias).reduce((sum, weight) => sum + (weight ?? 0), 0)
    if (total > 0 && rng() < 0.55) {
      let roll = rng() * total
      for (const [archetype, weight] of Object.entries(bias) as Array<[PlanetArchetype, number]>) {
        roll -= weight
        if (roll <= 0) return archetype
      }
    }
    return rollPlanetArchetype({ chunkX, chunkY, index, random: rng })
  }

  private planetFallbackSlot(index: number, existingCount: number) {
    const slots = [
      { x: 0.2, y: 0.24 },
      { x: 0.78, y: 0.34 },
      { x: 0.42, y: 0.78 }
    ]
    return slots[(index + existingCount) % slots.length]
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
    const accel = (
      powerupBalance.ship.accelerationBase
      + this.build.engine * powerupBalance.ship.accelerationPerEngineRank
      + this.build.nav * powerupBalance.ship.accelerationPerNavRank
    ) * dt
    const maxSpeed = this.player.speed
      + this.build.engine * powerupBalance.ship.maxSpeedPerEngineRank
      + this.build.nav * powerupBalance.ship.maxSpeedPerNavRank
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
    return clamp(
      powerupBalance.dash.durationBase
        + this.build.engine * powerupBalance.dash.durationPerEngineRank
        + this.build.phase * powerupBalance.dash.durationPerPhaseRank,
      powerupBalance.dash.durationBase,
      powerupBalance.dash.durationMax
    )
  }

  private dashSpeed() {
    return powerupBalance.dash.speedBase
      + this.build.engine * powerupBalance.dash.speedPerEngineRank
      + this.build.phase * powerupBalance.dash.speedPerPhaseRank
  }

  private dashCooldown() {
    return clamp(
      powerupBalance.dash.cooldownBase
        - this.build.engine * powerupBalance.dash.cooldownReductionPerEngineRank
        - this.build.heat * powerupBalance.dash.cooldownReductionPerHeatRank,
      powerupBalance.dash.cooldownMin,
      powerupBalance.dash.cooldownBase
    )
  }

  private dashInvulnerability() {
    const engineBonus = this.build.engine >= powerupBalance.dash.engineInvulnerabilityThreshold ? powerupBalance.dash.engineInvulnerabilityBonus : 0
    return powerupBalance.dash.invulnerabilityBase + engineBonus + this.build.phase * powerupBalance.dash.invulnerabilityPerPhaseRank
  }

  private resolveNavigationMove(move: Vec, moveActive: boolean, dt: number): Vec {
    const level = this.navigationCruiseLevel()

    const manualActive = moveActive && Math.abs(move.x) + Math.abs(move.y) > 0.06
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
    const influence = manualActive ? 0.58 + level * 0.035 : 0
    const ghost = { x: Math.cos(this.autoNavHeading) * cruise, y: Math.sin(this.autoNavHeading) * cruise }
    if (!manualActive) return ghost
    const steered = { x: ghost.x + move.x * influence, y: ghost.y + move.y * influence }
    const magnitude = len(steered.x, steered.y)
    return magnitude > 1 ? { x: steered.x / magnitude, y: steered.y / magnitude } : steered
  }

  private navigationCruiseLevel() {
    return this.build.nav
  }

  private bestNavigationPickup() {
    let best: Pickup | null = null
    let bestScore = 0
    const reach = powerupBalance.ship.navPickupReachBase
      + this.build.nav * powerupBalance.ship.navPickupReachPerNavRank
      + this.build.magnet * powerupBalance.ship.navPickupReachPerMagnetRank
    const reach2 = reach * reach
    for (const pickup of this.pickups) {
      const d = dist2(pickup, this.player)
      if (d > reach2) continue
      const kindValue = pickup.kind === 'chest' ? 9 : pickup.kind === 'core' ? 7 : pickup.kind === 'repair' ? 5 : pickup.kind === 'magnet' ? 4 : 1
      const score = kindValue / Math.max(powerupBalance.ship.navPickupMinScoreDistance, d)
      if (score > bestScore) {
        bestScore = score
        best = pickup
      }
    }
    return best
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
    const angle = this.player.angle + rand(-0.9, 0.9)
    const distance = beaconSpawnDistance(this.skippedReturnBeacons)
    this.returnBeacon = {
      x: this.player.x + Math.cos(angle) * distance,
      y: this.player.y + Math.sin(angle) * distance,
      radius: 132,
      hold: 0,
      phase: 0,
      age: 0,
      reminded: false,
      assistTriggered: false
    }
    this.toast('SPACE STATION AVAILABLE - TAP DOCK TO LOCK')
    this.audio.pickup('nav')
  }

  private returnBeaconReady() {
    const node = currentSectorNode(this.sectorMap)
    if (this.isIntroSectorNode(node)) return this.stats.time >= this.nextReturnBeaconAt
    return returnBeaconEligible({
      time: this.stats.time,
      planetsVisited: this.stats.planets,
      activeBeacon: false,
      nextBeaconAt: this.nextReturnBeaconAt
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
    let ax = 0
    let ay = 0
    const radius = 230 + level * 38
    const radius2 = radius * radius
    for (const enemy of this.enemies) {
      const dx = this.player.x - enemy.x
      const dy = this.player.y - enemy.y
      const d = dx * dx + dy * dy
      if (d <= 1 || d > radius2) continue
      const weight = (enemy.kind === 'brute' || enemy.kind === 'warden' ? 1.45 : 1) * (1 - d / radius2)
      ax += (dx / Math.sqrt(d)) * weight
      ay += (dy / Math.sqrt(d)) * weight
    }
    if (Math.abs(ax) + Math.abs(ay) <= 0.02) return
    const avoidAngle = Math.atan2(ay, ax)
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
    let mx = 0
    let my = 0
    if (this.keys.has('KeyA')) mx -= 1
    if (this.keys.has('KeyD')) mx += 1
    if (this.keys.has('KeyW')) my -= 1
    if (this.keys.has('KeyS')) my += 1
    if (this.touchStick.active) {
      const dx = this.touchStick.x - this.touchStick.startX
      const dy = this.touchStick.y - this.touchStick.startY
      const distance = Math.min(82, Math.hypot(dx, dy))
      const direction = Math.atan2(dy, dx)
      mx = Math.cos(direction) * (distance / 82)
      my = Math.sin(direction) * (distance / 82)
    }
    let aimX = 0
    let aimY = 0
    if (this.keys.has('ArrowLeft') || this.keys.has('KeyJ')) aimX -= 1
    if (this.keys.has('ArrowRight') || this.keys.has('KeyL')) aimX += 1
    if (this.keys.has('ArrowUp') || this.keys.has('KeyI')) aimY -= 1
    if (this.keys.has('ArrowDown') || this.keys.has('KeyK')) aimY += 1
    let gamepadFire = false
    let gamepadDash = false
    const gamepad = navigator.getGamepads?.().find((pad): pad is Gamepad => Boolean(pad))
    if (gamepad) {
      const lx = this.deadzone(gamepad.axes[0] ?? 0)
      const ly = this.deadzone(gamepad.axes[1] ?? 0)
      const rx = this.deadzone(gamepad.axes[2] ?? 0)
      const ry = this.deadzone(gamepad.axes[3] ?? 0)
      if (Math.abs(lx) + Math.abs(ly) > 0) {
        mx = lx
        my = ly
      }
      if (Math.abs(rx) + Math.abs(ry) > 0) {
        aimX = rx
        aimY = ry
        gamepadFire = true
      }
      gamepadFire ||= (gamepad.buttons[7]?.value ?? 0) > 0.45 || !!gamepad.buttons[0]?.pressed
      gamepadDash ||= !!gamepad.buttons[1]?.pressed || !!gamepad.buttons[5]?.pressed
      if (gamepad.buttons[3]?.pressed) this.pressed.add('KeyE')
    }
    const moveActive = Math.abs(mx) + Math.abs(my) > 0.04
    const move = norm(mx, my)
    if (!moveActive) {
      move.x = 0
      move.y = 0
    }

    let aiming = Math.abs(aimX) + Math.abs(aimY) > 0
    let aimAngle = aiming ? Math.atan2(aimY, aimX) : this.player.aimAngle
    if (!aiming && this.mouse.down) {
      const world = this.screenToWorld(this.mouse.x, this.mouse.y)
      aimAngle = Math.atan2(world.y - this.player.y, world.x - this.player.x)
      aiming = true
    }
    let autoFire = false
    if (!aiming && this.state === 'playing') {
      const target = this.findAutoTarget()
      if (target) {
        aimAngle = Math.atan2(target.y - this.player.y, target.x - this.player.x)
        aiming = true
        autoFire = true
      }
    }
    return {
      move,
      moveActive,
      aiming,
      aimAngle,
      firing: this.keys.has('Space') || this.mouse.down || gamepadFire || aiming || autoFire || this.consumeMobileFire(),
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

  private deadzone(v: number) {
    const z = 0.18
    if (Math.abs(v) < z) return 0
    return Math.sign(v) * ((Math.abs(v) - z) / (1 - z))
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
    if (pulse) {
      this.impactPulses.push(pulse)
      if (this.impactPulses.length > 96) this.impactPulses.shift()
    }
    if (!highLoad && this.particles.length < MAX_PARTICLES && Math.random() < 0.2) {
      this.particles.push({ x: e.x, y: e.y, vx: rand(-80, 80), vy: rand(-80, 80), life: 0.22, maxLife: 0.22, color, size: 2, glow: 10 })
    }
    if (e.hp <= 0) this.killEnemy(e, true)
  }

  private killEnemy(e: Enemy, reward: boolean) {
    this.removeEnemy(e)
    const big = e.kind === 'warden' || e.kind === 'brute' || e.kind === 'bulwark' || isGiantEnemyKind(e.kind)
    const highLoad = this.isHighLoad()
    const pulse = createImpactPulse({
      kind: 'kill',
      x: e.x,
      y: e.y,
      color: e.color,
      amount: e.value,
      giant: big,
      highLoad
    })
    if (pulse) {
      this.impactPulses.push(pulse)
      if (this.impactPulses.length > 96) this.impactPulses.shift()
    }
    if (big || !highLoad || this.collisionFxCooldown <= 0) {
      this.audio.boom(big ? 'heavy' : 'small')
      this.camera.shake = Math.max(this.camera.shake, big ? 16 : highLoad ? 2 : 5)
      this.burst(e.x, e.y, e.color, big ? 42 : highLoad ? 4 : 12, big ? 330 : highLoad ? 120 : 150)
      this.collisionFxCooldown = highLoad ? 0.04 : 0
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
      const xpCount = isGiantEnemyKind(e.kind)
        ? spaceEnemyBehavior.rewards.xpCount.giant
        : e.kind === 'warden'
          ? spaceEnemyBehavior.rewards.xpCount.warden
          : e.kind === 'bulwark'
            ? spaceEnemyBehavior.rewards.xpCount.bulwark
            : e.kind === 'brute'
              ? spaceEnemyBehavior.rewards.xpCount.brute
              : advancedRewardEnemyKinds.includes(e.kind)
                ? spaceEnemyBehavior.rewards.xpCount.advanced
                : spaceEnemyBehavior.rewards.xpCount.default
      const xpDrops = highLoad && e.kind !== 'warden' ? 1 : xpCount
      const xpValue = isGiantEnemyKind(e.kind)
        ? spaceEnemyBehavior.rewards.xpValue.giant
        : e.kind === 'warden'
          ? spaceEnemyBehavior.rewards.xpValue.warden
          : e.kind === 'bulwark'
            ? spaceEnemyBehavior.rewards.xpValue.bulwark
            : e.kind === 'brute'
              ? spaceEnemyBehavior.rewards.xpValue.brute
              : highLoad
                ? spaceEnemyBehavior.rewards.xpValue.highLoadPerDrop * xpCount
                : spaceEnemyBehavior.rewards.xpValue.default
      for (let i = 0; i < xpDrops; i += 1) this.drop('xp', e.x, e.y, xpValue)
      if (e.kind === 'warden' || isGiantEnemyKind(e.kind)) this.drop('chest', e.x, e.y, 1)
      if (e.kind === 'splinter' && this.enemies.length < MAX_ENEMIES - spaceEnemyBehavior.splitChild.count && Math.random() < spaceEnemyBehavior.splitChild.chance) {
        for (let k = 0; k < spaceEnemyBehavior.splitChild.count; k += 1) {
          const child = this.spawnChild(e.x, e.y)
          this.enemies.push(child)
        }
      }
      if (Math.random() < powerupBalance.upgradeApply.vampireRepairDropBaseChance + this.build.vampire * powerupBalance.upgradeApply.vampireRepairDropChancePerRank) {
        this.drop('repair', e.x, e.y, powerupBalance.upgradeApply.vampireRepairDropValue)
      }
      if (Math.random() < powerupBalance.upgradeApply.magnetDropBaseChance + this.stats.time * powerupBalance.upgradeApply.magnetDropChancePerSecond) {
        this.drop('magnet', e.x, e.y, powerupBalance.upgradeApply.magnetDropValue)
      }
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
    if (this.player.invuln > 0) return
    this.player.invuln = 0.42
    this.player.shieldDelay = 2.4
    let remaining = Math.max(1, amount * (1 - this.build.phase * powerupBalance.upgradeApply.phaseShipDamageReductionPerRank))
    let shieldDamage = 0
    if (this.player.shield > 0) {
      const used = Math.min(this.player.shield, remaining)
      this.player.shield -= used
      remaining -= used
      shieldDamage = used
    }
    const hullDamage = remaining
    this.player.hull -= hullDamage
    const flash = createPlayerDamageFlash({
      hullRatio: this.player.hull / this.player.maxHull,
      hullDamage,
      shieldDamage,
      surface: false
    })
    this.playerDamageFlash = flash
    this.audio.hit()
    this.camera.shake = Math.max(this.camera.shake, 12)
    this.burst(this.player.x, this.player.y, '#ff5d73', 16, 210)
  }

  private damageSurfacePilot(amount: number) {
    if (!this.surface || this.surface.pilot.invuln > 0) return
    const pilot = this.surface.pilot
    pilot.invuln = 0.65
    const hullDamage = Math.max(1, amount * (1 - this.build.phase * powerupBalance.upgradeApply.phaseSurfaceDamageReductionPerRank))
    pilot.health = Math.max(0, pilot.health - hullDamage)
    const flash = createPlayerDamageFlash({
      hullRatio: pilot.health / pilot.maxHealth,
      hullDamage,
      shieldDamage: 0,
      surface: true
    })
    this.playerDamageFlash = flash
    this.audio.hit()
    this.camera.shake = Math.max(this.camera.shake, 10)
    this.burst(pilot.x, pilot.y, '#ff5d73', 12, 180)
    if (pilot.health <= 0) {
      this.surface.message = 'SUIT CRITICAL - RETURNING TO SHIP'
      this.toast('SUIT CRITICAL - RETURNING TO SHIP')
      this.startTakeoff()
    }
  }

  private drop(kind: PickupKind, x: number, y: number, value: number) {
    if (kind === 'xp' && this.isHighLoad()) {
      for (const pickup of this.pickups) {
        if (pickup.kind !== 'xp') continue
        const dx = pickup.x - x
        const dy = pickup.y - y
        if (dx * dx + dy * dy > pickupBalance.xp.mergeDistance * pickupBalance.xp.mergeDistance) continue
        pickup.value += value
        pickup.life = Math.max(pickup.life, 22)
        pickup.radius = clamp(pickup.radius + pickupBalance.xp.mergeRadiusStep, pickupBalance.xp.radius, pickupBalance.xp.mergeRadiusMax)
        pickup.vx += rand(-18, 18)
        pickup.vy += rand(-18, 18)
        return
      }
    }
    if (this.pickups.length >= MAX_PICKUPS) {
      const xpIndex = this.pickups.findIndex((pickup) => pickup.kind === 'xp')
      if (xpIndex >= 0) this.pickups.splice(xpIndex, 1)
      else this.pickups.shift()
    }
    const a = Math.random() * TAU
    const speed = rand(pickupBalance.scatterSpeedMin, pickupBalance.scatterSpeedMax)
    const color = kind === 'xp' ? '#57fff3' : kind === 'repair' ? '#8fff7d' : kind === 'chest' ? '#fff27a' : '#b990ff'
    const radius = kind === 'chest' ? pickupBalance.chestRadius : kind === 'xp' ? pickupBalance.xp.radius : pickupBalance.defaultRadius
    this.pickups.push({ kind, x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, value, radius, life: kind === 'xp' ? pickupBalance.xp.lifeSeconds : pickupBalance.persistentLifeSeconds, color })
  }

  private collect(p: Pickup) {
    this.audio.pickup(p.kind)
    this.player.pickupAbsorbPulse = Math.max(this.player.pickupAbsorbPulse, 0.34)
    if (p.kind === 'xp') {
      this.stats.score += p.value
      const levelsGained = applyMutationXp(this.stats, p.value)
      for (let i = 0; i < levelsGained; i += 1) this.bankUpgrade('MUTATION SIGNAL BANKED. LAND TO INSTALL IT.')
    } else if (p.kind === 'repair') {
      this.player.hull = clamp(this.player.hull + p.value, 0, this.player.maxHull)
    } else if (p.kind === 'magnet') {
      for (const drop of this.pickups) drop.life = Math.max(drop.life, 2)
      this.build.magnet = clamp(this.build.magnet + powerupBalance.upgradeApply.temporaryMagnetRanks, 0, upgradeMaxRank('magnet'))
      this.toast('SIGNAL MAGNET TEMPORARILY OVERCHARGED')
    } else if (p.kind === 'chest') {
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
    if (!surface) return workbenchBalance.surfaceSignalCapBase
    const rewardBonus = surface.event === 'horde' || surface.event === 'jackpot'
      ? workbenchBalance.surfaceSignalCapRewardEventBonus
      : 0
    return workbenchBalance.surfaceSignalCapBase + rewardBonus
  }

  private bankSurfaceUpgrade(message?: string) {
    if (!this.surface) return this.bankUpgrade(message)
    if (this.surface.bankedSignals >= this.surfaceSignalCap()) {
      this.surface.overflowSignals += 1
      this.resources.scrap += workbenchBalance.overflowSignalScrap
      this.resources.crystal += workbenchBalance.overflowSignalCrystal
      if (this.surface.overflowSignals === 1) this.toast('SIGNAL BUFFER FULL: EXTRA SIGNALS CONVERT TO CARGO')
      return false
    }
    this.surface.pendingUpgrade = true
    this.surface.bankedSignals += 1
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
    return {
      x: clamp(pilot.x - this.width / 2, 0, Math.max(0, world.width - this.width)),
      y: clamp(pilot.y - this.height / 2, 0, Math.max(0, world.height - this.height))
    }
  }

  private surfaceInterest() {
    return clamp(
      this.stats.time / surfaceRunBalance.interest.timeDivisor
        + this.stats.planets * surfaceRunBalance.interest.perPlanet
        + this.stats.level * surfaceRunBalance.interest.perLevel,
      0,
      1
    )
  }

  private surfaceMaxHealth() {
    return powerupBalance.surface.baseHealth + this.build.suitHealth * powerupBalance.surface.healthPerSuitRank
  }

  private surfaceMaxOxygen() {
    return powerupBalance.surface.baseOxygen + this.build.suitO2 * powerupBalance.surface.oxygenPerSuitRank
  }

  private surfaceLowOxygenRatio() {
    return this.build.suitO2 >= powerupBalance.surface.lowOxygenSuitThreshold
      ? powerupBalance.surface.lowOxygenRatioUpgraded
      : powerupBalance.surface.lowOxygenRatioBase
  }

  private surfaceGunDamage() {
    return powerupBalance.surface.baseGunDamage + this.build.suitBlaster * powerupBalance.surface.gunDamagePerBlasterRank
  }

  private surfaceGunCooldown() {
    return clamp(
      powerupBalance.surface.baseGunCooldown - this.build.suitBlaster * powerupBalance.surface.gunCooldownPerBlasterRank,
      powerupBalance.surface.minGunCooldown,
      powerupBalance.surface.baseGunCooldown
    )
  }

  private surfaceGunSpeed() {
    return powerupBalance.surface.baseGunSpeed + this.build.suitBlaster * powerupBalance.surface.gunSpeedPerBlasterRank
  }

  private surfaceThreatKeepouts(pilot: Vec, ship: Vec) {
    return [
      { x: pilot.x, y: pilot.y, radius: surfacePilotSpawnKeepout() },
      { x: ship.x, y: ship.y, radius: surfaceRunBalance.threatPlacement.shipKeepoutRadius }
    ]
  }

  private safeSurfaceThreatPoint(candidate: Vec, keepouts: ReturnType<VectorShooter['surfaceThreatKeepouts']>, clearance: number = surfaceRunBalance.threatPlacement.safeDefaultClearance, fallbackAngle = 0) {
    const world = surfaceRunBalance.world
    return surfaceThreatSpawnPoint(candidate, keepouts, { minX: world.threatMinX, maxX: world.threatMaxX, minY: world.threatMinY, maxY: world.threatMaxY }, clearance, fallbackAngle)
  }

  private createGenericSurfaceThreat(planet: Planet, event: SurfaceEventKind, i: number, total: number, keepouts: ReturnType<VectorShooter['surfaceThreatKeepouts']>): SurfaceThreat {
    const a = (i / Math.max(1, total)) * TAU + rand(-0.25, 0.25)
    const placement = surfaceRunBalance.threatPlacement
    const r = event === 'horde'
      ? rand(placement.hordeDistanceMin, placement.hordeDistanceMax)
      : event === 'swarm'
        ? rand(placement.swarmDistanceMin, placement.swarmDistanceMax)
        : rand(placement.defaultDistanceMin, placement.defaultDistanceMax)
    const point = this.safeSurfaceThreatPoint({
      x: surfaceRunBalance.world.ship.x + 20 + Math.cos(a) * r,
      y: surfaceRunBalance.world.ship.y + Math.sin(a) * r
    }, keepouts, event === 'swarm' || event === 'horde' ? placement.swarmClearance : placement.defaultClearance, a)
    const id = event === 'horde'
      ? 'enemy:surface:horde'
      : event === 'swarm'
        ? 'enemy:surface:swarm'
        : planet.name === 'NULL CATHEDRAL'
          ? 'enemy:surface:null-cathedral'
          : 'enemy:surface:standard'
    const title = event === 'horde'
      ? 'Horde Larva'
      : event === 'swarm'
        ? 'Swarm Skitterer'
        : planet.name === 'NULL CATHEDRAL'
          ? 'Cathedral Sentinel'
          : 'Surface Crawler'
    const color = event === 'horde' ? '#ff61d8' : planet.name === 'RED MERCY' || planet.name === 'NULL CATHEDRAL' ? '#ff5d73' : '#fff27a'
    this.recordEnemyDiscovery(id, title, `${planet.name} surface contact.`, 'Planet surface telemetry', color)
    return {
      x: point.x,
      y: point.y,
      vx: 0,
      vy: 0,
      hp: scaledSurfaceHp(
        event === 'horde'
          ? surfaceThreatBalance.generic.hordeBaseHp + this.stats.time * surfaceThreatBalance.generic.hordeHpPerSecond
          : event === 'swarm'
            ? surfaceThreatBalance.generic.swarmBaseHp + this.stats.time * surfaceThreatBalance.generic.swarmHpPerSecond
            : planet.name === 'NULL CATHEDRAL'
              ? surfaceThreatBalance.generic.specialBaseHp
              : surfaceThreatBalance.generic.baseHp
      ),
      radius: event === 'horde'
        ? surfaceThreatBalance.generic.hordeRadius
        : event === 'swarm'
          ? surfaceThreatBalance.generic.swarmRadius
          : planet.name === 'NULL CATHEDRAL'
            ? surfaceThreatBalance.generic.specialRadius
            : surfaceThreatBalance.generic.radius,
      phase: rand(0, TAU),
      color,
      hit: 0,
      behavior: 'chaser'
    }
  }

  private createPlanetBossThreat(planet: Planet, crowded: boolean, keepouts: ReturnType<VectorShooter['surfaceThreatKeepouts']>): SurfaceThreat {
    const seed = hashString(planet.id, this.stats.planets + Math.floor(this.stats.time / 60))
    const row = seed % planetBossCatalogVariants.length
    const variant = planetBossCatalogVariants[row]
    const angle = ((seed >>> 4) / 0xfffffff) * TAU
    const distance = crowded ? rand(280, 420) : rand(170, 320)
    const point = this.safeSurfaceThreatPoint({
      x: surfaceRunBalance.world.ship.x + 20 + Math.cos(angle) * distance,
      y: surfaceRunBalance.world.ship.y + Math.sin(angle) * distance
    }, keepouts, surfaceRunBalance.threatPlacement.bossClearance, angle)
    this.recordEnemyDiscovery(`enemy:surface:boss:${row}`, variant.title, `${planet.name} ${variant.note}.`, 'Boss catalog telemetry', variant.color)
    return {
      x: point.x,
      y: point.y,
      vx: 0,
      vy: 0,
      hp: scaledSurfaceHp(surfaceThreatBalance.boss.baseHp + this.stats.time * surfaceThreatBalance.boss.hpPerSecond + this.stats.level * surfaceThreatBalance.boss.hpPerLevel),
      radius: surfaceThreatBalance.boss.radius,
      phase: rand(0, TAU),
      color: variant.color,
      hit: 0,
      sprite: 'bossCatalog',
      spriteRow: row,
      boss: true,
      behavior: variant.behavior,
      behaviorCooldown: rand(surfaceThreatMotionBalance.blink.cooldownMin, surfaceThreatMotionBalance.blink.cooldownMax)
    }
  }

  private createGlassMiteOracleThreat(keepouts: ReturnType<VectorShooter['surfaceThreatKeepouts']>): SurfaceThreat {
    const point = this.safeSurfaceThreatPoint({ x: rand(990, 1080), y: rand(760, 880) }, keepouts, surfaceRunBalance.threatPlacement.oracleClearance, Math.PI * 0.25)
    this.recordEnemyDiscovery('enemy:surface:oracle', 'Glass Mite Oracle', 'Rare crystalline oracle encountered on a strange surface.', 'Planet surface telemetry', '#57fff3')
    return {
      x: point.x,
      y: point.y,
      vx: 0,
      vy: 0,
      hp: scaledSurfaceHp(surfaceThreatBalance.oracle.baseHp + this.stats.time * surfaceThreatBalance.oracle.hpPerSecond),
      radius: surfaceThreatBalance.oracle.radius,
      phase: rand(0, TAU),
      color: '#57fff3',
      hit: 0,
      sprite: 'glassMiteOracle',
      behavior: 'chaser'
    }
  }

  private createSurfaceAliens(planet: Planet, event: SurfaceEventKind, threatCount: number, scenario: SurfaceScenarioKind, forcedCount?: number): SurfaceAlien[] {
    if (forcedCount === 0) return []
    const quiet = threatCount === 0
    const chance =
      scenario === 'friendly' ? 1 :
      scenario === 'mixed' ? 0.62 + this.surfaceInterest() * 0.24 :
      event === 'swarm' ? 0.06 :
      event === 'volatile' ? 0.22 :
      event === 'repair' ? 0.72 :
      event === 'standard' ? 0.58 :
      event === 'relic' ? 0.46 :
      0.28
    if (forcedCount === undefined && Math.random() > chance + (quiet ? surfaceRunBalance.alien.quietBonusChance : 0)) return []
    const gifts: AlienGiftKind[] = ['herb', 'idol', 'coin', 'map', 'beacon']
    const row = hashString(planet.id, Math.floor(this.stats.time) + 17) % ALIEN_CATALOG_ROWS
    const variant = planetAlienCatalogVariants[row]
    return [{
      x: rand(260, 1340),
      y: rand(210, 960),
      radius: surfaceRunBalance.alien.radius,
      phase: rand(0, TAU),
      color: variant.color,
      name: variant.name,
      gift: Math.random() < 0.42 ? variant.gift : gifts[Math.floor(Math.random() * gifts.length)],
      resolved: false,
      sprite: 'alienCatalog',
      spriteRow: row
    }]
  }

  private createSurfaceLoreSites(planet: Planet, scenario: SurfaceScenarioKind, event: SurfaceEventKind, forcedCount?: number): SurfaceLoreSite[] {
    if (forcedCount === 0) return []
    if (forcedCount === undefined && scenario !== 'lore' && event !== 'relic' && planet.archetype !== 'strange') return []
    const count = forcedCount ?? (scenario === 'lore' ? 2 + Math.floor(Math.random() * 3) : Math.random() < 0.34 ? 1 : 0)
    const sites: SurfaceLoreSite[] = []
    const library = this.loreLibrary(planet)
    for (let i = 0; i < count; i += 1) {
      const entry = library[(hashString(planet.id, i + this.stats.planets * 11) + i) % library.length]
      const a = (i / Math.max(1, count)) * TAU + rand(-0.42, 0.42)
      const point = this.surfaceSafePoint({ x: 800 + Math.cos(a) * rand(260, 520), y: 590 + Math.sin(a) * rand(220, 420) }, 260)
      sites.push({
        x: point.x,
        y: point.y,
        radius: entry.kind === 'pyramid' ? 36 : 30,
        phase: rand(0, TAU),
        kind: entry.kind,
        title: entry.title,
        copy: entry.copy,
        resolved: false
      })
    }
    return sites
  }

  private loreLibrary(planet: Planet): Array<Pick<SurfaceLoreSite, 'kind' | 'title' | 'copy'>> {
    const name = planet.name
    return [
      {
        kind: 'fossils',
        title: 'FOSSIL BED',
        copy: `The fossils are arranged in spirals, not by tide but by ritual. Whatever lived on ${name} learned to count the stars before it learned to leave.`
      },
      {
        kind: 'pyramid',
        title: 'VECTOR PYRAMID',
        copy: `The pyramid has no entrance, only a black seam humming under the dust. Your suit translates one repeated phrase: "We aimed the sky at ourselves."`
      },
      {
        kind: 'grave',
        title: 'GLASS GRAVES',
        copy: `Each grave marker contains a tiny preserved storm. The names are gone, but the weather inside them still remembers the dead.`
      },
      {
        kind: 'machine',
        title: 'SLEEPING MACHINE',
        copy: `A buried engine ticks once when your shadow crosses it. It is still waiting for pilots who became fossils long before your species had radios.`
      },
      {
        kind: 'choir',
        title: 'BONE CHOIR',
        copy: `Rib-like arches vibrate when you walk between them. The song is only two notes, but your ship answers from orbit.`
      }
    ]
  }

  private surfaceEventPoint(event: SurfaceEventKind, i: number, count: number): Vec {
    return plannedSurfaceEventPoint(event, i, count, rand)
  }

  private surfaceSafePoint(point: Vec, minDistance = 210): Vec {
    const world = surfaceRunBalance.world
    const ship = world.ship
    const pilot = world.pilotStart
    let x = clamp(point.x, world.resourceSafeMinX, world.resourceSafeMaxX)
    let y = clamp(point.y, world.resourceSafeMinY, world.resourceSafeMaxY)
    for (let pass = 0; pass < 3; pass += 1) {
      for (const anchor of [ship, pilot]) {
        const dx = x - anchor.x
        const dy = y - anchor.y
        const distance = Math.hypot(dx, dy)
        if (distance >= minDistance) continue
        const angle = distance > 1 ? Math.atan2(dy, dx) : rand(0, TAU)
        const push = minDistance + rand(18, 96)
        x = clamp(anchor.x + Math.cos(angle) * push, world.resourceSafeMinX, world.resourceSafeMaxX)
        y = clamp(anchor.y + Math.sin(angle) * push, world.resourceSafeMinY, world.resourceSafeMaxY)
      }
    }
    return { x, y }
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
      if (resource.kind === 'crystal') {
        const gained = Math.ceil(resource.value * (1 + this.build.cargo * powerupBalance.upgradeApply.cargoResourceBonusPerRank))
        this.resources.crystal += gained
        this.stats.score += resource.value * 12
        const levelsGained = applyMutationXp(this.stats, resource.value)
        for (let i = 0; i < levelsGained; i += 1) this.bankSurfaceUpgrade()
      } else if (resource.kind === 'scrap') {
        const gained = Math.ceil(resource.value * (1 + this.build.cargo * powerupBalance.upgradeApply.cargoResourceBonusPerRank))
        this.resources.scrap += gained
        this.stats.score += gained
      } else if (resource.kind === 'repair') {
        const surfaceRepair = resource.value * (1 + this.build.suitHealth * powerupBalance.upgradeApply.suitRepairBonusPerRank)
        this.surface.pilot.health = clamp(this.surface.pilot.health + surfaceRepair, 0, this.surface.pilot.maxHealth)
      } else if (resource.kind === 'cache') {
        this.resolvePlanetCache(resource)
      }
    }
  }

  private resolvePlanetCache(resource: SurfaceResource) {
    if (!this.surface) return
    this.recordArtifact({
      id: 'cache:surface',
      kind: 'cache',
      title: 'Surface Cache',
      detail: `${this.surface.event.toUpperCase()} cache cracked open.`,
      source: this.surface.planet.name,
      color: this.artifactColor('cache', `${this.surface.planet.id}:${resource.x}:${resource.y}`),
      icon: hashString(`${this.surface.planet.id}:${resource.x}:${resource.y}`, 67) % 16
    })
    const luck = this.build.luck * powerupBalance.planetCache.luckRelicChancePerRank + this.build.survey * powerupBalance.planetCache.surveyRelicChancePerRank
    const cargoBonus = 1 + this.build.cargo * powerupBalance.upgradeApply.cargoResourceBonusPerRank
    this.stats.score += Math.floor(
      (powerupBalance.planetCache.scoreBase + this.stats.level * powerupBalance.planetCache.scorePerLevel)
      * (1 + this.build.cargo * powerupBalance.upgradeApply.cargoCacheScoreBonusPerRank)
    )
    this.resources.scrap += Math.ceil(rand(powerupBalance.planetCache.scrapMin, powerupBalance.planetCache.scrapMax) * cargoBonus)
    this.resources.crystal += Math.ceil(rand(powerupBalance.planetCache.crystalMin, powerupBalance.planetCache.crystalMax) * cargoBonus)
    this.resources.cores += powerupBalance.planetCache.coresBase + (this.build.cargo >= powerupBalance.upgradeApply.cargoCoreBonusThreshold ? powerupBalance.upgradeApply.cargoCoreBonus : 0)
    const missingRelics = relics.filter((relic) => !this.relics.has(relic.id))
    const relicChance = powerupBalance.planetCache.relicChanceBase + luck
    const extraSignalChance = powerupBalance.planetCache.extraSignalChanceBase + luck
    if (missingRelics.length && Math.random() < relicChance) {
      const relic = missingRelics[Math.floor(Math.random() * missingRelics.length)]
      this.acquireRelic(relic)
      this.surface.message = `${relic.name.toUpperCase()} RECOVERED. GET BACK TO THE SHIP.`
    } else {
      const banked = this.bankSurfaceUpgrade()
      this.surface.message = banked
        ? 'MUTATION CACHE SECURED. GET BACK TO THE SHIP.'
        : 'SIGNAL BUFFER FULL. CACHE CONVERTED TO CARGO.'
    }
    if (Math.random() < extraSignalChance) {
      this.bankSurfaceUpgrade('BONUS MUTATION SIGNAL FOUND IN CACHE')
    }
    const cacheMessage = this.surface.message
    const ambushChance = Math.max(
      powerupBalance.planetCache.ambushChanceMin,
      powerupBalance.planetCache.ambushChanceBase
        - this.build.survey * powerupBalance.planetCache.ambushChanceReductionPerSurveyRank
        + (this.relics.has('staticIdol') ? powerupBalance.planetCache.staticIdolAmbushChancePenalty : 0)
    )
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
    const pressureDistance = this.surface.event === 'horde'
      ? 460
      : this.surface.event === 'swarm'
        ? 420
        : 360
    const angle = this.surface.wave.waveIndex * 1.618 + this.stats.time * 0.13
    const keepouts = this.surfaceThreatKeepouts(this.surface.pilot, this.surface.ship)
    return this.safeSurfaceThreatPoint({
      x: this.surface.pilot.x + Math.cos(angle) * pressureDistance,
      y: this.surface.pilot.y + Math.sin(angle) * pressureDistance
    }, keepouts, surfaceRunBalance.threatPlacement.swarmClearance, angle)
  }

  private spawnSurfaceWaveThreats(anchor: { x: number; y: number; spawnCount: number }) {
    if (!this.surface) return
    const keepouts = this.surfaceThreatKeepouts(this.surface.pilot, this.surface.ship)
    const start = this.surface.threats.length
    const total = Math.max(1, start + anchor.spawnCount)
    const scatter = anchor.spawnCount > 1 ? 54 : 0
    for (let i = 0; i < anchor.spawnCount; i += 1) {
      const angle = (i / Math.max(1, anchor.spawnCount)) * TAU + this.surface.wave.elapsed * 0.7
      const point = this.safeSurfaceThreatPoint({
        x: anchor.x + Math.cos(angle) * scatter,
        y: anchor.y + Math.sin(angle) * scatter
      }, keepouts, surfaceRunBalance.threatPlacement.swarmClearance, angle)
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
    return this.surface.aliens.find((alien) => !alien.resolved && Math.sqrt(dist2(alien, this.surface!.pilot)) < alien.radius + surfaceRunBalance.alien.interactionRadiusBonus) ?? null
  }

  private findNearbyLoreSite() {
    if (!this.surface) return null
    return this.surface.loreSites.find((site) => !site.resolved && Math.sqrt(dist2(site, this.surface!.pilot)) < site.radius + surfaceRunBalance.lore.interactionRadiusBonus) ?? null
  }

  private inspectLoreSite(site: SurfaceLoreSite) {
    if (!this.surface || site.resolved) return
    this.state = 'lore'
    site.resolved = true
    this.surface.message = `${site.title}: ${site.copy}`
    const score = runBalance.scoring.loreBaseScore + this.stats.level * runBalance.scoring.loreScorePerLevel
    this.stats.score += score
    this.resources.crystal += surfaceRunBalance.lore.crystalReward
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
    if (Math.random() < powerupBalance.upgradeApply.loreSignalBaseChance + this.build.survey * powerupBalance.upgradeApply.loreSignalSurveyChancePerRank) {
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
    const reward = document.createElement('p')
    reward.className = 'copy'
    reward.textContent = decodedSignal ? `Recovered 1 crystal, ${score} score, and a mutation signal.` : `Recovered 1 crystal and ${score} score.`
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
    panel.append(h, copy, reward, row)
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
    copy.textContent = this.alienOfferCopy(alien)
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

  private alienOfferCopy(alien: SurfaceAlien) {
    return {
      herb: 'It unfolds a luminous herb in both hands. The suit reads medicine, poison, and prayer in equal measure.',
      idol: 'It offers a tiny idol made of cooled lightning. The object is either a charm or a trap pretending to be polite.',
      map: 'It draws a living map in the dust. The route keeps changing when you blink.',
      coin: 'It flips a black coin into the air and waits for your glove to open.',
      beacon: 'It holds up a cracked docking charter. The station signature inside is alive, frightened, and already calling your ship.'
    }[alien.gift]
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
    const luck = this.build.luck * powerupBalance.upgradeApply.alienGiftLuckPerRank + this.build.survey * powerupBalance.upgradeApply.alienGiftSurveyPerRank
    const good = Math.random() < powerupBalance.upgradeApply.alienGiftGoodBaseChance + luck
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
      for (let i = 0; i < gift.idolThreatCount; i += 1) {
        this.surface.threats.push({
          x: clamp(alien.x + rand(-gift.idolThreatScatter, gift.idolThreatScatter), 60, this.surface.width - 60),
          y: clamp(alien.y + rand(-gift.idolThreatScatter, gift.idolThreatScatter), 60, this.surface.height - 60),
          vx: 0,
          vy: 0,
          hp: gift.idolThreatHpBase + this.stats.time * gift.idolThreatHpPerSecond,
          radius: gift.idolThreatRadius,
          phase: rand(0, TAU),
          color: '#ff5d73',
          hit: 0
        })
      }
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
      for (let i = 0; i < gift.beaconThreatCount; i += 1) {
        this.surface.threats.push({
          x: clamp(alien.x + rand(-gift.beaconThreatScatter, gift.beaconThreatScatter), 60, this.surface.width - 60),
          y: clamp(alien.y + rand(-gift.beaconThreatScatter, gift.beaconThreatScatter), 60, this.surface.height - 60),
          vx: 0,
          vy: 0,
          hp: gift.beaconThreatHpBase + this.stats.time * gift.beaconThreatHpPerSecond,
          radius: gift.beaconThreatRadius,
          phase: rand(0, TAU),
          color: '#70a8ff',
          hit: 0
        })
      }
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
    const collectionEntry = collectionCatalogById.get(record.id)
    const canonicalRecord = collectionEntry
      ? {
          ...record,
          kind: collectionEntry.kind,
          color: collectionEntry.color,
          icon: collectionEntry.icon
        }
      : record
    const existing = this.artifacts.get(record.id)
    if (existing) {
      existing.count += 1
      existing.detail = canonicalRecord.detail
      existing.source = canonicalRecord.source
      existing.kind = canonicalRecord.kind
      existing.color = canonicalRecord.color
      existing.icon = canonicalRecord.icon
      return
    }
    this.artifacts.set(record.id, { ...canonicalRecord, count: 1 })
    if (['alien', 'cache', 'lore', 'relic'].includes(canonicalRecord.kind)) this.discoverySuitOffer = true
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
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  private artifactColor(kind: ArtifactKind, key: string) {
    const palettes: Record<ArtifactKind, string[]> = {
      relic: ['#fff27a', '#f8fffb', '#b990ff'],
      alien: ['#b990ff', '#57fff3', '#8fff7d'],
      lore: ['#d7fff7', '#70a8ff', '#fff27a'],
      planet: ['#57fff3', '#8fff7d', '#ff5d73', '#b990ff'],
      cache: ['#fff27a', '#70a8ff', '#57fff3'],
      enemy: ['#ff5d73', '#ff61d8', '#fff27a', '#57fff3']
    }
    const colors = palettes[kind]
    return colors[hashString(key, 73) % colors.length]
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
    const before = { ...this.mothership.resources }
    const archiveRecords = this.currentRunArchiveRecords()
    const discoveries = Object.values(archiveRecords)
    const nodesCleared = this.sectorMap.nodes.filter((node) => node.completed && node.kind !== 'mothership').length
    this.mothership = applyRunRecovery(this.mothership, {
      outcome,
      resources: this.resources,
      archiveRecords,
      skippedBeacons: this.skippedReturnBeacons
    })
    this.saveMothership()
    const recovered = {
      scrap: this.mothership.resources.scrap - before.scrap,
      crystal: this.mothership.resources.crystal - before.crystal,
      cores: this.mothership.resources.cores - before.cores
    }
    this.debrief = buildDebriefReport({
      outcome,
      earnedResources: this.resources,
      recoveredResources: recovered,
      discoveries,
      nodesCleared,
      planetsVisited: this.stats.planets,
      skippedBeacons: this.skippedReturnBeacons,
      stationVisits: this.stationVisits
    })
    this.returnBeacon = null
    this.autoNavTargetBeacon = false
    this.state = 'debrief'
    this.renderDebrief()
  }

  private currentRunArchiveRecords(): Record<string, PersistentArchiveRecord> {
    const records: Record<string, PersistentArchiveRecord> = {}
    for (const artifact of this.artifacts.values()) {
      records[artifact.id] = {
        id: artifact.id,
        kind: artifact.kind,
        title: artifact.title,
        detail: artifact.detail,
        source: artifact.source,
        color: artifact.color,
        icon: artifact.icon,
        count: artifact.count
      }
    }
    return records
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
    let repaired = 0
    let workbenchSignals = 0
    let scrap = 0
    let crystal = 0
    if (node.stationServices.includes('repair')) {
      const before = this.player.hull
      this.player.hull = clamp(this.player.hull + runBalance.station.repairHull, 0, this.player.maxHull)
      repaired = Math.round(this.player.hull - before)
    }
    if (node.stationServices.includes('workbench')) {
      const before = this.pendingUpgrades
      this.pendingUpgrades = Math.max(this.pendingUpgrades, runBalance.station.workbenchSignals)
      this.workbenchRerolls = Math.max(this.workbenchRerolls, runBalance.station.rerolls)
      workbenchSignals = Math.max(0, this.pendingUpgrades - before)
    }
    if (node.stationServices.includes('trade')) {
      scrap = runBalance.station.tradeScrap
      crystal = runBalance.station.tradeCrystal
      this.resources.scrap += scrap
      this.resources.crystal += crystal
    }
    this.audio.pickup('nav')
    const visit = this.recordStationVisit(node, repaired, workbenchSignals, scrap, crystal)
    return buildServiceStationDockReport({
      node,
      visit,
      repaired,
      workbenchSignals,
      scrap,
      crystal
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
    this.scoreName = input.value.toUpperCase().replace(/[^A-Z0-9 _-]/g, '').slice(0, 12).trim() || 'ACE'
    input.value = this.scoreName
    this.saveScore()
  }

  private reset() {
    this.sectorMap = createSectorMap(Date.now())
    this.sectorNodeProfile = sectorNodeRunProfile(currentSectorNode(this.sectorMap))
    this.player = this.makePlayer()
    const shipyard = this.mothership.departments.shipyard
    this.player.maxHull += shipyard * runBalance.progression.shipyardHullPerTier
    this.player.hull = this.player.maxHull
    this.player.speed += shipyard * runBalance.progression.shipyardSpeedPerTier
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
    this.workbenchRerolls = this.mothership.departments.workbench >= 1 ? 1 : 0
    const hangarCrew = this.mothership.departments.hangarCrew
    this.resources = {
      scrap: hangarCrew * runBalance.progression.hangarCrewScrapPerTier,
      crystal: hangarCrew >= runBalance.progression.hangarCrewCrystalUnlockTier ? hangarCrew * runBalance.progression.hangarCrewCrystalPerTier : 0,
      cores: hangarCrew >= runBalance.progression.hangarCrewCoreUnlockTier ? runBalance.progression.hangarCrewCores : 0
    }
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
    try {
      return JSON.parse(localStorageWithFallback(SCORE_STORAGE_KEY, LEGACY_SCORE_STORAGE_KEYS) || '[]') as ScoreEntry[]
    } catch {
      return []
    }
  }

  private resetProgressFromUrl() {
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#\??/, ''))
    const requested = params.get('resetProgress') ?? hashParams.get('resetProgress') ?? ''
    if (!['1', 'true', 'yes'].includes(requested.toLowerCase())) return
    this.clearPersistentProgressStorage()
  }

  private clearPersistentProgressStorage() {
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (
        key === SCORE_STORAGE_KEY
        || LEGACY_SCORE_STORAGE_KEYS.includes(key)
        || key === GRAPHICS_STORAGE_KEY
        || LEGACY_GRAPHICS_STORAGE_KEYS.includes(key)
        || key === MOTHERSHIP_STORAGE_KEY
        || key.startsWith('galactic_hordes_')
      ) {
        localStorage.removeItem(key)
      }
    }
  }

  private loadMothership() {
    try {
      return normalizeMothershipState(JSON.parse(localStorage.getItem(MOTHERSHIP_STORAGE_KEY) || 'null'))
    } catch {
      return defaultMothershipState()
    }
  }

  private saveMothership() {
    localStorage.setItem(MOTHERSHIP_STORAGE_KEY, JSON.stringify(this.mothership))
  }

  private saveScore() {
    if (this.scoreSaved) return
    this.scoreSaved = true
    const entry = scoreEntryFromRun({
      name: this.scoreName,
      score: this.stats.score,
      time: this.stats.time,
      level: this.stats.level,
      kills: this.stats.kills,
      date: new Date().toISOString(),
      debrief: this.debrief
    })
    this.highs = [...this.highs, entry].sort((a, b) => b.score - a.score).slice(0, 10)
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(this.highs))
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
