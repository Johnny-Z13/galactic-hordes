import type { PersistentArchiveRecord, ResourceBundle, RunOutcomeKind } from './mothership-progression'
import { journeyDistanceLy, type StationVisitRecord } from './station-memory'

export interface DebriefReport {
  outcome: RunOutcomeKind
  title: string
  copy: string
  resources: {
    earned: ResourceBundle
    recovered: ResourceBundle
  }
  discoveries: PersistentArchiveRecord[]
  skippedBeacons: number
  stationVisits: StationVisitRecord[]
  lightYears: number
}

interface DebriefReportInput {
  outcome: RunOutcomeKind
  earnedResources: ResourceBundle
  recoveredResources: ResourceBundle
  discoveries: PersistentArchiveRecord[]
  nodesCleared: number
  planetsVisited: number
  skippedBeacons: number
  stationVisits: StationVisitRecord[]
}

const titleForOutcome = (outcome: RunOutcomeKind) => (
  outcome === 'destroyed'
    ? 'BLACK BOX RECOVERED'
    : outcome === 'deepExtraction'
      ? 'DEEP EXPEDITION EXTRACTED'
      : 'EXPEDITION EXTRACTED'
)

const copyForOutcome = (outcome: RunOutcomeKind) => (
  outcome === 'destroyed'
    ? 'The scout ship was lost. The mothership recovered partial cargo and all transmitted discoveries.'
    : 'The scout ship docked at a route station. Cargo, signals, and discoveries were processed cleanly.'
)

export function buildDebriefReport(input: DebriefReportInput): DebriefReport {
  return {
    outcome: input.outcome,
    title: titleForOutcome(input.outcome),
    copy: copyForOutcome(input.outcome),
    resources: {
      earned: { ...input.earnedResources },
      recovered: { ...input.recoveredResources }
    },
    discoveries: [...input.discoveries],
    skippedBeacons: input.skippedBeacons,
    stationVisits: [...input.stationVisits],
    lightYears: journeyDistanceLy({
      nodesCleared: input.nodesCleared,
      planetsVisited: input.planetsVisited,
      stationsDocked: input.stationVisits.length,
      skippedStations: input.skippedBeacons
    })
  }
}
