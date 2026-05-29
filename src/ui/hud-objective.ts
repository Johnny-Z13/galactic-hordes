import { spaceSpawnBalance } from '../game-balance'
import { dist2 } from '../math-utils'
import { runObjectiveReadout } from '../run-objective-readout'
import { currentSectorNode, sectorNodeDecisionIntel, type SectorMap, type SectorNodeRunProfile } from '../sector-map'
import { nextSpaceWaveWarning } from '../space-wave-director'
import type { SurfaceEventKind } from '../surface-encounters'

interface HudObjectiveView extends Object {}

interface HudObjectiveRuntime {
  returnBeacon: { x: number; y: number } | null
  player: { x: number; y: number }
  sectorMap: SectorMap
  state: string
  stats: {
    time: number
  }
  nextReturnBeaconAt: number
  surface: { event: SurfaceEventKind } | null
  pendingUpgrades: number
  sectorNodeProfile: SectorNodeRunProfile
  firedSectorWaves: Set<string>
  sectorNodeStartedAt: number
}

function hudObjectiveRuntime(self: HudObjectiveView) {
  return self as HudObjectiveRuntime
}

export function currentHudObjectiveReadout(self: HudObjectiveView) {
  const view = hudObjectiveRuntime(self)
  const returnBeaconDistance = view.returnBeacon
    ? Math.sqrt(dist2(view.returnBeacon, view.player))
    : null
  const currentNode = currentSectorNode(view.sectorMap)
  return runObjectiveReadout({
    state: view.state,
    routeObjective: currentNode.config.objective,
    routeIntel: sectorNodeDecisionIntel(currentNode),
    elapsed: view.stats.time,
    nextReturnBeaconAt: view.nextReturnBeaconAt,
    returnBeaconDistance,
    surfaceEvent: view.surface?.event ?? null,
    pendingUpgrades: view.pendingUpgrades,
    waveWarning: view.state === 'playing' ? nextSpaceWaveWarning({
      nodeId: view.sectorMap.currentNodeId,
      waves: view.sectorNodeProfile.config.waves,
      firedWaveIds: view.firedSectorWaves,
      elapsed: view.stats.time - view.sectorNodeStartedAt,
      warningSeconds: spaceSpawnBalance.sectorWaveWarningSeconds
    }) : null
  })
}
