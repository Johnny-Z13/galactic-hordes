# Sector Wave Warning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a readable warning before authored sector waves spawn enemies in space.

**Architecture:** Create `src/space-wave-director.ts` for pure wave id/readout calculations. Keep spawn side effects and canvas rendering in `src/main.ts`.

**Tech Stack:** TypeScript, Canvas 2D, Playwright test runner, Vite build.

---

### Task 1: Space Wave Readout Helper

**Files:**
- Create: `src/space-wave-director.ts`
- Create: `tests/space-wave-director.spec.ts`

- [ ] **Step 1: Write failing tests**

Test `spaceWaveId(...)` stability and `nextSpaceWaveWarning(...)` countdown/progress behavior.

- [ ] **Step 2: Run RED**

Run: `npx playwright test tests/space-wave-director.spec.ts`

Expected: fails because `src/space-wave-director.ts` does not exist.

- [ ] **Step 3: Implement helper**

Export `spaceWaveId(...)`, `spaceWaveEnemyTotal(...)`, and `nextSpaceWaveWarning(...)`.

### Task 2: Runtime Wiring

**Files:**
- Modify: `src/main.ts`
- Modify: `tests/space-wave-director.spec.ts`

- [ ] **Step 1: Add wiring assertions**

Assert `main.ts` imports `nextSpaceWaveWarning` and `spaceWaveId`, calls `renderSectorWaveWarning(ctx)`, and defines `private renderSectorWaveWarning(...)`.

- [ ] **Step 2: Render warning**

Call `renderSectorWaveWarning(ctx)` from `renderSpaceScene(...)`. Draw a compact label, countdown, enemy count, and progress bar.

- [ ] **Step 3: Share wave id logic**

Update `updateSectorWaves(...)` to call `spaceWaveId(this.sectorMap.currentNodeId, wave)` instead of duplicating id string construction.

### Task 3: Verification and Commit

**Files:**
- Modify: no additional files expected

- [ ] **Step 1: Focused verification**

Run: `npx playwright test tests/space-wave-director.spec.ts tests/sector-map-ui.spec.ts tests/space-encounters.spec.ts`.

- [ ] **Step 2: Full verification**

Run: `npx tsc --noEmit`, `npm run build`, `npx playwright test`, and `git diff --check`.

- [ ] **Step 3: Browser smoke**

Open `http://127.0.0.1:5176/?harness=1&resetProgress=1`, start a route, and confirm no console errors.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/superpowers/specs/2026-05-28-sector-wave-warning-design.md docs/superpowers/plans/2026-05-28-sector-wave-warning.md src/main.ts src/space-wave-director.ts tests/space-wave-director.spec.ts
git commit -m "feat: warn before sector waves"
```
