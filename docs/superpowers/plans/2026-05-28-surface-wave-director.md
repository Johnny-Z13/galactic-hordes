# Surface Wave Director Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a v1 timed surface wave director for Galactic Hordes planet landings.

**Architecture:** `src/surface/wave-director.ts` owns wave timing and spawn-count decisions. `src/main.ts` stores director state on `SurfaceRun` and converts spawn requests into existing generic surface threats.

**Tech Stack:** TypeScript, Playwright test runner, Vite build.

---

### Task 1: Wave Director Module

**Files:**
- Create: `src/surface/wave-director.ts`
- Modify: `src/surface-balance.ts`
- Test: `tests/surface-wave-director.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { surfaceWaveDirectorBalance } from '../src/surface-balance'
import { createSurfaceWaveState, updateSurfaceWaveDirector } from '../src/surface/wave-director'

test('friendly surface waves wait through the opening grace window', () => {
  const wave = createSurfaceWaveState({ event: 'relic', scenario: 'friendly' })
  const result = updateSurfaceWaveDirector({ wave, event: 'relic', scenario: 'friendly', dt: surfaceWaveDirectorBalance.initialDelay.friendly - 1, activeThreats: 0, o2Returning: false, collected: 0, totalResources: 10 })
  expect(result.spawnCount).toBe(0)
})

test('horde waves spawn faster and larger than standard waves', () => {
  const horde = createSurfaceWaveState({ event: 'horde', scenario: 'horde' })
  const standard = createSurfaceWaveState({ event: 'standard', scenario: 'salvage' })
  const hordeResult = updateSurfaceWaveDirector({ wave: horde, event: 'horde', scenario: 'horde', dt: surfaceWaveDirectorBalance.initialDelay.horde, activeThreats: 0, o2Returning: false, collected: 10, totalResources: 30 })
  const standardResult = updateSurfaceWaveDirector({ wave: standard, event: 'standard', scenario: 'salvage', dt: surfaceWaveDirectorBalance.initialDelay.default, activeThreats: 0, o2Returning: false, collected: 0, totalResources: 10 })
  expect(hordeResult.spawnCount).toBeGreaterThan(standardResult.spawnCount)
})
```

- [ ] **Step 2: Run RED**

Run: `npx playwright test tests/surface-wave-director.spec.ts`

Expected: fails because `src/surface/wave-director.ts` does not exist.

- [ ] **Step 3: Implement module and balance**

Add `surfaceWaveDirectorBalance` to `src/surface-balance.ts`. Add `createSurfaceWaveState` and `updateSurfaceWaveDirector` to `src/surface/wave-director.ts`.

### Task 2: Main Integration

**Files:**
- Modify: `src/main.ts`
- Test: `tests/surface-wave-director.spec.ts`

- [ ] **Step 1: Store wave state on `SurfaceRun`**

Add `wave: SurfaceWaveState` to `SurfaceRun` and initialize it in `createSurfaceRun(...)`.

- [ ] **Step 2: Update waves during surface play**

In `updateSurface(...)`, call `updateSurfaceWaves(dt)` after threat updates and before interaction checks. Convert emitted spawns into `createGenericSurfaceThreat(...)` calls.

- [ ] **Step 3: Verify delegation**

Add a source-boundary assertion that `main.ts` imports `./surface/wave-director`, calls `createSurfaceWaveState`, and calls `updateSurfaceWaveDirector`.

### Task 3: Verification and Commit

**Files:**
- Modify: no additional files expected

- [ ] **Step 1: Focused verification**

Run: `npx playwright test tests/surface-wave-director.spec.ts tests/surface-lifecycle.spec.ts tests/surface-suit.spec.ts tests/surface-threat-behavior.spec.ts`

Expected: all tests pass.

- [ ] **Step 2: Full verification**

Run: `npx tsc --noEmit`, `npm run build`, `npx playwright test`, and `git diff --check`.

Expected: all commands exit 0.

- [ ] **Step 3: Browser smoke**

Open `http://127.0.0.1:5176/?harness=1&resetProgress=1`, start a run, launch a planet route, and confirm no console errors.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/superpowers/specs/2026-05-28-surface-wave-director-design.md docs/superpowers/plans/2026-05-28-surface-wave-director.md src/main.ts src/surface-balance.ts src/surface/wave-director.ts tests/surface-wave-director.spec.ts
git commit -m "feat: add surface wave director"
```
