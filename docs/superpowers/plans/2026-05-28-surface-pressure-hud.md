# Surface Pressure HUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compact surface HUD readout that previews wave pressure before telegraphs appear.

**Architecture:** `src/surface/wave-director.ts` owns pure pressure status calculation. `src/main.ts` owns canvas rendering in the existing surface HUD. Balance thresholds live in `src/surface-balance.ts`.

**Tech Stack:** TypeScript, Canvas 2D, Playwright test runner, Vite build.

---

### Task 1: Pressure Readout Helper

**Files:**
- Modify: `src/surface-balance.ts`
- Modify: `src/surface/wave-director.ts`
- Modify: `tests/surface-wave-director.spec.ts`

- [ ] **Step 1: Write failing tests**

Add tests for `surfaceWavePressureReadout(...)` returning `RISING` near the next wave, `INCOMING` while telegraphs are queued, and `SATURATED` at the active threat cap.

- [ ] **Step 2: Run RED**

Run: `npx playwright test tests/surface-wave-director.spec.ts`

Expected: fails because `surfaceWavePressureReadout` is not exported.

- [ ] **Step 3: Implement helper**

Add `surfaceWaveDirectorBalance.pressure.risingProgress`. Export `surfaceWavePressureReadout(...)` from `src/surface/wave-director.ts`.

### Task 2: HUD Rendering

**Files:**
- Modify: `src/main.ts`
- Modify: `tests/surface-wave-director.spec.ts`

- [ ] **Step 1: Add wiring assertion**

Assert `main.ts` imports `surfaceWavePressureReadout`, calls `renderSurfacePressureHud(ctx, s)`, and defines `private renderSurfacePressureHud(...)`.

- [ ] **Step 2: Render pressure readout**

Call the helper from `renderSurfaceHud(...)` and draw a compact label plus progress bar. Keep mobile text below the existing planet/event lines.

### Task 3: Verification and Commit

**Files:**
- Modify: no additional files expected

- [ ] **Step 1: Focused verification**

Run: `npx playwright test tests/surface-wave-director.spec.ts tests/surface-suit.spec.ts`

- [ ] **Step 2: Full verification**

Run: `npx tsc --noEmit`, `npm run build`, `npx playwright test`, and `git diff --check`.

- [ ] **Step 3: Browser smoke**

Open `http://127.0.0.1:5176/?harness=1&resetProgress=1`, start/land a run, and confirm no console errors while the surface HUD renders.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/superpowers/specs/2026-05-28-surface-pressure-hud-design.md docs/superpowers/plans/2026-05-28-surface-pressure-hud.md src/main.ts src/surface-balance.ts src/surface/wave-director.ts tests/surface-wave-director.spec.ts
git commit -m "feat: add surface pressure hud"
```
