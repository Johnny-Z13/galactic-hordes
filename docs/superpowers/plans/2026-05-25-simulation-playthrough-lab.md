# Simulation Playthrough Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic extracted simulation runner plus a local HTML dashboard that can run many Galactic Hordes playthroughs, summarize balance/performance-shaped outcomes, and eventually calibrate against real browser playthroughs.

**Architecture:** Create a simulation layer under `src/sim/` that imports the real balance and procedural modules instead of duplicating tuning data. Expose the same engine to a Node CLI, Playwright tests, and a Vite-served dashboard that runs batches in a Web Worker. Keep the first simulation abstract enough to ship quickly, then improve fidelity phase by phase.

**Tech Stack:** TypeScript, Vite, Playwright test runner, browser Web Worker, DOM dashboard, existing game balance modules.

---

## Target End State

The ideal system has four entry points that all use the same simulation engine:

- `npm run sim -- --runs=10 --policy=balanced --seed=1000`
- `npm run sim:lab`
- `npm run test:sim`
- Playwright calibration tests that compare a small number of real browser runs with simulation expectations.

The dashboard should support:

- Batch run controls for run count, base seed, max simulated minutes, policy, route preference, landing preference, and difficulty profile.
- One-click presets such as `Quick 10`, `Balance 50`, `Planet Variety`, `Late Pressure`, and `Economy Sweep`.
- Progress feedback while the batch runs.
- Summary cards for survival, route progress, planets, economy, upgrades, damage, death causes, procedural coverage, and balance flags.
- Run table with seed, policy, outcome, survival time, route nodes cleared, planets landed, resources, upgrades, and flagged anomalies.
- JSON export for deeper analysis.

The simulation should eventually model:

- Sector-map route generation and route choice.
- Space pressure, enemy waves, hazards, return beacons, station docking, and final node outcomes.
- Planet landing selection, surface encounter outcomes, cache results, alien/lore/relic discoveries, and board/takeoff flow.
- Upgrade choice policies, permanent-ish run build state, resource economy, death and extraction causes.
- Balance envelopes with warnings when outcomes fall outside desired ranges.

## File Structure

Create:

- `src/sim/sim-rng.ts`: deterministic RNG helpers and weighted-choice utilities.
- `src/sim/sim-types.ts`: shared simulation input, state, event, result, metric, and dashboard types.
- `src/sim/sim-policies.ts`: bot decision policies for routes, planets, upgrades, and risk.
- `src/sim/sim-runner.ts`: fixed-step abstract playthrough runner.
- `src/sim/sim-metrics.ts`: aggregation, percentiles, balance flags, and report formatting.
- `src/sim/sim-cli.ts`: Node command-line runner.
- `src/sim/sim-worker.ts`: browser worker entry point for dashboard batches.
- `src/sim/sim-dashboard.ts`: DOM controller for the dashboard.
- `sim-lab.html`: Vite-served dashboard page.
- `tests/sim-rng.spec.ts`: deterministic RNG tests.
- `tests/sim-runner.spec.ts`: runner and policy behavior tests.
- `tests/sim-metrics.spec.ts`: aggregation and flag tests.

Modify:

- `package.json`: add `sim`, `sim:lab`, and `test:sim` scripts.
- `vite.config.ts`: include the existing server config; no route-specific config is needed.
- `README.md`: add a short "Simulation Lab" section after the feature exists.
- `docs/game-balance-design.md`: document how simulation outputs should inform tuning decisions.

Create documentation:

- `docs/simulation-playthrough-lab.md`: human guide for running the CLI, dashboard, presets, policies, and interpreting reports.
- `docs/simulation-model-notes.md`: engineering notes on fidelity boundaries, modeled systems, unmodeled systems, and calibration rules.
- `docs/simulation-balance-targets.md`: current target envelopes for policies, survival, economy, route progress, planet variety, and acceptable warning thresholds.

Avoid modifying `src/main.ts` until the Playwright calibration phase. The simulation should first stand on pure modules and existing balance/procedural exports.

---

## Phase 1: Deterministic Simulation Skeleton

**Outcome:** A pure TypeScript simulation can run one abstract playthrough from a seed and return a structured result.

### Task 1: Add Deterministic RNG

**Files:**
- Create: `src/sim/sim-rng.ts`
- Create: `tests/sim-rng.spec.ts`

- [ ] **Step 1: Write RNG tests**

Create `tests/sim-rng.spec.ts`:

```ts
import { expect, test } from '@playwright/test'
import { createSimRng, pickWeighted } from '../src/sim/sim-rng'

test('simulation rng repeats the same sequence for the same seed', () => {
  const a = createSimRng(42)
  const b = createSimRng(42)

  expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()])
})

test('simulation rng produces different sequences for different seeds', () => {
  const a = createSimRng(42)
  const b = createSimRng(43)

  expect([a.next(), a.next(), a.next()]).not.toEqual([b.next(), b.next(), b.next()])
})

test('weighted picker ignores zero weights and returns a stable choice', () => {
  const rng = createSimRng(7)
  const choices = [
    { value: 'skip', weight: 0 },
    { value: 'take', weight: 10 }
  ]

  expect(pickWeighted(choices, rng)).toBe('take')
})
```

- [ ] **Step 2: Run the RNG tests and verify failure**

Run: `npm run test -- tests/sim-rng.spec.ts`

Expected: FAIL because `src/sim/sim-rng.ts` does not exist.

- [ ] **Step 3: Implement the RNG module**

Create `src/sim/sim-rng.ts`:

```ts
export interface SimRng {
  seed: number
  next: () => number
  int: (min: number, max: number) => number
  chance: (probability: number) => boolean
}

export function createSimRng(seed: number): SimRng {
  let state = seed >>> 0
  const next = () => {
    state += 0x6d2b79f5
    let r = Math.imul(state ^ (state >>> 15), 1 | state)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
  return {
    seed: seed >>> 0,
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    chance: (probability) => next() < probability
  }
}

export function pickWeighted<T>(choices: Array<{ value: T; weight: number }>, rng: SimRng): T {
  const available = choices.filter((choice) => choice.weight > 0)
  if (!available.length) throw new Error('pickWeighted requires at least one positive weight')
  let roll = rng.next() * available.reduce((sum, choice) => sum + choice.weight, 0)
  for (const choice of available) {
    roll -= choice.weight
    if (roll <= 0) return choice.value
  }
  return available[available.length - 1].value
}
```

- [ ] **Step 4: Run the RNG tests and verify pass**

Run: `npm run test -- tests/sim-rng.spec.ts`

Expected: PASS.

### Task 2: Define Simulation Contracts

**Files:**
- Create: `src/sim/sim-types.ts`

- [ ] **Step 1: Create shared simulation types**

Create `src/sim/sim-types.ts`:

```ts
import type { SectorNodeTemplateId } from '../sector-map'
import type { PlanetArchetype, SurfaceScenarioKind } from '../surface-encounters'
import type { UpgradeId } from '../powerup-balance'

export type SimPolicyId = 'balanced' | 'survival' | 'planetHunter' | 'greedyCache' | 'routeRusher' | 'stress'
export type SimOutcome = 'destroyed' | 'extracted' | 'finalCleared' | 'timeLimit'
export type SimDeathCause = 'contact' | 'projectile' | 'hazard' | 'surface' | 'attrition' | 'none'

export interface SimRunOptions {
  seed: number
  policy: SimPolicyId
  maxSeconds: number
  difficulty: 'normal' | 'testEasy' | 'stress'
}

export interface SimBuildState {
  upgrades: Record<UpgradeId, number>
  relicCount: number
  evolvedWeapons: number
}

export interface SimEconomyState {
  scrap: number
  crystal: number
  cores: number
  mutationSignals: number
}

export interface SimCoverageState {
  routeTemplates: Record<string, number>
  planetArchetypes: Record<string, number>
  surfaceScenarios: Record<string, number>
  upgradesChosen: Record<string, number>
}

export interface SimRunResult {
  seed: number
  policy: SimPolicyId
  outcome: SimOutcome
  deathCause: SimDeathCause
  seconds: number
  nodesCleared: number
  finalReached: boolean
  planetsLanded: number
  kills: number
  damageTaken: number
  economy: SimEconomyState
  build: SimBuildState
  coverage: SimCoverageState
  events: SimEvent[]
  flags: string[]
}

export type SimEvent =
  | { t: number; kind: 'routeSelected'; templateId: SectorNodeTemplateId; label: string }
  | { t: number; kind: 'nodeCleared'; templateId: SectorNodeTemplateId; secondsInNode: number }
  | { t: number; kind: 'planetLanded'; archetype: PlanetArchetype; scenario: SurfaceScenarioKind }
  | { t: number; kind: 'upgradeChosen'; upgradeId: UpgradeId; rank: number }
  | { t: number; kind: 'resourceGained'; scrap: number; crystal: number; cores: number; mutationSignals: number }
  | { t: number; kind: 'damageTaken'; amount: number; cause: Exclude<SimDeathCause, 'none'> }
  | { t: number; kind: 'runEnded'; outcome: SimOutcome; deathCause: SimDeathCause }

export interface SimBatchOptions extends SimRunOptions {
  runs: number
}

export interface SimBatchSummary {
  options: SimBatchOptions
  runs: SimRunResult[]
  survival: {
    averageSeconds: number
    medianSeconds: number
    bestSeconds: number
  }
  route: {
    averageNodesCleared: number
    finalReached: number
    templateCounts: Record<string, number>
  }
  planets: {
    averageLandings: number
    archetypeCounts: Record<string, number>
    scenarioCounts: Record<string, number>
  }
  economy: {
    averageScrap: number
    averageCrystal: number
    averageCores: number
    averageMutationSignals: number
  }
  balanceFlags: string[]
}
```

- [ ] **Step 2: Type-check the new contracts**

Run: `npm run build`

Expected: PASS after later tasks create imports that use these types. If this phase is run alone, TypeScript should still pass because the file is self-contained and imported type names exist in current source modules.

### Task 3: Build Abstract Runner

**Files:**
- Create: `src/sim/sim-policies.ts`
- Create: `src/sim/sim-runner.ts`
- Create: `tests/sim-runner.spec.ts`

- [ ] **Step 1: Write runner tests**

Create `tests/sim-runner.spec.ts`:

```ts
import { expect, test } from '@playwright/test'
import { runSimPlaythrough } from '../src/sim/sim-runner'

test('simulation runner returns deterministic results for a fixed seed', () => {
  const options = { seed: 100, policy: 'balanced' as const, maxSeconds: 600, difficulty: 'normal' as const }

  expect(runSimPlaythrough(options)).toEqual(runSimPlaythrough(options))
})

test('simulation runner records route planet economy and ending events', () => {
  const result = runSimPlaythrough({ seed: 101, policy: 'planetHunter', maxSeconds: 900, difficulty: 'normal' })

  expect(result.seconds).toBeGreaterThan(0)
  expect(result.events.some((event) => event.kind === 'routeSelected')).toBe(true)
  expect(result.events.some((event) => event.kind === 'runEnded')).toBe(true)
  expect(Object.values(result.coverage.routeTemplates).reduce((sum, count) => sum + count, 0)).toBeGreaterThan(0)
  expect(result.economy.scrap + result.economy.crystal + result.economy.cores).toBeGreaterThanOrEqual(0)
})

test('survival policy takes less damage than greedy cache policy across the same seeds', () => {
  const seeds = [200, 201, 202, 203, 204]
  const survivalDamage = seeds.reduce((sum, seed) => sum + runSimPlaythrough({ seed, policy: 'survival', maxSeconds: 600, difficulty: 'normal' }).damageTaken, 0)
  const greedyDamage = seeds.reduce((sum, seed) => sum + runSimPlaythrough({ seed, policy: 'greedyCache', maxSeconds: 600, difficulty: 'normal' }).damageTaken, 0)

  expect(survivalDamage).toBeLessThan(greedyDamage)
})
```

- [ ] **Step 2: Run runner tests and verify failure**

Run: `npm run test -- tests/sim-runner.spec.ts`

Expected: FAIL because runner files do not exist.

- [ ] **Step 3: Implement policy definitions**

Create `src/sim/sim-policies.ts`:

```ts
import type { SectorNode } from '../sector-map'
import type { Upgrade } from '../powerup-balance'
import type { SimPolicyId } from './sim-types'

export interface SimPolicy {
  id: SimPolicyId
  riskTolerance: number
  planetBias: number
  cacheGreed: number
  routeRush: number
  survivalUpgradeBias: number
}

export const simPolicies: Record<SimPolicyId, SimPolicy> = {
  balanced: { id: 'balanced', riskTolerance: 0.5, planetBias: 0.55, cacheGreed: 0.45, routeRush: 0.5, survivalUpgradeBias: 0.45 },
  survival: { id: 'survival', riskTolerance: 0.25, planetBias: 0.35, cacheGreed: 0.2, routeRush: 0.35, survivalUpgradeBias: 0.9 },
  planetHunter: { id: 'planetHunter', riskTolerance: 0.55, planetBias: 0.9, cacheGreed: 0.55, routeRush: 0.35, survivalUpgradeBias: 0.4 },
  greedyCache: { id: 'greedyCache', riskTolerance: 0.8, planetBias: 0.75, cacheGreed: 0.95, routeRush: 0.45, survivalUpgradeBias: 0.2 },
  routeRusher: { id: 'routeRusher', riskTolerance: 0.6, planetBias: 0.25, cacheGreed: 0.25, routeRush: 0.9, survivalUpgradeBias: 0.35 },
  stress: { id: 'stress', riskTolerance: 1, planetBias: 0.85, cacheGreed: 1, routeRush: 1, survivalUpgradeBias: 0.1 }
}

export function scoreRouteChoice(node: SectorNode, policy: SimPolicy): number {
  const paceRisk = { safe: 0.1, mild: 0.3, standard: 0.5, intense: 0.8, boss: 1 }[node.config.pace]
  const planetValue = node.kind === 'planet' ? policy.planetBias : 0
  const rewardValue = node.config.rewards.resourceMultiplier * (0.35 + policy.cacheGreed)
  const rushValue = node.kind === 'station' ? 0.2 : policy.routeRush
  const riskPenalty = paceRisk * (1 - policy.riskTolerance)
  return rewardValue + planetValue + rushValue - riskPenalty
}

export function scoreUpgradeChoice(upgrade: Upgrade, policy: SimPolicy): number {
  const survivalBuckets = new Set(['survival', 'navigation', 'spacesuit'])
  const survivalValue = survivalBuckets.has(upgrade.bucket) ? policy.survivalUpgradeBias : 0.25
  const weaponValue = upgrade.category === 'weapon' ? 0.5 + policy.riskTolerance * 0.4 : 0.2
  return survivalValue + weaponValue + upgrade.rarity
}
```

- [ ] **Step 4: Implement the abstract runner**

Create `src/sim/sim-runner.ts`:

```ts
import { availableSectorChoices, completeSectorNode, createSectorMap, currentSectorNode, selectSectorNode } from '../sector-map'
import { upgrades, type UpgradeId } from '../powerup-balance'
import { planSurfaceEncounter } from '../surface-encounters'
import { createSimRng } from './sim-rng'
import { scoreRouteChoice, scoreUpgradeChoice, simPolicies } from './sim-policies'
import type { SimCoverageState, SimDeathCause, SimEvent, SimRunOptions, SimRunResult } from './sim-types'

const upgradeIds = upgrades.map((upgrade) => upgrade.id)

function emptyBuild(): Record<UpgradeId, number> {
  return Object.fromEntries(upgradeIds.map((id) => [id, 0])) as Record<UpgradeId, number>
}

function emptyCoverage(): SimCoverageState {
  return { routeTemplates: {}, planetArchetypes: {}, surfaceScenarios: {}, upgradesChosen: {} }
}

function increment(record: Record<string, number>, key: string, amount = 1) {
  record[key] = (record[key] ?? 0) + amount
}

export function runSimPlaythrough(options: SimRunOptions): SimRunResult {
  const rng = createSimRng(options.seed)
  const policy = simPolicies[options.policy]
  let sectorMap = createSectorMap(options.seed)
  const events: SimEvent[] = []
  const coverage = emptyCoverage()
  const build = emptyBuild()
  const economy = { scrap: 0, crystal: 0, cores: 0, mutationSignals: 0 }
  let seconds = 0
  let nodesCleared = 0
  let planetsLanded = 0
  let kills = 0
  let damageTaken = 0
  let outcome: SimRunResult['outcome'] = 'timeLimit'
  let deathCause: SimDeathCause = 'none'
  let finalReached = false

  while (seconds < options.maxSeconds) {
    const choices = availableSectorChoices(sectorMap)
    if (!choices.length) break
    const node = choices.slice().sort((a, b) => scoreRouteChoice(b, policy) - scoreRouteChoice(a, policy))[0]
    sectorMap = selectSectorNode(sectorMap, node.id)
    const selected = currentSectorNode(sectorMap)
    increment(coverage.routeTemplates, selected.config.templateId)
    events.push({ t: seconds, kind: 'routeSelected', templateId: selected.config.templateId, label: selected.label })

    const nodeSeconds = Math.round(55 + selected.config.depth * 95 + selected.config.enemies.spawnMultiplier * 45 - policy.routeRush * 18)
    const pressure = selected.config.enemies.spawnMultiplier * ({ safe: 0.55, mild: 0.75, standard: 1, intense: 1.35, boss: 1.7 }[selected.config.pace])
    const hazardPressure = selected.config.hazards.includes('asteroids') ? 0.28 : selected.config.hazards.includes('hunterWing') ? 0.22 : 0.1
    const damage = Math.max(0, Math.round((pressure + hazardPressure - policy.riskTolerance * 0.42 - policy.survivalUpgradeBias * 0.2) * (18 + rng.next() * 28)))
    damageTaken += damage
    if (damage > 0) events.push({ t: seconds + nodeSeconds * 0.45, kind: 'damageTaken', amount: damage, cause: selected.config.hazards.includes('asteroids') ? 'hazard' : 'contact' })
    kills += Math.round(nodeSeconds * pressure * (0.28 + policy.riskTolerance * 0.12))

    const planetAttempts = selected.config.planets.countMax > 0
      ? Math.max(0, Math.round((selected.config.planets.countMin + selected.config.planets.countMax) * 0.5 * policy.planetBias))
      : 0
    for (let i = 0; i < planetAttempts; i += 1) {
      const archetypes = Object.entries(selected.config.planets.archetypeBias)
      const archetype = (archetypes.sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] ?? 'cache') as Parameters<typeof planSurfaceEncounter>[0]['planetArchetype']
      const surface = planSurfaceEncounter({
        planetArchetype: archetype,
        firstRunLanding: planetsLanded === 0,
        firstVisitToPlanet: true,
        interest: Math.min(1, seconds / 600 + planetsLanded * 0.12),
        time: seconds,
        luck: build.luck,
        survey: build.survey,
        random: rng.next
      })
      planetsLanded += 1
      increment(coverage.planetArchetypes, archetype)
      increment(coverage.surfaceScenarios, surface.scenario)
      events.push({ t: seconds + nodeSeconds * 0.55, kind: 'planetLanded', archetype, scenario: surface.scenario })
      economy.scrap += Math.round(surface.resourceCount * (8 + selected.config.rewards.resourceMultiplier * 6))
      economy.crystal += Math.round(surface.resourceCount * (4 + selected.config.rewards.resourceMultiplier * 4))
      economy.cores += surface.bossCacheCount > 0 || rng.chance(0.08 + policy.cacheGreed * 0.04) ? 1 : 0
      economy.mutationSignals += surface.resourceCount > 0 && rng.chance(0.35 + policy.cacheGreed * 0.25) ? 1 : 0
      if (surface.threatCount + surface.bossCount > 0) damageTaken += Math.round((surface.threatCount + surface.bossCount * 2) * (3 + policy.cacheGreed * 5))
    }

    while (economy.mutationSignals > 0) {
      const candidates = upgrades.filter((upgrade) => (build[upgrade.id] ?? 0) < upgrade.max)
      const chosen = candidates.slice().sort((a, b) => scoreUpgradeChoice(b, policy) - scoreUpgradeChoice(a, policy))[0]
      build[chosen.id] = Math.min(chosen.max, (build[chosen.id] ?? 0) + 1)
      economy.mutationSignals -= 1
      increment(coverage.upgradesChosen, chosen.id)
      events.push({ t: seconds + nodeSeconds * 0.8, kind: 'upgradeChosen', upgradeId: chosen.id, rank: build[chosen.id] })
    }

    events.push({ t: seconds + nodeSeconds, kind: 'resourceGained', ...economy })
    seconds += nodeSeconds
    nodesCleared += selected.kind === 'station' ? 0 : 1
    events.push({ t: seconds, kind: 'nodeCleared', templateId: selected.config.templateId, secondsInNode: nodeSeconds })

    if (damageTaken >= 100) {
      outcome = 'destroyed'
      deathCause = selected.config.hazards.includes('asteroids') ? 'hazard' : planetsLanded > 0 && policy.cacheGreed > 0.7 ? 'surface' : 'contact'
      break
    }
    if (selected.kind === 'final') {
      outcome = 'finalCleared'
      finalReached = true
      break
    }
    sectorMap = completeSectorNode(sectorMap)
  }

  if (outcome === 'timeLimit' && deathCause === 'none' && nodesCleared > 0) outcome = 'extracted'
  events.push({ t: seconds, kind: 'runEnded', outcome, deathCause })

  return {
    seed: options.seed,
    policy: options.policy,
    outcome,
    deathCause,
    seconds,
    nodesCleared,
    finalReached,
    planetsLanded,
    kills,
    damageTaken,
    economy,
    build: { upgrades: build, relicCount: 0, evolvedWeapons: 0 },
    coverage,
    events,
    flags: []
  }
}
```

- [ ] **Step 5: Run runner tests and verify pass**

Run: `npm run test -- tests/sim-runner.spec.ts`

Expected: PASS.

---

## Phase 2: Batch Metrics and CLI

**Outcome:** Developers can run batches from the terminal and get useful summaries before the dashboard exists.

### Task 4: Add Aggregation and Balance Flags

**Files:**
- Create: `src/sim/sim-metrics.ts`
- Create: `tests/sim-metrics.spec.ts`

- [ ] **Step 1: Write metrics tests**

Create `tests/sim-metrics.spec.ts`:

```ts
import { expect, test } from '@playwright/test'
import { summarizeSimBatch } from '../src/sim/sim-metrics'
import { runSimPlaythrough } from '../src/sim/sim-runner'

test('batch summary aggregates survival route planets and economy', () => {
  const options = { seed: 300, runs: 5, policy: 'balanced' as const, maxSeconds: 600, difficulty: 'normal' as const }
  const runs = Array.from({ length: options.runs }, (_, index) => runSimPlaythrough({ ...options, seed: options.seed + index }))
  const summary = summarizeSimBatch(options, runs)

  expect(summary.runs).toHaveLength(5)
  expect(summary.survival.averageSeconds).toBeGreaterThan(0)
  expect(summary.route.averageNodesCleared).toBeGreaterThan(0)
  expect(Object.values(summary.route.templateCounts).reduce((sum, count) => sum + count, 0)).toBeGreaterThan(0)
})

test('batch summary flags destructive median survival', () => {
  const options = { seed: 400, runs: 3, policy: 'stress' as const, maxSeconds: 120, difficulty: 'stress' as const }
  const runs = Array.from({ length: options.runs }, (_, index) => ({
    ...runSimPlaythrough({ ...options, seed: options.seed + index }),
    outcome: 'destroyed' as const,
    seconds: 45,
    damageTaken: 150
  }))
  const summary = summarizeSimBatch(options, runs)

  expect(summary.balanceFlags.some((flag) => flag.includes('Median survival'))).toBe(true)
})
```

- [ ] **Step 2: Run metrics tests and verify failure**

Run: `npm run test -- tests/sim-metrics.spec.ts`

Expected: FAIL because `sim-metrics.ts` does not exist.

- [ ] **Step 3: Implement metrics**

Create `src/sim/sim-metrics.ts`:

```ts
import type { SimBatchOptions, SimBatchSummary, SimRunResult } from './sim-types'

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function median(values: number[]) {
  if (!values.length) return 0
  const sorted = values.slice().sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

function mergeCounts(records: Array<Record<string, number>>) {
  const merged: Record<string, number> = {}
  for (const record of records) {
    for (const [key, value] of Object.entries(record)) merged[key] = (merged[key] ?? 0) + value
  }
  return merged
}

export function summarizeSimBatch(options: SimBatchOptions, runs: SimRunResult[]): SimBatchSummary {
  const seconds = runs.map((run) => run.seconds)
  const medianSeconds = median(seconds)
  const balanceFlags: string[] = []
  const destroyedRate = runs.filter((run) => run.outcome === 'destroyed').length / Math.max(1, runs.length)
  if (medianSeconds < 180) balanceFlags.push(`Median survival ${Math.round(medianSeconds)}s is below the 180s early-run floor.`)
  if (destroyedRate > 0.75) balanceFlags.push(`Destroyed rate ${Math.round(destroyedRate * 100)}% is above the 75% watch threshold.`)

  return {
    options,
    runs,
    survival: {
      averageSeconds: average(seconds),
      medianSeconds,
      bestSeconds: Math.max(0, ...seconds)
    },
    route: {
      averageNodesCleared: average(runs.map((run) => run.nodesCleared)),
      finalReached: runs.filter((run) => run.finalReached).length,
      templateCounts: mergeCounts(runs.map((run) => run.coverage.routeTemplates))
    },
    planets: {
      averageLandings: average(runs.map((run) => run.planetsLanded)),
      archetypeCounts: mergeCounts(runs.map((run) => run.coverage.planetArchetypes)),
      scenarioCounts: mergeCounts(runs.map((run) => run.coverage.surfaceScenarios))
    },
    economy: {
      averageScrap: average(runs.map((run) => run.economy.scrap)),
      averageCrystal: average(runs.map((run) => run.economy.crystal)),
      averageCores: average(runs.map((run) => run.economy.cores)),
      averageMutationSignals: average(runs.map((run) => run.economy.mutationSignals))
    },
    balanceFlags
  }
}

export function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${secs}`
}
```

- [ ] **Step 4: Run metrics tests and verify pass**

Run: `npm run test -- tests/sim-metrics.spec.ts`

Expected: PASS.

### Task 5: Add CLI Runner

**Files:**
- Create: `src/sim/sim-cli.ts`
- Modify: `package.json`

- [ ] **Step 1: Add CLI script to `package.json`**

Add scripts:

```json
{
  "sim": "tsx src/sim/sim-cli.ts",
  "test:sim": "playwright test tests/sim-rng.spec.ts tests/sim-runner.spec.ts tests/sim-metrics.spec.ts"
}
```

Add dev dependency:

```json
{
  "tsx": "^4.20.0"
}
```

- [ ] **Step 2: Install dependency**

Run: `npm install`

Expected: PASS and `package-lock.json` updates.

- [ ] **Step 3: Implement CLI**

Create `src/sim/sim-cli.ts`:

```ts
import { formatSeconds, summarizeSimBatch } from './sim-metrics'
import { runSimPlaythrough } from './sim-runner'
import type { SimBatchOptions, SimPolicyId } from './sim-types'

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = 'true'] = arg.replace(/^--/, '').split('=')
    return [key, value] as const
  })
)

const options: SimBatchOptions = {
  seed: Number(args.get('seed') ?? 1000),
  runs: Number(args.get('runs') ?? 10),
  policy: (args.get('policy') ?? 'balanced') as SimPolicyId,
  maxSeconds: Number(args.get('maxSeconds') ?? 900),
  difficulty: (args.get('difficulty') ?? 'normal') as SimBatchOptions['difficulty']
}

const runs = Array.from({ length: options.runs }, (_, index) => runSimPlaythrough({ ...options, seed: options.seed + index }))
const summary = summarizeSimBatch(options, runs)

console.log(`Simulation batch: ${options.runs} runs, ${options.policy}, seed ${options.seed}`)
console.log(`Survival: avg ${formatSeconds(summary.survival.averageSeconds)}, median ${formatSeconds(summary.survival.medianSeconds)}, best ${formatSeconds(summary.survival.bestSeconds)}`)
console.log(`Route: avg nodes ${summary.route.averageNodesCleared.toFixed(1)}, final reached ${summary.route.finalReached}/${options.runs}`)
console.log(`Planets: avg landings ${summary.planets.averageLandings.toFixed(1)}`)
console.log(`Economy: scrap ${summary.economy.averageScrap.toFixed(1)}, crystal ${summary.economy.averageCrystal.toFixed(1)}, cores ${summary.economy.averageCores.toFixed(1)}`)
if (summary.balanceFlags.length) {
  console.log('Balance flags:')
  for (const flag of summary.balanceFlags) console.log(`- ${flag}`)
}
```

- [ ] **Step 4: Run the CLI**

Run: `npm run sim -- --runs=10 --policy=balanced --seed=1000`

Expected: terminal output includes `Simulation batch: 10 runs`.

---

## Phase 3: HTML Dashboard MVP

**Outcome:** A local dashboard lets the user click a button, run playthrough batches, and read a nicer report.

### Task 6: Add Dashboard Worker

**Files:**
- Create: `src/sim/sim-worker.ts`

- [ ] **Step 1: Implement worker protocol**

Create `src/sim/sim-worker.ts`:

```ts
import { summarizeSimBatch } from './sim-metrics'
import { runSimPlaythrough } from './sim-runner'
import type { SimBatchOptions } from './sim-types'

type WorkerRequest = { kind: 'runBatch'; options: SimBatchOptions }

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  if (event.data.kind !== 'runBatch') return
  const { options } = event.data
  const runs = []
  for (let index = 0; index < options.runs; index += 1) {
    runs.push(runSimPlaythrough({ ...options, seed: options.seed + index }))
    self.postMessage({ kind: 'progress', completed: index + 1, total: options.runs })
  }
  self.postMessage({ kind: 'summary', summary: summarizeSimBatch(options, runs) })
}
```

### Task 7: Add Dashboard Page and Controller

**Files:**
- Create: `sim-lab.html`
- Create: `src/sim/sim-dashboard.ts`
- Modify: `package.json`

- [ ] **Step 1: Create dashboard HTML**

Create `sim-lab.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Galactic Hordes Sim Lab</title>
  </head>
  <body>
    <main class="sim-lab">
      <header>
        <div>
          <p>Galactic Hordes</p>
          <h1>Simulation Lab</h1>
        </div>
        <button id="run">Run Playthroughs</button>
      </header>
      <section class="controls">
        <label>Runs <input id="runs" type="number" min="1" max="500" value="10" /></label>
        <label>Seed <input id="seed" type="number" value="1000" /></label>
        <label>Max Seconds <input id="maxSeconds" type="number" min="60" max="3600" value="900" /></label>
        <label>Policy
          <select id="policy">
            <option value="balanced">Balanced</option>
            <option value="survival">Survival</option>
            <option value="planetHunter">Planet Hunter</option>
            <option value="greedyCache">Greedy Cache</option>
            <option value="routeRusher">Route Rusher</option>
            <option value="stress">Stress</option>
          </select>
        </label>
      </section>
      <section id="progress" class="progress">Ready.</section>
      <section id="summary" class="summary"></section>
      <section id="runsTable" class="runs-table"></section>
    </main>
    <script type="module" src="/src/sim/sim-dashboard.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Implement dashboard controller**

Create `src/sim/sim-dashboard.ts`:

```ts
import './sim-lab.css'
import { formatSeconds } from './sim-metrics'
import type { SimBatchOptions, SimBatchSummary, SimPolicyId } from './sim-types'

const worker = new Worker(new URL('./sim-worker.ts', import.meta.url), { type: 'module' })
const runButton = document.querySelector<HTMLButtonElement>('#run')!
const progress = document.querySelector<HTMLElement>('#progress')!
const summaryEl = document.querySelector<HTMLElement>('#summary')!
const runsTable = document.querySelector<HTMLElement>('#runsTable')!

function inputNumber(id: string) {
  return Number(document.querySelector<HTMLInputElement>(`#${id}`)!.value)
}

function options(): SimBatchOptions {
  return {
    runs: inputNumber('runs'),
    seed: inputNumber('seed'),
    maxSeconds: inputNumber('maxSeconds'),
    policy: document.querySelector<HTMLSelectElement>('#policy')!.value as SimPolicyId,
    difficulty: 'normal'
  }
}

function renderSummary(summary: SimBatchSummary) {
  summaryEl.innerHTML = `
    <article><span>Median Survival</span><b>${formatSeconds(summary.survival.medianSeconds)}</b></article>
    <article><span>Best Survival</span><b>${formatSeconds(summary.survival.bestSeconds)}</b></article>
    <article><span>Avg Nodes</span><b>${summary.route.averageNodesCleared.toFixed(1)}</b></article>
    <article><span>Avg Planets</span><b>${summary.planets.averageLandings.toFixed(1)}</b></article>
    <article><span>Avg Scrap</span><b>${summary.economy.averageScrap.toFixed(0)}</b></article>
    <article><span>Flags</span><b>${summary.balanceFlags.length}</b></article>
  `
  runsTable.innerHTML = `
    <h2>Runs</h2>
    <table>
      <thead><tr><th>Seed</th><th>Outcome</th><th>Time</th><th>Nodes</th><th>Planets</th><th>Damage</th><th>Scrap</th></tr></thead>
      <tbody>
        ${summary.runs.map((run) => `
          <tr>
            <td>${run.seed}</td>
            <td>${run.outcome}</td>
            <td>${formatSeconds(run.seconds)}</td>
            <td>${run.nodesCleared}</td>
            <td>${run.planetsLanded}</td>
            <td>${run.damageTaken}</td>
            <td>${run.economy.scrap}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

worker.onmessage = (event: MessageEvent) => {
  if (event.data.kind === 'progress') progress.textContent = `Running ${event.data.completed}/${event.data.total}...`
  if (event.data.kind === 'summary') {
    runButton.disabled = false
    progress.textContent = 'Complete.'
    renderSummary(event.data.summary)
  }
}

runButton.addEventListener('click', () => {
  runButton.disabled = true
  progress.textContent = 'Starting...'
  worker.postMessage({ kind: 'runBatch', options: options() })
})
```

- [ ] **Step 3: Create dashboard CSS**

Create `src/sim/sim-lab.css`:

```css
body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #101319;
  color: #eef5ff;
}

.sim-lab {
  width: min(1180px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 28px 0 48px;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

header p {
  margin: 0 0 4px;
  color: #7fd8ff;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0;
  font-size: 34px;
}

button,
input,
select {
  border: 1px solid #344052;
  background: #171d26;
  color: #eef5ff;
  border-radius: 6px;
  padding: 10px 12px;
}

button {
  cursor: pointer;
  background: #1e8cff;
  border-color: #4ba4ff;
  font-weight: 700;
}

button:disabled {
  opacity: 0.55;
  cursor: wait;
}

.controls,
.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 24px;
}

label,
article,
.progress,
.runs-table {
  background: #171d26;
  border: 1px solid #283241;
  border-radius: 8px;
  padding: 14px;
}

label {
  display: grid;
  gap: 8px;
  color: #9fb0c8;
  font-size: 13px;
}

.progress {
  margin-top: 16px;
}

article span {
  display: block;
  color: #9fb0c8;
  font-size: 12px;
  text-transform: uppercase;
}

article b {
  display: block;
  margin-top: 8px;
  font-size: 24px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  border-bottom: 1px solid #283241;
  text-align: left;
}
```

- [ ] **Step 4: Add dashboard script**

Add to `package.json`:

```json
{
  "sim:lab": "vite --host 127.0.0.1 --port 5177 sim-lab.html"
}
```

- [ ] **Step 5: Run dashboard**

Run: `npm run sim:lab`

Expected: Vite serves the dashboard on `http://127.0.0.1:5177/sim-lab.html`.

---

## Phase 4: Procedural Coverage and Balance Envelopes

**Outcome:** The simulation becomes useful for balance, not just smoke testing.

### Task 8: Add Coverage Expectations

**Files:**
- Modify: `tests/sim-metrics.spec.ts`
- Modify: `src/sim/sim-metrics.ts`
- Modify: `src/sim/sim-dashboard.ts`

- [ ] **Step 1: Add tests for coverage flags**

Add to `tests/sim-metrics.spec.ts`:

```ts
test('batch summary flags missing procedural variety', () => {
  const options = { seed: 500, runs: 5, policy: 'balanced' as const, maxSeconds: 600, difficulty: 'normal' as const }
  const runs = Array.from({ length: options.runs }, (_, index) => {
    const run = runSimPlaythrough({ ...options, seed: options.seed + index })
    run.coverage.routeTemplates = { safeDrift: 1 }
    run.coverage.planetArchetypes = { cache: 1 }
    return run
  })

  const summary = summarizeSimBatch(options, runs)

  expect(summary.balanceFlags.some((flag) => flag.includes('route template variety'))).toBe(true)
  expect(summary.balanceFlags.some((flag) => flag.includes('planet archetype variety'))).toBe(true)
})
```

- [ ] **Step 2: Implement coverage flags**

Add these checks in `summarizeSimBatch`:

```ts
if (Object.keys(mergeCounts(runs.map((run) => run.coverage.routeTemplates))).length < 4) {
  balanceFlags.push('Low route template variety across batch; expected at least 4 template families.')
}
if (Object.keys(mergeCounts(runs.map((run) => run.coverage.planetArchetypes))).length < 3) {
  balanceFlags.push('Low planet archetype variety across batch; expected at least 3 archetype families.')
}
```

- [ ] **Step 3: Surface coverage in the dashboard**

Add a coverage section to `renderSummary`:

```ts
const templateRows = Object.entries(summary.route.templateCounts)
  .map(([key, value]) => `<li><b>${key}</b><span>${value}</span></li>`)
  .join('')
const planetRows = Object.entries(summary.planets.archetypeCounts)
  .map(([key, value]) => `<li><b>${key}</b><span>${value}</span></li>`)
  .join('')
```

Append the generated lists below the summary cards.

- [ ] **Step 4: Run tests**

Run: `npm run test:sim`

Expected: PASS.

### Task 9: Add Target Envelopes

**Files:**
- Create: `src/sim/sim-targets.ts`
- Modify: `src/sim/sim-metrics.ts`
- Create: `tests/sim-targets.spec.ts`

- [ ] **Step 1: Define initial balance targets**

Create `src/sim/sim-targets.ts`:

```ts
import type { SimPolicyId } from './sim-types'

export interface SimBalanceTarget {
  medianSurvivalMin: number
  medianSurvivalMax: number
  destroyedRateMax: number
  averagePlanetsMin: number
  averageNodesMin: number
}

export const simBalanceTargets: Record<SimPolicyId, SimBalanceTarget> = {
  balanced: { medianSurvivalMin: 240, medianSurvivalMax: 1200, destroyedRateMax: 0.65, averagePlanetsMin: 1.2, averageNodesMin: 1.5 },
  survival: { medianSurvivalMin: 360, medianSurvivalMax: 1500, destroyedRateMax: 0.5, averagePlanetsMin: 0.8, averageNodesMin: 1.5 },
  planetHunter: { medianSurvivalMin: 240, medianSurvivalMax: 1200, destroyedRateMax: 0.7, averagePlanetsMin: 2.5, averageNodesMin: 1.2 },
  greedyCache: { medianSurvivalMin: 180, medianSurvivalMax: 1100, destroyedRateMax: 0.8, averagePlanetsMin: 1.8, averageNodesMin: 1 },
  routeRusher: { medianSurvivalMin: 220, medianSurvivalMax: 1200, destroyedRateMax: 0.7, averagePlanetsMin: 0.3, averageNodesMin: 2 },
  stress: { medianSurvivalMin: 60, medianSurvivalMax: 900, destroyedRateMax: 0.95, averagePlanetsMin: 0.2, averageNodesMin: 0.8 }
}
```

- [ ] **Step 2: Use targets in summary flags**

In `sim-metrics.ts`, import `simBalanceTargets` and compare the current summary values against the target for `options.policy`.

- [ ] **Step 3: Add tests for target-based flags**

Create `tests/sim-targets.spec.ts` with a run batch that violates `averagePlanetsMin` and assert that a planet-specific flag appears.

- [ ] **Step 4: Run tests**

Run: `npm run test:sim`

Expected: PASS after `test:sim` includes `tests/sim-targets.spec.ts`.

---

## Phase 5: Simulation Fidelity Expansion

**Outcome:** The abstract runner gradually tracks the real game loop closely enough to guide tuning decisions.

### Task 10: Model Space Node Pressure More Explicitly

**Files:**
- Create: `src/sim/sim-space.ts`
- Modify: `src/sim/sim-runner.ts`
- Create: `tests/sim-space.spec.ts`

- [ ] **Step 1: Extract space node simulation**

Create `simulateSpaceNode({ node, policy, rng, build, seconds })` returning:

```ts
{
  nodeSeconds: number
  kills: number
  damageTaken: number
  deathCause: 'contact' | 'projectile' | 'hazard' | 'none'
  stationAvailable: boolean
}
```

Use `node.config.enemies.spawnMultiplier`, `node.config.waves`, `node.config.hazards`, and `node.config.hazardConfig`.

- [ ] **Step 2: Add tests**

Assert that `bossGate` and `finalStand` produce higher expected pressure than `safeDrift`, and asteroid nodes can produce hazard damage.

- [ ] **Step 3: Replace inline runner pressure math**

Move the current node damage/kills logic out of `sim-runner.ts` into `sim-space.ts`.

### Task 11: Model Planet Surface Outcomes

**Files:**
- Create: `src/sim/sim-surface.ts`
- Modify: `src/sim/sim-runner.ts`
- Create: `tests/sim-surface.spec.ts`

- [ ] **Step 1: Extract surface simulation**

Create `simulateSurfaceVisit({ archetype, policy, rng, build, seconds, landingIndex })` returning:

```ts
{
  scenario: SurfaceScenarioKind
  event: SurfaceEventKind
  damageTaken: number
  resources: SimEconomyState
  mutationSignals: number
  discoveries: number
}
```

Use `planSurfaceEncounter`, `surfaceResourceValue`, `bossCacheValue`, and surface balance values where possible.

- [ ] **Step 2: Add tests**

Assert that planet-hunter policy lands more often than route-rusher across the same seeds, and greedy-cache earns more resources with more damage than survival policy.

### Task 12: Model Upgrade Offers and Build Evolution

**Files:**
- Create: `src/sim/sim-upgrades.ts`
- Modify: `src/sim/sim-runner.ts`
- Create: `tests/sim-upgrades.spec.ts`

- [ ] **Step 1: Extract upgrade selection**

Create `chooseSimUpgrade({ build, policy, rng })` using `workbenchRollableUpgrades`, `upgrades`, `upgradeMaxRank`, and `scoreUpgradeChoice`.

- [ ] **Step 2: Add tests**

Assert survival policy prefers shield/repair/spacesuit paths when available, and route-rusher/greedy policies prefer weapon/economy paths.

### Task 13: Model Stations and Extraction

**Files:**
- Create: `src/sim/sim-stations.ts`
- Modify: `src/sim/sim-runner.ts`
- Create: `tests/sim-stations.spec.ts`

- [ ] **Step 1: Add station service outcomes**

Create `simulateStationDock({ node, state })` that applies repair, workbench signals, trade resources, and scan-like coverage benefits.

- [ ] **Step 2: Add tests**

Assert station nodes repair damage and add workbench opportunities without counting as combat nodes cleared.

---

## Phase 6: Dashboard Reports and Export

**Outcome:** The dashboard becomes the main human workflow for balance review.

### Task 14: Add Presets and Report Export

**Files:**
- Modify: `sim-lab.html`
- Modify: `src/sim/sim-dashboard.ts`
- Modify: `src/sim/sim-lab.css`

- [ ] **Step 1: Add preset buttons**

Add buttons with fixed option patches:

```ts
const presets = {
  quick10: { runs: 10, maxSeconds: 900, policy: 'balanced' },
  balance50: { runs: 50, maxSeconds: 1200, policy: 'balanced' },
  planetVariety: { runs: 30, maxSeconds: 1200, policy: 'planetHunter' },
  economySweep: { runs: 30, maxSeconds: 1200, policy: 'greedyCache' },
  latePressure: { runs: 20, maxSeconds: 1800, policy: 'stress' }
}
```

- [ ] **Step 2: Add JSON export**

Store the last `SimBatchSummary` in memory and add a button that creates a Blob download named `galactic-hordes-sim-summary-<seed>.json`.

- [ ] **Step 3: Add flag panel**

Render `summary.balanceFlags` as a visible panel above the run table. If no flags exist, show `No balance flags for this batch.`

### Task 15: Add Visual Charts Without External Dependencies

**Files:**
- Create: `src/sim/sim-charts.ts`
- Modify: `src/sim/sim-dashboard.ts`
- Modify: `src/sim/sim-lab.css`

- [ ] **Step 1: Implement simple SVG bars**

Create helpers for horizontal bar charts from `{ label, value }[]`.

- [ ] **Step 2: Add charts**

Render:

- Outcome counts.
- Route template counts.
- Planet archetype counts.
- Death cause counts.

---

## Phase 7: Calibration Against Real Browser Runs

**Outcome:** The extracted simulation can be checked against the actual rendered game so it does not drift into fantasy.

### Task 16: Add Test-Only Browser Harness API

**Files:**
- Modify: `src/main.ts`
- Create: `tests/playthrough-harness.spec.ts`

- [ ] **Step 1: Add a guarded harness flag**

Only expose the harness when `new URLSearchParams(window.location.search).get('harness') === '1'`.

- [ ] **Step 2: Add minimal snapshots**

Expose:

```ts
window.__galacticHarness = {
  snapshot: () => ({
    state: this.state,
    time: this.stats.time,
    hull: this.player.hull,
    score: this.stats.score,
    planets: this.stats.planets,
    resources: this.resources,
    enemies: this.enemies.length,
    pickups: this.pickups.length,
    currentNode: currentSectorNode(this.sectorMap).config.templateId,
    perf: this.perf
  })
}
```

- [ ] **Step 3: Add Playwright smoke test**

Launch `/?harness=1&resetProgress=1`, click through title/mothership/sector map, wait for `playing`, and assert the harness snapshot contains live time and current node data.

### Task 17: Compare Real Runs With Sim Envelopes

**Files:**
- Create: `tests/playthrough-calibration.spec.ts`
- Modify: `src/sim/sim-targets.ts`

- [ ] **Step 1: Run short real browser samples**

Use Playwright keyboard/pointer automation for 2-3 seeds and collect survival time, node template, planet count, and FPS.

- [ ] **Step 2: Compare to broad envelopes**

Assert real values are inside wide sim-derived ranges, not exact matches.

---

## Phase 8: Documentation and Tuning Workflow

**Outcome:** The simulation becomes understandable, repeatable, and useful for tuning decisions across future development sessions.

### Task 18: Add User-Facing Simulation Docs

**Files:**
- Create: `docs/simulation-playthrough-lab.md`
- Modify: `README.md`

- [ ] **Step 1: Create the lab guide**

Create `docs/simulation-playthrough-lab.md`:

```md
# Simulation Playthrough Lab

The Simulation Playthrough Lab runs deterministic abstract playthroughs of Galactic Hordes. It is for balance review, procedural coverage checks, and quick regression detection. It is not a frame-perfect replay of the canvas game.

## Dashboard

Run:

```bash
npm run sim:lab
```

Open:

```txt
http://127.0.0.1:5177/sim-lab.html
```

Use `Quick 10` for a fast gut check, `Balance 50` for normal tuning, `Planet Variety` for surface and archetype coverage, `Economy Sweep` for reward pressure, and `Late Pressure` for stress testing.

## CLI

Run:

```bash
npm run sim -- --runs=10 --policy=balanced --seed=1000
```

Useful policies:

- `balanced`: cautious normal play.
- `survival`: avoids risk and prefers defensive upgrades.
- `planetHunter`: lands often and tests surface variety.
- `greedyCache`: chases rewards and exposes economy exploits.
- `routeRusher`: clears route nodes quickly.
- `stress`: pushes pressure and reward systems beyond normal play.

## Reading Results

Use median survival, destroyed rate, route template variety, planet archetype variety, and resource averages as directional signals. Investigate balance flags before changing tuning values.
```

- [ ] **Step 2: Link the guide from README**

Add a `Simulation Lab` subsection to `README.md`:

```md
## Simulation Lab

The extracted simulation lab runs deterministic playthrough batches for balance review and procedural coverage. Run `npm run sim:lab` for the dashboard or `npm run sim -- --runs=10 --policy=balanced --seed=1000` for a terminal summary.

See [docs/simulation-playthrough-lab.md](docs/simulation-playthrough-lab.md) for presets, policies, and report interpretation.
```

### Task 19: Document Model Fidelity and Known Boundaries

**Files:**
- Create: `docs/simulation-model-notes.md`

- [ ] **Step 1: Create engineering notes**

Create `docs/simulation-model-notes.md`:

```md
# Simulation Model Notes

The simulation imports real balance and procedural modules where possible, then models playthrough outcomes at a higher level than the rendered game.

## Modeled

- Sector-map generation, route selection, template coverage, and node progress.
- Abstract space pressure from pace, wave order, hazards, enemy multipliers, and policy risk.
- Planet landing frequency, archetype coverage, surface scenarios, resources, and surface damage.
- Upgrade choice pressure through policy-weighted workbench choices.
- Station services, extraction outcomes, death causes, and economy summaries.

## Not Frame-Perfect

- Individual enemy steering, projectile geometry, collision timing, and canvas rendering.
- Exact pickup movement, player micro-dodging, and per-frame auto-fire targeting.
- Real browser FPS. Performance must be checked through Playwright/browser calibration, not the pure simulation.

## Calibration Rule

When a real browser sample and simulation disagree, treat the browser as evidence and adjust either the simulation model or the target envelope. Do not tune game balance from simulation output alone when the browser sample shows a different player experience.
```

### Task 20: Document Balance Targets

**Files:**
- Create: `docs/simulation-balance-targets.md`
- Modify: `docs/game-balance-design.md`

- [ ] **Step 1: Create target-envelope document**

Create `docs/simulation-balance-targets.md`:

```md
# Simulation Balance Targets

These targets are envelopes, not exact expected outputs. They exist to catch large balance shifts and guide tuning discussions.

| Policy | Median Survival | Destroyed Rate | Avg Planets | Avg Nodes |
| --- | ---: | ---: | ---: | ---: |
| balanced | 4:00-20:00 | <= 65% | >= 1.2 | >= 1.5 |
| survival | 6:00-25:00 | <= 50% | >= 0.8 | >= 1.5 |
| planetHunter | 4:00-20:00 | <= 70% | >= 2.5 | >= 1.2 |
| greedyCache | 3:00-18:20 | <= 80% | >= 1.8 | >= 1.0 |
| routeRusher | 3:40-20:00 | <= 70% | >= 0.3 | >= 2.0 |
| stress | 1:00-15:00 | <= 95% | >= 0.2 | >= 0.8 |

Investigate any batch that misses procedural variety thresholds:

- Fewer than four route template families in a normal batch.
- Fewer than three planet archetype families in a normal batch.
- One death cause dominating more than 70% of destroyed runs outside stress presets.
```

- [ ] **Step 2: Link targets from balance docs**

Add a paragraph to `docs/game-balance-design.md`:

```md
## Simulation Balance Lab

The simulation lab provides batch-level balance signals for survival, route progress, economy, and procedural variety. Use [simulation balance targets](simulation-balance-targets.md) as broad tuning envelopes, then verify major changes in the browser when they affect combat feel, landing flow, or performance.
```

### Task 21: Add Fast CI Simulation Test

**Files:**
- Modify: `package.json`
- Create: `tests/sim-ci.spec.ts`

- [ ] **Step 1: Add `test:sim:ci`**

Add:

```json
{
  "test:sim:ci": "playwright test tests/sim-ci.spec.ts"
}
```

- [ ] **Step 2: Add CI-safe batch test**

Create a 10-run balanced batch with fixed seed and assert:

- Median survival is above the early-run floor.
- Route template variety includes at least four templates.
- Planet archetype variety includes at least three archetypes.
- Destroyed rate is below the policy target.

### Task 22: Add Slow Local Sweep

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add local sweep script**

Add:

```json
{
  "sim:sweep": "npm run sim -- --runs=100 --policy=balanced --seed=5000 --maxSeconds=1800"
}
```

- [ ] **Step 2: Document usage**

Add this sentence to `docs/simulation-playthrough-lab.md`:

```md
Use `npm run sim:sweep` before merging broad balance changes that affect route generation, enemy pressure, planet rewards, upgrade rolls, or run progression.
```

---

## Phase 9: Ideal Long-Term Analysis Layer

**Outcome:** The lab becomes a tuning cockpit rather than a test-only utility.

### Task 23: Add Scenario Matrix Runs

**Files:**
- Create: `src/sim/sim-matrix.ts`
- Modify: `src/sim/sim-dashboard.ts`

- [ ] Add a matrix runner that executes several policies over the same seed range.
- [ ] Render policy comparison rows for median survival, destroyed rate, average planets, average nodes, average resources, and most common death cause.

### Task 24: Add Regression Baselines

**Files:**
- Create: `src/sim/sim-baselines.ts`
- Create: `tests/sim-regression.spec.ts`

- [ ] Store named baseline envelopes, not exact outputs.
- [ ] Compare current summaries against baseline tolerances.
- [ ] Flag meaningful shifts such as `balanced median survival changed by more than 25%`.

### Task 25: Add Seed Explorer

**Files:**
- Modify: `src/sim/sim-dashboard.ts`
- Modify: `src/sim/sim-lab.css`

- [ ] Let a user click a table row to inspect one run's event timeline.
- [ ] Show route selections, planet landings, upgrades, damage events, resource spikes, and death/extraction.
- [ ] Add a "copy seed command" button that prints `npm run sim -- --runs=1 --seed=<seed> --policy=<policy>`.

---

## Verification Before Completion

Run these commands before calling the project complete:

```bash
npm run test:sim
npm run test:sim:ci
npm run build
npm run sim -- --runs=10 --policy=balanced --seed=1000
```

For dashboard verification:

```bash
npm run sim:lab
```

Then open `http://127.0.0.1:5177/sim-lab.html`, run `Quick 10`, run `Planet Variety`, and confirm the dashboard updates without freezing.

For calibration verification after Phase 7:

```bash
npm run test -- tests/playthrough-harness.spec.ts tests/playthrough-calibration.spec.ts
```

---

## Implementation Notes

- Keep the simulation deterministic: every stochastic decision must use `SimRng`, never `Math.random`.
- Keep simulation code pure until the dashboard layer. The runner should not touch DOM, `localStorage`, timers, or canvas.
- Import real balance/procedural data from existing modules. Do not copy constants into `src/sim/`.
- Prefer broad balance envelopes over exact expectations. The simulation is a decision-support model, not a frame-perfect replay.
- Keep Playwright calibration small. Full rendered playthroughs are slower and should validate the sim, not replace it.
