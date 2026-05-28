import { buildDebriefReport, type DebriefReport } from '../debrief-report'
import {
  applyRunRecovery,
  type MothershipState,
  type PersistentArchiveRecord,
  type ResourceBundle,
  type RunOutcomeKind
} from '../mothership-progression'
import type { StationVisitRecord } from '../station-memory'

export interface FinishedRunInput {
  mothership: MothershipState
  outcome: RunOutcomeKind
  earnedResources: ResourceBundle
  archiveRecords: Record<string, PersistentArchiveRecord>
  nodesCleared: number
  planetsVisited: number
  skippedBeacons: number
  stationVisits: StationVisitRecord[]
}

export interface FinishedRunResult {
  mothership: MothershipState
  recoveredResources: ResourceBundle
  debrief: DebriefReport
}

export function resolveFinishedRun(input: FinishedRunInput): FinishedRunResult {
  const mothership = applyRunRecovery(input.mothership, {
    outcome: input.outcome,
    resources: input.earnedResources,
    archiveRecords: input.archiveRecords,
    skippedBeacons: input.skippedBeacons
  })
  const recoveredResources = {
    scrap: mothership.resources.scrap - input.mothership.resources.scrap,
    crystal: mothership.resources.crystal - input.mothership.resources.crystal,
    cores: mothership.resources.cores - input.mothership.resources.cores
  }
  return {
    mothership,
    recoveredResources,
    debrief: buildDebriefReport({
      outcome: input.outcome,
      earnedResources: input.earnedResources,
      recoveredResources,
      discoveries: Object.values(input.archiveRecords),
      nodesCleared: input.nodesCleared,
      planetsVisited: input.planetsVisited,
      skippedBeacons: input.skippedBeacons,
      stationVisits: input.stationVisits
    })
  }
}
