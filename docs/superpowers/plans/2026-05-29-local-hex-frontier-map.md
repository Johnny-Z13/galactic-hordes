# Local Hex Frontier Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the linear sector route with a finite axial hex frontier map while preserving the existing run profile and station-docking loop.

**Architecture:** Keep the public `sector-map.ts` API stable so `main.ts`, station docking, HUD, and debrief flow keep working. Add axial hex metadata (`q`, `r`, `charted`, `frontier`, `stationEdges`) to sector nodes, generate a radius-3 local cluster, and make choices adjacency-based instead of column-based. Update the DOM sector map renderer to position hexes from axial coordinates and show station edge markers.

**Tech Stack:** TypeScript, DOM UI, CSS, Playwright tests, Vite build.

---

### Task 1: Hex Data Model And Adjacency

**Files:**
- Modify: `src/sector-map.ts`
- Test: `tests/sector-map.spec.ts`

- [ ] **Step 1: Write failing tests**

Add tests asserting that `createSectorMap(42)` creates nodes with `q`/`r`, that the origin is `(0,0)`, that available choices are adjacent by hex distance, that non-adjacent selection is rejected, and that station edge metadata exists for available choices.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- tests/sector-map.spec.ts`
Expected: FAIL because current nodes do not expose axial coordinates or station edge metadata and choices are column-based.

- [ ] **Step 3: Implement axial generation**

In `src/sector-map.ts`, add `q`, `r`, `charted`, `frontier`, and `stationEdges` to `SectorNode`. Generate a radius-3 axial cluster around the mothership, retain `column`/`row` as compatibility/display aliases, and create adjacency edges between neighboring hexes. Keep existing route templates and configs.

- [ ] **Step 4: Implement adjacency choices**

Change `availableSectorChoices()` and `selectSectorNode()` to use outgoing adjacency from the current completed hex. Keep invalid selections returning the map unchanged.

- [ ] **Step 5: Run tests**

Run: `npm test -- tests/sector-map.spec.ts`
Expected: PASS.

### Task 2: Hex Map UI

**Files:**
- Modify: `src/ui/sector-map-screen.ts`
- Modify: `src/style.css`
- Test: `tests/sector-map-ui.spec.ts`

- [ ] **Step 1: Write failing UI tests**

Update tests to expect `sector-map-hexchart`, `sector-node-frontier`, station edge markers, axial coordinate positioning, and hex route string rendering.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- tests/sector-map-ui.spec.ts`
Expected: FAIL because the UI still renders a starchart with column/row positions and no station edge markers.

- [ ] **Step 3: Implement hex positioning and station markers**

Replace `sectorNodePosition()` with axial-to-percentage positioning. Add `sectorStationEdgeMarkers()` and render station edge spans inside hex buttons. Keep the choice list and route metrics.

- [ ] **Step 4: Update CSS**

Add hex-shaped node treatment, frontier/available/current/completed states, station-edge marker positioning, and responsive graph sizing.

- [ ] **Step 5: Run UI tests**

Run: `npm test -- tests/sector-map-ui.spec.ts`
Expected: PASS.

### Task 3: Integration And Regression

**Files:**
- Modify only if needed: `src/main.ts`, `src/ui/station-dock.ts`
- Test: `tests/sector-map.spec.ts`, `tests/sector-map-ui.spec.ts`, `tests/return-beacons.spec.ts`, `tests/playthrough-harness.spec.ts`

- [ ] **Step 1: Run integration tests**

Run: `npm test -- tests/sector-map.spec.ts tests/sector-map-ui.spec.ts tests/return-beacons.spec.ts tests/playthrough-harness.spec.ts`
Expected: PASS or expose any API compatibility gap.

- [ ] **Step 2: Fix compatibility gaps only**

If existing callers require `column`, `row`, `columns`, or route labels, preserve those as compatibility fields rather than widening changes into `main.ts`.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Browser smoke**

Run a Playwright smoke through title -> sector map -> choose adjacent hex -> enter play. Expected: harness snapshot reaches `playing` and current node is no longer `mothership`.
