import './style.css'
import collectionIconAtlasUrl from './assets/collection-icon-atlas.png'
import glassMiteOracleSheetUrl from './assets/glass-mite-oracle-sheet-alpha.png'
import planetAlienCatalogUrl from './assets/planet-alien-catalog-alpha.png'
import planetBossCatalogUrl from './assets/planet-boss-catalog-alpha.png'
import spaceEnemyCatalogUrl from './assets/space-enemy-catalog-alpha.png'
import surfaceSpacemanSheetUrl from './assets/surface-spaceman-sheet-alpha.png'
import titleLogoMarkUrl from './assets/title-logo-mark.png'
import { orderArtifactArchiveCards } from './artifact-archive'
import { collectionCatalog, collectionCatalogById, collectionIconAtlasColumns, collectionIconAtlasRows } from './collection-catalog'
import {
  activeBalanceProfile,
  balancedSpaceEnemyDefinition,
  enemyAttackCooldown,
  pickSpaceEnemyKind,
  scaledBossTimer,
  scaledSpawnTimer,
  scaledSurfaceDamage,
  scaledSurfaceHp,
  scaledSurfaceSpeed,
  spaceEnemyRunScale,
  spaceEnemySpeedBonus,
  spaceSpawnBalance,
  spawnPressureMinutes,
  surfaceThreatBalance
} from './game-balance'
import { navigationCruiseScalar, navigationTrailProfile } from './navigation-cruise'
import { selectPlanetBiome, type PlanetBiomeProfile } from './planet-biomes'
import { planetNameFor } from './planet-names'
import { pickupMagnetRange, pickupMagnetStrength } from './pickup-magnet'
import { planetRadius } from './planet-sizing'
import { nextXpThreshold, runBalance } from './run-balance'
import {
  evolutions,
  limitBreakChoices,
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
  type SectorHazardTag,
  type SectorMap,
  type SectorNode,
  type SectorNodeRunProfile,
  type SectorStationService,
  type SectorWaveOrder
} from './sector-map'
import { pressurePackSize, shouldRecycleEnemy } from './spawn-pressure'
import { buildStationVisitRecord, journeyDistanceLy, stationNameForNode as stationMemoryNameForNode, type StationVisitRecord } from './station-memory'
import {
  cameraTargetFor,
  screenToWorld as spaceScreenToWorld,
  spaceProjectileLifeForOffscreenTravel,
  spaceViewportScale,
  worldToScreen as spaceWorldToScreen
} from './space-camera'
import { isGiantEnemyKind, isSpriteEnemyKind, spaceEnemyDefinitions, spaceEnemySpawnPoint, spriteEnemyKinds, type SpaceEnemyKind } from './space-enemies'
import type { Vec, Enemy, Bullet, EnemyKind } from './main-types'
import { norm, dist2, len, TAU } from './math-utils'
import { renderSurfaceBiomeMotifs as drawSurfaceBiomeMotifs } from './render/surface-biomes'
import { renderPlayer as drawPlayer } from './render/player'
import { renderEnemies as drawEnemies } from './render/enemies'
import { enemyBehaviors, type EnemyBehaviorContext } from './enemy-behaviors'
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
import { SURFACE_PILOT_SIZE_SCALE, surfacePilotCollisionRadius, surfacePilotMuzzleOffset, surfacePilotSpawnKeepout, surfacePilotSpriteScale } from './surface-pilot'
import {
  bossCacheValue,
  pickSurfaceResourceKind,
  planetAlienCatalogVariants,
  planetBossCatalogVariants,
  surfaceEventPoint as plannedSurfaceEventPoint,
  surfaceResourceValue,
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
  firstOpportunityUpgrade,
  workbenchRollableUpgrades,
  workbenchUnlockEdges,
  workbenchUpgradeRows,
  type WorkbenchUpgradeRow
} from './workbench-rolls'
import { workbenchBayDefinitions, workbenchBayForUpgrade, type WorkbenchBayDefinition, type WorkbenchBayId } from './workbench-bays'
import { optionOrbProfile, pulseVolleyCount, rearGunProfile, starterSignatureFlags } from './weapon-signatures'
import {
  renderLevelUp as uiRenderLevelUp,
  currentLevelUpScrollTop as uiCurrentLevelUpScrollTop,
  restoreLevelUpScroll as uiRestoreLevelUpScroll,
  canApplyWorkbenchChoice as uiCanApplyWorkbenchChoice,
  renderManifestSummary as uiRenderManifestSummary,
  renderManifestRelicLine as uiRenderManifestRelicLine,
  workbenchExtraUnlockedIds as uiWorkbenchExtraUnlockedIds,
  installCueFor as uiInstallCueFor
} from './ui/workbench'
import { renderCollectionScreen as uiRenderCollectionScreen } from './ui/collection'
import { showMothership as uiShowMothership, renderMothershipMetaSystems as uiRenderMothershipMetaSystems } from './ui/mothership-console'
import { renderDebrief as uiRenderDebrief } from './ui/debrief'
import { introHookConfig } from './intro-hook'
import type { StateHandlers } from './game-states'

export type GameState = 'title' | 'mothership' | 'collection' | 'powerups' | 'sectorMap' | 'station' | 'playing' | 'paused' | 'levelup' | 'planet' | 'landing' | 'surface' | 'alien' | 'lore' | 'takeoff' | 'dying' | 'debrief' | 'gameover' | 'scores'
type PickupKind = 'xp' | 'repair' | 'magnet' | 'core' | 'chest'
type GraphicsMode = 'LOW' | 'MED' | 'GLOW'
export type ArtifactKind = 'relic' | 'alien' | 'lore' | 'planet' | 'cache' | 'enemy'
export type MothershipConsoleView = 'workbench' | 'manifest'
export type MothershipCollectionFilter = 'all' | 'found' | 'locked' | ArtifactKind

interface Pickup {
  kind: PickupKind
  x: number
  y: number
  vx: number
  vy: number
  value: number
  radius: number
  life: number
  color: string
}

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

interface ScorePopup {
  x: number
  y: number
  vy: number
  life: number
  totalLife: number
  text: string
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

interface Planet {
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

interface DebriefReport {
  outcome: RunOutcomeKind
  title: string
  copy: string
  resources: {
    earned: { scrap: number; crystal: number; cores: number }
    recovered: { scrap: number; crystal: number; cores: number }
  }
  discoveries: PersistentArchiveRecord[]
  skippedBeacons: number
  stationVisits: StationVisitRecord[]
  lightYears: number
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

interface StationDockReport {
  nodeId: string
  stationName: string
  nodeLabel: string
  fiction: string
  serviceLine: string
  repaired: number
  workbenchSignals: number
  scrap: number
  crystal: number
  services: SectorStationService[]
  contactName: string
  contactRole: string
  rumor: string
  routeStatus: string
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

export type WorkbenchChoice =
  | { kind: 'upgrade'; upgrade: Upgrade }
  | { kind: 'evolution'; evolution: Evolution }
  | { kind: 'limit'; id: LimitId; name: string; description: string }
  | { kind: 'relic'; relic: Relic }

interface ScoreEntry {
  name: string
  score: number
  time: number
  level: number
  kills: number
  date: string
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
const STORAGE_KEY = 'vector_shooter_high_scores'
const MOTHERSHIP_STORAGE_KEY = 'galactic_hordes_mothership_v2'
const GRID_CELL = 180
const GRID_STRIDE = 1000
const MAX_PARTICLES = 300
const MAX_SHOCKWAVES = 12
const MAX_BULLETS = 220
const MAX_ENEMIES = 320
const MAX_PICKUPS = 220
const ENEMY_RECYCLE_RADIUS = 2200
const ENEMY_PRESSURE_RADIUS = 1250

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
const rand = (min: number, max: number) => min + Math.random() * (max - min)
const BOSS_CATALOG_ROWS = planetBossCatalogVariants.length
const BOSS_CATALOG_FRAMES = 4
const ALIEN_CATALOG_ROWS = planetAlienCatalogVariants.length
const ALIEN_CATALOG_FRAMES = 4
const angleLerp = (a: number, b: number, t: number) => {
  const diff = Math.atan2(Math.sin(b - a), Math.cos(b - a))
  return a + diff * t
}
const hash32 = (x: number, y: number, salt = 0) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(salt, 2246822519)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return (h ^ (h >>> 16)) >>> 0
}
export const hashString = (value: string, salt = 0) => {
  let h = 2166136261 ^ salt
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
const rngFrom = (seed: number) => {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

type PlanetAudioMood = Planet['archetype'] | 'deepSpace' | 'title'
type WeaponSoundKind = 'pulse' | 'prism' | 'rail' | 'needle' | 'surface'
export type AudioUpgradeCue = UpgradeBucket | 'evolution' | 'relic' | 'limit'
type ExplosionSoundKind = 'small' | 'heavy' | 'surface' | 'gameover'
type PickupSoundKind = PickupKind | SurfaceResourceKind | 'gift' | 'nav'

interface PlanetMoodProfile {
  root: number
  chord: [number, number, number]
  noise: number
  pulse: number
  wobble: number
  filter: number
}

interface WeaponSoundProfile {
  base: number
  upper: number
  wave: OscillatorType
  duration: number
  bend: number
  gain: number
  noise: number
  filter: number
}

class AudioDirector {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private sfx: GainNode | null = null
  private bed: GainNode | null = null
  private weaponBus: GainNode | null = null
  private flangerLfo: OscillatorNode | null = null
  private beatTimer = 0
  private beatInterval = 0.7
  private beatIndex = 0
  private ambientTimer = 0
  private mood: PlanetAudioMood = 'title'
  private unlocked = false
  private planetMoods: Record<PlanetAudioMood, PlanetMoodProfile> = {
    title: { root: 55, chord: [0, 7, 12], noise: 0.012, pulse: 0.6, wobble: 0.4, filter: 820 },
    deepSpace: { root: 44, chord: [0, 5, 12], noise: 0.016, pulse: 0.48, wobble: 0.65, filter: 620 },
    cache: { root: 58, chord: [0, 7, 14], noise: 0.018, pulse: 0.68, wobble: 0.5, filter: 980 },
    hostile: { root: 41, chord: [0, 1, 7], noise: 0.03, pulse: 0.36, wobble: 0.9, filter: 520 },
    repair: { root: 62, chord: [0, 5, 9], noise: 0.01, pulse: 0.82, wobble: 0.28, filter: 1180 },
    relic: { root: 49, chord: [0, 7, 11], noise: 0.02, pulse: 0.52, wobble: 0.72, filter: 760 },
    strange: { root: 46, chord: [0, 6, 13], noise: 0.024, pulse: 0.44, wobble: 1.1, filter: 690 },
    lore: { root: 52, chord: [0, 3, 10], noise: 0.014, pulse: 0.72, wobble: 0.8, filter: 880 },
    horde: { root: 38, chord: [0, 1, 6], noise: 0.04, pulse: 0.3, wobble: 1.18, filter: 500 }
  }
  private weaponProfiles: Record<WeaponSoundKind, WeaponSoundProfile> = {
    pulse: { base: 310, upper: 890, wave: 'square', duration: 0.044, bend: 46, gain: 0.034, noise: 0.009, filter: 2500 },
    prism: { base: 420, upper: 1220, wave: 'triangle', duration: 0.052, bend: 82, gain: 0.032, noise: 0.006, filter: 3400 },
    rail: { base: 145, upper: 1480, wave: 'sawtooth', duration: 0.09, bend: -36, gain: 0.052, noise: 0.026, filter: 2100 },
    needle: { base: 760, upper: 1900, wave: 'square', duration: 0.065, bend: 180, gain: 0.038, noise: 0.014, filter: 3800 },
    surface: { base: 238, upper: 720, wave: 'square', duration: 0.048, bend: 24, gain: 0.04, noise: 0.018, filter: 1800 }
  }

  unlock() {
    if (this.unlocked) return
    const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return
    this.context = new AudioCtor()
    this.master = this.context.createGain()
    this.sfx = this.context.createGain()
    this.bed = this.context.createGain()
    this.master.gain.value = 0.36
    this.sfx.gain.value = 1
    this.bed.gain.value = 0.55
    this.setupWeaponFlanger()
    const limiter = this.context.createDynamicsCompressor()
    limiter.threshold.value = -18
    limiter.ratio.value = 9
    limiter.attack.value = 0.004
    limiter.release.value = 0.16
    this.sfx.connect(this.master)
    this.bed.connect(this.master)
    this.master.connect(limiter)
    limiter.connect(this.context.destination)
    this.unlocked = true
  }

  update(dt: number, intensity: number, mood: PlanetAudioMood) {
    if (!this.context || !this.master || !this.bed) return
    this.mood = mood
    this.ambientTimer -= dt
    if (this.ambientTimer <= 0) {
      this.ambientTimer = this.emitAmbientMood(mood, intensity)
    }
    this.updateBeatClock(dt, intensity, mood)
  }

  fire(kind: WeaponSoundKind, power: number) {
    const profile = this.weaponProfiles[kind]
    const drive = Math.min(9, power)
    const low = profile.base + drive * 14
    const high = profile.upper + drive * 28
    const destination = this.weaponDestination(kind)
    this.tone(low, profile.duration, profile.wave, profile.gain, 0.006, kind === 'rail' ? -10 : -12, { destination, filter: profile.filter, bend: profile.bend })
    this.tone(high, profile.duration * 0.72, kind === 'prism' ? 'sine' : 'triangle', profile.gain * 0.46, 0.004, kind === 'needle' ? -13 : -16, { destination, filter: profile.filter + 900, bend: profile.bend * 0.5 })
    if (profile.noise > 0) this.noise(profile.duration * 0.75, profile.noise, kind === 'rail' ? -14 : -19, { destination, filter: profile.filter * 0.72, type: kind === 'surface' ? 'highpass' : 'bandpass' })
  }

  hit() {
    this.impact(1.2)
    this.tone(140, 0.065, 'triangle', 0.022, 0.01, -20, { bend: -34, filter: 820 })
  }

  impact(power = 1) {
    const intensity = clamp(power, 0.65, 1.45)
    const spark = 980 + Math.random() * 180
    this.noise(0.032, 0.062 * intensity, -14, { filter: 3600 + spark, type: 'highpass' })
    this.noise(0.052, 0.036 * intensity, -19, { filter: 1850 + spark * 0.35, type: 'bandpass' })
    this.tone(spark, 0.038, 'square', 0.03 * intensity, 0.003, -15, { bend: 420, filter: 5200 })
    setTimeout(() => this.tone(spark * 1.48, 0.032, 'triangle', 0.022 * intensity, 0.003, -17, { bend: -260, filter: 6400 }), 18)
  }

  pickup(kind: PickupSoundKind = 'xp') {
    const base = {
      xp: 760,
      repair: 520,
      magnet: 980,
      core: 620,
      chest: 430,
      crystal: 840,
      scrap: 360,
      cache: 560,
      gift: 700,
      nav: 1040
    }[kind]
    const wave: OscillatorType = kind === 'scrap' || kind === 'chest' ? 'square' : kind === 'repair' ? 'triangle' : 'sine'
    this.tone(base + Math.random() * 70, 0.075, wave, 0.034, 0.01, -15, { filter: base * 3, bend: kind === 'magnet' || kind === 'nav' ? 120 : 22 })
    if (kind === 'chest' || kind === 'cache' || kind === 'core') this.tone(base * 1.5, 0.11, 'triangle', 0.026, 0.018, -17, { filter: 2400 })
  }

  level() {
    this.tone(360, 0.12, 'triangle', 0.05, 0.02, -12, { filter: 1800 })
    setTimeout(() => this.tone(540, 0.14, 'triangle', 0.055, 0.02, -12, { filter: 2200 }), 70)
    setTimeout(() => this.tone(810, 0.18, 'triangle', 0.07, 0.02, -12, { filter: 2800 }), 140)
    this.syncToBeat(() => this.tone(720, 0.08, 'sine', 0.026, 0.012, -18, { filter: 2600 }), 2)
  }

  install(cue: AudioUpgradeCue, rare = false) {
    const root = {
      weapons: 520,
      navigation: 680,
      survival: 390,
      economy: 760,
      planetcraft: 470,
      spacesuit: 580,
      control: 610,
      evolution: 300,
      relic: 260,
      limit: 860
    }[cue]
    const wave: OscillatorType = cue === 'weapons' || cue === 'control' ? 'square' : cue === 'relic' || cue === 'evolution' ? 'sawtooth' : 'triangle'
    this.tone(root, 0.08, wave, 0.043, 0.008, rare ? -10 : -13, { filter: 1900, bend: cue === 'evolution' ? 120 : 34 })
    setTimeout(() => this.tone(root * (cue === 'survival' ? 1.34 : 1.5), 0.1, 'square', 0.03, 0.006, rare ? -11 : -15, { filter: 2600 }), 55)
    setTimeout(() => this.tone(root * (rare ? 2.08 : 1.88), 0.13, 'sine', 0.034, 0.006, rare ? -10 : -14, { filter: 3400 }), 120)
    if (rare) this.noise(0.1, 0.08, -17, { filter: cue === 'relic' ? 920 : 1700, type: 'bandpass' })
  }

  upgrade(cue: AudioUpgradeCue, rare = false) {
    const root = {
      weapons: 640,
      navigation: 820,
      survival: 460,
      economy: 920,
      planetcraft: 560,
      spacesuit: 700,
      control: 740,
      evolution: 380,
      relic: 320,
      limit: 980
    }[cue]
    this.tone(root, 0.06, 'triangle', 0.04, 0.006, rare ? -10 : -14, { filter: 2600, bend: 48 })
    setTimeout(() => this.tone(root * 1.62, 0.09, 'sine', 0.036, 0.006, rare ? -10 : -15, { filter: 3600, bend: rare ? 86 : 38 }), 48)
    if (rare) setTimeout(() => this.tone(root * 2.12, 0.12, 'square', 0.026, 0.008, -15, { filter: 4200 }), 112)
  }

  boom(kind: ExplosionSoundKind = 'small') {
    const big = kind === 'heavy' || kind === 'gameover'
    const surface = kind === 'surface'
    this.noise(big ? 0.34 : surface ? 0.2 : 0.16, big ? 0.2 : 0.11, big ? -8 : -12, { filter: big ? 520 : 880, type: 'lowpass' })
    this.noise(big ? 0.16 : 0.08, big ? 0.1 : 0.046, big ? -14 : -18, { filter: big ? 1600 : 2400, type: 'bandpass' })
    this.tone(big ? 52 : surface ? 74 : 92, big ? 0.36 : 0.18, 'sawtooth', big ? 0.09 : 0.044, 0.018, big ? -8 : -13, { bend: big ? -28 : -16, filter: big ? 760 : 1100 })
    if (kind === 'gameover') setTimeout(() => this.tone(38, 0.55, 'triangle', 0.07, 0.04, -12, { bend: -10, filter: 620 }), 120)
  }

  land() {
    this.tone(160, 0.15, 'sine', 0.05, 0.02, -16, { bend: -22, filter: 900 })
    this.tone(240, 0.22, 'triangle', 0.045, 0.03, -15, { bend: -38, filter: 1300 })
    this.noise(0.12, 0.04, -20, { filter: 620, type: 'lowpass' })
  }

  planetSignal(mood: PlanetAudioMood) {
    const profile = this.planetMoods[mood]
    for (let i = 0; i < profile.chord.length; i += 1) {
      const note = this.note(profile.root, profile.chord[i] + 12)
      setTimeout(() => this.syncToBeat(() => this.tone(note, 0.12, i === 1 ? 'square' : 'triangle', 0.032, 0.014, -15, { filter: profile.filter + note * 2, bend: profile.wobble * 16 }), 2), i * 68)
    }
    this.noise(0.11, profile.noise * 2.6, -21, { filter: profile.filter, type: 'bandpass' })
  }

  private emitAmbientMood(mood: PlanetAudioMood, intensity: number) {
    if (!this.bed) return 1
    const bed = this.bed
    const profile = this.planetMoods[mood]
    const chord = profile.chord[Math.floor(Math.random() * profile.chord.length)]
    const low = this.note(profile.root, chord - 12)
    const dur = clamp(0.9 + Math.random() * 0.75 - intensity * 0.24, 0.44, 1.45)
    this.tone(low + rand(-profile.wobble * 3, profile.wobble * 3), dur, mood === 'hostile' ? 'sawtooth' : 'triangle', 0.024, 0.08, -24, { destination: bed, filter: profile.filter, bend: rand(-profile.wobble * 18, profile.wobble * 18) })
    if (Math.random() < 0.62) this.noise(0.08 + profile.noise * 4, profile.noise, -25, { destination: bed, filter: profile.filter + rand(-120, 220), type: mood === 'repair' ? 'lowpass' : 'bandpass' })
    return clamp(profile.pulse * 1.65 + Math.random() * 0.5, 0.55, 1.8)
  }

  private updateBeatClock(dt: number, intensity: number, mood: PlanetAudioMood) {
    if (!this.bed) return
    this.beatTimer -= dt
    if (this.beatTimer > 0) return
    const profile = this.planetMoods[mood]
    this.beatInterval = clamp(profile.pulse - intensity * 0.2, 0.24, 0.9)
    this.beatTimer = this.beatInterval
    this.heartbeat(mood, intensity)
    this.beatIndex += 1
  }

  private heartbeat(mood: PlanetAudioMood, intensity: number) {
    if (!this.bed) return
    const profile = this.planetMoods[mood]
    const accent = this.beatIndex % 4 === 0
    const chord = profile.chord[this.beatIndex % profile.chord.length]
    const note = this.note(profile.root, chord + Math.floor(intensity * 5))
    this.tone(note, 0.075, 'sawtooth', 0.024, 0.035, -18, { destination: this.bed, filter: profile.filter + note })
    this.tone(profile.root * 0.5, accent ? 0.12 : 0.08, 'sine', accent ? 0.02 : 0.012, 0.025, accent ? -23 : -27, { destination: this.bed, filter: profile.filter * 0.7 })
    if (Math.random() < 0.36 + intensity * 0.24) this.noise(0.055, profile.noise, -23, { destination: this.bed, filter: profile.filter, type: 'bandpass' })
  }

  private nextBeatDelay(subdivision = 1) {
    const step = this.beatInterval / Math.max(1, subdivision)
    if (step <= 0) return 0
    return clamp(this.beatTimer % step, 0, step)
  }

  private syncToBeat(fn: () => void, subdivision = 1) {
    const delay = this.nextBeatDelay(subdivision)
    if (delay <= 0.018) fn()
    else setTimeout(fn, delay * 1000)
  }

  private note(root: number, semitones: number) {
    return root * Math.pow(2, semitones / 12)
  }

  private setupWeaponFlanger() {
    if (!this.context || !this.sfx) return
    const weaponBus = this.context.createGain()
    const flangerDelay = this.context.createDelay(0.03)
    const flangerFeedback = this.context.createGain()
    const flangerWet = this.context.createGain()
    const flangerLfo = this.context.createOscillator()
    const flangerDepth = this.context.createGain()

    weaponBus.gain.value = 1
    flangerDelay.delayTime.value = 0.006
    flangerFeedback.gain.value = 0.18
    flangerWet.gain.value = 0.16
    flangerLfo.type = 'sine'
    flangerLfo.frequency.value = 0.16
    flangerDepth.gain.value = 0.0038

    flangerLfo.connect(flangerDepth)
    flangerDepth.connect(flangerDelay.delayTime)
    weaponBus.connect(this.sfx)
    weaponBus.connect(flangerDelay)
    flangerDelay.connect(flangerFeedback)
    flangerFeedback.connect(flangerDelay)
    flangerDelay.connect(flangerWet)
    flangerWet.connect(this.sfx)
    flangerLfo.start()

    this.weaponBus = weaponBus
    this.flangerLfo = flangerLfo
  }

  private weaponDestination(kind: WeaponSoundKind) {
    if (kind === 'surface') return undefined
    return this.weaponBus ?? undefined
  }

  private tone(freq: number, duration: number, type: OscillatorType, gain: number, attack: number, db: number, options: { bend?: number; filter?: number; destination?: AudioNode } = {}) {
    if (!this.context || !this.sfx) return
    const now = this.context.currentTime
    const osc = this.context.createOscillator()
    const filter = this.context.createBiquadFilter()
    const amp = this.context.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    if (options.bend) osc.frequency.exponentialRampToValueAtTime(Math.max(24, freq + options.bend), now + duration)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(options.filter ?? 1800 + freq, now)
    amp.gain.setValueAtTime(0.0001, now)
    amp.gain.exponentialRampToValueAtTime(gain * Math.pow(10, db / 20), now + attack)
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.connect(filter)
    filter.connect(amp)
    amp.connect(options.destination ?? this.sfx)
    osc.start(now)
    osc.stop(now + duration + 0.02)
  }

  private noise(duration: number, gain: number, db: number, options: { filter?: number; type?: BiquadFilterType; destination?: AudioNode } = {}) {
    if (!this.context || !this.sfx) return
    const now = this.context.currentTime
    const buffer = this.context.createBuffer(1, this.context.sampleRate * duration, this.context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) {
      const crush = i % 5 === 0 ? Math.random() * 2 - 1 : data[i - 1] || 0
      data[i] = crush * (1 - i / data.length)
    }
    const source = this.context.createBufferSource()
    const filter = this.context.createBiquadFilter()
    const amp = this.context.createGain()
    source.buffer = buffer
    filter.type = options.type ?? 'bandpass'
    filter.frequency.value = options.filter ?? 420 + Math.random() * 1400
    filter.Q.value = 1.8
    amp.gain.value = gain * Math.pow(10, db / 20)
    source.connect(filter)
    filter.connect(amp)
    amp.connect(options.destination ?? this.sfx)
    source.start(now)
  }
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
        this.renderTransitionOverlay(ctx, t, 'LANDING')
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
        this.renderTransitionOverlay(ctx, t, 'TAKEOFF')
      }
    },
    dying: {
      update: (dt) => this.updateDying(dt),
      render: (ctx) => {
        this.renderSpaceScene(ctx)
        this.renderDeathOverlay(ctx)
      }
    }
  }
  private graphicsMode: GraphicsMode = (localStorage.getItem('vector_shooter_graphics') as GraphicsMode) || 'LOW'
  private perf: PerfStats = { updateMs: 0, renderMs: 0, frameMs: 16.7, fps: 60 }
  private keys = new Set<string>()
  private pressed = new Set<string>()
  private mouse = { x: 0, y: 0, down: false }
  private touchStick = { active: false, id: -1, startX: 0, startY: 0, x: 0, y: 0 }
  private mobileActionQueued = false
  private mobileDashQueued = false
  private mobileFireQueued = false
  private audio = new AudioDirector()
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
  private upgradeChoices: WorkbenchChoice[] = []
  private workbenchInstalling = false
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
  private enemyGrid = new Map<number, Enemy[]>()
  private nearbyEnemyScratch: Enemy[] = []
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
    fireHelixSpikes: (e, def, toP) => this.fireHelixSpikes(e, def, toP),
    firePrismFan: (e, def, toP) => this.firePrismFan(e, def, toP),
    fireSiphonVortex: (e, def) => this.fireSiphonVortex(e, def),
    fireDreadnoughtBroadside: (e, def, toP) => this.fireDreadnoughtBroadside(e, def, toP),
    fireCathedralLattice: (e, def, toP) => this.fireCathedralLattice(e, def, toP),
    damagePlayer: (amount) => this.damagePlayer(amount),
    killEnemy: (e, reward) => this.killEnemy(e, reward)
  }
  private pickups: Pickup[] = []
  private particles: Particle[] = []
  private scorePopups: ScorePopup[] = []
  private shockwaves: Shockwave[] = []
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
    hullFill: document.createElement('div'),
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
    const hud = document.createElement('div')
    hud.className = 'hud'
    const top = document.createElement('div')
    top.className = 'topbar'
    const meters = document.createElement('div')
    meters.className = 'hud-meters'
    meters.append(this.meter('HULL', this.ui.hull, this.ui.hullFill, 'health', this.ui.hullLabel), this.meter('XP', this.ui.level, this.ui.xpFill, 'xp', this.ui.xpLabel))
    const left = document.createElement('div')
    left.className = 'hud-cluster hud-cluster-left'
    left.append(this.chip('TIME', this.ui.time), this.chip('SCORE', this.ui.score))
    this.ui.toast.className = 'toast'
    this.ui.perf.className = 'perf'
    hud.append(top, this.ui.toast, this.makeTouchControls())
    top.append(meters, left)
    return hud
  }

  private meter(label: string, value: HTMLElement, fill: HTMLElement, tone: string, labelEl = document.createElement('span')) {
    const meter = document.createElement('div')
    meter.className = `hud-meter ${tone}`
    const meta = document.createElement('div')
    meta.className = 'hud-meter-meta'
    labelEl.textContent = label
    value.className = 'hud-meter-value'
    meta.append(labelEl, value)
    const bar = document.createElement('div')
    bar.className = 'hud-meter-bar'
    fill.className = `hud-meter-fill ${tone}`
    bar.append(fill)
    meter.append(meta, bar)
    return meter
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

  private chip(label: string, value: HTMLElement, tone = '') {
    const chip = document.createElement('div')
    chip.className = `hud-chip ${tone}`.trim()
    const l = document.createElement('span')
    l.className = 'hud-label'
    l.textContent = label
    value.className = 'hud-value'
    chip.append(l, value)
    return chip
  }

  private makeScreens() {
    const wrap = document.createElement('div')
    const screenList = [this.ui.title, this.ui.collection, this.ui.powerups, this.ui.sectorMap, this.ui.station, this.ui.levelup, this.ui.planet, this.ui.gameover, this.ui.scores]
    for (const s of screenList) {
      s.className = 'screen'
      wrap.append(s)
    }
    this.ui.gameover.className = 'screen gameover-screen'
    return wrap
  }

  private bind() {
    window.addEventListener('resize', () => this.resize())
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
    for (let i = this.scorePopups.length - 1; i >= 0; i -= 1) {
      const sp = this.scorePopups[i]
      sp.life -= dt
      sp.y += sp.vy * dt
      if (sp.life <= 0) this.scorePopups.splice(i, 1)
    }
    this.updateOrbitals(dt)
    this.updateSpawning()
    this.updateSectorWaves()
    this.updateReturnBeacon(dt)
    this.updateCamera(dt)
    this.updateHud()
    if (this.player.hull <= 0) this.gameOver()
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
      this.deployMineWake(d)
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
      this.toast('SURFACE TEAM DEPLOYED: COLLECT SIGNALS, RETURN TO SHIP')
    }
  }

  private updateTakeoff(dt: number) {
    this.transitionTimer += dt
    this.toastTimer -= dt
    this.updateParticles(dt)
    this.updateHud()
    if (this.transitionTimer >= this.transitionDuration * 0.5) this.snapToOrbitReturnPoint()
    if (this.transitionTimer >= this.transitionDuration) this.finishTakeoff()
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
    this.updateSurfaceOxygen(dt)
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

    const nearShip = Math.sqrt(dist2(this.surface.pilot, this.surface.ship)) < 64
    const lore = this.findNearbyLoreSite()
    const alien = this.findNearbyAlien()
    if (this.surface.o2Returning && nearShip) this.startTakeoff()
    else if (input.interact && lore) this.inspectLoreSite(lore)
    else if (input.interact && alien) this.openAlienEncounter(alien)
    else if (input.interact && nearShip) this.startTakeoff()
    if (this.surface.collected >= this.surface.resources.length && !nearShip) {
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

  private updateSurfaceOxygen(dt: number) {
    if (!this.surface) return
    this.surface.pilot.oxygen = Math.max(0, this.surface.pilot.oxygen - dt)
    const low = this.surface.pilot.oxygen <= this.surface.pilot.maxOxygen * this.surfaceLowOxygenRatio()
    if (low && !this.surface.o2Returning) {
      this.surface.o2Returning = true
      this.surface.message = 'O2 LOW - RETURNING TO SHIP'
      this.toast('O2 LOW - RETURNING TO SHIP')
    }
    if (this.surface.pilot.oxygen <= 0) this.startTakeoff()
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

  private deployMineWake(direction: Vec) {
    const level = this.build.mine
    if (level <= 0) return
    const evolved = this.evolved.has('mine')
    const count = Math.min(
      powerupBalance.mineWake.maxMines,
      powerupBalance.mineWake.baseMines
        + Math.ceil(level / powerupBalance.mineWake.ranksPerExtraMine)
        + (evolved ? powerupBalance.mineWake.evolvedMineBonus : 0)
    )
    const side = { x: -direction.y, y: direction.x }
    for (let i = 0; i < count; i += 1) {
      if (this.bullets.length > MAX_BULLETS) this.bullets.shift()
      const offset = i - (count - 1) / 2
      this.bullets.push({
        x: this.player.x - direction.x * (powerupBalance.mineWake.backOffsetBase + i * powerupBalance.mineWake.backOffsetStep) + side.x * offset * powerupBalance.mineWake.sideOffsetStep,
        y: this.player.y - direction.y * (powerupBalance.mineWake.backOffsetBase + i * powerupBalance.mineWake.backOffsetStep) + side.y * offset * powerupBalance.mineWake.sideOffsetStep,
        vx: -direction.x * powerupBalance.mineWake.driftSpeed,
        vy: -direction.y * powerupBalance.mineWake.driftSpeed,
        life: powerupBalance.mineWake.lifeBase + level * powerupBalance.mineWake.lifePerRank + (evolved ? powerupBalance.mineWake.evolvedLifeBonus : 0),
        damage: powerupBalance.mineWake.damageBase + level * powerupBalance.mineWake.damagePerRank + this.limitBreaks.might * powerupBalance.mineWake.limitMightDamagePerRank,
        radius: evolved ? powerupBalance.mineWake.evolvedRadius : powerupBalance.mineWake.radius,
        color: evolved ? '#fff27a' : '#70a8ff',
        pierce: evolved ? powerupBalance.mineWake.evolvedPierce : powerupBalance.mineWake.pierce,
        mine: true
      })
    }
  }

  private emitDashWake(direction: Vec, intensity = 1) {
    if (this.isHighLoad() && intensity < 1) return
    if (intensity < 1 && Math.random() > intensity) return

    const engine = this.build.engine
    const phase = this.build.phase
    const color = phase >= 2 ? '#b990ff' : engine >= 4 ? '#fff27a' : '#70a8ff'
    const accent = phase > 0 ? '#d7fff7' : '#57fff3'
    const side = { x: -direction.y, y: direction.x }
    const count = Math.max(2, Math.floor((3 + engine + phase * 1.4) * intensity))
    const backDistance = 20 + engine * 4

    if (intensity >= 1 && this.shockwaves.length < MAX_SHOCKWAVES) {
      this.shockwaves.push({
        x: this.player.x - direction.x * 12,
        y: this.player.y - direction.y * 12,
        radius: 12 + engine * 3 + phase * 4,
        speed: 360 + engine * 34 + phase * 28,
        life: 0.32 + engine * 0.025,
        maxLife: 0.32 + engine * 0.025,
        color,
        jag: rand(0, TAU)
      })
    }

    for (let i = 0; i < count; i += 1) {
      if (this.particles.length >= MAX_PARTICLES) this.particles.shift()
      const lane = (i - (count - 1) / 2) * (4 + engine * 0.7)
      const jitter = rand(-7, 7)
      const speed = rand(90 + engine * 10, 210 + engine * 28 + phase * 18)
      const life = rand(0.22, 0.46 + engine * 0.035)
      this.particles.push({
        x: this.player.x - direction.x * (backDistance + rand(0, 22)) + side.x * (lane + jitter),
        y: this.player.y - direction.y * (backDistance + rand(0, 22)) + side.y * (lane + jitter),
        vx: -direction.x * speed + side.x * rand(-36, 36),
        vy: -direction.y * speed + side.y * rand(-36, 36),
        life,
        maxLife: life,
        color: i % 3 === 0 ? accent : color,
        size: rand(2.4, 5.6 + engine * 0.45),
        angle: Math.atan2(direction.y, direction.x),
        spin: rand(-4, 4),
        sides: phase >= 2 && i % 4 === 0 ? 4 : undefined,
        length: rand(28 + engine * 7, 58 + engine * 14 + phase * 8),
        glow: this.allowGlow() ? 32 : 16
      })
    }
  }

  private optionOrbAngle(index: number, count: number) {
    return this.stats.time * (2.4 + count * 0.18) + (index / count) * TAU
  }

  private optionOrbWorldPosition(index: number, count: number, radius: number) {
    const a = this.optionOrbAngle(index, count)
    return {
      x: this.player.x + Math.cos(a) * radius,
      y: this.player.y + Math.sin(a) * radius,
      angle: a
    }
  }

  private fireOptionOrbs(serial: number, damage: number, speed: number) {
    const evolved = this.evolved.has('orbit')
    const profile = optionOrbProfile({ orbitRank: this.build.orbit, fireSerial: serial, evolved })
    if (!profile.fires || profile.count <= 0) return

    const radius = powerupBalance.orbit.radiusBase + this.build.orbit * powerupBalance.orbit.radiusPerRank
    const boltSpeed = speed * powerupBalance.orbit.boltSpeedMultiplier
    const boltLife = spaceProjectileLifeForOffscreenTravel(
      powerupBalance.weapon.pulseBaseLife * powerupBalance.orbit.boltLifeMultiplier,
      boltSpeed,
      this.width,
      this.height,
      this.spaceScale()
    )
    const color = evolved ? '#fff27a' : '#8fff7d'
    for (let i = 0; i < profile.count; i += 1) {
      if (this.bullets.length > MAX_BULLETS) this.bullets.shift()
      const orb = this.optionOrbWorldPosition(i, profile.count, radius)
      const lace = profile.count > 1 ? (i - (profile.count - 1) / 2) * 0.025 : 0
      const a = this.player.aimAngle + lace
      this.bullets.push({
        x: orb.x + Math.cos(a) * 10,
        y: orb.y + Math.sin(a) * 10,
        vx: Math.cos(a) * boltSpeed + this.player.vx * 0.1,
        vy: Math.sin(a) * boltSpeed + this.player.vy * 0.1,
        life: boltLife,
        damage: damage * profile.damageMultiplier,
        radius: evolved ? 3.4 : 2.8,
        color,
        pierce: profile.pierce,
        chain: this.evolved.has('chain') ? 1 : 0,
        option: true
      })
    }
  }

  private fireRearGun(damage: number, speed: number) {
    const profile = rearGunProfile(this.build.rear)
    if (profile.shots <= 0) return

    const rearSpeed = speed * profile.speedMultiplier
    for (let i = 0; i < profile.shots; i += 1) {
      if (this.bullets.length > MAX_BULLETS) this.bullets.shift()
      const offset = profile.shots === 1 ? 0 : (i - (profile.shots - 1) / 2) * profile.spread
      const a = this.player.aimAngle + Math.PI + offset
      const vx = Math.cos(a) * rearSpeed + this.player.vx * 0.1
      const vy = Math.sin(a) * rearSpeed + this.player.vy * 0.1
      const bulletSpeed = Math.hypot(vx, vy)
      this.bullets.push({
        x: this.player.x + Math.cos(a) * 21,
        y: this.player.y + Math.sin(a) * 21,
        vx,
        vy,
        life: spaceProjectileLifeForOffscreenTravel(
          powerupBalance.weapon.pulseBaseLife * powerupBalance.rearGun.lifeMultiplier,
          bulletSpeed,
          this.width,
          this.height,
          this.spaceScale()
        ),
        damage: damage * profile.damageMultiplier,
        radius: 3.2,
        color: '#ff9d5c',
        pierce: profile.pierce,
        rail: false,
        chain: 0
      })
    }
  }

  private fire() {
    if (this.bullets.length > MAX_BULLETS) this.bullets.splice(0, this.bullets.length - MAX_BULLETS)
    const rapid = this.build.rapid
    const choir = this.evolved.has('rapid')
    const shatter = this.evolved.has('split')
    const solar = this.evolved.has('rail')
    const resonance = this.evolved.has('echo')
    const storm = this.evolved.has('chain')
    const blackNeedle = this.evolved.has('rift')
    const glassRisk = this.relics.has('glassReactor') ? 1.12 : 1
    this.player.fireCd = clamp(
      (
        powerupBalance.weapon.baseFireCooldown
        - rapid * powerupBalance.weapon.rapidCooldownPerRank
        - this.build.heat * powerupBalance.weapon.heatCooldownPerRank
        - this.limitBreaks.cooldown * powerupBalance.weapon.limitCooldownPerRank
      ) * (choir ? powerupBalance.weapon.choirCooldownMultiplier : 1),
      powerupBalance.weapon.minFireCooldown,
      powerupBalance.weapon.baseFireCooldown
    )
    const damage = (
      powerupBalance.weapon.baseDamage
      + this.stats.level * powerupBalance.weapon.damagePerLevel
      + this.build.rail * powerupBalance.weapon.railDamagePerRank
      + this.build.rift * powerupBalance.weapon.riftDamagePerRank
      + this.limitBreaks.might * powerupBalance.weapon.limitMightDamagePerRank
    ) * glassRisk
    const speed = powerupBalance.weapon.baseProjectileSpeed
      + this.build.echo * powerupBalance.weapon.echoProjectileSpeedPerRank
      + this.build.heat * powerupBalance.weapon.heatProjectileSpeedPerRank
      + this.limitBreaks.speed * powerupBalance.weapon.limitSpeedProjectileSpeedPerRank
    const count = 1 + this.build.split + (shatter ? powerupBalance.weapon.shatterExtraRays : 0) + Math.floor(this.limitBreaks.amount / powerupBalance.weapon.limitAmountRanksPerExtraRay)
    const spread = count === 1 ? 0 : clamp(
      powerupBalance.weapon.spreadBase + count * powerupBalance.weapon.spreadPerRay,
      powerupBalance.weapon.spreadBase,
      powerupBalance.weapon.spreadMax
    )
    const serial = this.fireSerial
    const railInterval = Math.max((solar ? powerupBalance.weapon.solarRailBaseInterval : powerupBalance.weapon.railBaseInterval) - this.build.rail, powerupBalance.weapon.railMinimumInterval)
    const needleInterval = Math.max((blackNeedle ? powerupBalance.weapon.blackNeedleBaseInterval : powerupBalance.weapon.needleBaseInterval) - this.build.rift, powerupBalance.weapon.needleMinimumInterval)
    const rail = this.build.rail > 0 && serial % railInterval === 0
    const needle = this.build.rift > 0 && serial % needleInterval === 0
    const volleys = pulseVolleyCount({ rapidRank: rapid, fireSerial: serial, evolved: choir })
    const cadenceDouble = volleys > 1 && !choir
    const pulseColor = storm ? '#8fff7d' : choir ? '#f6fffe' : cadenceDouble ? '#d7fff7' : this.build.heat >= 3 ? '#ff9d5c' : this.build.pierce >= 3 ? '#70a8ff' : '#57fff3'
    this.fireSerial += 1
    for (let v = 0; v < volleys; v += 1) {
      for (let i = 0; i < count; i += 1) {
        const offset = (count === 1 ? 0 : (i - (count - 1) / 2) * spread) + (volleys === 1 ? 0 : (v - 0.5) * powerupBalance.weapon.volleyOffset)
        const a = this.player.aimAngle + offset
        const bulletSpeed = Math.hypot(Math.cos(a) * speed + this.player.vx * 0.14, Math.sin(a) * speed + this.player.vy * 0.14)
        const bulletLife = rail
          ? spaceProjectileLifeForOffscreenTravel(
            powerupBalance.weapon.railBaseLife + (solar ? powerupBalance.weapon.solarRailLifeBonus : 0),
            bulletSpeed,
            this.width,
            this.height,
            this.spaceScale()
          )
          : spaceProjectileLifeForOffscreenTravel(
            powerupBalance.weapon.pulseBaseLife + this.build.echo * powerupBalance.weapon.echoLifePerRank + (resonance ? powerupBalance.weapon.resonanceLifeBonus : 0),
            bulletSpeed,
            this.width,
            this.height,
            this.spaceScale()
          )
        this.bullets.push({
          x: this.player.x + Math.cos(a) * 22,
          y: this.player.y + Math.sin(a) * 22,
          vx: Math.cos(a) * speed + this.player.vx * 0.14,
          vy: Math.sin(a) * speed + this.player.vy * 0.14,
          life: bulletLife,
          damage: rail
            ? damage * (solar ? powerupBalance.weapon.solarRailDamageMultiplier : powerupBalance.weapon.railDamageMultiplier)
            : damage * (shatter && i !== Math.floor(count / 2) ? powerupBalance.weapon.shatterSideRayDamageMultiplier : 1),
          radius: rail ? (solar ? 7 : 5) : 3.5,
          color: rail ? '#fff27a' : needle ? '#b990ff' : pulseColor,
          pierce: rail
            ? powerupBalance.weapon.railPierceBase + this.build.pierce + (solar ? powerupBalance.weapon.solarRailPierceBonus : 0)
            : this.build.pierce + (resonance ? powerupBalance.weapon.resonancePierceBonus : 0),
          rail,
          chain: this.build.chain + (storm ? powerupBalance.weapon.stormChainBonus : 0)
        })
      }
    }
    if (needle) {
      const a = this.player.aimAngle
      this.bullets.push({
        x: this.player.x + Math.cos(a) * 24,
        y: this.player.y + Math.sin(a) * 24,
        vx: Math.cos(a) * (speed * powerupBalance.weapon.needleSpeedMultiplier),
        vy: Math.sin(a) * (speed * powerupBalance.weapon.needleSpeedMultiplier),
        life: spaceProjectileLifeForOffscreenTravel(
          powerupBalance.weapon.needleLife,
          speed * powerupBalance.weapon.needleSpeedMultiplier,
          this.width,
          this.height,
          this.spaceScale()
        ),
        damage: damage * (blackNeedle ? powerupBalance.weapon.blackNeedleDamageMultiplier : powerupBalance.weapon.needleDamageMultiplier),
        radius: blackNeedle ? powerupBalance.weapon.blackNeedleRadius : powerupBalance.weapon.needleRadius,
        color: blackNeedle ? '#ffffff' : '#b990ff',
        pierce: powerupBalance.weapon.needlePierceBase + this.build.rift + (blackNeedle ? powerupBalance.weapon.blackNeedlePierceBonus : 0),
        rail: true,
        chain: storm ? powerupBalance.weapon.stormNeedleChainBonus : 0
      })
    }
    this.fireOptionOrbs(serial, damage, speed)
    this.fireRearGun(damage, speed)
    this.audio.fire(this.weaponSoundKind(rail, needle, count), this.stats.level + rapid)
  }

  private weaponSoundKind(rail: boolean, needle: boolean, count: number): WeaponSoundKind {
    if (needle) return 'needle'
    if (rail) return 'rail'
    if (count > 1 || this.build.split > 0) return 'prism'
    return 'pulse'
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
          this.damageSpaceHazard(hazard, b.damage, b.color)
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
          if (b.chain && b.chain > 0) this.spawnChainBolt(b, e)
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

  private damageSpaceHazard(hazard: SpaceHazardAsteroid, amount: number, color: string) {
    const previousRadius = hazard.radius
    hazard.radius -= amount * 0.72
    hazard.vx += rand(-18, 18)
    hazard.vy += rand(-18, 18)
    this.burst(hazard.x, hazard.y, color, previousRadius > 42 ? 8 : 4, previousRadius > 42 ? 145 : 90)
    if (hazard.radius > 22) return

    const index = this.spaceHazards.indexOf(hazard)
    if (index >= 0) this.spaceHazards.splice(index, 1)
    this.stats.score += Math.max(2, Math.round(previousRadius / 12))
    if (previousRadius <= 46 || this.spaceHazards.length > 70) return

    for (let split = 0; split < 2; split += 1) {
      const a = Math.random() * TAU
      const speed = rand(70, 135)
      this.spaceHazards.push({
        x: hazard.x + Math.cos(a) * previousRadius * 0.32,
        y: hazard.y + Math.sin(a) * previousRadius * 0.32,
        vx: hazard.vx * 0.55 + Math.cos(a) * speed,
        vy: hazard.vy * 0.55 + Math.sin(a) * speed,
        radius: previousRadius * 0.44,
        spin: rand(-2.2, 2.2),
        life: Math.max(9, hazard.life * 0.72),
        phase: Math.random() * TAU,
        hitCooldown: 0,
        damageMultiplier: hazard.damageMultiplier
      })
    }
  }

  private spawnChainBolt(source: Bullet, hit: Enemy) {
    if (this.bullets.length > MAX_BULLETS - 4) return
    let best: Enemy | null = null
    let bestD = (powerupBalance.chain.rangeBase + this.build.chain * powerupBalance.chain.rangePerRank) ** 2
    for (const enemy of this.enemies) {
      if (enemy === hit || enemy.hp <= 0) continue
      const d = (enemy.x - hit.x) ** 2 + (enemy.y - hit.y) ** 2
      if (d < bestD) {
        bestD = d
        best = enemy
      }
    }
    if (!best) return
    const aim = norm(best.x - hit.x, best.y - hit.y)
    this.bullets.push({
      x: hit.x,
      y: hit.y,
      vx: aim.x * 960,
      vy: aim.y * 960,
      life: 0.16,
      damage: source.damage * (this.evolved.has('chain') ? 0.58 : 0.42),
      radius: 4,
      color: '#fff27a',
      pierce: 0,
      rail: true,
      chain: source.chain ? source.chain - 1 : 0
    })
  }

  private rebuildEnemyGrid() {
    this.enemyGrid.clear()
    for (const enemy of this.enemies) {
      if (enemy.hp <= 0) continue
      const key = this.gridKey(enemy.x, enemy.y)
      let bucket = this.enemyGrid.get(key)
      if (!bucket) {
        bucket = []
        this.enemyGrid.set(key, bucket)
      }
      bucket.push(enemy)
    }
  }

  private gridKey(x: number, y: number) {
    return Math.floor(x / GRID_CELL) * GRID_STRIDE + Math.floor(y / GRID_CELL)
  }

  private getNearbyEnemies(x: number, y: number) {
    const cx = Math.floor(x / GRID_CELL)
    const cy = Math.floor(y / GRID_CELL)
    const result = this.nearbyEnemyScratch
    result.length = 0
    for (let gx = cx - 1; gx <= cx + 1; gx += 1) {
      for (let gy = cy - 1; gy <= cy + 1; gy += 1) {
        const bucket = this.enemyGrid.get(gx * GRID_STRIDE + gy)
        if (bucket) result.push(...bucket)
      }
    }
    return result
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
        if (this.tryDashRam(e)) continue
        this.damagePlayer(enemyBalance.contactDamage)
        if (e.kind === 'brute' || e.kind === 'bulwark' || isGiantEnemyKind(e.kind)) {
          e.vx -= toP.x * behavior.global.contactKnockback
          e.vy -= toP.y * behavior.global.contactKnockback
        } else if (e.kind !== 'warden') this.killEnemy(e, false)
      }
    }
  }

  private updatePickups(dt: number) {
    const magnetInput = {
      magnetLevel: this.build.magnet,
      limitMagnet: this.limitBreaks.magnet,
      hasHungryCompass: this.relics.has('hungryCompass')
    }
    for (let i = this.pickups.length - 1; i >= 0; i -= 1) {
      const p = this.pickups[i]
      p.life -= dt
      const d = Math.sqrt(dist2(p, this.player))
      const magnet = pickupMagnetRange(p.kind, magnetInput)
      if (d < magnet || p.kind === 'magnet') {
        const pull = norm(this.player.x - p.x, this.player.y - p.y)
        const strength = pickupMagnetStrength(p.kind)
        p.vx += pull.x * strength * dt
        p.vy += pull.y * strength * dt
      }
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= Math.pow(0.08, dt)
      p.vy *= Math.pow(0.08, dt)
      const rr = p.radius + this.player.radius + 6
      if (d < rr || p.life <= 0) {
        if (d < rr) this.collect(p)
        this.pickups.splice(i, 1)
      }
    }
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
  }

  private tryDashRam(e: Enemy) {
    if (this.player.dashTime <= 0 || this.build.phase <= 0) return false
    const force = powerupBalance.dash.ramForceBase + this.build.phase * powerupBalance.dash.ramForcePerPhaseRank
    const damage = powerupBalance.dash.ramDamageBase
      + this.build.phase * powerupBalance.dash.ramDamagePerPhaseRank
      + this.build.engine * powerupBalance.dash.ramDamagePerEngineRank
    e.hp -= damage
    e.flash = Math.max(e.flash, introHookConfig.hitFlash.dashRamDurationSeconds)
    e.vx += this.player.dashX * force
    e.vy += this.player.dashY * force
    this.burst(e.x, e.y, '#b990ff', 5 + this.build.phase, 130 + this.build.phase * 20)
    if (e.hp <= 0) this.killEnemy(e, true)
    return true
  }

  private emitEnemyTrail(e: Enemy, color: string, intensity = 1) {
    if (this.isHighLoad() || this.particles.length >= MAX_PARTICLES) return
    const speed = Math.hypot(e.vx, e.vy)
    if (speed < 85 || Math.random() > 0.42 * intensity) return
    const back = norm(-e.vx, -e.vy)
    const side = { x: -back.y, y: back.x }
    const spread = isGiantEnemyKind(e.kind) ? 24 : e.kind === 'bulwark' ? 18 : e.kind === 'skimmer' || e.kind === 'helix' ? 13 : 8
    const life = isGiantEnemyKind(e.kind) ? 0.62 : e.kind === 'shard' ? 0.28 : e.kind === 'razor' ? 0.34 : 0.46
    this.particles.push({
      x: e.x + back.x * e.radius * 0.75 + side.x * rand(-spread, spread),
      y: e.y + back.y * e.radius * 0.75 + side.y * rand(-spread, spread),
      vx: back.x * rand(30, 90) + side.x * rand(-24, 24),
      vy: back.y * rand(30, 90) + side.y * rand(-24, 24),
      life,
      maxLife: life,
      color,
      size: isGiantEnemyKind(e.kind) ? rand(4, 9) : e.kind === 'bulwark' ? rand(3, 7) : rand(2, 5),
      angle: Math.atan2(e.vy, e.vx),
      spin: rand(-2, 2),
      sides: isGiantEnemyKind(e.kind) || e.kind === 'bulwark' ? 4 : undefined,
      length: isGiantEnemyKind(e.kind) ? rand(44, 84) : e.kind === 'shard' ? rand(42, 76) : e.kind === 'razor' ? rand(34, 68) : rand(20, 44),
      glow: this.allowGlow() ? 28 : 14
    })
  }

  private fireSiphonVortex(e: Enemy, enemyBalance: ReturnType<typeof balancedSpaceEnemyDefinition>) {
    const tuned = spaceEnemyBehavior.siphon
    e.cd = enemyAttackCooldown(enemyBalance, this.stats.time)
    const speed = enemyBalance.projectileSpeed ?? 0
    const damage = enemyBalance.projectileDamage ?? 0
    for (let arm = 0; arm < tuned.vortexArms; arm += 1) {
      for (let k = 0; k < tuned.vortexShotsPerArm; k += 1) {
        const a = e.phase * tuned.swirlFrequency + arm * Math.PI + k * tuned.vortexAngleStep
        const laneSpeed = speed * (tuned.vortexSpeedBase + k * tuned.vortexSpeedStep)
        this.bullets.push({
          x: e.x + Math.cos(a) * e.radius * 0.92,
          y: e.y + Math.sin(a) * e.radius * 0.92,
          vx: Math.cos(a) * laneSpeed,
          vy: Math.sin(a) * laneSpeed,
          life: tuned.vortexProjectileLife,
          damage,
          radius: tuned.vortexProjectileRadius,
          color: k % 2 ? '#8fff7d' : '#57fff3',
          pierce: 0,
          hostile: true
        })
      }
    }
    this.burst(e.x, e.y, '#8fff7d', 14, 180)
  }

  private fireHelixSpikes(e: Enemy, enemyBalance: ReturnType<typeof balancedSpaceEnemyDefinition>, toP: Vec) {
    const tuned = spaceEnemyBehavior.helix
    e.cd = enemyAttackCooldown(enemyBalance, this.stats.time)
    const speed = enemyBalance.projectileSpeed ?? 0
    const damage = enemyBalance.projectileDamage ?? 0
    const baseAngle = Math.atan2(toP.y, toP.x)
    for (let pair = 0; pair < tuned.shotPairs; pair += 1) {
      const offset = (pair + 1) * tuned.shotAngleStep
      for (const sign of [-1, 1]) {
        const a = baseAngle + sign * offset + Math.sin(e.phase * tuned.corkscrewFrequency) * 0.08
        this.bullets.push({
          x: e.x + Math.cos(a) * e.radius,
          y: e.y + Math.sin(a) * e.radius,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: tuned.projectileLife,
          damage,
          radius: tuned.projectileRadius,
          color: sign > 0 ? '#7df7ff' : '#a6ff4d',
          pierce: 0,
          hostile: true
        })
      }
    }
    this.burst(e.x, e.y, '#7df7ff', 7, 125)
  }

  private firePrismFan(e: Enemy, enemyBalance: ReturnType<typeof balancedSpaceEnemyDefinition>, toP: Vec) {
    const tuned = spaceEnemyBehavior.prism
    e.cd = enemyAttackCooldown(enemyBalance, this.stats.time)
    const speed = enemyBalance.projectileSpeed ?? 0
    const damage = enemyBalance.projectileDamage ?? 0
    const baseAngle = Math.atan2(toP.y, toP.x)
    const center = (tuned.beamCount - 1) / 2
    for (let shot = 0; shot < tuned.beamCount; shot += 1) {
      const offset = (shot - center) * tuned.beamSpreadRadians
      const a = baseAngle + offset
      this.bullets.push({
        x: e.x + Math.cos(a) * e.radius * 0.9,
        y: e.y + Math.sin(a) * e.radius * 0.9,
        vx: Math.cos(a) * speed * (1 - Math.abs(offset) * 0.18),
        vy: Math.sin(a) * speed * (1 - Math.abs(offset) * 0.18),
        life: tuned.projectileLife,
        damage,
        radius: tuned.projectileRadius,
        color: shot % 2 ? '#ff8cf0' : '#fff27a',
        pierce: 0,
        hostile: true
      })
    }
    this.burst(e.x, e.y, '#ff8cf0', 9, 150)
  }

  private fireDreadnoughtBroadside(e: Enemy, enemyBalance: ReturnType<typeof balancedSpaceEnemyDefinition>, toP: Vec) {
    const tuned = spaceEnemyBehavior.dreadnought
    e.cd = enemyBalance.attackCooldownSeconds ?? 0
    const speed = enemyBalance.projectileSpeed ?? 0
    const damage = enemyBalance.projectileDamage ?? 0
    const baseAngle = Math.atan2(toP.y, toP.x)
    for (let shot = -3; shot <= 3; shot += 1) {
      const a = baseAngle + shot * tuned.broadsideSpreadRadians
      const sideFalloff = 1 - Math.abs(shot) * tuned.broadsideSideSpeedLoss
      this.bullets.push({
        x: e.x + Math.cos(a) * e.radius,
        y: e.y + Math.sin(a) * e.radius,
        vx: Math.cos(a) * speed * sideFalloff,
        vy: Math.sin(a) * speed * sideFalloff,
        life: tuned.broadsideLife,
        damage,
        radius: shot === 0 ? tuned.broadsideCenterRadius : tuned.broadsideSideRadius,
        color: shot === 0 ? '#fff27a' : '#ff5d73',
        pierce: 0,
        hostile: true
      })
    }
    for (const offset of tuned.rearOffsets) {
      const a = baseAngle + Math.PI + offset
      this.bullets.push({
        x: e.x + Math.cos(a) * e.radius * 0.75,
        y: e.y + Math.sin(a) * e.radius * 0.75,
        vx: Math.cos(a) * speed * tuned.rearSpeedMultiplier,
        vy: Math.sin(a) * speed * tuned.rearSpeedMultiplier,
        life: tuned.rearLife,
        damage: damage * tuned.rearDamageMultiplier,
        radius: tuned.rearRadius,
        color: '#b990ff',
        pierce: 0,
        hostile: true
      })
    }
    this.camera.shake = Math.max(this.camera.shake, 5)
    this.burst(e.x, e.y, '#ff5d73', 16, 210)
  }

  private fireCathedralLattice(e: Enemy, enemyBalance: ReturnType<typeof balancedSpaceEnemyDefinition>, toP: Vec) {
    const tuned = spaceEnemyBehavior.cathedral
    e.cd = enemyBalance.attackCooldownSeconds ?? 0
    const speed = enemyBalance.projectileSpeed ?? 0
    const damage = enemyBalance.projectileDamage ?? 0
    for (let ring = 0; ring < tuned.latticeRings; ring += 1) {
      for (let k = 0; k < tuned.latticeShotsPerRing; k += 1) {
        const a = e.phase * (ring % 2 ? -tuned.latticeSpinScale : tuned.latticeSpinScale) + (k / tuned.latticeShotsPerRing) * TAU + ring * tuned.latticeRingAngleStep
        const outerRing = ring === tuned.latticeRings - 1
        this.bullets.push({
          x: e.x + Math.cos(a) * e.radius * (tuned.latticeSpawnRadiusBase + ring * tuned.latticeSpawnRadiusStep),
          y: e.y + Math.sin(a) * e.radius * (tuned.latticeSpawnRadiusBase + ring * tuned.latticeSpawnRadiusStep),
          vx: Math.cos(a) * speed * (tuned.latticeSpeedBase + ring * tuned.latticeSpeedStep),
          vy: Math.sin(a) * speed * (tuned.latticeSpeedBase + ring * tuned.latticeSpeedStep),
          life: tuned.latticeLife,
          damage: damage * (outerRing ? tuned.latticeOuterDamageMultiplier : tuned.latticeInnerDamageMultiplier),
          radius: outerRing ? tuned.latticeOuterRadius : tuned.latticeInnerRadius,
          color: ring === 1 ? '#b990ff' : '#d7fff7',
          pierce: 0,
          hostile: true
        })
      }
    }
    const aim = Math.atan2(toP.y, toP.x)
    for (const offset of tuned.aimedOffsets) {
      const a = aim + offset
      this.bullets.push({
        x: e.x + Math.cos(a) * e.radius,
        y: e.y + Math.sin(a) * e.radius,
        vx: Math.cos(a) * speed * tuned.aimedSpeedMultiplier,
        vy: Math.sin(a) * speed * tuned.aimedSpeedMultiplier,
        life: tuned.aimedLife,
        damage: damage * tuned.aimedDamageMultiplier,
        radius: tuned.aimedRadius,
        color: '#fff27a',
        pierce: 0,
        hostile: true
      })
    }
    this.camera.shake = Math.max(this.camera.shake, 4)
    this.burst(e.x, e.y, '#d7fff7', 18, 190)
  }

  private updateOrbitals(dt: number) {
    const gravity = this.evolved.has('orbit')
    const profile = optionOrbProfile({ orbitRank: this.build.orbit, fireSerial: this.fireSerial, evolved: gravity })
    const count = profile.count
    if (count <= 0) return
    const radius = powerupBalance.orbit.radiusBase + this.build.orbit * powerupBalance.orbit.radiusPerRank
    const damage = (
      powerupBalance.orbit.damageBase
      + this.build.orbit * powerupBalance.orbit.damagePerRank
      + this.limitBreaks.might * powerupBalance.orbit.limitMightDamagePerRank
    ) * (gravity ? powerupBalance.orbit.gravityDamageMultiplier : 1) * dt
    for (const e of this.enemies) {
      if (gravity && (e.x - this.player.x) ** 2 + (e.y - this.player.y) ** 2 < (radius + powerupBalance.orbit.gravityPullRadiusBonus) ** 2) {
        const pull = norm(this.player.x - e.x, this.player.y - e.y)
        e.vx += pull.x * powerupBalance.orbit.gravityPullForce * dt
        e.vy += pull.y * powerupBalance.orbit.gravityPullForce * dt
      }
      for (let i = 0; i < count; i += 1) {
        const orb = this.optionOrbWorldPosition(i, count, radius)
        const rr = e.radius + 12
        if ((e.x - orb.x) ** 2 + (e.y - orb.y) ** 2 < rr * rr) this.damageEnemy(e, damage, gravity ? '#fff27a' : '#8fff7d')
      }
    }
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
      const id = `${this.sectorMap.currentNodeId}:${wave.label}:${wave.atSeconds}`
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
    const scale = spaceEnemyRunScale(this.stats.time, this.stats.planets)
    const base = balancedSpaceEnemyDefinition(kind)
    this.recordEnemyDiscovery(`enemy:space:${kind}`, `${this.enemyDisplayName(kind)} Vector`, `Encountered in open space after ${formatTime(this.stats.time)}.`, 'Space horde telemetry', base.color)
    this.enemies.push({
      id: this.enemyId++,
      kind,
      x,
      y,
      vx: 0,
      vy: 0,
      hp: base.hp * scale,
      maxHp: base.hp * scale,
      radius: base.radius,
      speed: base.speed + spaceEnemySpeedBonus(this.stats.time),
      value: Math.floor(base.value * scale),
      phase: Math.random() * TAU,
      cd: Math.random() * spaceEnemyBehavior.global.initialCooldownRandomSeconds,
      color: base.color,
      flash: 0
    })
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
    e.flash = introHookConfig.hitFlash.durationSeconds
    if (!this.isHighLoad() && this.particles.length < MAX_PARTICLES && Math.random() < 0.2) {
      this.particles.push({ x: e.x, y: e.y, vx: rand(-80, 80), vy: rand(-80, 80), life: 0.22, maxLife: 0.22, color, size: 2, glow: 10 })
    }
    if (e.hp <= 0) this.killEnemy(e, true)
  }

  private killEnemy(e: Enemy, reward: boolean) {
    this.removeEnemy(e)
    const big = e.kind === 'warden' || e.kind === 'brute' || e.kind === 'bulwark' || isGiantEnemyKind(e.kind)
    const highLoad = this.isHighLoad()
    if (big || !highLoad || this.collisionFxCooldown <= 0) {
      this.audio.boom(big ? 'heavy' : 'small')
      this.camera.shake = Math.max(this.camera.shake, big ? 16 : highLoad ? 2 : 5)
      this.burst(e.x, e.y, e.color, big ? 42 : highLoad ? 4 : 12, big ? 330 : highLoad ? 120 : 150)
      this.collisionFxCooldown = highLoad ? 0.04 : 0
    }
    if (reward) {
      if (this.scorePopups.length >= introHookConfig.popup.cap) this.scorePopups.shift()
      this.scorePopups.push({
        x: e.x,
        y: e.y,
        vy: -introHookConfig.popup.riseSpeed,
        life: introHookConfig.popup.lifeSeconds,
        totalLife: introHookConfig.popup.lifeSeconds,
        text: `+${Math.round(e.value)}`
      })
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
    const a = Math.random() * TAU
    return {
      id: this.enemyId++,
      kind: 'chaser',
      x: x + Math.cos(a) * spaceEnemyBehavior.splitChild.spawnOffset,
      y: y + Math.sin(a) * spaceEnemyBehavior.splitChild.spawnOffset,
      vx: Math.cos(a) * spaceEnemyBehavior.splitChild.launchSpeed,
      vy: Math.sin(a) * spaceEnemyBehavior.splitChild.launchSpeed,
      hp: spaceEnemyBehavior.splitChild.hpBase + this.stats.time / spaceEnemyBehavior.splitChild.hpTimeDivisor,
      maxHp: spaceEnemyBehavior.splitChild.hpBase + this.stats.time / spaceEnemyBehavior.splitChild.hpTimeDivisor,
      radius: spaceEnemyBehavior.splitChild.radius,
      speed: spaceEnemyBehavior.splitChild.speed,
      value: spaceEnemyBehavior.splitChild.value,
      phase: Math.random() * TAU,
      cd: 0,
      color: '#70a8ff',
      flash: 0
    }
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
    if (this.player.shield > 0) {
      const used = Math.min(this.player.shield, remaining)
      this.player.shield -= used
      remaining -= used
    }
    this.player.hull -= remaining
    this.audio.hit()
    this.camera.shake = Math.max(this.camera.shake, 12)
    this.burst(this.player.x, this.player.y, '#ff5d73', 16, 210)
  }

  private damageSurfacePilot(amount: number) {
    if (!this.surface || this.surface.pilot.invuln > 0) return
    const pilot = this.surface.pilot
    pilot.invuln = 0.65
    pilot.health = Math.max(0, pilot.health - Math.max(1, amount * (1 - this.build.phase * powerupBalance.upgradeApply.phaseSurfaceDamageReductionPerRank)))
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
      this.stats.xp += p.value
      this.stats.score += p.value
      while (this.stats.xp >= this.stats.nextXp) {
        this.stats.xp -= this.stats.nextXp
        this.stats.level += 1
        this.stats.nextXp = nextXpThreshold(this.stats.nextXp)
        this.bankUpgrade('MUTATION SIGNAL BANKED. LAND TO INSTALL IT.')
      }
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
    const choices: WorkbenchChoice[] = []
    const evo = this.availableEvolutions()
    if (evo.length && (rare || Math.random() < workbenchBalance.evolutionChanceBase + this.build.luck * workbenchBalance.evolutionChanceLuckPerRank)) {
      choices.push({ kind: 'evolution', evolution: evo[Math.floor(Math.random() * evo.length)] })
    }
    const relic = this.rollRelicChoice(rare)
    if (relic && choices.length < count) choices.push({ kind: 'relic', relic })
    const discoverySuit = this.discoverySuitOffer
      ? firstOpportunityUpgrade(upgrades, this.build, 'suitO2')
      : null
    if (discoverySuit && choices.length < count) choices.push({ kind: 'upgrade', upgrade: discoverySuit })
    const available = workbenchRollableUpgrades(upgrades, this.build, uiWorkbenchExtraUnlockedIds(this))
      .filter((u) => !choices.some((choice) => choice.kind === 'upgrade' && choice.upgrade.id === u.id))
    while (choices.length < count && available.length) {
      const selected = this.weightedUpgrade(available, rare)
      choices.push({ kind: 'upgrade', upgrade: selected })
      available.splice(available.indexOf(selected), 1)
    }
    while (choices.length < count) choices.push(this.rollLimitBreak())
    return choices
  }

  private weightedUpgrade(pool: Upgrade[], rare: boolean) {
    const benchTier = this.mothership.departments.workbench
    const ownedBias = workbenchBalance.ownedBiasBase
      + this.build.luck * workbenchBalance.ownedBiasLuckPerRank
      + (benchTier >= workbenchBalance.ownedBiasWorkbenchTier ? workbenchBalance.ownedBiasWorkbenchBonus : 0)
    const rareBias = rare ? workbenchBalance.rareUpgradeWeightMultiplier : 1
    const weights = pool.map((upgrade) => {
      const owned = this.build[upgrade.id] > 0
      const weaponFocus = upgrade.category === 'weapon' ? workbenchBalance.weaponFocusWeight : 1
      return Math.max(1, upgrade.rarity * (owned ? ownedBias : 1) * weaponFocus * (upgrade.rarity < workbenchBalance.rareUpgradeRarityThreshold ? rareBias : 1))
    })
    let roll = Math.random() * weights.reduce((sum, weight) => sum + weight, 0)
    for (let i = 0; i < pool.length; i += 1) {
      roll -= weights[i]
      if (roll <= 0) return pool[i]
    }
    return pool[pool.length - 1]
  }

  private rollRelicChoice(rare: boolean): Relic | null {
    const missing = relics.filter((relic) => !this.relics.has(relic.id))
    if (!missing.length) return null
    const chance = (rare ? workbenchBalance.relicChanceRare : workbenchBalance.relicChanceBase)
      + this.build.luck * workbenchBalance.relicChanceLuckPerRank
      + this.build.survey * workbenchBalance.relicChanceSurveyPerRank
    if (Math.random() > chance) return null
    let roll = Math.random() * missing.reduce((sum, relic) => sum + relic.rarity, 0)
    for (const relic of missing) {
      roll -= relic.rarity
      if (roll <= 0) return relic
    }
    return missing[0]
  }

  private rollLimitBreak(): WorkbenchChoice {
    return { kind: 'limit', ...limitBreakChoices[Math.floor(Math.random() * limitBreakChoices.length)] }
  }

  private availableEvolutions() {
    return evolutions.filter((evolution) => this.build[evolution.weapon] >= upgradeMaxRank(evolution.weapon) && this.relics.has(evolution.relic) && !this.evolved.has(evolution.weapon))
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
    if (choice.kind === 'upgrade' && choice.upgrade.bucket === 'spacesuit') this.discoverySuitOffer = false
    this.pendingUpgrades = Math.max(0, this.pendingUpgrades - 1)
    if (this.pendingUpgrades > 0) {
      this.refreshLevelUp('SHIPBOARD WORKBENCH', `${this.pendingUpgrades} mutation signal${this.pendingUpgrades === 1 ? '' : 's'} remain before takeoff.`)
      return
    }
    this.showOnly(null)
    if (this.takeoffAfterWorkbench) {
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
    this.toast(`${upgrade.name.toUpperCase()} ONLINE`)
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
      if (this.build.nav >= powerupBalance.ship.navPlanetLockRank) {
        const target = this.nearestPlanetBeacon()
        if (target) {
          this.autoNavTargetPlanetId = target.id
          this.autoNavActive = true
          this.autoNavHeading = Math.atan2(target.y - this.player.y, target.x - this.player.x)
          this.toast(`NAV GHOST LOCKED: ${target.name}`)
          this.audio.pickup('nav')
          return
        }
      }
      this.toast('NO LANDING SIGNAL IN RANGE')
      return
    }
    this.startLanding(planet)
  }

  private nearestPlanetBeacon() {
    let best: Planet | null = null
    let bestD = Number.POSITIVE_INFINITY
    for (const planet of this.planets) {
      const d = dist2(planet, this.player)
      if (d < bestD) {
        bestD = d
        best = planet
      }
    }
    return best
  }

  private startLanding(planet: Planet) {
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
    const resources: SurfaceResource[] = []
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
    for (let i = 0; i < count; i += 1) {
      const kind = pickSurfaceResourceKind({
        index: i,
        firstVisit: first,
        openingLanding,
        event,
        roll: Math.random()
      })
      const color = kind === 'cache' ? '#fff27a' : kind === 'crystal' ? planet.color : kind === 'scrap' ? '#70a8ff' : '#8fff7d'
      const cluster = this.surfaceSafePoint(this.surfaceEventPoint(event, i, count), kind === 'cache' ? surfaceRunBalance.resource.cacheSafeDistance : surfaceRunBalance.resource.defaultSafeDistance)
      resources.push({
        kind,
        x: cluster.x,
        y: cluster.y,
        radius: kind === 'cache' ? surfaceRunBalance.resource.radius.cache : surfaceRunBalance.resource.radius.default,
        value: surfaceResourceValue(kind, event),
        color,
        collected: false
      })
    }
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
      collected: 0,
      pendingUpgrade: false,
      bankedSignals: 0,
      overflowSignals: 0,
      bossCacheCount: profile.bossCacheCount,
      o2Returning: false,
      message: this.surfaceEventMessage(event, first, scenario)
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
    const row = seed % BOSS_CATALOG_ROWS
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

  private surfaceEventMessage(event: SurfaceEventKind, first: boolean, scenario?: SurfaceScenarioKind) {
    if (scenario === 'lore') return 'QUIET RUINS BELOW. INSPECT THE OLD SIGNALS.'
    if (scenario === 'boss') return 'LARGE BIO-SIGNAL BELOW. KILL IT OR RUN.'
    if (scenario === 'friendly') return 'SINGLE LIFEFORM HAILING YOUR SUIT. APPROACH CAREFULLY.'
    if (scenario === 'mixed') return 'WEIRD SURFACE. CONTACTS AND A RARE SIGNAL SHARE THE SAME GROUND.'
    if (scenario === 'horde') return 'HORDE VAULT BELOW. SURVIVE IT AND THE TREASURE BREAKS OPEN.'
    if (event === 'jackpot') return 'SIGNAL JACKPOT. GRAB EVERYTHING.'
    if (event === 'horde') return 'HORDE VAULT. THE LOOT IS REAL. SO ARE THEY.'
    if (event === 'swarm') return 'BAD PLANET. CONTACTS EVERYWHERE.'
    if (event === 'relic') return 'RELIC SIGNATURES BELOW. CACHE HUNT.'
    if (event === 'repair') return 'QUIET DOCK. PATCH UP AND SCAVENGE.'
    if (event === 'volatile') return 'VOLATILE CACHE FIELD. EXPECT TROUBLE.'
    return first ? 'UNKNOWN SURFACE. MINE THE SIGNAL CACHE.' : 'OLD LANDING SITE. QUICK SALVAGE ONLY.'
  }

  private confirmLanding() {
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
    for (const resource of this.surface.resources) {
      if (resource.collected) continue
      const rr = resource.radius + surfaceRunBalance.resource.collectionBonusRadius
      if ((resource.x - this.surface.pilot.x) ** 2 + (resource.y - this.surface.pilot.y) ** 2 > rr * rr) continue
      resource.collected = true
      this.surface.collected += 1
      this.audio.pickup(resource.kind)
      this.burst(resource.x, resource.y, resource.color, resource.kind === 'cache' ? 22 : 10, resource.kind === 'cache' ? 240 : 140)
      if (resource.kind === 'crystal') {
        const gained = Math.ceil(resource.value * (1 + this.build.cargo * powerupBalance.upgradeApply.cargoResourceBonusPerRank))
        this.resources.crystal += gained
        this.stats.xp += resource.value
        this.stats.score += resource.value * 12
        while (this.stats.xp >= this.stats.nextXp) {
          this.stats.xp -= this.stats.nextXp
          this.stats.level += 1
          this.stats.nextXp = nextXpThreshold(this.stats.nextXp)
          this.bankSurfaceUpgrade()
        }
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
      for (let i = 0; i < ambush.baseCount + Math.floor(this.stats.time / ambush.timeDivisor); i += 1) {
        const point = this.safeSurfaceThreatPoint({
          x: resource.x + rand(-ambush.scatter, ambush.scatter),
          y: resource.y + rand(-ambush.scatter, ambush.scatter)
        }, keepouts, ambush.clearance, rand(0, TAU))
        this.surface.threats.push({
          x: point.x,
          y: point.y,
          vx: 0,
          vy: 0,
          hp: ambush.hpBase + this.stats.time * ambush.hpPerSecond,
          radius: ambush.radius,
          phase: Math.random() * TAU,
          color: '#ff5d73',
          hit: 0,
          behavior: 'chaser'
        })
      }
      this.surface.message = `${cacheMessage} CACHE WAS WIRED.`
    }
  }

  private updateSurfaceThreats(dt: number) {
    if (!this.surface) return
    for (let i = this.surface.threats.length - 1; i >= 0; i -= 1) {
      const threat = this.surface.threats[i]
      threat.phase += dt
      threat.hit -= dt
      const toPilot = norm(this.surface.pilot.x - threat.x, this.surface.pilot.y - threat.y)
      this.steerSurfaceThreat(threat, toPilot, dt)
      threat.vx *= Math.pow(surfaceThreatMotionBalance.frictionBase, dt)
      threat.vy *= Math.pow(surfaceThreatMotionBalance.frictionBase, dt)
      threat.x = clamp(threat.x + threat.vx * dt, surfaceThreatMotionBalance.edgePadding, this.surface.width - surfaceThreatMotionBalance.edgePadding)
      threat.y = clamp(threat.y + threat.vy * dt, surfaceThreatMotionBalance.edgePadding, this.surface.height - surfaceThreatMotionBalance.edgePadding)
      const rr = threat.radius + surfacePilotCollisionRadius()
      if ((threat.x - this.surface.pilot.x) ** 2 + (threat.y - this.surface.pilot.y) ** 2 < rr * rr && this.surface.pilot.invuln <= 0) {
        this.damagePlayer(scaledSurfaceDamage(threat.boss ? surfaceThreatBalance.boss.contactDamage : surfaceThreatBalance.generic.contactDamage))
        this.burst(this.surface.pilot.x, this.surface.pilot.y, '#ff5d73', 10, 160)
      }
      if (threat.hp <= 0) {
        this.burst(threat.x, threat.y, threat.color, threat.boss ? 42 : 24, threat.boss ? 360 : 260)
        this.audio.boom(threat.boss ? 'heavy' : 'surface')
        this.stats.score += threat.boss ? runBalance.scoring.surfaceBossScore : runBalance.scoring.surfaceThreatScore
        if (threat.behavior === 'splitter' && !threat.splitChild) this.spawnSurfaceSplitters(threat)
        if (threat.boss) this.dropSurfaceBossCache(threat)
        this.surface.threats.splice(i, 1)
      }
    }
  }

  private steerSurfaceThreat(threat: SurfaceThreat, toPilot: Vec, dt: number) {
    if (!this.surface) return
    const accel = scaledSurfaceSpeed(threat.boss ? surfaceThreatBalance.boss.acceleration : surfaceThreatBalance.generic.acceleration)
    const maxSpeed = scaledSurfaceSpeed(threat.boss ? surfaceThreatBalance.boss.maxSpeed : surfaceThreatBalance.generic.maxSpeed)
    const behavior = threat.behavior ?? 'chaser'
    if (behavior === 'orbiter') {
      const distance = len(this.surface.pilot.x - threat.x, this.surface.pilot.y - threat.y)
      const radial =
        distance > surfaceThreatMotionBalance.orbit.outerDistance ? surfaceThreatMotionBalance.orbit.pull :
        distance < surfaceThreatMotionBalance.orbit.innerDistance ? surfaceThreatMotionBalance.orbit.repel :
        surfaceThreatMotionBalance.orbit.hold
      threat.vx += (toPilot.x * radial - toPilot.y * surfaceThreatMotionBalance.orbit.tangent) * accel * dt
      threat.vy += (toPilot.y * radial + toPilot.x * surfaceThreatMotionBalance.orbit.tangent) * accel * dt
    } else if (behavior === 'blinker') {
      threat.behaviorCooldown = (threat.behaviorCooldown ?? rand(surfaceThreatMotionBalance.blink.cooldownMin, surfaceThreatMotionBalance.blink.cooldownMax)) - dt
      const distance = len(this.surface.pilot.x - threat.x, this.surface.pilot.y - threat.y)
      if (threat.behaviorCooldown <= 0 && distance > surfaceThreatMotionBalance.blink.minDistance) {
        threat.vx += (toPilot.x * surfaceThreatMotionBalance.blink.dashSpeedScale - toPilot.y * surfaceThreatMotionBalance.blink.sideSpeedScale) * maxSpeed
        threat.vy += (toPilot.y * surfaceThreatMotionBalance.blink.dashSpeedScale + toPilot.x * surfaceThreatMotionBalance.blink.sideSpeedScale) * maxSpeed
        threat.behaviorCooldown = rand(surfaceThreatMotionBalance.blink.cooldownMin, surfaceThreatMotionBalance.blink.cooldownMax)
        this.burst(threat.x, threat.y, threat.color, 8, 120)
      } else {
        threat.vx += toPilot.x * accel * surfaceThreatMotionBalance.blink.driftAccelerationScale * dt
        threat.vy += toPilot.y * accel * surfaceThreatMotionBalance.blink.driftAccelerationScale * dt
      }
    } else {
      threat.vx += toPilot.x * accel * dt
      threat.vy += toPilot.y * accel * dt
    }
    this.limitSurfaceThreatSpeed(threat, maxSpeed)
  }

  private limitSurfaceThreatSpeed(threat: SurfaceThreat, maxSpeed: number) {
    const speed = len(threat.vx, threat.vy)
    if (speed <= maxSpeed) return
    threat.vx = (threat.vx / speed) * maxSpeed
    threat.vy = (threat.vy / speed) * maxSpeed
  }

  private spawnSurfaceSplitters(threat: SurfaceThreat) {
    if (!this.surface) return
    for (let i = 0; i < surfaceThreatMotionBalance.splitter.childCount; i += 1) {
      const angle = (i / surfaceThreatMotionBalance.splitter.childCount) * TAU + threat.phase
      const x = clamp(threat.x + Math.cos(angle) * surfaceThreatMotionBalance.splitter.childScatter, surfaceThreatMotionBalance.edgePadding, this.surface.width - surfaceThreatMotionBalance.edgePadding)
      const y = clamp(threat.y + Math.sin(angle) * surfaceThreatMotionBalance.splitter.childScatter, surfaceThreatMotionBalance.edgePadding, this.surface.height - surfaceThreatMotionBalance.edgePadding)
      const childSpeed = scaledSurfaceSpeed(surfaceThreatBalance.generic.maxSpeed) * surfaceThreatMotionBalance.splitter.childSpeedScale
      this.surface.threats.push({
        x,
        y,
        vx: Math.cos(angle) * childSpeed,
        vy: Math.sin(angle) * childSpeed,
        hp: scaledSurfaceHp(surfaceThreatBalance.generic.swarmBaseHp + this.stats.time * surfaceThreatBalance.generic.swarmHpPerSecond) * surfaceThreatMotionBalance.splitter.childHpScale,
        radius: surfaceThreatBalance.generic.swarmRadius,
        phase: rand(0, TAU),
        color: threat.color,
        hit: 0,
        behavior: 'chaser',
        splitChild: true
      })
    }
  }

  private dropSurfaceBossCache(threat: SurfaceThreat) {
    if (!this.surface) return
    const count = this.surface.bossCacheCount
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * TAU + rand(-0.2, 0.2)
      const bossCache = surfaceRunBalance.bossCache
      const r = rand(bossCache.scatterMin, bossCache.scatterMax)
      const point = this.surfaceSafePoint({ x: threat.x + Math.cos(a) * r, y: threat.y + Math.sin(a) * r }, bossCache.safeDistance)
      this.surface.resources.push({
        kind: i < 2 && this.surface.scenario === 'horde' ? 'cache' : i === 0 ? 'cache' : Math.random() < bossCache.crystalChance ? 'crystal' : 'scrap',
        x: point.x,
        y: point.y,
        radius: i === 0 ? surfaceRunBalance.resource.radius.cache : surfaceRunBalance.resource.radius.default,
        value: bossCacheValue(i, this.surface.scenario, this.stats.level),
        color: i === 0 ? '#fff27a' : i % 2 ? threat.color : '#70a8ff',
        collected: false
      })
    }
    this.surface.message = this.surface.scenario === 'horde' ? 'HORDE VAULT DEFEATED. MASSIVE TREASURE SPILLED.' : 'BOSS SIGNAL BROKE OPEN. RICH CACHE SPILLED.'
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
    for (let i = this.surface.bullets.length - 1; i >= 0; i -= 1) {
      const bullet = this.surface.bullets[i]
      bullet.life -= dt
      bullet.x += bullet.vx * dt
      bullet.y += bullet.vy * dt
      if (bullet.life <= 0 || bullet.x < -20 || bullet.y < -20 || bullet.x > this.surface.width + 20 || bullet.y > this.surface.height + 20) {
        this.surface.bullets.splice(i, 1)
        continue
      }
      for (const threat of this.surface.threats) {
        const rr = threat.radius + bullet.radius
        if ((threat.x - bullet.x) ** 2 + (threat.y - bullet.y) ** 2 > rr * rr) continue
        threat.hp -= bullet.damage
        threat.hit = 0.035
        const push = norm(threat.x - bullet.x, threat.y - bullet.y)
        threat.vx += push.x * 70
        threat.vy += push.y * 70
        this.playBulletImpact(0.85)
        this.surfaceHitSpark(bullet.x, bullet.y, bullet.color)
        this.surface.bullets.splice(i, 1)
        break
      }
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
    let best: SurfaceThreat | null = null
    let bestD = 420 * 420
    for (const threat of this.surface.threats) {
      const d = (threat.x - this.surface.pilot.x) ** 2 + (threat.y - this.surface.pilot.y) ** 2
      if (d < bestD) {
        bestD = d
        best = threat
      }
    }
    return best
  }

  private fireSurfaceGun() {
    if (!this.surface) return
    const target = this.findSurfaceTarget()
    if (!target) return
    const angle = Math.atan2(target.y - this.surface.pilot.y, target.x - this.surface.pilot.x)
    this.surface.pilot.facing = angle
    this.surface.pilot.gunCd = this.surfaceGunCooldown()
    this.audio.fire('surface', 1)
    const muzzleX = this.surface.pilot.x + Math.cos(angle) * surfacePilotMuzzleOffset()
    const muzzleY = this.surface.pilot.y + Math.sin(angle) * surfacePilotMuzzleOffset()
    const speed = this.surfaceGunSpeed()
    this.surface.bullets.push({
      x: muzzleX,
      y: muzzleY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.62,
      radius: 4,
      damage: this.surfaceGunDamage(),
      color: '#fff27a'
    })
    this.burst(muzzleX, muzzleY, '#fff27a', 4, 90)
  }

  private startTakeoff(options: { urgent?: boolean; skipWorkbench?: boolean } = {}) {
    if (!this.surface) return
    if (this.pendingUpgrades > 0 && !options.urgent && !options.skipWorkbench) {
      this.takeoffAfterWorkbench = true
      this.openLevelUp('SHIPBOARD WORKBENCH', `${this.pendingUpgrades} banked mutation signal${this.pendingUpgrades === 1 ? '' : 's'} available. Spend before takeoff.`)
      return
    }
    this.state = 'takeoff'
    this.transitionTimer = 0
    this.transitionDuration = 1.2
    this.audio.land()
    this.toast(options.urgent ? 'O2 LOW - RETURNING TO SHIP' : 'RETURNING TO ORBIT')
  }

  private finishTakeoff() {
    if (!this.surface) return
    this.snapToOrbitReturnPoint()
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
    this.stats.score += first
      ? runBalance.landing.surfaceExtractScoreBase + this.surface.collected * runBalance.landing.surfaceExtractScorePerResource
      : this.surface.collected * runBalance.landing.surfaceRevisitScorePerResource
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
      return
    }
    this.renderSpaceScene(ctx)
  }

  private renderSpaceScene(ctx: CanvasRenderingContext2D) {
    this.mini.style.display = this.state === 'dying' ? 'none' : ''
    this.renderBackground(ctx)
    this.renderPlanets(ctx)
    this.renderSpaceHazards(ctx)
    this.renderDerelictSignals(ctx)
    this.renderReturnBeacon(ctx)
    this.renderPickups(ctx)
    this.renderBullets(ctx)
    this.renderEnemies(ctx)
    this.renderOrbitals(ctx)
    this.renderAutopilot(ctx)
    if (this.state !== 'dying' || this.deathTimer < 0.16) this.renderPlayer(ctx)
    this.renderShockwaves(ctx)
    this.renderParticles(ctx)
    this.renderLandingPrompt(ctx)
    this.renderMinimap()
    this.renderScorePopups(ctx)
  }

  private renderScorePopups(ctx: CanvasRenderingContext2D) {
    if (this.scorePopups.length === 0) return
    ctx.save()
    ctx.font = `${introHookConfig.popup.fontPx}px Courier New`
    ctx.textAlign = 'center'
    ctx.fillStyle = introHookConfig.popup.color
    for (const sp of this.scorePopups) {
      const screen = this.worldToScreen(sp.x, sp.y)
      ctx.globalAlpha = Math.max(0, sp.life / sp.totalLife)
      ctx.fillText(sp.text, screen.x, screen.y)
    }
    ctx.globalAlpha = 1
    ctx.restore()
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
    localStorage.setItem('vector_shooter_graphics', mode)
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
    const sky = ctx.createLinearGradient(0, 0, 0, this.height)
    sky.addColorStop(0, biome.skyTop)
    sky.addColorStop(0.52, biome.skyMid)
    sky.addColorStop(1, biome.skyBottom)
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, this.width, this.height)

    ctx.strokeStyle = biome.gridColor
    ctx.lineWidth = 1
    const grid = 90
    for (let x = -s.camera.x % grid; x < this.width + grid; x += grid) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + Math.sin((x + s.camera.x) * 0.004) * 24, this.height)
      ctx.stroke()
    }
    for (let y = -s.camera.y % grid; y < this.height + grid; y += grid) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(this.width, y + Math.sin((y + s.camera.y) * 0.005) * 18)
      ctx.stroke()
    }

    this.renderSurfaceBiomeMotifs(ctx, s)

    const horizon = this.surfaceToScreen(s.width / 2, s.height + 520)
    ctx.strokeStyle = biome.horizonColor
    ctx.shadowColor = biome.horizonColor
    ctx.shadowBlur = 20
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(horizon.x, horizon.y, 860, Math.PI * 1.12, Math.PI * 1.88)
    ctx.stroke()
    ctx.globalAlpha = 0.26
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath()
      ctx.arc(horizon.x, horizon.y, 720 - i * 62, Math.PI * 1.2, Math.PI * 1.8)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0

    this.renderSurfaceShip(ctx, s)
    this.renderSurfaceResources(ctx, s)
    this.renderSurfaceLoreSites(ctx, s)
    this.renderSurfaceAliens(ctx, s)
    this.renderSurfaceBullets(ctx, s)
    this.renderSurfaceThreats(ctx, s)
    this.renderSurfacePilot(ctx, s)
    this.renderShockwaves(ctx)
    this.renderParticles(ctx)
    this.renderSurfaceHud(ctx, s)
    // NOTE: renderScorePopups uses worldToScreen; surface kills will render at an incorrect
    // screen position. Accepted for V1 — most kills happen in space. Fix in a later pass.
    this.renderScorePopups(ctx)
    ctx.restore()
  }

  private renderSurfaceBiomeMotifs(ctx: CanvasRenderingContext2D, s: SurfaceRun) {
    drawSurfaceBiomeMotifs({
      ctx,
      biome: s.planet.biome,
      seed: hashString(s.planet.id, 83),
      glow: this.allowGlow(),
      surfaceWidth: s.width,
      surfaceHeight: s.height,
      viewWidth: this.width,
      viewHeight: this.height,
      surfaceToScreen: (x, y) => this.surfaceToScreen(x, y)
    })
  }

  private renderSurfaceShip(ctx: CanvasRenderingContext2D, s: SurfaceRun) {
    const p = this.surfaceToScreen(s.ship.x, s.ship.y)
    const pulse = Math.sin(this.stats.time * 3) * 0.06
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.strokeStyle = '#57fff3'
    ctx.shadowColor = '#57fff3'
    ctx.shadowBlur = 20
    ctx.lineWidth = 2
    ctx.rotate(-Math.PI / 2)
    ctx.scale(2.35 + pulse, 2.35 + pulse)
    ctx.beginPath()
    ctx.moveTo(24, 0)
    ctx.lineTo(-15, -13)
    ctx.lineTo(-8, 0)
    ctx.lineTo(-15, 13)
    ctx.closePath()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-16, -8)
    ctx.lineTo(-30, 0)
    ctx.lineTo(-16, 8)
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.strokeStyle = '#fff27a'
    ctx.shadowColor = '#fff27a'
    ctx.shadowBlur = 14
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(-22, 28)
    ctx.lineTo(-46, 50)
    ctx.moveTo(22, 28)
    ctx.lineTo(46, 50)
    ctx.moveTo(-32, 50)
    ctx.lineTo(32, 50)
    ctx.stroke()
    ctx.restore()
  }

  private renderSurfaceResources(ctx: CanvasRenderingContext2D, s: SurfaceRun) {
    for (const r of s.resources) {
      if (r.collected) continue
      const p = this.surfaceToScreen(r.x, r.y)
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(this.stats.time * 1.8)
      ctx.strokeStyle = r.color
      ctx.shadowColor = r.color
      ctx.shadowBlur = r.kind === 'cache' ? 24 : 14
      ctx.lineWidth = r.kind === 'cache' ? 3 : 2
      ctx.beginPath()
      if (r.kind === 'cache') {
        ctx.rect(-r.radius, -r.radius, r.radius * 2, r.radius * 2)
        ctx.moveTo(-r.radius, 0)
        ctx.lineTo(r.radius, 0)
        ctx.moveTo(0, -r.radius)
        ctx.lineTo(0, r.radius)
      } else {
        ctx.moveTo(0, -r.radius)
        ctx.lineTo(r.radius, 0)
        ctx.lineTo(0, r.radius)
        ctx.lineTo(-r.radius, 0)
        ctx.closePath()
      }
      ctx.stroke()
      ctx.restore()
    }
  }

  private renderSurfaceLoreSites(ctx: CanvasRenderingContext2D, s: SurfaceRun) {
    for (const site of s.loreSites) {
      if (site.resolved) continue
      const p = this.surfaceToScreen(site.x, site.y)
      const pulse = Math.sin(this.stats.time * 2.8 + site.phase)
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.strokeStyle = '#d7fff7'
      ctx.shadowColor = '#d7fff7'
      ctx.shadowBlur = this.allowGlow() ? 18 : 8
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.9
      if (site.kind === 'pyramid') {
        ctx.beginPath()
        ctx.moveTo(0, -site.radius)
        ctx.lineTo(site.radius * 0.95, site.radius * 0.62)
        ctx.lineTo(-site.radius * 0.95, site.radius * 0.62)
        ctx.closePath()
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, -site.radius)
        ctx.lineTo(0, site.radius * 0.62)
        ctx.stroke()
      } else if (site.kind === 'grave') {
        ctx.beginPath()
        ctx.moveTo(-site.radius * 0.72, site.radius * 0.62)
        ctx.lineTo(-site.radius * 0.72, -site.radius * 0.2)
        ctx.quadraticCurveTo(0, -site.radius, site.radius * 0.72, -site.radius * 0.2)
        ctx.lineTo(site.radius * 0.72, site.radius * 0.62)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(-site.radius * 0.32, -site.radius * 0.1)
        ctx.lineTo(site.radius * 0.32, -site.radius * 0.1)
        ctx.moveTo(0, -site.radius * 0.42)
        ctx.lineTo(0, site.radius * 0.28)
        ctx.stroke()
      } else if (site.kind === 'fossils') {
        for (let i = 0; i < 5; i += 1) {
          ctx.beginPath()
          ctx.ellipse((i - 2) * 10, Math.sin(i) * 5, 7, 18, i * 0.65, 0, TAU)
          ctx.stroke()
        }
      } else if (site.kind === 'machine') {
        ctx.beginPath()
        ctx.rect(-site.radius * 0.7, -site.radius * 0.45, site.radius * 1.4, site.radius * 0.9)
        ctx.moveTo(-site.radius, -site.radius * 0.72)
        ctx.lineTo(site.radius, site.radius * 0.72)
        ctx.moveTo(site.radius, -site.radius * 0.72)
        ctx.lineTo(-site.radius, site.radius * 0.72)
        ctx.stroke()
      } else {
        for (let i = 0; i < 4; i += 1) {
          ctx.beginPath()
          ctx.arc(0, 0, site.radius * (0.35 + i * 0.18), i * 0.7, Math.PI + i * 0.7)
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 0.32 + pulse * 0.08
      ctx.beginPath()
      ctx.arc(0, 0, site.radius + 10 + pulse * 3, 0, TAU)
      ctx.stroke()
      ctx.restore()
    }
  }

  private renderSurfaceThreats(ctx: CanvasRenderingContext2D, s: SurfaceRun) {
    for (const threat of s.threats) {
      if (threat.sprite === 'glassMiteOracle') {
        this.renderGlassMiteOracleThreat(ctx, threat)
        continue
      }
      if (threat.sprite === 'bossCatalog') {
        this.renderCatalogBossThreat(ctx, threat)
        continue
      }
      const p = this.surfaceToScreen(threat.x, threat.y)
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(threat.phase)
      ctx.strokeStyle = threat.hit > 0 ? '#fff27a' : threat.color
      ctx.shadowColor = threat.color
      ctx.shadowBlur = 18
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < 7; i += 1) {
        const a = (i / 7) * TAU
        const radius = i % 2 ? threat.radius * 0.45 : threat.radius
        const x = Math.cos(a) * radius
        const y = Math.sin(a) * radius
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.restore()
    }
  }

  private renderGlassMiteOracleThreat(ctx: CanvasRenderingContext2D, threat: SurfaceThreat) {
    const p = this.surfaceToScreen(threat.x, threat.y)
    const sheet = this.glassMiteOracleSheet
    if (!sheet.complete || sheet.naturalWidth === 0) {
      this.renderFallbackMite(ctx, threat, p)
      return
    }
    const frameCount = 5
    const frame = Math.floor((this.stats.time * 8 + threat.phase) % frameCount)
    const sw = sheet.naturalWidth / frameCount
    const sh = sheet.naturalHeight
    const bob = Math.sin(this.stats.time * 5 + threat.phase) * 3
    const scale = threat.hit > 0 ? 0.475 : 0.46
    const dw = sw * scale
    const dh = sh * scale
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = threat.hit > 0 ? 0.96 : 0.92
    ctx.shadowColor = '#57fff3'
    ctx.shadowBlur = this.allowGlow() ? 20 : 8
    ctx.drawImage(sheet, frame * sw, 0, sw, sh, p.x - dw / 2, p.y - dh * 0.54 + bob, dw, dh)
    if (threat.hit > 0) {
      ctx.globalCompositeOperation = 'screen'
      ctx.globalAlpha = 0.16
      ctx.fillStyle = '#57fff3'
      ctx.beginPath()
      ctx.arc(p.x, p.y - 14 + bob, threat.radius + 14, 0, TAU)
      ctx.fill()
    }
    ctx.restore()
  }

  private renderCatalogBossThreat(ctx: CanvasRenderingContext2D, threat: SurfaceThreat) {
    const p = this.surfaceToScreen(threat.x, threat.y)
    const sheet = this.planetBossCatalog
    if (!sheet.complete || sheet.naturalWidth === 0) {
      this.renderFallbackMite(ctx, threat, p)
      return
    }
    const row = clamp(Math.floor(threat.spriteRow ?? 0), 0, BOSS_CATALOG_ROWS - 1)
    const frame = Math.floor((this.stats.time * 6 + threat.phase) % BOSS_CATALOG_FRAMES)
    const sw = sheet.naturalWidth / BOSS_CATALOG_FRAMES
    const sh = sheet.naturalHeight / BOSS_CATALOG_ROWS
    const bob = Math.sin(this.stats.time * 3.2 + threat.phase) * 4
    const scale = threat.hit > 0 ? 0.56 : 0.54
    const dw = sw * scale
    const dh = sh * scale
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = threat.hit > 0 ? 0.98 : 0.94
    ctx.shadowColor = threat.color
    ctx.shadowBlur = this.allowGlow() ? 24 : 8
    ctx.drawImage(sheet, frame * sw, row * sh, sw, sh, p.x - dw / 2, p.y - dh * 0.55 + bob, dw, dh)
    ctx.globalAlpha = 0.45
    ctx.strokeStyle = threat.color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(p.x, p.y + bob, threat.radius + 9 + Math.sin(this.stats.time * 4 + threat.phase) * 4, 0, TAU)
    ctx.stroke()
    ctx.restore()
  }

  private renderFallbackMite(ctx: CanvasRenderingContext2D, threat: SurfaceThreat, p: Vec) {
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.strokeStyle = threat.hit > 0 ? '#fff27a' : '#57fff3'
    ctx.shadowColor = '#57fff3'
    ctx.shadowBlur = 16
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, -34)
    ctx.lineTo(22, -2)
    ctx.lineTo(10, 25)
    ctx.lineTo(-12, 24)
    ctx.lineTo(-22, -2)
    ctx.closePath()
    ctx.stroke()
    ctx.strokeStyle = '#fff27a'
    ctx.beginPath()
    ctx.moveTo(-14, 16)
    ctx.lineTo(-34, 34)
    ctx.moveTo(14, 16)
    ctx.lineTo(34, 34)
    ctx.stroke()
    ctx.restore()
  }

  private renderSurfaceAliens(ctx: CanvasRenderingContext2D, s: SurfaceRun) {
    for (const alien of s.aliens) {
      if (alien.resolved) continue
      if (alien.sprite === 'alienCatalog' && this.planetAlienCatalog.complete && this.planetAlienCatalog.naturalWidth > 0) {
        this.renderCatalogAlien(ctx, alien)
        continue
      }
      const p = this.surfaceToScreen(alien.x, alien.y)
      const bob = Math.sin(this.stats.time * 2.4 + alien.phase) * 5
      ctx.save()
      ctx.translate(p.x, p.y + bob)
      ctx.strokeStyle = alien.color
      ctx.fillStyle = alien.color
      ctx.shadowColor = alien.color
      ctx.shadowBlur = 18
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(0, -8, 13, 23, Math.sin(alien.phase) * 0.25, 0, TAU)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, -30, 11, 0, TAU)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(-4, -31, 1.8, 0, TAU)
      ctx.arc(4, -31, 1.8, 0, TAU)
      ctx.arc(0, -25, 1.8, 0, TAU)
      ctx.fill()
      ctx.globalAlpha = 0.45
      ctx.beginPath()
      ctx.arc(0, -10, alien.radius + Math.sin(this.stats.time * 3) * 3, 0, TAU)
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.moveTo(-8, 10)
      ctx.lineTo(-16, 24)
      ctx.moveTo(8, 10)
      ctx.lineTo(16, 24)
      ctx.stroke()
      ctx.restore()
    }
  }

  private renderCatalogAlien(ctx: CanvasRenderingContext2D, alien: SurfaceAlien) {
    const p = this.surfaceToScreen(alien.x, alien.y)
    const sheet = this.planetAlienCatalog
    if (!sheet.complete || sheet.naturalWidth === 0) return
    const row = clamp(Math.floor(alien.spriteRow ?? 0), 0, ALIEN_CATALOG_ROWS - 1)
    const frame = Math.floor((this.stats.time * 4 + alien.phase) % ALIEN_CATALOG_FRAMES)
    const sw = sheet.naturalWidth / ALIEN_CATALOG_FRAMES
    const sh = sheet.naturalHeight / ALIEN_CATALOG_ROWS
    const bob = Math.sin(this.stats.time * 2.2 + alien.phase) * 5
    const scale = 0.48
    const dw = sw * scale
    const dh = sh * scale
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = 0.94
    ctx.shadowColor = alien.color
    ctx.shadowBlur = this.allowGlow() ? 20 : 8
    ctx.drawImage(sheet, frame * sw, row * sh, sw, sh, p.x - dw / 2, p.y - dh * 0.58 + bob, dw, dh)
    ctx.globalAlpha = 0.55
    ctx.strokeStyle = '#8fff7d'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(p.x, p.y + bob, alien.radius + 12 + Math.sin(this.stats.time * 3) * 3, 0, TAU)
    ctx.stroke()
    ctx.restore()
  }

  private renderSurfaceBullets(ctx: CanvasRenderingContext2D, s: SurfaceRun) {
    ctx.save()
    ctx.strokeStyle = '#fff27a'
    ctx.fillStyle = '#fff27a'
    ctx.shadowColor = '#fff27a'
    ctx.shadowBlur = this.allowGlow() ? 4 : 0
    ctx.lineWidth = 1.1
    ctx.globalAlpha = 0.58
    for (const bullet of s.bullets) {
      const p = this.surfaceToScreen(bullet.x, bullet.y)
      const angle = Math.atan2(bullet.vy, bullet.vx)
      ctx.beginPath()
      ctx.moveTo(p.x - Math.cos(angle) * 7, p.y - Math.sin(angle) * 7)
      ctx.lineTo(p.x + Math.cos(angle) * 6, p.y + Math.sin(angle) * 6)
      ctx.stroke()
    }
    ctx.restore()
  }

  private renderSurfacePilot(ctx: CanvasRenderingContext2D, s: SurfaceRun) {
    const p = this.surfaceToScreen(s.pilot.x, s.pilot.y)
    const sheet = this.surfaceSpacemanSheet
    if (sheet.complete && sheet.naturalWidth > 0) {
      const frameCount = 8
      const moving = len(s.pilot.vx, s.pilot.vy) > 12
      const frame = moving ? Math.floor(this.stats.time * 11) % frameCount : 0
      const sw = sheet.naturalWidth / frameCount
      const sh = sheet.naturalHeight
      const scale = surfacePilotSpriteScale(s.pilot.invuln > 0 ? 0.45 : 0.42)
      const dw = sw * scale
      const dh = sh * scale
      const flip = Math.cos(s.pilot.facing) < 0 ? -1 : 1
      const bob = moving ? Math.sin(this.stats.time * 18) * 1.5 : Math.sin(this.stats.time * 3) * 0.8
      ctx.save()
      ctx.translate(p.x, p.y + bob)
      ctx.scale(flip, 1)
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = s.pilot.invuln > 0 ? 1 : 0.96
      ctx.shadowColor = s.pilot.invuln > 0 ? '#fff27a' : '#57fff3'
      ctx.shadowBlur = this.allowGlow() ? 14 : 5
      ctx.drawImage(sheet, frame * sw, 0, sw, sh, -dw / 2, -dh * 0.62, dw, dh)
      ctx.restore()
      return
    }
    this.renderFallbackSurfacePilot(ctx, s, p)
  }

  private renderFallbackSurfacePilot(ctx: CanvasRenderingContext2D, s: SurfaceRun, p: Vec) {
    const step = Math.sin(this.stats.time * 11) * 4
    const facing = Math.sign(Math.cos(s.pilot.facing)) || 1
    const aim = s.pilot.facing
    const gunKick = Math.max(0, s.pilot.gunCd) * 18
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.scale(SURFACE_PILOT_SIZE_SCALE, SURFACE_PILOT_SIZE_SCALE)
    ctx.strokeStyle = s.pilot.invuln > 0 ? '#fff27a' : '#d7fff7'
    ctx.shadowColor = '#57fff3'
    ctx.shadowBlur = 10
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, -16, 5, 0, TAU)
    ctx.moveTo(0, -11)
    ctx.lineTo(0, 6)
    ctx.moveTo(0, -5)
    ctx.lineTo(Math.cos(aim) * 11, Math.sin(aim) * 11 - 3)
    ctx.moveTo(0, -4)
    ctx.lineTo(facing * -8, 2)
    ctx.moveTo(0, 6)
    ctx.lineTo(-7, 20 + step)
    ctx.moveTo(0, 6)
    ctx.lineTo(7, 20 - step)
    ctx.stroke()
    ctx.strokeStyle = '#fff27a'
    ctx.shadowColor = '#fff27a'
    ctx.beginPath()
    ctx.moveTo(Math.cos(aim) * 8, Math.sin(aim) * 8 - 3)
    ctx.lineTo(Math.cos(aim) * (22 - gunKick), Math.sin(aim) * (22 - gunKick) - 3)
    ctx.stroke()
    ctx.restore()
  }

  private renderSurfaceHud(ctx: CanvasRenderingContext2D, s: SurfaceRun) {
    const nearShip = Math.sqrt(dist2(s.pilot, s.ship)) < 64
    const nearLore = this.findNearbyLoreSite()
    const nearAlien = this.findNearbyAlien()
    ctx.save()
    ctx.fillStyle = '#fff27a'
    ctx.shadowColor = '#fff27a'
    ctx.shadowBlur = 12
    ctx.font = this.width < 560 ? '12px Courier New' : '14px Courier New'
    ctx.textAlign = 'center'
    const message = nearLore ? `PRESS E / Y TO INSPECT: ${nearLore.title}` : nearAlien ? `PRESS E / Y TO SPEAK: ${nearAlien.name}` : nearShip ? 'PRESS E / Y TO BOARD SHIP' : s.message
    if (this.width < 560) {
      ctx.font = '11px Courier New'
      ctx.fillText(`${s.planet.name} // ${this.surfaceScenarioLabel(s.scenario)}`, this.width / 2, 78, this.width - 24)
      ctx.fillText(`${this.surfaceEventLabel(s.event)} // ${s.collected}/${s.resources.length} SIGNALS`, this.width / 2, 94, this.width - 24)
    } else {
      ctx.fillText(`${s.planet.name} // ${this.surfaceScenarioLabel(s.scenario)} // ${this.surfaceEventLabel(s.event)} // ${s.collected}/${s.resources.length} SIGNALS`, this.width / 2, 86, this.width - 16)
    }
    const actionInset = this.width < 560 ? 132 : 0
    const messageX = actionInset ? (this.width - actionInset) / 2 : this.width / 2
    ctx.font = this.width < 560 ? '11px Courier New' : '14px Courier New'
    ctx.fillText(message, messageX, this.width < 560 ? this.height - 72 : this.height - 42, this.width - actionInset - 18)
    ctx.restore()
  }

  private surfaceEventLabel(event: SurfaceEventKind) {
    return {
      jackpot: 'JACKPOT',
      horde: 'HORDE VAULT',
      swarm: 'INFESTED',
      relic: 'RELIC SITE',
      repair: 'SAFE DOCK',
      volatile: 'VOLATILE',
      standard: 'UNKNOWN'
    }[event]
  }

  private surfaceScenarioLabel(scenario: SurfaceScenarioKind) {
    return {
      salvage: 'SALVAGE',
      boss: 'BOSS',
      friendly: 'CONTACT',
      mixed: 'MYSTERY',
      lore: 'RUINS',
      horde: 'VAST HORDE'
    }[scenario]
  }

  private renderTransitionOverlay(ctx: CanvasRenderingContext2D, t: number, label: string) {
    const pulse = Math.sin(t * Math.PI)
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.strokeStyle = '#57fff3'
    ctx.shadowColor = '#57fff3'
    ctx.shadowBlur = 24
    ctx.lineWidth = 2
    for (let i = 0; i < 9; i += 1) {
      const r = (i + 1) * 70 + pulse * 120
      ctx.beginPath()
      ctx.arc(this.width / 2, this.height / 2, r, 0, TAU)
      ctx.stroke()
    }
    ctx.fillStyle = `rgba(0,0,0,${0.18 + pulse * 0.32})`
    ctx.fillRect(0, 0, this.width, this.height)
    ctx.fillStyle = '#d7fff7'
    ctx.font = '18px Courier New'
    ctx.textAlign = 'center'
    ctx.fillText(label, this.width / 2, this.height / 2)
    ctx.restore()
  }

  private renderDeathOverlay(ctx: CanvasRenderingContext2D) {
    const t = clamp(this.deathTimer / 2.35, 0, 1)
    const flash = Math.max(0, 1 - this.deathTimer * 2.6)
    const p = this.worldToScreen(this.player.x, this.player.y)
    ctx.save()
    ctx.fillStyle = `rgba(0,0,0,${0.2 + t * 0.52})`
    ctx.fillRect(0, 0, this.width, this.height)
    ctx.globalCompositeOperation = 'lighter'
    const boom = clamp(this.deathTimer / 1.1, 0, 1)
    for (let i = 0; i < 4; i += 1) {
      const ring = boom * (70 + i * 38)
      const alpha = Math.max(0, 0.52 - boom * 0.42 - i * 0.06)
      ctx.strokeStyle = i % 2 === 0 ? `rgba(255,93,115,${alpha})` : `rgba(255,242,122,${alpha})`
      ctx.shadowColor = i % 2 === 0 ? '#ff5d73' : '#fff27a'
      ctx.shadowBlur = 22
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(p.x, p.y, ring, 0, TAU)
      ctx.stroke()
    }
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * TAU + this.deathTimer * 0.9
      const length = 54 + boom * 120
      ctx.strokeStyle = i % 3 === 0 ? 'rgba(255,242,122,0.46)' : 'rgba(87,255,243,0.34)'
      ctx.beginPath()
      ctx.moveTo(p.x + Math.cos(a) * 18, p.y + Math.sin(a) * 18)
      ctx.lineTo(p.x + Math.cos(a) * length, p.y + Math.sin(a) * length)
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
    if (flash > 0) {
      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = `rgba(255,242,122,${flash * 0.42})`
      ctx.fillRect(0, 0, this.width, this.height)
    }
    ctx.globalCompositeOperation = 'source-over'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#ff5d73'
    ctx.shadowBlur = 26
    ctx.fillStyle = '#ffedf1'
    ctx.font = '24px Courier New'
    ctx.fillText('YOU DIED', this.width / 2, this.height * 0.42)
    ctx.shadowColor = '#57fff3'
    ctx.shadowBlur = 18
    ctx.fillStyle = '#d7fff7'
    ctx.font = '13px Courier New'
    ctx.fillText('BLACK BOX TRANSMITTING TO MOTHERSHIP', this.width / 2, this.height * 0.42 + 34)
    const barWidth = Math.min(320, this.width - 52)
    const x = (this.width - barWidth) / 2
    const y = this.height * 0.42 + 58
    ctx.strokeStyle = 'rgba(87,255,243,0.62)'
    ctx.strokeRect(x, y, barWidth, 7)
    ctx.fillStyle = '#57fff3'
    ctx.fillRect(x, y, barWidth * t, 7)
    ctx.restore()
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    ctx.save()
    this.renderNebulaBands(ctx)
    this.renderSectorLandmarks(ctx)
    ctx.strokeStyle = 'rgba(87,255,243,0.08)'
    ctx.lineWidth = 1
    const grid = 240
    const scale = this.spaceScale()
    const viewRight = this.camera.x + this.width / scale
    const viewBottom = this.camera.y + this.height / scale
    const startX = Math.floor(this.camera.x / grid) * grid
    const startY = Math.floor(this.camera.y / grid) * grid
    for (let x = startX; x < viewRight + grid; x += grid) {
      const sx = (x - this.camera.x) * scale
      ctx.beginPath()
      ctx.moveTo(sx, 0)
      ctx.lineTo(sx, this.height)
      ctx.stroke()
    }
    for (let y = startY; y < viewBottom + grid; y += grid) {
      const sy = (y - this.camera.y) * scale
      ctx.beginPath()
      ctx.moveTo(0, sy)
      ctx.lineTo(this.width, sy)
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(255,242,122,0.16)'
    ctx.fillStyle = 'rgba(255,242,122,0.42)'
    ctx.font = '11px Courier New'
    const chunkStartX = Math.floor(this.camera.x / CHUNK_SIZE) * CHUNK_SIZE
    const chunkStartY = Math.floor(this.camera.y / CHUNK_SIZE) * CHUNK_SIZE
    for (let x = chunkStartX; x < viewRight + CHUNK_SIZE; x += CHUNK_SIZE) {
      const sx = (x - this.camera.x) * scale
      ctx.beginPath()
      ctx.moveTo(sx, 0)
      ctx.lineTo(sx, this.height)
      ctx.stroke()
    }
    for (let y = chunkStartY; y < viewBottom + CHUNK_SIZE; y += CHUNK_SIZE) {
      const sy = (y - this.camera.y) * scale
      ctx.beginPath()
      ctx.moveTo(0, sy)
      ctx.lineTo(this.width, sy)
      ctx.stroke()
    }
    const sector = this.currentChunk()
    ctx.fillText(`SECTOR ${sector.x}:${sector.y}`, 14, this.height - 18)
    for (const s of this.stars) {
      const p = this.worldToScreen(s.x, s.y)
      if (p.x < -10 || p.x > this.width + 10 || p.y < -10 || p.y > this.height + 10) continue
      const h = hash32(Math.floor(s.x), Math.floor(s.y), 23)
      const alpha = 0.34 + (h % 50) / 100
      const size = h % 17 === 0 ? 2.2 : h % 7 === 0 ? 1.7 : 1.15
      const palette = h % 11 === 0 ? '255,242,122' : h % 5 === 0 ? '185,144,255' : h % 3 === 0 ? '143,255,125' : '215,255,247'
      ctx.fillStyle = `rgba(${palette},${alpha})`
      ctx.fillRect(p.x, p.y, size, size)
    }
    ctx.restore()
  }

  private renderSectorLandmarks(ctx: CanvasRenderingContext2D) {
    const colors = [
      [87, 255, 243],
      [143, 255, 125],
      [185, 144, 255],
      [255, 242, 122],
      [112, 168, 255],
      [255, 93, 115]
    ]
    const landmarkGrid = 820
    const scale = this.spaceScale()
    const viewRight = this.camera.x + this.width / scale
    const viewBottom = this.camera.y + this.height / scale
    const minX = Math.floor((this.camera.x - landmarkGrid) / landmarkGrid)
    const maxX = Math.floor((viewRight + landmarkGrid) / landmarkGrid)
    const minY = Math.floor((this.camera.y - landmarkGrid) / landmarkGrid)
    const maxY = Math.floor((viewBottom + landmarkGrid) / landmarkGrid)
    const glow = this.allowGlow()
    ctx.save()
    ctx.globalCompositeOperation = glow ? 'screen' : 'source-over'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (let gx = minX; gx <= maxX; gx += 1) {
      for (let gy = minY; gy <= maxY; gy += 1) {
        const rng = rngFrom(hash32(gx, gy, 177))
        if (rng() < 0.16) continue
        const color = colors[Math.floor(rng() * colors.length)]
        const accent = colors[Math.floor(rng() * colors.length)]
        const alpha = glow ? 0.22 : 0.13
        const landmarkCount = 1 + Math.floor(rng() * 2)
        for (let i = 0; i < landmarkCount; i += 1) {
          const worldX = gx * landmarkGrid + rng() * landmarkGrid
          const worldY = gy * landmarkGrid + rng() * landmarkGrid
          const p = this.worldToScreen(worldX, worldY)
          const x = p.x
          const y = p.y
          const kind = Math.floor(rng() * 4)
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(rng() * TAU)
          ctx.shadowColor = `rgba(${color[0]},${color[1]},${color[2]},0.34)`
          ctx.shadowBlur = glow ? 12 : 0
          if (kind === 0) {
            const radius = 62 + rng() * 110
            ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha * 0.72})`
            ctx.lineWidth = 1.2
            ctx.beginPath()
            ctx.ellipse(0, 0, radius * (1.3 + rng() * 0.7), radius * (0.18 + rng() * 0.18), 0, 0, TAU)
            ctx.stroke()
            ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${alpha * 0.42})`
            ctx.beginPath()
            ctx.arc(0, 0, radius * 0.32, rng() * TAU, rng() * TAU + TAU * (0.34 + rng() * 0.3))
            ctx.stroke()
          } else if (kind === 1) {
            const length = 160 + rng() * 280
            ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha * 0.62})`
            ctx.lineWidth = 1 + rng() * 1.4
            ctx.beginPath()
            ctx.moveTo(-length / 2, 0)
            ctx.lineTo(length / 2, 0)
            ctx.stroke()
            ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${alpha * 0.36})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(-length * 0.36, 16)
            ctx.lineTo(length * 0.42, 16)
            ctx.stroke()
          } else if (kind === 2) {
            const radius = 54 + rng() * 88
            ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha * 0.54})`
            ctx.lineWidth = 1
            for (let j = 0; j < 3; j += 1) {
              ctx.beginPath()
              ctx.arc(0, 0, radius * (0.48 + j * 0.24), rng() * TAU, rng() * TAU + TAU * (0.18 + rng() * 0.24))
              ctx.stroke()
            }
          } else {
            const points = 7 + Math.floor(rng() * 8)
            ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha * 0.56})`
            for (let j = 0; j < points; j += 1) {
              const a = rng() * TAU
              const d = rng() * 90
              const size = 1 + rng() * 1.8
              ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d, size, size)
            }
          }
          ctx.restore()
        }
      }
    }
    ctx.restore()
  }

  private renderNebulaBands(ctx: CanvasRenderingContext2D) {
    const colors = [
      [87, 255, 243],
      [143, 255, 125],
      [185, 144, 255],
      [255, 242, 122],
      [112, 168, 255],
      [255, 93, 115]
    ]
    const scale = this.spaceScale()
    const viewRight = this.camera.x + this.width / scale
    const viewBottom = this.camera.y + this.height / scale
    const minX = Math.floor((this.camera.x - CHUNK_SIZE) / CHUNK_SIZE)
    const maxX = Math.floor((viewRight + CHUNK_SIZE) / CHUNK_SIZE)
    const minY = Math.floor((this.camera.y - CHUNK_SIZE) / CHUNK_SIZE)
    const maxY = Math.floor((viewBottom + CHUNK_SIZE) / CHUNK_SIZE)
    const glow = this.allowGlow()
    ctx.save()
    ctx.globalCompositeOperation = glow ? 'screen' : 'source-over'
    for (let cx = minX; cx <= maxX; cx += 1) {
      for (let cy = minY; cy <= maxY; cy += 1) {
        const rng = rngFrom(hash32(cx, cy, 91))
        if (rng() < 0.46) continue
        const color = colors[Math.floor(rng() * colors.length)]
        const accent = colors[Math.floor(rng() * colors.length)]
        const worldX = cx * CHUNK_SIZE + rng() * CHUNK_SIZE
        const worldY = cy * CHUNK_SIZE + rng() * CHUNK_SIZE
        const p = this.worldToScreen(worldX, worldY)
        const x = p.x
        const y = p.y
        const length = CHUNK_SIZE * (0.8 + rng() * 0.75)
        const breadth = 150 + rng() * 260
        const angle = rng() * TAU
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(angle)
        ctx.filter = `blur(${glow ? 34 : 24}px)`
        const gradient = ctx.createLinearGradient(-length / 2, 0, length / 2, 0)
        const alpha = glow ? 0.075 : 0.045
        gradient.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},0)`)
        gradient.addColorStop(0.36, `rgba(${color[0]},${color[1]},${color[2]},${alpha})`)
        gradient.addColorStop(0.62, `rgba(${accent[0]},${accent[1]},${accent[2]},${alpha * 0.55})`)
        gradient.addColorStop(1, `rgba(${accent[0]},${accent[1]},${accent[2]},0)`)
        ctx.fillStyle = gradient
        ctx.fillRect(-length / 2, -breadth / 2, length, breadth)
        if (glow && rng() > 0.55) {
          ctx.globalAlpha = 0.24
          ctx.fillRect(-length * 0.35, -breadth * 0.06, length * 0.72, breadth * 0.12)
        }
        ctx.restore()
      }
    }
    ctx.restore()
  }

  private renderPlanets(ctx: CanvasRenderingContext2D) {
    const scale = this.spaceScale()
    for (const p of this.planets) {
      const s = this.worldToScreen(p.x, p.y)
      const radius = p.radius * scale
      if (s.x < -260 || s.x > this.width + 260 || s.y < -260 || s.y > this.height + 260) continue
      const biome = p.biome
      ctx.save()
      ctx.strokeStyle = biome.baseColor
      ctx.fillStyle = biome.shadowColor
      ctx.shadowColor = biome.baseColor
      ctx.shadowBlur = this.allowGlow() ? 18 : 6
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(s.x, s.y, radius, 0, TAU)
      ctx.fill()
      ctx.stroke()
      ctx.shadowBlur = 0
      ctx.save()
      ctx.beginPath()
      ctx.arc(s.x, s.y, radius * 0.98, 0, TAU)
      ctx.clip()
      ctx.globalAlpha = 0.62
      ctx.strokeStyle = biome.accentColor
      ctx.lineWidth = Math.max(1.2, 2 * scale)
      if (biome.surfaceMotif === 'canopy') {
        for (let i = -2; i < 4; i += 1) {
          ctx.beginPath()
          ctx.arc(s.x - radius * 0.28 + i * radius * 0.2, s.y - radius * 0.12 + Math.sin(i) * radius * 0.1, radius * 0.34, Math.PI * 0.98, Math.PI * 1.95)
          ctx.stroke()
        }
      } else if (biome.surfaceMotif === 'dunes' || biome.surfaceMotif === 'islands') {
        for (let i = -2; i <= 2; i += 1) {
          ctx.beginPath()
          ctx.ellipse(s.x, s.y + i * radius * 0.22, radius * 1.05, radius * 0.18, Math.sin(i + p.x) * 0.18, 0, TAU)
          ctx.stroke()
        }
      } else if (biome.surfaceMotif === 'lava') {
        for (let i = 0; i < 5; i += 1) {
          const a = (i / 5) * TAU + (p.x % 17) * 0.03
          ctx.beginPath()
          ctx.moveTo(s.x + Math.cos(a) * radius * 0.18, s.y + Math.sin(a) * radius * 0.18)
          ctx.lineTo(s.x + Math.cos(a + 0.38) * radius * 0.92, s.y + Math.sin(a + 0.38) * radius * 0.92)
          ctx.stroke()
        }
      } else if (biome.surfaceMotif === 'ice' || biome.surfaceMotif === 'crystals') {
        for (let i = 0; i < 6; i += 1) {
          const x = s.x - radius * 0.7 + i * radius * 0.28
          ctx.beginPath()
          ctx.moveTo(x, s.y + radius * 0.62)
          ctx.lineTo(x + radius * 0.18, s.y - radius * 0.48)
          ctx.lineTo(x + radius * 0.36, s.y + radius * 0.5)
          ctx.stroke()
        }
      } else if (biome.surfaceMotif === 'reef') {
        for (let i = 0; i < 5; i += 1) {
          ctx.beginPath()
          ctx.arc(s.x + Math.cos(i) * radius * 0.36, s.y + Math.sin(i * 1.7) * radius * 0.32, radius * (0.16 + i * 0.025), 0, TAU)
          ctx.stroke()
        }
      } else {
        for (let i = 0; i < 4; i += 1) {
          const x = s.x - radius * 0.48 + i * radius * 0.32
          ctx.strokeRect(x, s.y - radius * 0.48, radius * 0.14, radius * 0.96)
        }
      }
      ctx.restore()
      ctx.strokeStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = this.allowGlow() ? 14 : 4
      ctx.globalAlpha = 0.42
      ctx.beginPath()
      ctx.ellipse(s.x, s.y, radius * 1.75, radius * 0.38, Math.sin(this.stats.time * 0.3) * 0.35, 0, TAU)
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.strokeStyle = biome.baseColor
      ctx.shadowColor = biome.baseColor
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath()
        ctx.arc(s.x, s.y, radius * (0.35 + i * 0.15), 0, TAU * (0.56 + Math.sin(this.stats.time + i) * 0.08))
        ctx.stroke()
      }
      ctx.fillStyle = p.visited ? '#8fff7d' : '#d7fff7'
      ctx.font = '12px Courier New'
      ctx.textAlign = 'center'
      ctx.fillText(p.name, s.x, s.y + radius + 24 * scale)
      ctx.fillStyle = biome.accentColor
      ctx.font = '10px Courier New'
      ctx.fillText(biome.label.toUpperCase(), s.x, s.y + radius + 38 * scale)
      ctx.restore()
    }
  }

  private renderSpaceHazards(ctx: CanvasRenderingContext2D) {
    if (!this.spaceHazards.length) return
    const scale = this.spaceScale()
    ctx.save()
    ctx.lineJoin = 'round'
    for (const hazard of this.spaceHazards) {
      const p = this.worldToScreen(hazard.x, hazard.y)
      const radius = hazard.radius * scale
      if (p.x < -radius - 80 || p.x > this.width + radius + 80 || p.y < -radius - 80 || p.y > this.height + radius + 80) continue
      const points = 10
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(hazard.phase)
      ctx.shadowColor = '#fff27a'
      ctx.shadowBlur = this.allowGlow() ? 18 : 4
      ctx.strokeStyle = 'rgba(255,242,122,0.82)'
      ctx.fillStyle = 'rgba(88,62,38,0.42)'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < points; i += 1) {
        const a = (i / points) * TAU
        const wobble = 0.82 + ((hash32(Math.floor(hazard.x), Math.floor(hazard.y), i) % 34) / 100)
        const x = Math.cos(a) * radius * wobble
        const y = Math.sin(a) * radius * wobble
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.globalAlpha = 0.34
      ctx.beginPath()
      ctx.arc(0, 0, radius * 1.28, 0, TAU)
      ctx.stroke()
      ctx.restore()
    }
    ctx.restore()
  }

  private renderDerelictSignals(ctx: CanvasRenderingContext2D) {
    if (!this.derelictSignals.length) return
    const scale = this.spaceScale()
    ctx.save()
    for (const signal of this.derelictSignals) {
      const p = this.worldToScreen(signal.x, signal.y)
      if (p.x < 34 || p.x > this.width - 34 || p.y < 92 || p.y > this.height - 34) {
        const edge = {
          x: clamp(p.x, 34, this.width - 34),
          y: clamp(p.y, 92, this.height - 34)
        }
        const angle = Math.atan2(p.y - this.height / 2, p.x - this.width / 2)
        ctx.save()
        ctx.translate(edge.x, edge.y)
        ctx.rotate(angle)
        ctx.strokeStyle = '#fff27a'
        ctx.fillStyle = 'rgba(255,242,122,0.2)'
        ctx.shadowColor = '#fff27a'
        ctx.shadowBlur = this.allowGlow() ? 14 : 0
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(18, 0)
        ctx.lineTo(-10, -10)
        ctx.lineTo(-4, 0)
        ctx.lineTo(-10, 10)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.restore()
        ctx.save()
        ctx.fillStyle = '#fff27a'
        ctx.font = '12px Courier New'
        ctx.textAlign = edge.x > this.width - 140 ? 'right' : edge.x < 140 ? 'left' : 'center'
        ctx.fillText('DERELICT', clamp(edge.x, 62, this.width - 62), clamp(edge.y - 18, 92, this.height - 48))
        ctx.restore()
        continue
      }
      const pulse = 1 + Math.sin(signal.phase * 5) * 0.08
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(signal.phase * 0.45)
      ctx.strokeStyle = '#fff27a'
      ctx.fillStyle = 'rgba(255,242,122,0.1)'
      ctx.shadowColor = '#fff27a'
      ctx.shadowBlur = this.allowGlow() ? 22 : 6
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.rect(-34 * scale * pulse, -18 * scale * pulse, 68 * scale * pulse, 36 * scale * pulse)
      ctx.moveTo(-46 * scale * pulse, 0)
      ctx.lineTo(-70 * scale * pulse, -16 * scale * pulse)
      ctx.moveTo(46 * scale * pulse, 0)
      ctx.lineTo(70 * scale * pulse, 16 * scale * pulse)
      ctx.fill()
      ctx.stroke()
      ctx.setLineDash([7, 7])
      ctx.beginPath()
      ctx.arc(0, 0, 96 * scale, 0, TAU)
      ctx.stroke()
      ctx.restore()

      ctx.save()
      ctx.fillStyle = '#fff27a'
      ctx.font = '12px Courier New'
      ctx.textAlign = 'center'
      ctx.fillText('DERELICT CACHE', p.x, p.y - 78 * scale)
      ctx.restore()
    }
    ctx.restore()
  }

  private renderReturnBeacon(ctx: CanvasRenderingContext2D) {
    if (!this.returnBeacon) return
    const p = this.worldToScreen(this.returnBeacon.x, this.returnBeacon.y)
    const distance = Math.floor(Math.sqrt(dist2(this.returnBeacon, this.player)))
    const margin = 34
    const topMargin = 92
    const onScreen = p.x >= margin && p.x <= this.width - margin && p.y >= topMargin && p.y <= this.height - margin
    if (!onScreen) {
      const edge = {
        x: clamp(p.x, margin, this.width - margin),
        y: clamp(p.y, topMargin, this.height - margin)
      }
      const angle = Math.atan2(p.y - this.height / 2, p.x - this.width / 2)
      ctx.save()
      ctx.translate(edge.x, edge.y)
      ctx.rotate(angle)
      ctx.fillStyle = '#fff27a'
      ctx.strokeStyle = '#111827'
      ctx.shadowColor = '#fff27a'
      ctx.shadowBlur = this.allowGlow() ? 14 : 0
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(18, 0)
      ctx.lineTo(-10, -12)
      ctx.lineTo(-5, 0)
      ctx.lineTo(-10, 12)
      ctx.closePath()
      ctx.stroke()
      ctx.fill()
      ctx.restore()

      ctx.save()
      ctx.fillStyle = '#fff27a'
      ctx.font = '12px Courier New'
      ctx.textAlign = edge.x > this.width - 120 ? 'right' : edge.x < 120 ? 'left' : 'center'
      const labelX = clamp(edge.x, 64, this.width - 64)
      const labelY = clamp(edge.y - 20, topMargin, this.height - 52)
      ctx.fillText(`STATION ${distance}`, labelX, labelY)
      ctx.restore()
      return
    }
    const pulse = Math.sin(this.returnBeacon.phase * 4) * 0.5 + 0.5
    const radius = this.returnBeacon.radius * this.spaceScale()
    const stationRadius = radius * 0.72
    const dockRadius = radius * 0.34
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.strokeStyle = '#fff27a'
    ctx.fillStyle = 'rgba(87,255,243,0.12)'
    ctx.shadowColor = '#fff27a'
    ctx.shadowBlur = this.allowGlow() ? 24 : 8
    ctx.lineWidth = 2 + pulse
    ctx.beginPath()
    for (let i = 0; i < 8; i += 1) {
      const a = -Math.PI / 8 + (i / 8) * TAU
      if (i === 0) ctx.moveTo(Math.cos(a) * stationRadius, Math.sin(a) * stationRadius)
      else ctx.lineTo(Math.cos(a) * stationRadius, Math.sin(a) * stationRadius)
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = '#57fff3'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let i = 0; i < 6; i += 1) {
      const a = Math.PI / 6 + (i / 6) * TAU
      if (i === 0) ctx.moveTo(Math.cos(a) * dockRadius, Math.sin(a) * dockRadius)
      else ctx.lineTo(Math.cos(a) * dockRadius, Math.sin(a) * dockRadius)
    }
    ctx.closePath()
    ctx.stroke()
    ctx.strokeStyle = '#fff27a'
    ctx.beginPath()
    ctx.moveTo(-stationRadius * 1.12, 0)
    ctx.lineTo(-dockRadius, 0)
    ctx.moveTo(dockRadius, 0)
    ctx.lineTo(stationRadius * 1.12, 0)
    ctx.moveTo(0, -stationRadius * 1.12)
    ctx.lineTo(0, -dockRadius)
    ctx.moveTo(0, dockRadius)
    ctx.lineTo(0, stationRadius * 1.12)
    ctx.stroke()
    ctx.strokeStyle = '#57fff3'
    ctx.beginPath()
    ctx.arc(0, 0, radius * clamp(this.returnBeacon.hold / BEACON_HOLD_SECONDS, 0, 1), 0, TAU)
    ctx.stroke()
    ctx.shadowBlur = 0
    ctx.fillStyle = '#fff27a'
    ctx.font = '12px Courier New'
    ctx.textAlign = 'center'
    ctx.fillText(`STATION ${distance}`, 0, -radius - 16)
    ctx.fillText('DOCKING', 0, radius + 24)
    ctx.restore()
  }

  private renderAutopilot(ctx: CanvasRenderingContext2D) {
    if (this.state !== 'playing' || !this.autoNavActive) return
    const p = this.worldToScreen(this.player.x, this.player.y)
    const target = this.autoNavTargetPlanetId ? this.planets.find((planet) => planet.id === this.autoNavTargetPlanetId) : null
    const beaconTarget = this.autoNavTargetBeacon ? this.returnBeacon : null
    const level = this.navigationCruiseLevel()
    const scale = this.spaceScale()
    const color = beaconTarget ? '#fff27a' : this.build.nav <= 0 ? '#57fff3' : this.build.nav >= 6 ? '#fff27a' : '#70a8ff'
    ctx.save()
    ctx.strokeStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = this.graphicsMode === 'LOW' ? 0 : 14
    ctx.lineWidth = 1.2
    ctx.globalAlpha = this.build.nav <= 0 ? 0.34 : 0.62
    ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    if (target) {
      const t = this.worldToScreen(target.x, target.y)
      ctx.lineTo(t.x, t.y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 0.78
      ctx.beginPath()
      ctx.arc(t.x, t.y, target.radius * scale + 16 * scale + Math.sin(this.stats.time * 5) * 3 * scale, 0, TAU)
      ctx.stroke()
    } else if (beaconTarget) {
      const t = this.worldToScreen(beaconTarget.x, beaconTarget.y)
      ctx.lineTo(t.x, t.y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 0.78
      ctx.beginPath()
      ctx.arc(t.x, t.y, beaconTarget.radius * scale + 12 * scale + Math.sin(this.stats.time * 5) * 4 * scale, 0, TAU)
      ctx.stroke()
    } else {
      const length = (62 + level * 13) * scale
      ctx.lineTo(p.x + Math.cos(this.autoNavHeading) * length, p.y + Math.sin(this.autoNavHeading) * length)
      ctx.stroke()
    }
    ctx.restore()
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
    for (const b of this.bullets) {
      const p = this.worldToScreen(b.x, b.y)
      if (p.x < -80 || p.x > this.width + 80 || p.y < -80 || p.y > this.height + 80) continue
      ctx.save()
      ctx.strokeStyle = b.color
      ctx.shadowColor = b.color
      ctx.shadowBlur = this.allowGlow() ? (b.rail ? 18 : b.option ? 16 : 10) : 0
      ctx.lineWidth = b.rail ? 3 : b.option ? 2.4 : 2
      ctx.beginPath()
      if (b.mine) {
        const radius = b.radius * scale
        ctx.arc(p.x, p.y, radius, 0, TAU)
        ctx.moveTo(p.x - radius, p.y)
        ctx.lineTo(p.x + radius, p.y)
      } else {
        const tail = norm(b.vx, b.vy)
        if (signature.pulseWake && !b.hostile) {
          ctx.globalAlpha = b.rail ? 0.35 : 0.28
          ctx.beginPath()
          ctx.arc(p.x - tail.x * 5 * scale, p.y - tail.y * 5 * scale, (b.radius + 5) * scale, 0, TAU)
          ctx.stroke()
          ctx.globalAlpha = 1
          ctx.beginPath()
        }
        if (signature.prismFins && !b.rail && !b.hostile) {
          const side = { x: -tail.y, y: tail.x }
          ctx.globalAlpha = 0.44
          ctx.moveTo(p.x - tail.x * 8 * scale + side.x * 5 * scale, p.y - tail.y * 8 * scale + side.y * 5 * scale)
          ctx.lineTo(p.x + tail.x * 3 * scale, p.y + tail.y * 3 * scale)
          ctx.moveTo(p.x - tail.x * 8 * scale - side.x * 5 * scale, p.y - tail.y * 8 * scale - side.y * 5 * scale)
          ctx.lineTo(p.x + tail.x * 3 * scale, p.y + tail.y * 3 * scale)
          ctx.globalAlpha = 1
        }
        if (b.option && !b.hostile) {
          ctx.globalAlpha = 0.62
          ctx.arc(p.x - tail.x * 3 * scale, p.y - tail.y * 3 * scale, (b.radius + 3.5) * scale, 0, TAU)
          ctx.moveTo(p.x - tail.x * 8 * scale - tail.y * 4 * scale, p.y - tail.y * 8 * scale + tail.x * 4 * scale)
          ctx.lineTo(p.x + tail.x * 4 * scale, p.y + tail.y * 4 * scale)
          ctx.moveTo(p.x - tail.x * 8 * scale + tail.y * 4 * scale, p.y - tail.y * 8 * scale - tail.x * 4 * scale)
          ctx.lineTo(p.x + tail.x * 4 * scale, p.y + tail.y * 4 * scale)
          ctx.globalAlpha = 1
        }
        ctx.moveTo(p.x - tail.x * (b.rail ? 26 : 12) * scale, p.y - tail.y * (b.rail ? 26 : 12) * scale)
        ctx.lineTo(p.x + tail.x * (b.rail ? 16 : 7) * scale, p.y + tail.y * (b.rail ? 16 : 7) * scale)
      }
      ctx.stroke()
      ctx.restore()
    }
  }

  private renderBulletsSimple(ctx: CanvasRenderingContext2D) {
    const scale = this.spaceScale()
    ctx.save()
    ctx.shadowBlur = 0
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(215,255,247,0.82)'
    ctx.beginPath()
    for (const b of this.bullets) {
      const { x, y } = this.worldToScreen(b.x, b.y)
      if (x < -80 || x > this.width + 80 || y < -80 || y > this.height + 80) continue
      const mag = Math.hypot(b.vx, b.vy) || 1
      const tx = b.vx / mag
      const ty = b.vy / mag
      const rear = (b.rail ? 24 : 11) * scale
      const nose = (b.rail ? 15 : 7) * scale
      ctx.moveTo(x - tx * rear, y - ty * rear)
      ctx.lineTo(x + tx * nose, y + ty * nose)
    }
    ctx.stroke()
    ctx.strokeStyle = 'rgba(255,242,122,0.86)'
    ctx.lineWidth = 3
    ctx.beginPath()
    for (const b of this.bullets) {
      if (!b.rail) continue
      const { x, y } = this.worldToScreen(b.x, b.y)
      if (x < -80 || x > this.width + 80 || y < -80 || y > this.height + 80) continue
      const mag = Math.hypot(b.vx, b.vy) || 1
      const tx = b.vx / mag
      const ty = b.vy / mag
      ctx.moveTo(x - tx * 28 * scale, y - ty * 28 * scale)
      ctx.lineTo(x + tx * 18 * scale, y + ty * 18 * scale)
    }
    ctx.stroke()
    ctx.restore()
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

  private renderPickups(ctx: CanvasRenderingContext2D) {
    const highLoad = this.isHighLoad()
    const scale = this.spaceScale()
    for (const p of this.pickups) {
      const s = this.worldToScreen(p.x, p.y)
      if (s.x < -60 || s.x > this.width + 60 || s.y < -60 || s.y > this.height + 60) continue
      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.strokeStyle = p.color
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = highLoad ? 0 : this.allowGlow() ? 18 : 10
      ctx.lineWidth = 2
      const pulse = 1 + Math.sin(this.stats.time * 5 + p.value) * 0.08
      const r = p.radius * pulse * scale
      const outerGlow = p.kind === 'xp' ? r + pickupBalance.xp.radius : r + pickupBalance.defaultRadius
      ctx.globalAlpha = 0.28
      ctx.beginPath()
      ctx.arc(0, 0, outerGlow, 0, TAU)
      ctx.stroke()
      ctx.globalAlpha = 0.95
      ctx.beginPath()
      if (p.kind === 'xp') {
        ctx.arc(0, 0, Math.max(4, r * 0.55), 0, TAU)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.moveTo(-r - 3, 0)
        ctx.lineTo(r + 3, 0)
        ctx.moveTo(0, -r - 3)
        ctx.lineTo(0, r + 3)
      } else if (p.kind === 'chest') {
        ctx.roundRect(-r, -r * 0.72, r * 2, r * 1.44, 4)
        ctx.moveTo(-r, -r * 0.18)
        ctx.lineTo(r, -r * 0.18)
        ctx.moveTo(0, -r * 0.72)
        ctx.lineTo(0, r * 0.72)
      } else if (p.kind === 'repair') {
        ctx.arc(0, 0, r, 0, TAU)
        ctx.moveTo(-r * 0.58, 0)
        ctx.lineTo(r * 0.58, 0)
        ctx.moveTo(0, -r * 0.58)
        ctx.lineTo(0, r * 0.58)
      } else if (p.kind === 'magnet') {
        ctx.arc(0, 0, r, Math.PI * 0.18, Math.PI * 0.82)
        ctx.moveTo(-r * 0.82, r * 0.18)
        ctx.lineTo(-r * 0.82, r * 0.76)
        ctx.moveTo(r * 0.82, r * 0.18)
        ctx.lineTo(r * 0.82, r * 0.76)
      } else {
        ctx.arc(0, 0, r, 0, TAU)
      }
      ctx.stroke()
      if (p.kind === 'xp') {
        ctx.globalAlpha = 0.42
        ctx.beginPath()
        ctx.arc(0, 0, r + pickupBalance.xp.outerHalo, 0, TAU)
        ctx.stroke()
      }
      ctx.restore()
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    const highLoad = this.isHighLoad()
    if (highLoad) {
      this.renderParticlesSimple(ctx)
      return
    }
    const surfaceMode = this.surface && (this.state === 'surface' || this.state === 'takeoff' || (this.state === 'landing' && this.transitionTimer / this.transitionDuration > 0.58))
    ctx.save()
    ctx.globalCompositeOperation = this.allowGlow() ? 'lighter' : 'source-over'
    const visibleBudget = highLoad ? 160 : MAX_PARTICLES
    let drawn = 0
    for (const p of this.particles) {
      const s = this.effectToScreen(p.x, p.y)
      if (s.x < -80 || s.x > this.width + 80 || s.y < -80 || s.y > this.height + 80) continue
      if (drawn++ > visibleBudget) break
      ctx.save()
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1)
      ctx.strokeStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = this.allowGlow() ? p.glow ?? 10 : 0
      ctx.lineWidth = p.sides ? 1.5 : clamp(p.size, 1, 3)
      ctx.translate(s.x, s.y)
      ctx.rotate(p.angle ?? 0)
      if (!surfaceMode) ctx.scale(this.spaceScale(), this.spaceScale())
      ctx.beginPath()
      if (p.sides && p.sides > 2) {
        for (let i = 0; i < p.sides; i += 1) {
          const a = (i / p.sides) * TAU
          const r = p.size * (i % 2 ? 0.55 : 1)
          const x = Math.cos(a) * r
          const y = Math.sin(a) * r
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
      } else {
        const length = p.length ?? Math.hypot(p.vx, p.vy) * 0.04
        ctx.moveTo(0, 0)
        ctx.lineTo(-length, 0)
      }
      ctx.stroke()
      ctx.restore()
    }
    ctx.restore()
  }

  private renderParticlesSimple(ctx: CanvasRenderingContext2D) {
    const surfaceMode = this.surface && (this.state === 'surface' || this.state === 'takeoff' || (this.state === 'landing' && this.transitionTimer / this.transitionDuration > 0.58))
    const camX = surfaceMode ? this.surface!.camera.x : this.camera.x
    const camY = surfaceMode ? this.surface!.camera.y : this.camera.y
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 0.78
    ctx.strokeStyle = 'rgba(215,255,247,0.76)'
    ctx.lineWidth = 1
    ctx.beginPath()
    let drawn = 0
    for (const p of this.particles) {
      const screen = surfaceMode ? { x: p.x - camX, y: p.y - camY } : this.worldToScreen(p.x, p.y)
      const x = screen.x
      const y = screen.y
      if (x < -80 || x > this.width + 80 || y < -80 || y > this.height + 80) continue
      if (drawn++ > 140) break
      const alpha = clamp(p.life / p.maxLife, 0, 1)
      const length = Math.max(3, (p.length ?? Math.hypot(p.vx, p.vy) * 0.035) * alpha * (surfaceMode ? 1 : this.spaceScale()))
      const mag = Math.hypot(p.vx, p.vy) || 1
      ctx.moveTo(x, y)
      ctx.lineTo(x - (p.vx / mag) * length, y - (p.vy / mag) * length)
    }
    ctx.stroke()
    ctx.restore()
  }

  private renderShockwaves(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.globalCompositeOperation = this.allowGlow() ? 'lighter' : 'source-over'
    const highLoad = this.isHighLoad()
    const glow = this.allowGlow()
    for (const w of this.shockwaves) {
      const s = this.effectToScreen(w.x, w.y)
      const radius = w.radius * (this.surface && (this.state === 'surface' || this.state === 'takeoff' || (this.state === 'landing' && this.transitionTimer / this.transitionDuration > 0.58)) ? 1 : this.spaceScale())
      if (s.x + radius < -120 || s.x - radius > this.width + 120 || s.y + radius < -120 || s.y - radius > this.height + 120) continue
      const alpha = clamp(w.life / w.maxLife, 0, 1)
      const points = highLoad ? 10 : glow ? 28 : 18
      ctx.save()
      ctx.globalAlpha = alpha * 0.92
      ctx.strokeStyle = w.color
      ctx.shadowColor = w.color
      ctx.shadowBlur = glow ? 42 : highLoad ? 0 : 22
      ctx.lineWidth = (glow ? 2.6 : 2) + alpha * (glow ? 4.6 : 3)
      ctx.beginPath()
      for (let i = 0; i <= points; i += 1) {
        const a = (i / points) * TAU
        const wobble = Math.sin(a * 5 + w.jag) * 0.12 + Math.sin(a * 9 - w.jag) * 0.06
        const r = radius * (1 + wobble)
        const x = s.x + Math.cos(a) * r
        const y = s.y + Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.globalAlpha = alpha * (glow ? 0.42 : 0.25)
      ctx.lineWidth = glow ? 12 : 8
      ctx.stroke()
      if (glow) {
        ctx.globalAlpha = alpha * 0.2
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let i = 0; i < 10; i += 1) {
          const a = (i / 10) * TAU + w.jag
          ctx.moveTo(s.x + Math.cos(a) * radius * 0.18, s.y + Math.sin(a) * radius * 0.18)
          ctx.lineTo(s.x + Math.cos(a) * radius * 0.96, s.y + Math.sin(a) * radius * 0.96)
        }
        ctx.stroke()
      }
      ctx.restore()
    }
    ctx.restore()
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
    const color = evolved ? '#fff27a' : '#8fff7d'
    ctx.save()
    ctx.globalCompositeOperation = glow ? 'lighter' : 'source-over'
    ctx.strokeStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = glow ? 28 : this.isHighLoad() ? 0 : 14
    ctx.globalAlpha = this.isHighLoad() ? 0.18 : 0.26
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, 0, TAU)
    ctx.stroke()
    ctx.globalAlpha = 1
    for (let i = 0; i < count; i += 1) {
      const a = this.optionOrbAngle(i, count)
      const x = center.x + Math.cos(a) * radius
      const y = center.y + Math.sin(a) * radius
      const orbRadius = (evolved ? 7.2 : 6.2) * scale
      const coreRadius = (evolved ? 2.8 : 2.2) * scale
      const side = { x: -Math.sin(a), y: Math.cos(a) }
      ctx.beginPath()
      ctx.arc(center.x, center.y, radius, a - 0.52, a - 0.12)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x, y, orbRadius, 0, TAU)
      ctx.moveTo(x - side.x * orbRadius * 1.45, y - side.y * orbRadius * 1.45)
      ctx.lineTo(x + side.x * orbRadius * 1.45, y + side.y * orbRadius * 1.45)
      ctx.moveTo(x + Math.cos(a) * coreRadius, y + Math.sin(a) * coreRadius)
      ctx.arc(x, y, coreRadius, 0, TAU)
      ctx.stroke()
      if (glow) {
        ctx.globalAlpha = 0.28
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.arc(x, y, orbRadius * 1.18, 0, TAU)
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.lineWidth = 1
      }
    }
    ctx.restore()
  }

  private renderLandingPrompt(ctx: CanvasRenderingContext2D) {
    if (this.state !== 'playing') return
    const planet = this.planets.find((p) => Math.sqrt(dist2(p, this.player)) < p.radius + 86)
    if (!planet) return
    const s = this.worldToScreen(planet.x, planet.y - planet.radius - 42)
    ctx.save()
    ctx.fillStyle = '#fff27a'
    ctx.font = this.width < 560 ? '11px Courier New' : '13px Courier New'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#fff27a'
    ctx.shadowBlur = 12
    const x = clamp(s.x, this.width < 560 ? 86 : 18, this.width - (this.width < 560 ? 86 : 18))
    if (this.width < 560) {
      ctx.fillText('PRESS E / Y TO LAND', x, s.y - 7, this.width - 24)
      ctx.fillText(planet.name, x, s.y + 8, this.width - 24)
    } else {
      ctx.fillText(`PRESS E / Y TO LAND: ${planet.name}`, x, s.y, this.width - 24)
    }
    ctx.restore()
  }

  private renderMinimap() {
    const ctx = this.miniCtx
    const w = 154
    const h = 154
    const scale = CHUNK_SIZE * (CHUNK_LOAD_RADIUS * 2 + 1)
    const toMini = (x: number, y: number) => ({
      x: w / 2 + ((x - this.player.x) / scale) * w,
      y: h / 2 + ((y - this.player.y) / scale) * h
    })
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(2,8,12,0.72)'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(87,255,243,0.5)'
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1)
    ctx.strokeStyle = 'rgba(87,255,243,0.18)'
    ctx.beginPath()
    ctx.moveTo(w / 2, 8)
    ctx.lineTo(w / 2, h - 8)
    ctx.moveTo(8, h / 2)
    ctx.lineTo(w - 8, h / 2)
    ctx.stroke()
    for (const p of this.planets) {
      const m = toMini(p.x, p.y)
      if (m.x < -6 || m.x > w + 6 || m.y < -6 || m.y > h + 6) continue
      ctx.strokeStyle = p.visited ? '#8fff7d' : p.color
      ctx.beginPath()
      ctx.arc(m.x, m.y, p.visited ? 4 : 3, 0, TAU)
      ctx.stroke()
    }
    for (const e of this.enemies.slice(0, 70)) {
      const m = toMini(e.x, e.y)
      if (m.x < 0 || m.x > w || m.y < 0 || m.y > h) continue
      ctx.fillStyle = e.kind === 'warden' ? '#b990ff' : '#ff5d73'
      ctx.fillRect(m.x - 1, m.y - 1, 2, 2)
    }
    ctx.fillStyle = '#57fff3'
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, 4, 0, TAU)
    ctx.fill()
  }

  private updateHud() {
    this.ui.score.textContent = Math.floor(this.stats.score).toString()
    this.ui.time.textContent = formatTime(this.stats.time)
    this.ui.wave.textContent = this.stats.kills.toString()
    this.ui.high.textContent = Math.max(this.stats.highScore, this.stats.score).toString()
    const beaconText = this.returnBeacon
      ? ` // STATION ${Math.floor(Math.sqrt(dist2(this.returnBeacon, this.player)))}`
      : ''
    this.ui.resources.textContent = `Scrap ${this.resources.scrap}  Crystals ${this.resources.crystal}  Cores ${this.resources.cores}${beaconText}`
    if (this.state === 'surface' && this.surface) {
      this.ui.hullLabel.textContent = 'HEALTH'
      this.ui.xpLabel.textContent = 'O2'
      this.ui.hull.textContent = `${Math.ceil(this.surface.pilot.health)}/${this.surface.pilot.maxHealth}`
      this.ui.level.textContent = `${Math.ceil(this.surface.pilot.oxygen)}s`
      this.ui.hullFill.style.width = `${clamp((this.surface.pilot.health / this.surface.pilot.maxHealth) * 100, 0, 100)}%`
      this.ui.xpFill.style.width = `${clamp((this.surface.pilot.oxygen / this.surface.pilot.maxOxygen) * 100, 0, 100)}%`
    } else {
      this.ui.hullLabel.textContent = 'HULL'
      this.ui.xpLabel.textContent = 'XP'
      this.ui.level.textContent = `LV ${this.stats.level}`
      const shield = this.player.maxShield > 0 ? ` +${Math.floor(this.player.shield)}` : ''
      this.ui.hull.textContent = `${Math.ceil(Math.max(0, this.player.hull))}/${this.player.maxHull}${shield}`
      this.ui.hullFill.style.width = `${clamp((Math.max(0, this.player.hull) / this.player.maxHull) * 100, 0, 100)}%`
      this.ui.xpFill.style.width = `${clamp((this.stats.xp / this.stats.nextXp) * 100, 0, 100)}%`
    }
    this.updateTouchHud()
    this.updatePerfHud()
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
      canPlanetLock: Boolean(!this.autoNavTargetPlanetId && !stationAvailable && this.build.nav >= powerupBalance.ship.navPlanetLockRank && this.planets.length)
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

  private renderCollectionScreen() {
    return uiRenderCollectionScreen(this)
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
    this.ui.planet.innerHTML = ''
    const panel = document.createElement('div')
    panel.className = 'panel planet-panel'
    const h = document.createElement('h1')
    h.className = 'title'
    h.textContent = p.name
    const copy = document.createElement('p')
    copy.className = 'copy'
    const scanner = this.mothership.departments.scanner
    const risk = this.planetRiskLabel(p)
    copy.textContent = p.visited
      ? `${p.biome.label}. The dock remembers you. It offers a small repair and a moment of quiet.`
      : scanner >= 3
        ? `${p.biome.label}. ${p.reward} Risk: ${risk}.`
        : scanner >= 1
          ? `${p.biome.label.toUpperCase()} // ${p.archetype.toUpperCase()} SIGNAL // ${p.reward}`
          : `${p.biome.label}. ${p.reward}`
    const row = document.createElement('div')
    row.className = 'button-row'
    const land = document.createElement('button')
    land.className = 'vector-button'
    land.textContent = p.visited ? 'Dock' : 'Land and Salvage'
    land.addEventListener('click', () => this.confirmLanding())
    const leave = document.createElement('button')
    leave.className = 'vector-button secondary'
    leave.textContent = 'Break Orbit'
    leave.addEventListener('click', () => {
      this.state = 'playing'
      this.showOnly(null)
    })
    row.append(land, leave)
    panel.append(h, copy, row)
    this.ui.planet.append(panel)
    this.showOnly('planet')
  }

  private planetRiskLabel(p: Planet) {
    if (p.archetype === 'horde') return 'EXTREME'
    if (p.archetype === 'hostile' || p.archetype === 'strange') return 'HOSTILE'
    if (p.archetype === 'relic' || p.archetype === 'cache') return 'UNSTABLE'
    return 'QUIET'
  }

  private showTitle() {
    this.state = 'title'
    this.ui.title.innerHTML = ''
    this.ui.title.className = 'screen title-screen'
    const recordCount = Object.keys(this.mothership.archive.records).length
    const maxedDepartments = Object.values(this.mothership.departments).filter((tier) => tier > 0).length
    const panel = document.createElement('div')
    panel.className = 'title-panel'
    const top = document.createElement('div')
    top.className = 'front-menu-top'
    const quit = document.createElement('button')
    quit.className = 'front-menu-pill danger'
    quit.type = 'button'
    quit.textContent = 'Quit'
    quit.addEventListener('click', () => this.toast('SIGNAL HELD'))
    const cargo = document.createElement('div')
    cargo.className = 'front-menu-cargo'
    cargo.innerHTML = `<img src="${titleLogoMarkUrl}" alt=""><b>${this.mothership.resources.cores}</b>`
    const options = document.createElement('button')
    options.className = 'front-menu-pill'
    options.type = 'button'
    options.textContent = 'Options'
    options.addEventListener('click', () => this.cycleGraphicsMode())
    top.append(quit, cargo, options)

    const wordmark = document.createElement('h1')
    wordmark.className = 'title-wordmark'
    wordmark.innerHTML = '<span>GALACTIC</span><span>HORDES</span>'
    const spacer = document.createElement('div')
    spacer.className = 'front-menu-spacer'
    const row = document.createElement('div')
    row.className = 'title-actions'
    const start = document.createElement('button')
    start.className = 'vector-button start-button'
    start.textContent = 'Start'
    start.addEventListener('click', () => this.showMothership())
    const collection = document.createElement('button')
    collection.className = 'vector-button secondary'
    collection.textContent = 'Collection'
    collection.addEventListener('click', () => this.showCollection())
    const powerups = document.createElement('button')
    powerups.className = 'vector-button'
    powerups.textContent = 'Power Up'
    powerups.addEventListener('click', () => this.showPowerUps())
    const scores = document.createElement('button')
    scores.className = 'vector-button secondary'
    scores.textContent = 'Scores'
    scores.addEventListener('click', () => this.showScores())
    const reset = document.createElement('button')
    reset.className = 'vector-button secondary danger tiny'
    reset.textContent = 'Reset Progress'
    reset.addEventListener('click', () => {
      if (reset.dataset.confirm === 'true') {
        this.resetPersistentProgress()
        return
      }
      reset.dataset.confirm = 'true'
      reset.textContent = 'Confirm Reset'
    })
    const footer = document.createElement('div')
    footer.className = 'front-menu-footer'
    footer.innerHTML = `
      <span><b>${recordCount}</b> discoveries</span>
      <span><b>${maxedDepartments}</b> systems</span>
      <span><b>${this.highs[0]?.score ?? 0}</b> best</span>
    `
    row.append(start, collection, powerups, scores, reset)
    panel.append(top, wordmark, spacer, row, footer)
    this.ui.title.append(panel)
    this.showOnly('title')
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
    this.state = 'collection'
    this.ui.collection.innerHTML = ''
    this.ui.collection.className = 'screen collection-route-screen'
    const shell = document.createElement('div')
    shell.className = 'front-subscreen collection-subscreen'
    const header = document.createElement('header')
    header.className = 'front-subscreen-head'
    header.innerHTML = `
      <div><span>RELICS / COLLECTION</span><h1>ARCHIVE</h1></div>
      <p>${Object.keys(this.mothership.archive.records).length} recovered records stored in mothership memory.</p>
    `
    const back = document.createElement('button')
    back.className = 'vector-button secondary'
    back.type = 'button'
    back.textContent = 'Back'
    back.addEventListener('click', () => this.showTitle())
    header.append(back)
    shell.append(header, this.renderCollectionScreen())
    this.ui.collection.append(shell)
    this.showOnly('collection')
    this.restoreFrontScreenScroll('collection', options.scrollTop)
  }

  private showPowerUps(options: { scrollTop?: number } = {}) {
    this.state = 'powerups'
    this.ui.powerups.innerHTML = ''
    this.ui.powerups.className = 'screen powerups-route-screen'
    const shell = document.createElement('div')
    shell.className = 'front-subscreen powerups-subscreen'
    const header = document.createElement('header')
    header.className = 'front-subscreen-head'
    header.innerHTML = `
      <div><span>POWER UP</span><h1>META SYSTEMS</h1></div>
      <p>Spend recovered cargo on permanent mothership departments before launching.</p>
    `
    const resources = document.createElement('div')
    resources.className = 'mothership-resources front-subscreen-resources'
    resources.innerHTML = `
      <span><b>Scrap</b>${this.mothership.resources.scrap}</span>
      <span><b>Crystals</b>${this.mothership.resources.crystal}</span>
      <span><b>Cores</b>${this.mothership.resources.cores}</span>
    `
    const back = document.createElement('button')
    back.className = 'vector-button secondary'
    back.type = 'button'
    back.textContent = 'Back'
    back.addEventListener('click', () => this.showTitle())
    header.append(resources, back)
    shell.append(header, uiRenderMothershipMetaSystems(this))
    this.ui.powerups.append(shell)
    this.showOnly('powerups')
    this.restoreFrontScreenScroll('powerups', options.scrollTop)
  }

  private showScores() {
    this.state = 'scores'
    this.ui.scores.innerHTML = ''
    const panel = document.createElement('div')
    panel.className = 'panel'
    const h = document.createElement('h1')
    h.className = 'title'
    h.textContent = 'HIGH SCORES'
    const table = document.createElement('table')
    table.className = 'score-table'
    table.innerHTML = '<thead><tr><th>Pilot</th><th>Score</th><th>Time</th><th>Level</th><th>Kills</th></tr></thead>'
    const body = document.createElement('tbody')
    for (const s of this.highs.slice(0, 8)) {
      const tr = document.createElement('tr')
      tr.innerHTML = `<td>${this.escape(s.name)}</td><td>${s.score}</td><td>${formatTime(s.time)}</td><td>${s.level}</td><td>${s.kills}</td>`
      body.append(tr)
    }
    if (!body.children.length) {
      const tr = document.createElement('tr')
      tr.innerHTML = '<td colspan="5">No signals recorded yet.</td>'
      body.append(tr)
    }
    table.append(body)
    const row = document.createElement('div')
    row.className = 'button-row'
    const back = document.createElement('button')
    back.className = 'vector-button'
    back.textContent = 'Back'
    back.addEventListener('click', () => this.showTitle())
    const reset = document.createElement('button')
    reset.className = 'vector-button secondary danger'
    reset.textContent = 'Reset Save'
    reset.addEventListener('click', () => {
      if (reset.dataset.confirm === 'true') {
        this.resetPersistentProgress()
        return
      }
      reset.dataset.confirm = 'true'
      reset.textContent = 'Confirm Reset'
    })
    row.append(back, reset)
    panel.append(h, table, row)
    this.ui.scores.append(panel)
    this.showOnly('scores')
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
    const lightYears = journeyDistanceLy({
      nodesCleared,
      planetsVisited: this.stats.planets,
      stationsDocked: this.stationVisits.length,
      skippedStations: this.skippedReturnBeacons
    })
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
    this.debrief = {
      outcome,
      title: outcome === 'destroyed' ? 'BLACK BOX RECOVERED' : outcome === 'deepExtraction' ? 'DEEP EXPEDITION EXTRACTED' : 'EXPEDITION EXTRACTED',
      copy: outcome === 'destroyed'
        ? 'The scout ship was lost. The mothership recovered partial cargo and all transmitted discoveries.'
        : 'The scout ship docked at a route station. Cargo, signals, and discoveries were processed cleanly.',
      resources: {
        earned: { ...this.resources },
        recovered
      },
      discoveries,
      skippedBeacons: this.skippedReturnBeacons,
      stationVisits: [...this.stationVisits],
      lightYears
    }
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
    this.state = 'sectorMap'
    this.ui.sectorMap.innerHTML = ''
    this.ui.sectorMap.className = 'screen sector-map-screen'
    const panel = document.createElement('div')
    panel.className = 'sector-map-panel'
    const top = document.createElement('div')
    top.className = 'sector-map-top'
    const titleBlock = document.createElement('div')
    titleBlock.className = 'sector-map-title'
    titleBlock.innerHTML = `<span>RUN ROUTE</span><h1>SECTOR MAP</h1><p>${this.escape(message)}</p>`
    const status = document.createElement('div')
    status.className = 'sector-map-status'
    status.innerHTML = `
      <span><b>${this.sectorMap.nodes.filter((node) => node.completed && node.kind !== 'mothership').length}</b> CLEARED</span>
      <span><b>${availableSectorChoices(this.sectorMap).length}</b> ROUTES</span>
      <span><b>${this.resources.scrap}</b> SCRAP</span>
    `
    top.append(titleBlock, status)

    const body = document.createElement('div')
    body.className = 'sector-map-body'
    const choices = availableSectorChoices(this.sectorMap)
    const graph = document.createElement('div')
    graph.className = 'sector-map-graph sector-map-starchart'
    const graphHeader = document.createElement('div')
    graphHeader.className = 'sector-map-graph-header'
    graphHeader.innerHTML = `<span>LOCAL STARCHART</span><b>${choices.length} ROUTES OPEN</b>`
    graph.append(graphHeader)
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.classList.add('sector-map-lines')
    svg.setAttribute('viewBox', '0 0 100 100')
    for (const edge of this.sectorMap.edges) {
      const from = this.sectorMap.nodes.find((node) => node.id === edge.from)
      const to = this.sectorMap.nodes.find((node) => node.id === edge.to)
      if (!from || !to) continue
      const a = this.sectorNodePosition(from)
      const b = this.sectorNodePosition(to)
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', `${a.x}`)
      line.setAttribute('y1', `${a.y}`)
      line.setAttribute('x2', `${b.x}`)
      line.setAttribute('y2', `${b.y}`)
      line.classList.add(from.completed && to.completed ? 'completed' : from.id === this.sectorMap.currentNodeId ? 'available' : 'locked')
      svg.append(line)
    }
    graph.append(svg)
    for (const node of this.sectorMap.nodes) {
      const pos = this.sectorNodePosition(node)
      const isAvailable = choices.some((choice) => choice.id === node.id)
      const stationVisit = this.stationVisits.find((visit) => visit.nodeId === node.id)
      const stateLabel = stationVisit ? 'DOCKED' : node.completed ? 'DONE' : node.id === this.sectorMap.currentNodeId ? 'HERE' : isAvailable ? 'OPEN' : 'LOCK'
      const button = document.createElement('button')
      button.type = 'button'
      button.className = this.sectorNodeClass(node, choices)
      button.style.left = `${pos.x}%`
      button.style.top = `${pos.y}%`
      button.dataset.label = node.label
      button.setAttribute('aria-label', `${this.sectorKindLabel(node.kind)}: ${node.label}`)
      button.innerHTML = `
        <span class="sector-node-core"><span class="sector-node-glyph">${this.sectorNodeGlyph(node.kind)}</span></span>
        <span class="sector-node-label">${this.escape(node.label.replace(/\s+\d+-\d+$/, ''))}</span>
        <span class="sector-node-state">${stateLabel}</span>
      `
      button.title = stationVisit ? `${stationVisit.stationName}: ${stationVisit.contactName}, ${stationVisit.contactRole}` : `${node.label}: ${node.description}`
      button.disabled = !isAvailable
      button.addEventListener('click', () => this.launchSectorNode(node.id))
      graph.append(button)
    }
    const legend = document.createElement('div')
    legend.className = 'sector-map-legend'
    legend.innerHTML = `
      <span><i class="legend-swatch planet"></i>Planet</span>
      <span><i class="legend-swatch hostile"></i>Combat</span>
      <span><i class="legend-swatch anomaly"></i>Hazard</span>
      <span><i class="legend-swatch station"></i>Station</span>
    `
    graph.append(legend)

    const details = document.createElement('div')
    details.className = 'sector-map-details'
    const current = currentSectorNode(this.sectorMap)
    const currentStationVisit = this.stationVisits.find((visit) => visit.nodeId === current.id)
    const heading = document.createElement('div')
    heading.className = 'sector-map-current'
    heading.innerHTML = currentStationVisit
      ? `<span>CURRENT NODE // DOCKED</span><h2>${this.escape(currentStationVisit.stationName)}</h2><p>${this.escape(`${currentStationVisit.contactName}, ${currentStationVisit.contactRole}: ${currentStationVisit.rumor}`)}</p>`
      : `<span>CURRENT NODE</span><h2>${this.escape(current.label)}</h2><p>${this.escape(current.description)}</p>`
    const list = document.createElement('div')
    list.className = 'sector-choice-list'
    for (const choice of choices) {
      const profile = sectorNodeRunProfile(choice)
      const hazards = this.sectorHazardsLabel(choice.config.hazards)
      const planets = this.sectorPlanetLabel(choice.config.planets.countMin, choice.config.planets.countMax)
      const option = document.createElement('button')
      option.type = 'button'
      option.className = `sector-choice ${choice.kind}`
      option.innerHTML = `
        <span class="sector-choice-head">
          <span class="sector-choice-kind">${this.escape(this.sectorKindLabel(choice.kind))}</span>
          <b class="sector-choice-title">${this.escape(choice.label)}</b>
        </span>
        <small>${this.escape(choice.config.readout)}</small>
        <span class="sector-choice-metrics" aria-label="Route metrics">
          <span><b>${planets}</b><em>PLANETS</em></span>
          <span><b>${choice.config.waves.length}</b><em>${this.sectorWaveLabel(choice.config.waveOrder)}</em></span>
          <span><b>x${profile.spawnMultiplier.toFixed(2)}</b><em>PRESSURE</em></span>
          <span><b>${this.escape(hazards)}</b><em>HAZARDS</em></span>
        </span>
        <i class="sector-choice-readout">${this.escape(this.sectorNodeConfigSummary(choice, profile))}</i>
      `
      option.addEventListener('click', () => this.launchSectorNode(choice.id))
      list.append(option)
    }
    if (!choices.length) {
      const empty = document.createElement('p')
      empty.className = 'copy small'
      empty.textContent = 'No forward route is open yet.'
      list.append(empty)
    }
    list.append(this.sectorMapDebugReadout())
    details.append(heading, list)
    body.append(graph, details)
    panel.append(top, body)
    this.ui.sectorMap.append(panel)
    this.showOnly('sectorMap')
  }

  private sectorNodePosition(node: SectorNode) {
    const x = 8 + (node.column / Math.max(1, this.sectorMap.columns - 1)) * 84
    const y = node.id === 'mothership' ? 48 : node.kind === 'final' ? 48 : 18 + node.row * 20
    return { x, y }
  }

  private sectorNodeClass(node: SectorNode, choices: SectorNode[]) {
    const classes = ['sector-node', node.kind]
    if (node.completed) classes.push('completed')
    if (node.id === this.sectorMap.currentNodeId) classes.push('current')
    if (choices.some((choice) => choice.id === node.id)) classes.push('available')
    if (!node.completed && node.id !== this.sectorMap.currentNodeId && !choices.some((choice) => choice.id === node.id)) classes.push('locked')
    return classes.join(' ')
  }

  private sectorNodeGlyph(kind: SectorNode['kind']) {
    return {
      mothership: 'M',
      hostile: 'H',
      planet: 'P',
      station: 'S',
      anomaly: 'A',
      boss: 'B',
      final: 'F'
    }[kind]
  }

  private sectorKindLabel(kind: SectorNode['kind']) {
    return {
      mothership: 'MOTHERSHIP',
      hostile: 'COMBAT',
      planet: 'PLANET',
      station: 'STATION',
      anomaly: 'ANOMALY',
      boss: 'BOSS',
      final: 'FINAL'
    }[kind]
  }

  private sectorWaveLabel(wave: SectorWaveOrder) {
    return {
      scouts: 'SCOUTS',
      swarm: 'SWARM',
      ambush: 'AMBUSH',
      bulwark: 'BULWARK',
      cathedral: 'CATHEDRAL'
    }[wave]
  }

  private sectorNodeConfigSummary(node: SectorNode, profile: SectorNodeRunProfile) {
    if (node.kind === 'station') return 'REPAIR / WORKBENCH / SCAN'
    const modifierSummary = [
      profile.enemyPacket.id === 'baseline' ? '' : profile.enemyPacket.label,
      profile.rewardShape.id === 'balanced' ? '' : profile.rewardShape.label,
      ...profile.modifiers.map((modifier) => modifier.label)
    ].filter(Boolean).slice(0, 3).join(' + ')
    return [
      `PLANETS ${this.sectorPlanetLabel(node.config.planets.countMin, node.config.planets.countMax)}`,
      `WAVES ${node.config.waves.length} ${this.sectorWaveLabel(node.config.waveOrder)}`,
      `HAZARDS ${this.sectorHazardsLabel(node.config.hazards)}`,
      `PRESSURE x${profile.spawnMultiplier.toFixed(2)}`,
      modifierSummary
    ].filter(Boolean).join(' / ')
  }

  private sectorMapDebugReadout() {
    const wrap = document.createElement('details')
    wrap.className = 'sector-debug-readout'
    const rows = this.sectorMap.nodes
      .filter((node) => node.kind !== 'mothership')
      .sort((a, b) => a.column - b.column || a.row - b.row)
      .map((node) => {
        const profile = sectorNodeRunProfile(node)
        const waveSummary = node.config.waves.map((wave) => `${wave.atSeconds}s:${wave.label}`).join(', ')
        return `
          <div class="sector-debug-row ${this.escape(node.kind)}">
            <b>${this.escape(node.label)}</b>
            <span>${this.escape(node.config.templateId)} / d${node.config.depth.toFixed(2)} / ${this.escape(node.config.pace)}</span>
            <span>${this.escape(node.config.enemyPacket.label)} / ${this.escape(node.config.rewardShape.label)} / ${this.escape(node.config.modifiers.map((modifier) => modifier.label).join(' + '))}</span>
            <span>PLANETS ${this.sectorPlanetLabel(node.config.planets.countMin, node.config.planets.countMax)} / ${this.escape(node.config.planets.density)} / ${this.escape(this.sectorHazardsLabel(node.config.hazards))}</span>
            <span>PRESSURE x${profile.spawnMultiplier.toFixed(2)} / REWARD x${profile.rewardMultiplier.toFixed(2)} / WAVES ${this.escape(waveSummary)}</span>
          </div>
        `
      })
      .join('')
    wrap.innerHTML = `<summary>ROUTE DEBUG</summary>${rows}`
    return wrap
  }

  private sectorPlanetLabel(min: number, max: number) {
    return min === max ? `${min}` : `${min}-${max}`
  }

  private sectorHazardsLabel(hazards: SectorHazardTag[]) {
    const labels: Record<SectorHazardTag, string> = {
      clear: 'CLEAR',
      asteroids: 'ASTEROIDS',
      hunterWing: 'HUNTER WING',
      derelictCache: 'DERELICT CACHE',
      nebula: 'NEBULA'
    }
    return hazards.map((hazard) => labels[hazard]).join(' + ')
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
    this.toast(`${selected.label}: ${selected.kind === 'final' ? 'SURVIVE THE LAST STAND' : 'DOCK AT STATION TO CLEAR ROUTE'}`)
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
    return {
      nodeId: node.id,
      stationName: visit.stationName,
      nodeLabel: node.label,
      fiction: this.stationFictionForNode(node, visit.stationName, true),
      serviceLine: `Station services are run-only. Hull +${repaired}, workbench ${workbenchSignals > 0 ? `+${workbenchSignals} signal` : 'signal already staged'}, scrap +${scrap}, crystal +${crystal}.`,
      repaired,
      workbenchSignals,
      scrap,
      crystal,
      services: [...node.stationServices],
      contactName: visit.contactName,
      contactRole: visit.contactRole,
      rumor: visit.rumor,
      routeStatus: 'Service berth clear. Route traffic control is holding your next jump.'
    }
  }

  private stationNameForNode(node: SectorNode) {
    return stationMemoryNameForNode(node)
  }

  private stationFictionForNode(node: SectorNode, stationName: string, serviceDock: boolean) {
    const lines = serviceDock
      ? [
          `${stationName} answers with a warm carrier tone. Docking arms fold around the hull and a tired traffic officer stamps your route charter.`,
          `${stationName} smells of hot coolant, recycled coffee, and old jump maps. The berth crew patch the hull while the route board blinks awake.`,
          `${stationName} rotates under your canopy like a brass compass. Service crews swarm the scorch marks and the station AI opens a temporary workbench lane.`
        ]
      : [
          `Welcome to ${stationName}. The docking collar seals with a low magnetic thud while the station master reads your route clearance aloud.`,
          `${stationName} catches the ship on a green-lit gantry. Beyond the glass, freight drones cut silent lanes through the dark.`,
          `A cracked sign over the airlock flickers: WELCOME TO ${stationName}. Your ship settles into the berth and the sector map spools back online.`
        ]
    return lines[hashString(node.id, serviceDock ? 91 : 47) % lines.length]
  }

  private routeStationDockReport(node: SectorNode): StationDockReport {
    const visit = this.recordStationVisit(node, 0, 0, 0, 0)
    return {
      nodeId: node.id,
      stationName: visit.stationName,
      nodeLabel: node.label,
      fiction: this.stationFictionForNode(node, visit.stationName, false),
      serviceLine: this.pendingUpgrades > 0
        ? `${this.pendingUpgrades} mutation signal${this.pendingUpgrades === 1 ? '' : 's'} banked in the station buffer.`
        : 'No mutation signals are waiting in the station buffer.',
      repaired: 0,
      workbenchSignals: 0,
      scrap: 0,
      crystal: 0,
      services: [...node.stationServices],
      contactName: visit.contactName,
      contactRole: visit.contactRole,
      rumor: visit.rumor,
      routeStatus: `${node.label} logged complete. Departure control is ready to hand you back to the sector map.`
    }
  }

  private showStationDock(report: StationDockReport) {
    this.stationDockReport = report
    this.state = 'station'
    this.ui.station.innerHTML = ''
    this.ui.station.className = 'screen station-dock-screen'
    const panel = document.createElement('div')
    panel.className = 'station-command-panel'
    const signalCopy = this.pendingUpgrades > 0
      ? `${this.pendingUpgrades} mutation signal${this.pendingUpgrades === 1 ? '' : 's'} banked`
      : 'No mutation signals banked'
    panel.innerHTML = `
      <div class="station-command-header">
        <span>STATION COMMAND</span>
        <h1>${this.escape(report.stationName)}</h1>
        <p>${this.escape(report.fiction)}</p>
      </div>
      <div class="station-command-status">
        <div><b>${this.escape(report.nodeLabel)}</b><span>route berth</span></div>
        <div><b>${Math.max(0, report.repaired)}</b><span>hull repaired</span></div>
        <div><b>${this.resources.scrap}</b><span>scrap manifest</span></div>
        <div><b>${signalCopy}</b><span>workbench buffer</span></div>
      </div>
    `
    const sections = document.createElement('div')
    sections.className = 'station-command-sections'
    const serviceList = document.createElement('div')
    serviceList.className = 'station-service-list'
    for (const service of report.services) {
      const chip = document.createElement('span')
      chip.textContent = this.stationServiceLabel(service)
      serviceList.append(chip)
    }
    const serviceCopy = document.createElement('p')
    serviceCopy.textContent = report.serviceLine
    const serviceActions = document.createElement('div')
    serviceActions.className = 'station-command-actions'
    const workbench = document.createElement('button')
    workbench.type = 'button'
    workbench.className = 'station-command-button primary'
    workbench.textContent = 'Open Workbench'
    workbench.disabled = this.pendingUpgrades <= 0
    workbench.addEventListener('click', () => this.openStationWorkbench())
    serviceActions.append(workbench)
    const contact = document.createElement('div')
    contact.className = 'station-contact-panel'
    contact.innerHTML = `
      <b>${this.escape(report.contactName)}</b>
      <span>${this.escape(report.contactRole)}</span>
      <p>${this.escape(report.rumor)}</p>
    `
    const cargo = document.createElement('div')
    cargo.className = 'station-cargo-grid'
    cargo.innerHTML = `
      <div><b>${this.resources.scrap}</b><span>SCRAP</span></div>
      <div><b>${this.resources.crystal}</b><span>CRYSTALS</span></div>
      <div><b>${this.resources.cores}</b><span>CORES</span></div>
      <div><b>${this.pendingUpgrades}</b><span>SIGNALS</span></div>
    `
    const routeStatus = document.createElement('p')
    routeStatus.textContent = report.routeStatus
    const routeActions = document.createElement('div')
    routeActions.className = 'station-command-actions'
    const route = document.createElement('button')
    route.type = 'button'
    route.className = 'station-command-button'
    route.textContent = 'Route Map'
    route.addEventListener('click', () => this.leaveStationForSectorMap())
    routeActions.append(route)
    sections.append(
      this.stationCommandSection('SERVICES', 'repair / trade / workbench', [serviceList, serviceCopy, serviceActions], true),
      this.stationCommandSection('CONTACT', report.contactRole.toUpperCase(), [contact], false),
      this.stationCommandSection('CARGO MANIFEST', `${this.resources.scrap} scrap / ${this.resources.crystal} crystal`, [cargo], false),
      this.stationCommandSection('ROUTE MAP', 'departure lane ready', [this.stationRouteMap(report), routeStatus, routeActions], false)
    )
    panel.append(sections)
    this.ui.station.append(panel)
    this.showOnly('station')
  }

  private stationCommandSection(title: string, status: string, children: HTMLElement[], open: boolean) {
    const section = document.createElement('details')
    section.className = 'station-command-section'
    section.open = open
    const summary = document.createElement('summary')
    summary.innerHTML = `<span>${this.escape(title)}</span><b>${this.escape(status)}</b>`
    section.append(summary, ...children)
    return section
  }

  private stationRouteMap(report: StationDockReport) {
    const map = document.createElement('div')
    map.className = 'station-route-map'
    for (const node of this.sectorMap.nodes) {
      const marker = document.createElement('span')
      marker.className = `station-route-node ${node.id === report.nodeId ? 'current' : node.completed ? 'complete' : availableSectorChoices(this.sectorMap).some((choice) => choice.id === node.id) ? 'available' : 'locked'}`
      marker.textContent = this.sectorNodeGlyph(node.kind)
      marker.title = node.id === report.nodeId ? report.stationName : node.label
      map.append(marker)
    }
    return map
  }

  private stationServiceLabel(service: SectorStationService) {
    const labels: Record<SectorStationService, string> = {
      repair: 'Hull Repair',
      workbench: 'Workbench',
      trade: 'Trade',
      scan: 'Route Scan'
    }
    return labels[service]
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
    for (const kind of this.sectorNodeProfile.config.enemies.startingSpawns) this.spawnEnemy(kind)
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
    const screens: Partial<Record<GameState, HTMLElement>> = {
      title: this.ui.title,
      collection: this.ui.collection,
      powerups: this.ui.powerups,
      sectorMap: this.ui.sectorMap,
      station: this.ui.station,
      levelup: this.ui.levelup,
      planet: this.ui.planet,
      gameover: this.ui.gameover,
      scores: this.ui.scores
    }
    for (const [name, el] of Object.entries(screens)) {
      el?.classList.toggle('visible', name === which)
    }
  }

  private installHarnessIfRequested() {
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#\??/, ''))
    const requested = params.get('harness') ?? hashParams.get('harness') ?? ''
    if (!['1', 'true', 'yes'].includes(requested.toLowerCase())) return
    window.__galacticHarness = {
      snapshot: () => ({
        state: this.state,
        time: this.stats.time,
        hull: this.player.hull,
        maxHull: this.player.maxHull,
        score: this.stats.score,
        planets: this.stats.planets,
        resources: { ...this.resources },
        enemies: this.enemies.length,
        pickups: this.pickups.length,
        currentNode: currentSectorNode(this.sectorMap).config.templateId,
        perf: { ...this.perf }
      })
    }
    window.debugSpawnSingleEnemy = (kind, dx, dy) => this.debugSpawnSingleEnemy(kind, dx, dy)
    window.debugPlayerPosition = () => this.debugPlayerPosition()
    window.debugNearestEnemyDistance = () => this.debugNearestEnemyDistance()
    window.debugStepEnemies = (dt) => this.debugStepEnemies(dt)
    window.debugEnemyCount = () => this.debugEnemyCount()
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
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as ScoreEntry[]
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
        key === STORAGE_KEY
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
    const entry: ScoreEntry = {
      name: this.scoreName,
      score: Math.floor(this.stats.score),
      time: this.stats.time,
      level: this.stats.level,
      kills: this.stats.kills,
      date: new Date().toISOString()
    }
    this.highs = [...this.highs, entry].sort((a, b) => b.score - a.score).slice(0, 10)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.highs))
  }

  private escape(value: string) {
    return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[ch]!)
  }
}

declare global {
  interface Window {
    __vectorShooter?: VectorShooter
    __galacticHarness?: {
      snapshot: () => {
        state: GameState
        time: number
        hull: number
        maxHull: number
        score: number
        planets: number
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
  }
}

window.__vectorShooter = new VectorShooter()
