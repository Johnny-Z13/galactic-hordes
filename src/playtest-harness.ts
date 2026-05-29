import { currentSectorNode, type SectorMap } from './sector-map'
import { dist2 } from './math-utils'
import { isGiantEnemyKind, type SpaceEnemyKind } from './space-enemies'
import { advanceScorePopups, type ScorePopupModel } from './score-popups'
import type { GameState } from './game-states'
import type { Enemy, EnemyKind, Vec } from './main-types'
import type { ResourceBundle } from './mothership-progression'
import type { Planet } from './main'

interface PlaytestHarnessHost extends Object {}

interface PlaytestHarnessRuntime {
  autoNavTargetPlanetId: string | null
  debrief: unknown | null
  enemies: Enemy[]
  hitstopUntil: number
  introWaypoint: {
    active: boolean
    timer: number
    targetPlanetId: string | null
  } | null
  pendingUpgrades: number
  perf: {
    updateMs: number
    renderMs: number
    frameMs: number
    fps: number
  }
  pickups: unknown[]
  planets: Planet[]
  player: Vec & {
    hull: number
    maxHull: number
  }
  resources: ResourceBundle
  scorePopups: ScorePopupModel[]
  sectorMap: SectorMap
  state: GameState
  stats: {
    time: number
    kills: number
    level: number
    xp: number
    nextXp: number
    score: number
    planets: number
  }
  ui: {
    objective: HTMLElement
  }
  debugEnemyCount(): number
  debugNearestEnemyDistance(): number
  debugPlayerPosition(): Vec
  debugSpawnSingleEnemy(kind: EnemyKind, dx: number, dy: number): void
  debugStepEnemies(dt: number): void
  killEnemy(enemy: Enemy, award: boolean): void
  startLanding(planet: Planet): void
}

function playtestHarnessRuntime(self: PlaytestHarnessHost) {
  return self as unknown as PlaytestHarnessRuntime
}

export function installPlaytestHarnessIfRequested(self: PlaytestHarnessHost) {
  const params = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#\??/, ''))
  const requested = params.get('harness') ?? hashParams.get('harness') ?? ''
  if (!['1', 'true', 'yes'].includes(requested.toLowerCase())) return
  const runtime = playtestHarnessRuntime(self)
  window.__galacticHarness = {
    snapshot: () => ({
      state: runtime.state,
      time: runtime.stats.time,
      kills: runtime.stats.kills,
      level: runtime.stats.level,
      xp: runtime.stats.xp,
      nextXp: runtime.stats.nextXp,
      hull: runtime.player.hull,
      maxHull: runtime.player.maxHull,
      score: runtime.stats.score,
      planets: runtime.stats.planets,
      pendingUpgrades: runtime.pendingUpgrades,
      lockedPlanetId: runtime.autoNavTargetPlanetId,
      objective: {
        label: runtime.ui.objective.parentElement?.querySelector('.hud-label')?.textContent ?? '',
        text: runtime.ui.objective.textContent ?? ''
      },
      resources: { ...runtime.resources },
      enemies: runtime.enemies.length,
      pickups: runtime.pickups.length,
      currentNode: currentSectorNode(runtime.sectorMap).config.templateId,
      perf: { ...runtime.perf }
    })
  }
  window.debugSpawnSingleEnemy = (kind, dx, dy) => runtime.debugSpawnSingleEnemy(kind, dx, dy)
  window.debugPlayerPosition = () => runtime.debugPlayerPosition()
  window.debugNearestEnemyDistance = () => runtime.debugNearestEnemyDistance()
  window.debugStepEnemies = (dt) => runtime.debugStepEnemies(dt)
  window.debugEnemyCount = () => runtime.debugEnemyCount()
  window.debugForceFirstEverRun = () => {
    runtime.debrief = null
    runtime.stats.planets = 0
    runtime.introWaypoint = null
  }
  window.debugIntroWaypointState = () => {
    const wp = runtime.introWaypoint
    if (!wp) return null
    return { active: wp.active, timer: wp.timer, targetPlanetId: wp.targetPlanetId }
  }
  window.debugLandOnNearestPlanet = () => {
    if (runtime.state !== 'playing') return false
    let nearest = null
    let bestD = Infinity
    for (const planet of runtime.planets) {
      const d = dist2(planet, runtime.player)
      if (d < bestD) { bestD = d; nearest = planet }
    }
    if (!nearest) return false
    runtime.startLanding(nearest)
    return true
  }
  window.debugScorePopupsSnapshot = () => ({
    count: runtime.scorePopups.length,
    texts: runtime.scorePopups.map((sp) => sp.text)
  })
  window.debugStepScorePopups = (dt: number) => advanceScorePopups(runtime.scorePopups, dt)
  window.debugHitstopUntil = () => runtime.hitstopUntil
  window.debugForceKillNearestEnemy = (giant: boolean) => {
    let target = null
    if (giant) {
      target = runtime.enemies.find((enemy: { kind: SpaceEnemyKind }) => isGiantEnemyKind(enemy.kind)) ?? null
    } else {
      let best = Infinity
      for (const enemy of runtime.enemies) {
        if (isGiantEnemyKind(enemy.kind)) continue
        const d = dist2(enemy, runtime.player)
        if (d < best) { best = d; target = enemy }
      }
    }
    if (!target) return false
    runtime.killEnemy(target, true)
    return true
  }
}
