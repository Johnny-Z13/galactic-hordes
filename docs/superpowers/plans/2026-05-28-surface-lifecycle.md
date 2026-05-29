# Surface Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move surface lifecycle decisions for Galactic Hordes out of `src/main.ts` into a small testable module.

**Architecture:** Keep `VectorShooter` responsible for UI, audio, rendering, persistence, and method orchestration. Extract pure decision helpers for oxygen drain, surface interaction priority, takeoff/workbench gating, transition timing, and extraction score into `src/surface/lifecycle.ts`.

**Tech Stack:** TypeScript, Playwright test runner, Vite build.

---

### Task 1: Surface Lifecycle Helper Module

**Files:**
- Create: `src/surface/lifecycle.ts`
- Modify: `src/main.ts`
- Test: `tests/surface-lifecycle.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  advanceSurfaceOxygen,
  surfaceExtractionScore,
  surfaceInteractionAction,
  surfaceTakeoffRequest,
  surfaceTransitionProgress
} from '../src/surface/lifecycle'

test('surface oxygen enters return mode once low and requests takeoff when depleted', () => {
  const low = advanceSurfaceOxygen({ oxygen: 5, maxOxygen: 20, o2Returning: false, dt: 1, lowOxygenRatio: 0.25 })
  expect(low).toEqual({ oxygen: 4, o2Returning: true, lowTriggered: true, depleted: false })

  const empty = advanceSurfaceOxygen({ oxygen: 0.5, maxOxygen: 20, o2Returning: true, dt: 1, lowOxygenRatio: 0.25 })
  expect(empty).toEqual({ oxygen: 0, o2Returning: true, lowTriggered: false, depleted: true })
})

test('surface interaction priority keeps forced oxygen return above optional interactions', () => {
  expect(surfaceInteractionAction({ o2Returning: true, nearShip: true, interact: true, nearbyLore: true, nearbyAlien: true })).toBe('takeoff')
  expect(surfaceInteractionAction({ o2Returning: false, nearShip: true, interact: true, nearbyLore: true, nearbyAlien: false })).toBe('inspectLore')
  expect(surfaceInteractionAction({ o2Returning: false, nearShip: true, interact: true, nearbyLore: false, nearbyAlien: true })).toBe('openAlien')
  expect(surfaceInteractionAction({ o2Returning: false, nearShip: true, interact: true, nearbyLore: false, nearbyAlien: false })).toBe('takeoff')
})

test('surface takeoff request gates pending upgrades unless urgent or skipped', () => {
  expect(surfaceTakeoffRequest({ pendingUpgrades: 2 })).toEqual({ action: 'openWorkbench' })
  expect(surfaceTakeoffRequest({ pendingUpgrades: 2, urgent: true })).toEqual({ action: 'startTakeoff', duration: 1.2, toast: 'O2 LOW - RETURNING TO SHIP' })
  expect(surfaceTakeoffRequest({ pendingUpgrades: 2, skipWorkbench: true })).toEqual({ action: 'startTakeoff', duration: 1.2, toast: 'RETURNING TO ORBIT' })
})

test('surface transition progress reports snap and completion thresholds', () => {
  expect(surfaceTransitionProgress({ timer: 0.5, duration: 1.2 })).toEqual({ snapToOrbit: false, complete: false })
  expect(surfaceTransitionProgress({ timer: 0.6, duration: 1.2 })).toEqual({ snapToOrbit: true, complete: false })
  expect(surfaceTransitionProgress({ timer: 1.2, duration: 1.2 })).toEqual({ snapToOrbit: true, complete: true })
})

test('surface extraction score keeps first visit and revisit formulas explicit', () => {
  expect(surfaceExtractionScore({ firstVisit: true, collected: 3 })).toBeGreaterThan(surfaceExtractionScore({ firstVisit: false, collected: 3 }))
})

test('main delegates surface lifecycle decisions', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  expect(main).toContain("from './surface/lifecycle'")
  expect(main).toContain('advanceSurfaceOxygen({')
  expect(main).toContain('surfaceInteractionAction({')
  expect(main).toContain('surfaceTakeoffRequest({')
  expect(main).toContain('surfaceTransitionProgress({')
  expect(main).toContain('surfaceExtractionScore({')
  expect(main).not.toContain('private updateSurfaceOxygen(')
})
```

- [ ] **Step 2: Run tests to verify RED**

Run: `npx playwright test tests/surface-lifecycle.spec.ts`

Expected: fails because `src/surface/lifecycle.ts` does not exist.

- [ ] **Step 3: Implement lifecycle helpers**

Create `advanceSurfaceOxygen`, `surfaceInteractionAction`, `surfaceTakeoffRequest`, `surfaceTransitionProgress`, and `surfaceExtractionScore`. Do not move audio, DOM, particles, or persistence into the helper.

- [ ] **Step 4: Wire `main.ts` through the helpers**

Replace direct oxygen drain, interaction priority, takeoff pending-upgrade gate, takeoff transition thresholds, and extraction score formula with calls into `src/surface/lifecycle.ts`.

- [ ] **Step 5: Update stale tests**

Update existing source-boundary assertions in `tests/surface-suit.spec.ts` so they follow the new lifecycle module rather than expecting oxygen mutation inside `main.ts`.

### Task 2: Verification and Commit

**Files:**
- Modify: no additional files expected

- [ ] **Step 1: Run focused verification**

Run: `npx playwright test tests/surface-lifecycle.spec.ts tests/surface-suit.spec.ts tests/surface-objectives.spec.ts tests/surface-run-setup.spec.ts`

Expected: all tests pass.

- [ ] **Step 2: Run full verification**

Run: `npx tsc --noEmit`, `npm run build`, `npx playwright test`, and `git diff --check`.

Expected: all commands exit 0.

- [ ] **Step 3: Browser smoke**

Open `http://127.0.0.1:5176/?harness=1&resetProgress=1`, start a run, launch a planet route, and confirm no console errors.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/superpowers/plans/2026-05-28-surface-lifecycle.md src/main.ts src/surface/lifecycle.ts tests/surface-lifecycle.spec.ts tests/surface-suit.spec.ts
git commit -m "refactor: extract surface lifecycle helpers"
```
