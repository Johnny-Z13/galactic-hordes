import { currentSectorNode } from './sector-map'
import { dist2 } from './math-utils'
import { isGiantEnemyKind, type SpaceEnemyKind } from './space-enemies'
import { advanceScorePopups } from './score-popups'

type PlaytestHarnessGame = Record<string, any>

export function installPlaytestHarnessIfRequested(self: PlaytestHarnessGame) {
  const params = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#\??/, ''))
  const requested = params.get('harness') ?? hashParams.get('harness') ?? ''
  if (!['1', 'true', 'yes'].includes(requested.toLowerCase())) return
  window.__galacticHarness = {
    snapshot: () => ({
      state: self['state'],
      time: self['stats'].time,
      kills: self['stats'].kills,
      level: self['stats'].level,
      xp: self['stats'].xp,
      nextXp: self['stats'].nextXp,
      hull: self['player'].hull,
      maxHull: self['player'].maxHull,
      score: self['stats'].score,
      planets: self['stats'].planets,
      pendingUpgrades: self['pendingUpgrades'],
      lockedPlanetId: self['autoNavTargetPlanetId'],
      objective: {
        label: self['ui'].objective.parentElement?.querySelector('.hud-label')?.textContent ?? '',
        text: self['ui'].objective.textContent ?? ''
      },
      resources: { ...self['resources'] },
      enemies: self['enemies'].length,
      pickups: self['pickups'].length,
      currentNode: currentSectorNode(self['sectorMap']).config.templateId,
      perf: { ...self['perf'] }
    })
  }
  window.debugSpawnSingleEnemy = (kind, dx, dy) => self['debugSpawnSingleEnemy'](kind, dx, dy)
  window.debugPlayerPosition = () => self['debugPlayerPosition']()
  window.debugNearestEnemyDistance = () => self['debugNearestEnemyDistance']()
  window.debugStepEnemies = (dt) => self['debugStepEnemies'](dt)
  window.debugEnemyCount = () => self['debugEnemyCount']()
  window.debugForceFirstEverRun = () => {
    self['debrief'] = null
    self['stats'].planets = 0
    self['introWaypoint'] = null
  }
  window.debugIntroWaypointState = () => {
    const wp = self['introWaypoint']
    if (!wp) return null
    return { active: wp.active, timer: wp.timer, targetPlanetId: wp.targetPlanetId }
  }
  window.debugLandOnNearestPlanet = () => {
    if (self['state'] !== 'playing') return false
    let nearest = null
    let bestD = Infinity
    for (const planet of self['planets']) {
      const d = dist2(planet, self['player'])
      if (d < bestD) { bestD = d; nearest = planet }
    }
    if (!nearest) return false
    self['startLanding'](nearest)
    return true
  }
  window.debugScorePopupsSnapshot = () => ({
    count: self['scorePopups'].length,
    texts: self['scorePopups'].map((sp: { text: string }) => sp.text)
  })
  window.debugStepScorePopups = (dt: number) => advanceScorePopups(self['scorePopups'], dt)
  window.debugHitstopUntil = () => self['hitstopUntil']
  window.debugForceKillNearestEnemy = (giant: boolean) => {
    let target = null
    if (giant) {
      target = self['enemies'].find((enemy: { kind: SpaceEnemyKind }) => isGiantEnemyKind(enemy.kind)) ?? null
    } else {
      let best = Infinity
      for (const enemy of self['enemies']) {
        if (isGiantEnemyKind(enemy.kind)) continue
        const d = dist2(enemy, self['player'])
        if (d < best) { best = d; target = enemy }
      }
    }
    if (!target) return false
    self['killEnemy'](target, true)
    return true
  }
}
