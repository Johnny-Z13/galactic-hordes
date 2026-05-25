import {
  availableSectorChoices,
  completeSectorNode,
  createSectorMap,
  currentSectorNode,
  selectSectorNode,
  type SectorNode
} from '../sector-map'
import type { PlanetArchetype } from '../surface-encounters'
import { createSimRng, pickWeighted } from './sim-rng'
import { scoreRouteChoice, simPolicies, type SimPolicy } from './sim-policies'
import { simulateSpaceNode } from './sim-space'
import { simulateStationDock } from './sim-stations'
import { simulateSurfaceVisit } from './sim-surface'
import { applySimUpgrade, chooseSimUpgrade, createEmptyUpgradeBuild } from './sim-upgrades'
import type { SimCoverageState, SimDeathCause, SimEconomyState, SimEvent, SimRunOptions, SimRunResult } from './sim-types'

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

function increment(record: Record<string, number>, key: string, amount = 1) {
  record[key] = (record[key] ?? 0) + amount
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

function runWorkbenchSignals(input: {
  economy: SimEconomyState
  build: ReturnType<typeof createEmptyUpgradeBuild>
  coverage: SimCoverageState
  events: SimEvent[]
  policy: SimPolicy
  rng: ReturnType<typeof createSimRng>
  seconds: number
}) {
  while (input.economy.mutationSignals > 0) {
    const upgrade = chooseSimUpgrade({ build: input.build, policy: input.policy, rng: input.rng })
    if (!upgrade) break
    const rank = applySimUpgrade(input.build, upgrade)
    input.economy.mutationSignals -= 1
    increment(input.coverage.upgradesChosen, upgrade.id)
    input.events.push({ t: input.seconds, kind: 'upgradeChosen', upgradeId: upgrade.id, rank })
  }
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
}) {
  const planetConfig = input.node.config.planets
  if (planetConfig.countMax <= 0) return { landed: 0, damageTaken: 0, discoveries: 0 }

  const meanPlanets = (planetConfig.countMin + planetConfig.countMax) / 2
  const visitPressure = meanPlanets * input.policy.planetBias * (input.node.kind === 'planet' ? 0.86 : 0.42)
  const attempts = Math.min(planetConfig.countMax, Math.max(0, Math.round(visitPressure + input.rng.range(-0.35, 0.55))))
  let landed = 0
  let damageTaken = 0
  let discoveries = 0

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
    landed += 1
    damageTaken += visit.damageTaken
    discoveries += visit.discoveries
    addEconomy(input.economy, visit.resources)
    increment(input.coverage.planetArchetypes, archetype)
    increment(input.coverage.surfaceEvents, visit.event)
    increment(input.coverage.surfaceScenarios, visit.scenario)
    input.events.push({ t: input.seconds + 12 + landed * 8, kind: 'planetLanded', archetype, event: visit.event, scenario: visit.scenario })
  }

  return { landed, damageTaken, discoveries }
}

export function runSimPlaythrough(options: SimRunOptions): SimRunResult {
  const rng = createSimRng(options.seed)
  const policy = simPolicies[options.policy]
  let sectorMap = createSectorMap(options.seed)
  const events: SimEvent[] = []
  const coverage = emptyCoverage()
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
    increment(coverage.routeTemplates, selected.config.templateId)
    events.push({ t: seconds, kind: 'routeSelected', templateId: selected.config.templateId, label: selected.label })

    if (selected.kind === 'station') {
      const dock = simulateStationDock({ node: selected, currentDamage: damageTaken })
      damageTaken = Math.max(0, damageTaken - dock.repaired)
      addEconomy(economy, dock.resources)
      for (const service of dock.services) increment(coverage.stationServices, service)
      stationsDocked += 1
      events.push({ t: seconds, kind: 'stationDocked', label: selected.label, services: dock.services })
      runWorkbenchSignals({ economy, build, coverage, events, policy, rng, seconds })
      sectorMap = completeSectorNode(sectorMap)
      continue
    }

    const space = simulateSpaceNode({
      node: selected,
      policy,
      rng,
      seconds,
      difficulty: options.difficulty,
      defensiveRanks: defensiveRanks(build)
    })
    kills += space.kills
    damageTaken += space.damageTaken
    if (space.damageTaken > 0 && space.deathCause !== 'none') {
      events.push({ t: seconds + space.nodeSeconds * 0.42, kind: 'damageTaken', amount: space.damageTaken, cause: space.deathCause })
    }

    const planetVisits = runPlanetVisits({
      node: selected,
      policy,
      rng,
      seconds: seconds + space.nodeSeconds * 0.55,
      planetsLanded,
      build,
      coverage,
      events,
      economy,
      difficulty: options.difficulty
    })
    planetsLanded += planetVisits.landed
    damageTaken += planetVisits.damageTaken
    discoveries += planetVisits.discoveries

    const nodeReward = {
      scrap: Math.round(selected.config.rewards.resourceMultiplier * (18 + space.kills * 0.45)),
      crystal: Math.round(selected.config.rewards.resourceMultiplier * (2 + planetsLanded * 0.22)),
      cores: selected.kind === 'boss' && rng.chance(0.45) ? 1 : 0,
      mutationSignals: rng.chance(selected.config.rewards.upgradeSignalBonusChance + policy.cacheGreed * 0.04) ? 1 : 0
    }
    addEconomy(economy, nodeReward)
    runWorkbenchSignals({ economy, build, coverage, events, policy, rng, seconds: seconds + space.nodeSeconds * 0.82 })
    events.push({ t: seconds + space.nodeSeconds, kind: 'resourceGained', ...economy })

    seconds += space.nodeSeconds
    nodesCleared += 1
    events.push({ t: seconds, kind: 'nodeCleared', templateId: selected.config.templateId, secondsInNode: space.nodeSeconds })

    const hullLimit = options.difficulty === 'testEasy' ? 240 : options.difficulty === 'stress' ? 112 : 210
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
  if (planetsLanded === 0 && options.policy === 'planetHunter') runFlags.push('planetHunter did not land on any planets')
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
    economy,
    build: { upgrades: build, relicCount: 0, evolvedWeapons: 0 },
    coverage,
    events,
    flags: runFlags
  }
}
