import type { PersistentArchiveRecord, ResourceBundle, RunOutcomeKind } from './mothership-progression'
import { journeyDistanceLy, type StationVisitRecord } from './station-memory'

export interface DebriefReport {
  outcome: RunOutcomeKind
  title: string
  journeyTitle: string
  copy: string
  resources: {
    earned: ResourceBundle
    recovered: ResourceBundle
  }
  discoveries: PersistentArchiveRecord[]
  skippedBeacons: number
  stationVisits: StationVisitRecord[]
  lightYears: number
  highlights: string[]
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

const plural = (count: number, singular: string, pluralWord = `${singular}s`) => (
  `${count} ${count === 1 ? singular : pluralWord}`
)

const journeyTitleFor = (input: DebriefReportInput) => {
  const firstStation = input.stationVisits[0]?.stationName
  const firstDiscovery = input.discoveries[0]?.title
  if (input.skippedBeacons > 0 && firstStation) return `${firstStation} DEEP ROUTE`
  if (input.skippedBeacons > 0) return 'DEEP ROUTE BLACK BOX'
  if (input.planetsVisited >= 2) return `${input.planetsVisited} PLANET SURVEY`
  if (firstStation) return `${firstStation} CIRCUIT`
  if (firstDiscovery) return `${firstDiscovery} DRIFT`
  return 'SCOUT DRIFT'
}

const highlightsFor = (input: DebriefReportInput, lightYears: number) => {
  const highlights = [
    `${lightYears} LY travelled across ${plural(input.nodesCleared, 'route node')}.`,
    input.planetsVisited > 0
      ? `${plural(input.planetsVisited, 'planet')} surveyed with ${plural(input.discoveries.length, 'discovery', 'discoveries')} logged.`
      : `${plural(input.discoveries.length, 'discovery', 'discoveries')} logged without a planet landing.`
  ]
  if (input.stationVisits.length > 0) {
    highlights.push(`Docked at ${input.stationVisits.slice(0, 3).map((visit) => visit.stationName).join(' // ')}.`)
  } else {
    highlights.push('No stations docked.')
  }
  if (input.skippedBeacons > 0) {
    highlights.push(`Skipped ${plural(input.skippedBeacons, 'station beacon')} for deep-route recovery.`)
  }
  return highlights
}

export function buildDebriefReport(input: DebriefReportInput): DebriefReport {
  const lightYears = journeyDistanceLy({
    nodesCleared: input.nodesCleared,
    planetsVisited: input.planetsVisited,
    stationsDocked: input.stationVisits.length,
    skippedStations: input.skippedBeacons
  })
  return {
    outcome: input.outcome,
    title: titleForOutcome(input.outcome),
    journeyTitle: journeyTitleFor(input),
    copy: copyForOutcome(input.outcome),
    resources: {
      earned: { ...input.earnedResources },
      recovered: { ...input.recoveredResources }
    },
    discoveries: [...input.discoveries],
    skippedBeacons: input.skippedBeacons,
    stationVisits: [...input.stationVisits],
    lightYears,
    highlights: highlightsFor(input, lightYears)
  }
}
