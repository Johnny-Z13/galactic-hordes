import { simBalanceTargets } from './sim-targets'
import type { SimBatchOptions, SimBatchSummary, SimRunResult } from './sim-types'

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function median(values: number[]) {
  if (!values.length) return 0
  const sorted = values.slice().sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function nullableMedian(values: Array<number | null>) {
  return median(values.filter((value): value is number => value !== null))
}

function mergeCounts(records: Array<Record<string, number>>) {
  const merged: Record<string, number> = {}
  for (const record of records) {
    for (const [key, value] of Object.entries(record)) {
      merged[key] = (merged[key] ?? 0) + value
    }
  }
  return merged
}

function deathCauseCounts(runs: SimRunResult[]) {
  const counts: Record<string, number> = {}
  for (const run of runs) {
    if (run.deathCause === 'none') continue
    counts[run.deathCause] = (counts[run.deathCause] ?? 0) + 1
  }
  return counts
}

function addTargetFlags(summary: Omit<SimBatchSummary, 'balanceFlags'>, flags: string[]) {
  const target = simBalanceTargets[summary.options.policy]
  if (summary.survival.medianSeconds < target.medianSurvivalMin) {
    flags.push(`Median survival ${formatSeconds(summary.survival.medianSeconds)} is below ${formatSeconds(target.medianSurvivalMin)} for ${summary.options.policy}.`)
  }
  if (summary.survival.medianSeconds > target.medianSurvivalMax) {
    flags.push(`Median survival ${formatSeconds(summary.survival.medianSeconds)} is above ${formatSeconds(target.medianSurvivalMax)} for ${summary.options.policy}.`)
  }
  if (summary.survival.destroyedRate > target.destroyedRateMax) {
    flags.push(`Destroyed rate ${Math.round(summary.survival.destroyedRate * 100)}% is above ${Math.round(target.destroyedRateMax * 100)}% for ${summary.options.policy}.`)
  }
  if (summary.planets.averageLandings < target.averagePlanetsMin) {
    flags.push(`Average planet landings ${summary.planets.averageLandings.toFixed(1)} is below ${target.averagePlanetsMin.toFixed(1)} for ${summary.options.policy}.`)
  }
  if (summary.planets.zeroLandingRate > target.zeroPlanetRunRateMax) {
    flags.push(`Zero-planet run rate ${Math.round(summary.planets.zeroLandingRate * 100)}% is above ${Math.round(target.zeroPlanetRunRateMax * 100)}% for ${summary.options.policy}.`)
  }
  if (summary.route.averageNodesCleared < target.averageNodesMin) {
    flags.push(`Average nodes cleared ${summary.route.averageNodesCleared.toFixed(1)} is below ${target.averageNodesMin.toFixed(1)} for ${summary.options.policy}.`)
  }
  if (
    summary.route.medianFinalClearSeconds !== null
    && target.medianFinalClearMin > 0
    && summary.route.medianFinalClearSeconds < target.medianFinalClearMin
  ) {
    flags.push(`Median final clear ${formatSeconds(summary.route.medianFinalClearSeconds)} is below ${formatSeconds(target.medianFinalClearMin)} for ${summary.options.policy}.`)
  }
  if (Object.keys(summary.route.templateCounts).length < target.routeTemplateVarietyMin) {
    flags.push(`Low route template variety across batch; expected at least ${target.routeTemplateVarietyMin} template families.`)
  }
  if (Object.keys(summary.planets.archetypeCounts).length < target.planetArchetypeVarietyMin) {
    flags.push(`Low planet archetype variety across batch; expected at least ${target.planetArchetypeVarietyMin} archetype families.`)
  }
}

export function summarizeSimBatch(options: SimBatchOptions, runs: SimRunResult[]): SimBatchSummary {
  const seconds = runs.map((run) => run.seconds)
  const finalClearSeconds = runs
    .filter((run) => run.outcome === 'finalCleared' || run.finalReached)
    .map((run) => run.seconds)
  const templateCounts = mergeCounts(runs.map((run) => run.coverage.routeTemplates))
  const archetypeCounts = mergeCounts(runs.map((run) => run.coverage.planetArchetypes))
  const deathCounts = deathCauseCounts(runs)
  const summaryWithoutFlags = {
    options,
    runs,
    survival: {
      averageSeconds: average(seconds),
      medianSeconds: median(seconds),
      bestSeconds: Math.max(0, ...seconds),
      destroyedRate: runs.filter((run) => run.outcome === 'destroyed').length / Math.max(1, runs.length)
    },
    route: {
      averageNodesCleared: average(runs.map((run) => run.nodesCleared)),
      finalReached: runs.filter((run) => run.finalReached).length,
      medianFinalClearSeconds: finalClearSeconds.length ? median(finalClearSeconds) : null,
      templateCounts,
      stationServiceCounts: mergeCounts(runs.map((run) => run.coverage.stationServices))
    },
    planets: {
      averageLandings: average(runs.map((run) => run.planetsLanded)),
      zeroLandingRate: runs.filter((run) => run.planetsLanded === 0).length / Math.max(1, runs.length),
      archetypeCounts,
      eventCounts: mergeCounts(runs.map((run) => run.coverage.surfaceEvents)),
      scenarioCounts: mergeCounts(runs.map((run) => run.coverage.surfaceScenarios))
    },
    economy: {
      averageScrap: average(runs.map((run) => run.economy.scrap)),
      averageCrystal: average(runs.map((run) => run.economy.crystal)),
      averageCores: average(runs.map((run) => run.economy.cores)),
      averageMutationSignals: average(runs.map((run) => run.economy.mutationSignals))
    },
    combat: {
      averageKills: average(runs.map((run) => run.kills)),
      averageDamageTaken: average(runs.map((run) => run.damageTaken)),
      deathCauseCounts: deathCounts
    },
    firstMinute: {
      averageKillsFirst60Sec: average(runs.map((run) => run.firstMinute.killsFirst60Sec)),
      medianFirstKillSec: nullableMedian(runs.map((run) => run.firstMinute.firstKillSec)),
      medianFirstLandingSec: nullableMedian(runs.map((run) => run.firstMinute.firstLandingSec)),
      medianFirstWorkbenchSec: nullableMedian(runs.map((run) => run.firstMinute.firstWorkbenchSec))
    },
    upgrades: {
      chosenCounts: mergeCounts(runs.map((run) => run.coverage.upgradesChosen))
    }
  }
  const balanceFlags = [...new Set(runs.flatMap((run) => run.flags))]
  addTargetFlags(summaryWithoutFlags, balanceFlags)

  const destroyedRuns = runs.filter((run) => run.outcome === 'destroyed').length
  const dominantDeath = Object.entries(deathCounts).sort((a, b) => b[1] - a[1])[0]
  if (dominantDeath && destroyedRuns > 0 && dominantDeath[1] / destroyedRuns > 0.7 && options.policy !== 'stress') {
    balanceFlags.push(`${dominantDeath[0]} causes ${Math.round((dominantDeath[1] / destroyedRuns) * 100)}% of destroyed runs.`)
  }

  return { ...summaryWithoutFlags, balanceFlags }
}

export function formatSeconds(seconds: number) {
  const roundedSeconds = Math.round(seconds)
  const minutes = Math.floor(roundedSeconds / 60)
  const secs = (roundedSeconds % 60).toString().padStart(2, '0')
  return `${minutes}:${secs}`
}

export function formatCountRecord(record: Record<string, number>) {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}
