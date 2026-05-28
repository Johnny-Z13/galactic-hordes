import { spaceSpawnBalance } from '../game-balance'
import type { VectorShooter } from '../main'
import { dist2 } from '../math-utils'
import { runObjectiveReadout } from '../run-objective-readout'
import { currentSectorNode } from '../sector-map'
import { nextSpaceWaveWarning } from '../space-wave-director'

export function currentHudObjectiveReadout(self: VectorShooter) {
  const returnBeaconDistance = self['returnBeacon']
    ? Math.sqrt(dist2(self['returnBeacon'], self['player']))
    : null
  return runObjectiveReadout({
    state: self['state'],
    routeObjective: currentSectorNode(self['sectorMap']).config.objective,
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
