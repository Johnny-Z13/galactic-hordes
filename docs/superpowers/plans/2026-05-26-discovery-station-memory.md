# Discovery Station Memory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Galactic Hordes runs feel remembered by adding station visit memory, station contacts, route-map station persistence, richer planet names, and journey debrief telemetry.

**Architecture:** Add focused pure modules for station memory and planet naming, then wire them into the existing `VectorShooter` class. Keep the implementation run-local and deterministic so it does not disturb persistent mothership save data.

**Tech Stack:** TypeScript, Vite, Playwright test runner.

---

### Task 1: Station Memory Module

**Files:**
- Create: `src/station-memory.ts`
- Test: `tests/station-memory.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { expect, test } from '@playwright/test'
import { createSectorMap } from '../src/sector-map'
import { buildStationVisitRecord, journeyDistanceLy, stationContactForNode, stationNameForNode } from '../src/station-memory'

test('station names and contacts are deterministic per sector node', () => {
  const node = createSectorMap(42).nodes.find((candidate) => candidate.kind === 'station')!
  expect(stationNameForNode(node)).toBe(stationNameForNode(node))
  expect(stationNameForNode(node)).toMatch(/^SPACE STATION [0-9]+$/)
  expect(stationContactForNode(node)).toEqual(stationContactForNode(node))
  expect(stationContactForNode(node).name.length).toBeGreaterThan(4)
})

test('station visit records preserve service results and rumor text', () => {
  const node = createSectorMap(77).nodes.find((candidate) => candidate.kind === 'station')!
  const record = buildStationVisitRecord({
    node,
    dockedAtSeconds: 128,
    repaired: 22,
    workbenchSignals: 1,
    scrap: 35,
    crystal: 1
  })

  expect(record.nodeId).toBe(node.id)
  expect(record.stationName).toBe(stationNameForNode(node))
  expect(record.services).toEqual(node.stationServices)
  expect(record.rumor.length).toBeGreaterThan(20)
})

test('journey distance rewards nodes planets stations and skipped stations', () => {
  expect(journeyDistanceLy({ nodesCleared: 3, planetsVisited: 2, stationsDocked: 1, skippedStations: 1 })).toBe(137)
})
```

- [ ] **Step 2: Run red test**

Run: `npm test tests/station-memory.spec.ts`

Expected: fails because `src/station-memory.ts` does not exist.

- [ ] **Step 3: Implement module**

Create deterministic hash, station name, contact, rumor, record, and distance helpers in `src/station-memory.ts`.

- [ ] **Step 4: Run green test**

Run: `npm test tests/station-memory.spec.ts`

Expected: pass.

### Task 2: Planet Name Module

**Files:**
- Create: `src/planet-names.ts`
- Test: `tests/planet-names.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { expect, test } from '@playwright/test'
import { planetNameFor } from '../src/planet-names'
import type { PlanetArchetype } from '../src/surface-encounters'

test('planet names are deterministic and compact', () => {
  const name = planetNameFor({ archetype: 'relic', biomeId: 'ruinWorld', chunkX: 4, chunkY: -2, index: 1 })
  expect(name).toBe(planetNameFor({ archetype: 'relic', biomeId: 'ruinWorld', chunkX: 4, chunkY: -2, index: 1 }))
  expect(name.split(/\s+/).length).toBeLessThanOrEqual(3)
})

test('planet names vary across archetypes and coordinates', () => {
  const archetypes: PlanetArchetype[] = ['cache', 'hostile', 'repair', 'relic', 'strange', 'lore', 'horde']
  const names = new Set(archetypes.flatMap((archetype, i) => [
    planetNameFor({ archetype, biomeId: 'crystalWorld', chunkX: i, chunkY: i + 2, index: 0 }),
    planetNameFor({ archetype, biomeId: 'ruinWorld', chunkX: i + 3, chunkY: -i, index: 1 })
  ]))
  expect(names.size).toBeGreaterThanOrEqual(12)
})
```

- [ ] **Step 2: Run red test**

Run: `npm test tests/planet-names.spec.ts`

Expected: fails because `src/planet-names.ts` does not exist.

- [ ] **Step 3: Implement module**

Create deterministic archetype and biome term tables in `src/planet-names.ts`.

- [ ] **Step 4: Run green test**

Run: `npm test tests/planet-names.spec.ts`

Expected: pass.

### Task 3: Main Game Wiring

**Files:**
- Modify: `src/main.ts`
- Test: `tests/sector-map-ui.spec.ts`

- [ ] **Step 1: Add failing source integration tests**

Extend `tests/sector-map-ui.spec.ts` to assert the main game imports station memory, stores `stationVisits`, marks `DOCKED`, renders `station-contact-panel`, and includes journey debrief text.

- [ ] **Step 2: Run red test**

Run: `npm test tests/sector-map-ui.spec.ts`

Expected: fails on missing source strings.

- [ ] **Step 3: Wire station memory and planet names**

Import `buildStationVisitRecord`, `journeyDistanceLy`, `StationVisitRecord`, and `planetNameFor`. Add `stationVisits`, enrich `StationDockReport`, record visits once per node, show contact panel, mark docked sector nodes, and add debrief journey fields.

- [ ] **Step 4: Run green test**

Run: `npm test tests/sector-map-ui.spec.ts`

Expected: pass.

### Task 4: Verification

**Files:**
- No new files.

- [ ] **Step 1: Run focused tests**

Run: `npm test tests/station-memory.spec.ts tests/planet-names.spec.ts tests/sector-map-ui.spec.ts tests/return-beacons.spec.ts`

Expected: pass.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: TypeScript and Vite build pass.

- [ ] **Step 3: Run one simulation smoke**

Run: `npm run sim -- --runs=10 --policy=balanced --seed=1000 --maxSeconds=900`

Expected: completes with no runtime errors and no balance flags.
