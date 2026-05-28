import { spaceSpawnBalance } from '../game-balance'
import type { VectorShooter } from '../main'
import { dist2 } from '../math-utils'
import { runObjectiveReadout } from '../run-objective-readout'
import { currentSectorNode, sectorNodeDecisionIntel } from '../sector-map'
import { nextSpaceWaveWarning } from '../space-wave-director'

export function currentHudObjectiveReadout(self: VectorShooter) {
  const returnBeaconDistance = self['returnBeacon']
    ? Math.sqrt(dist2(self['returnBeacon'], self['player']))
    : null
  const currentNode = currentSectorNode(self['sectorMap'])
  return runObjectiveReadout({
    state: self['state'],
    routeObjective: currentNode.config.objective,
    routeIntel: sectorNodeDecisionIntel(currentNode),
    elapsed: self['stats'].time,
    nextReturnBeaconAt: self['nextReturnBeaconAt'],
    returnBeaconDistance,
    surfaceEvent: self['surface']?.event ?? null,
    pendingUpgrades: self['pendingUpgrades'],
    waveWarning: self['state'] === 'playing' ? nextSpaceWaveWarning({
      nodeId: self['sectorMap'].currentNodeId,
      waves: self['sectorNodeProfile'].config.waves,
      firedWaveIds: self['firedSectorWaves'],
      elapsed: self['stats'].time - self['sectorNodeStartedAt'],
      warningSeconds: spaceSpawnBalance.sectorWaveWarningSeconds
    }) : null
  })
}
