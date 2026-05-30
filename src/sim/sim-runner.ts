import {
  availableSectorChoices,
  completeSectorNode,
  createSectorMap,
  currentSectorNode,
  selectSectorNode,
  type SectorNode
} from '../sector-map'
import { introSafeDriftSpawnMultiplier, introSafeDriftStartingSpawns } from '../intro-hook'
import { runBalance } from '../run-balance'
import type { PlanetArchetype } from '../surface-encounters'
import { createSimRng, pickWeighted } from './sim-rng'
import { scoreRouteChoice, simPolicies, type SimPolicy } from './sim-policies'
import { simulateSpaceNode } from './sim-space'
import { simulateStationDock } from './sim-stations'
import { simulateSurfaceVisit } from './sim-surface'
import { applySimUpgrade, chooseSimUpgrade, createEmptyUpgradeBuild } from './sim-upgrades'
import type { SimCoverageState, SimDeathCause, SimEconomyState, SimEvent, SimFirstMinuteState, SimRunOptions, SimRunResult } from './sim-types'

function emptyCoverage(): SimCoverageState {
  return {
    routeTemplates: {},
    planetArchetypes: {},
    surfaceEvents: {},
    surfaceScenarios: {},
    upgradesChosen: {},
    stationServices: {}
  }
}

function emptyFirstMinute(): SimFirstMinuteState {
  return {
    firstKillSec: null,
    killsFirst60Sec: 0,
    firstLandingSec: null,
    firstWorkbenchSec: null
  }
}

function increment(record: Record<string, number>, key: string, amount = 1) {
  record[key] = (record[key] ?? 0) + amount
}

function recordSpaceEngagement(firstMinute: SimFirstMinuteState, startSeconds: number, nodeSeconds: number, kills: number, frontLoadedKills = 0) {
  if (kills <= 0 || nodeSeconds <= 0) return

  const firstKillSec = startSeconds + (frontLoadedKills > 0 ? Math.min(3, nodeSeconds / Math.max(1, frontLoadedKills)) : Math.min(nodeSeconds, nodeSeconds / kills))
  if (firstMinute.firstKillSec === null) firstMinute.firstKillSec = firstKillSec

  if (startSeconds >= 60) return
  const overlapSeconds = Math.min(60, startSeconds + nodeSeconds) - startSeconds
  if (overlapSeconds <= 0) return
  const steadyKills = Math.max(0, kills - frontLoadedKills)
  firstMinute.killsFirst60Sec += Math.max(0, frontLoadedKills + Math.round(steadyKills * (overlapSeconds / nodeSeconds)))
}

function addEconomy(target: SimEconomyState, source: SimEconomyState) {
  target.scrap += source.scrap
  target.crystal += source.crystal
  target.cores += source.cores
  target.mutationSignals += source.mutationSignals
}

function chooseRoute(choices: SectorNode[], policy: SimPolicy, rng: ReturnType<typeof createSimRng>) {
  return pickWeighted(
    choices.map((node) => ({
      value: node,
      weight: Math.max(0.05, scoreRouteChoice(node, policy) + rng.range(0, 0.8))
    })),
    rng
  )
}

function choosePlanetArchetype(node: SectorNode, rng: ReturnType<typeof createSimRng>): PlanetArchetype {
  const weighted = Object.entries(node.config.planets.archetypeBias)
    .map(([value, weight]) => ({ value: value as PlanetArchetype, weight: weight ?? 0 }))
    .filter((choice) => choice.weight > 0)
  if (weighted.length) return pickWeighted(weighted, rng)
  const fallback: PlanetArchetype[] = ['cache', 'hostile', 'repair', 'relic', 'strange', 'lore']
  return fallback[rng.int(0, fallback.length - 1)]
}

function defensiveRanks(build: ReturnType<typeof createEmptyUpgradeBuild>) {
  return build.shield + build.repair + build.vampire + build.nav + build.suitHealth + build.suitO2
}

function introAdjustedNode(node: SectorNode, seconds: number): SectorNode {
  if (seconds !== 0 || node.config.templateId !== 'safeDrift') return node
  return {
    ...node,
    config: {
      ...node.config,
      enemies: {
        ...node.config.enemies,
        startingSpawns: introSafeDriftStartingSpawns(node.config.enemies.startingSpawns),
        spawnMultiplier: introSafeDriftSpawnMultiplier(node.config.enemies.spawnMultiplier)
      }
    }
  }
}

function runWorkbenchSignals(input: {
  economy: SimEconomyState
  build: ReturnType<typeof createEmptyUpgradeBuild>
  coverage: SimCoverageState
  events: SimEvent[]
  policy: SimPolicy
  rng: ReturnType<typeof createSimRng>
  seconds: number
}): { upgraded: boolean } {
  let upgraded = false
  while (input.economy.mutationSignals > 0) {
    const upgrade = chooseSimUpgrade({ build: input.build, policy: input.policy, rng: input.rng })
    if (!upgrade) break
    const rank = applySimUpgrade(input.build, upgrade)
    input.economy.mutationSignals -= 1
    upgraded = true
    increment(input.coverage.upgradesChosen, upgrade.id)
    input.events.push({ t: input.seconds, kind: 'upgradeChosen', upgradeId: upgrade.id, rank })
  }
  return { upgraded }
}

function runPlanetVisits(input: {
  node: SectorNode
  policy: SimPolicy
  rng: ReturnType<typeof createSimRng>
  seconds: number
  planetsLanded: number
  build: ReturnType<typeof createEmptyUpgradeBuild>
  coverage: SimCoverageState
  events: SimEvent[]
  economy: SimEconomyState
  difficulty: SimRunOptions['difficulty']
  firstLandingFloor: number
}) {
  const planetConfig = input.node.config.planets
  if (planetConfig.countMax <= 0) return { landed: 0, damageTaken: 0, repaired: 0, discoveries: 0, firstLandingAt: null }

  const meanPlanets = (planetConfig.countMin + planetConfig.countMax) / 2
  const visitPressure = meanPlanets * input.policy.planetBias * (input.node.kind === 'planet' ? 0.86 : 0.42)
  const attempts = Math.min(planetConfig.countMax, Math.max(0, Math.round(visitPressure + input.rng.range(-0.35, 0.55))))
  let landed = 0
  let damageTaken = 0
  let repaired = 0
  let discoveries = 0
  let firstLandingAt: number | null = null

  for (let i = 0; i < attempts; i += 1) {
    const archetype = choosePlanetArchetype(input.node, input.rng)
    const visit = simulateSurfaceVisit({
      archetype,
      policy: input.policy,
      rng: input.rng,
      seconds: input.seconds,
      landingIndex: input.planetsLanded + landed,
      luck: input.build.luck,
      survey: input.build.survey,
      difficulty: input.difficulty
    })
    if (input.planetsLanded + landed === 0) visit.resources.mutationSignals = Math.max(visit.resources.mutationSignals, 1)
    landed += 1
    damageTaken += visit.damageTaken
    // Landing on a planet patches the hull, like the live game (run-balance landing repair).
    // Repair-archetype docks heal more; later landings (revisits) heal less.
    const landingRepair = (input.planetsLanded + landed === 1)
      ? runBalance.landing.firstVisitHullRepair
      : runBalance.landing.revisitHullRepair
    repaired += archetype === 'repair' ? Math.round(landingRepair * 1.5) : landingRepair
    discoveries += visit.discoveries
    addEconomy(input.economy, visit.resources)
    increment(input.coverage.planetArchetypes, archetype)
    increment(input.coverage.surfaceEvents, visit.event)
    increment(input.coverage.surfaceScenarios, visit.scenario)
    // The run's very first landing models an early beeline to a planet rather than a
    // mid-node detour, so it is not gated behind the node-progress offset baked into input.seconds.
    const isRunFirstLanding = input.planetsLanded + landed === 1
    const landingAt = isRunFirstLanding
      ? input.firstLandingFloor + input.rng.range(0, 12)
      : input.seconds + 12 + landed * 8
    if (firstLandingAt === null) firstLandingAt = landingAt
    input.events.push({ t: landingAt, kind: 'planetLanded', archetype, event: visit.event, scenario: visit.scenario })
  }

  return { landed, damageTaken, repaired, discoveries, firstLandingAt }
}

export function runSimPlaythrough(options: SimRunOptions): SimRunResult {
  const rng = createSimRng(options.seed)
  const policy = simPolicies[options.policy]
  let sectorMap = createSectorMap(options.seed)
  const events: SimEvent[] = []
  const coverage = emptyCoverage()
  const firstMinute = emptyFirstMinute()
  const build = createEmptyUpgradeBuild()
  const economy: SimEconomyState = { scrap: 0, crystal: 0, cores: 0, mutationSignals: 0 }
  let seconds = 0
  let nodesCleared = 0
  let stationsDocked = 0
  let planetsLanded = 0
  let kills = 0
  let damageTaken = 0
  let discoveries = 0
  let outcome: SimRunResult['outcome'] = 'timeLimit'
  let deathCause: SimDeathCause = 'none'
  let finalReached = false

  while (seconds < options.maxSeconds) {
    const choices = availableSectorChoices(sectorMap)
    if (!choices.length) break

    const node = chooseRoute(choices, policy, rng)
    sectorMap = selectSectorNode(sectorMap, node.id)
    const selected = currentSectorNode(sectorMap)
    const nodeForRun = introAdjustedNode(selected, seconds)
    increment(coverage.routeTemplates, selected.config.templateId)
    events.push({ t: seconds, kind: 'routeSelected', templateId: selected.config.templateId, label: selected.label })

    if (selected.kind === 'station') {
      const dock = simulateStationDock({ node: nodeForRun, currentDamage: damageTaken })
      damageTaken = Math.max(0, damageTaken - dock.repaired)
      addEconomy(economy, dock.resources)
      for (const service of dock.services) increment(coverage.stationServices, service)
      stationsDocked += 1
      events.push({ t: seconds, kind: 'stationDocked', label: selected.label, services: dock.services })
      const workbench = runWorkbenchSignals({ economy, build, coverage, events, policy, rng, seconds })
      if (workbench.upgraded && firstMinute.firstWorkbenchSec === null) firstMinute.firstWorkbenchSec = seconds
      sectorMap = completeSectorNode(sectorMap)
      continue
    }

    const space = simulateSpaceNode({
      node: nodeForRun,
      policy,
      rng,
      seconds,
      difficulty: options.difficulty,
      defensiveRanks: defensiveRanks(build)
    })
    recordSpaceEngagement(firstMinute, seconds, space.nodeSeconds, space.kills, space.frontLoadedKills)
    kills += space.kills
    damageTaken += space.damageTaken
    if (space.damageTaken > 0 && space.deathCause !== 'none') {
      events.push({ t: seconds + space.nodeSeconds * 0.42, kind: 'damageTaken', amount: space.damageTaken, cause: space.deathCause })
    }

    const planetVisits = runPlanetVisits({
      node: nodeForRun,
      policy,
      rng,
      seconds: seconds + space.nodeSeconds * (seconds === 0 ? 0.43 : 0.55),
      planetsLanded,
      build,
      coverage,
      events,
      economy,
      difficulty: options.difficulty,
      // Opening-node beeline window: a player reaches the first planet roughly 40-55s in.
      firstLandingFloor: seconds + 40
    })
    planetsLanded += planetVisits.landed
    damageTaken += planetVisits.damageTaken
    // Landing repairs patch the hull between fights, so net pressure is the recovery balance.
    damageTaken = Math.max(0, damageTaken - planetVisits.repaired)
    discoveries += planetVisits.discoveries
    if (planetVisits.firstLandingAt !== null && firstMinute.firstLandingSec === null) firstMinute.firstLandingSec = planetVisits.firstLandingAt
    if (planetVisits.firstLandingAt !== null && planetVisits.landed > 0 && firstMinute.firstWorkbenchSec === null && economy.mutationSignals > 0) {
      const workbenchAt = planetVisits.firstLandingAt + 18
      const workbench = runWorkbenchSignals({ economy, build, coverage, events, policy, rng, seconds: workbenchAt })
      if (workbench.upgraded) firstMinute.firstWorkbenchSec = workbenchAt
    }

    const nodeReward = {
      scrap: Math.round(nodeForRun.config.rewards.resourceMultiplier * (18 + space.kills * 0.45)),
      crystal: Math.round(nodeForRun.config.rewards.resourceMultiplier * (2 + planetsLanded * 0.22)),
      cores: nodeForRun.kind === 'boss' && rng.chance(0.45) ? 1 : 0,
      mutationSignals: rng.chance(nodeForRun.config.rewards.upgradeSignalBonusChance + policy.cacheGreed * 0.04) ? 1 : 0
    }
    addEconomy(economy, nodeReward)
    const workbench = runWorkbenchSignals({ economy, build, coverage, events, policy, rng, seconds: seconds + space.nodeSeconds * 0.82 })
    if (workbench.upgraded && firstMinute.firstWorkbenchSec === null) firstMinute.firstWorkbenchSec = seconds + space.nodeSeconds * 0.82
    events.push({ t: seconds + space.nodeSeconds, kind: 'resourceGained', ...economy })

    seconds += space.nodeSeconds
    nodesCleared += 1
    events.push({ t: seconds, kind: 'nodeCleared', templateId: selected.config.templateId, secondsInNode: space.nodeSeconds })

    const hullLimit = options.difficulty === 'testEasy' ? 240 : options.difficulty === 'stress' ? 190 : 213
    if (damageTaken >= hullLimit) {
      outcome = 'destroyed'
      deathCause = planetVisits.damageTaken > space.damageTaken && planetVisits.damageTaken > 0 ? 'surface' : space.deathCause === 'none' ? 'attrition' : space.deathCause
      break
    }

    if (selected.kind === 'final') {
      outcome = 'finalCleared'
      finalReached = true
      break
    }

    sectorMap = completeSectorNode(sectorMap)
  }

  if (outcome === 'timeLimit' && deathCause === 'none') outcome = nodesCleared >= 1 ? 'extracted' : 'timeLimit'
  const runFlags: string[] = []
  if (discoveries === 0 && planetsLanded > 0) runFlags.push('planet landings produced no discoveries')
  events.push({ t: seconds, kind: 'runEnded', outcome, deathCause })

  return {
    seed: options.seed,
    policy: options.policy,
    difficulty: options.difficulty,
    outcome,
    deathCause,
    seconds,
    nodesCleared,
    finalReached,
    planetsLanded,
    stationsDocked,
    kills,
    damageTaken,
    firstMinute,
    economy,
    build: { upgrades: build, relicCount: 0, evolvedWeapons: 0 },
    coverage,
    events,
    flags: runFlags
  }
}
