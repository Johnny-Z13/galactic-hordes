# Surface Wave Telegraphs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visible surface wave warnings before timed wave enemies spawn.

**Architecture:** Extend `src/surface/wave-director.ts` with telegraph result and telegraph aging helpers. `src/main.ts` stores telegraphs on `SurfaceRun`, renders them in the surface pass, and spawns wave enemies from expired telegraph anchors.

**Tech Stack:** TypeScript, Canvas 2D, Playwright test runner, Vite build.

---

### Task 1: Telegraph Scheduling

**Files:**
- Modify: `src/surface-balance.ts`
- Modify: `src/surface/wave-director.ts`
- Modify: `tests/surface-wave-director.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
test('surface wave director emits a telegraph before spawning', () => {
  const wave = createSurfaceWaveState({ event: 'standard', scenario: 'salvage' })
  const result = updateSurfaceWaveDirector({
    wave,
    event: 'standard',
    scenario: 'salvage',
    dt: surfaceWaveDirectorBalance.initialDelay.default,
    activeThreats: 0,
    o2Returning: false,
    collected: 0,
    totalResources: 10
  })
  expect(result.telegraph?.spawnCount).toBeGreaterThan(0)
  expect(result.spawnCount).toBe(0)
})
```

- [ ] **Step 2: Run RED**

Run: `npx playwright test tests/surface-wave-director.spec.ts`

Expected: fails because `telegraph` does not exist on the result.

- [ ] **Step 3: Implement telegraph result**

Add `surfaceWaveDirectorBalance.telegraph.warningSeconds`. Change matured waves to return `{ spawnCount: 0, telegraph: { spawnCount, warningSeconds } }`.

### Task 2: Telegraph Aging and Rendering

**Files:**
- Modify: `src/surface/wave-director.ts`
- Modify: `src/main.ts`
- Modify: `tests/surface-wave-director.spec.ts`

- [ ] **Step 1: Add telegraph aging tests**

Add tests for `advanceSurfaceWaveTelegraphs(...)` returning expired telegraphs and preserving pending ones.

- [ ] **Step 2: Implement `advanceSurfaceWaveTelegraphs(...)`**

The function mutates countdown/life values on telegraphs and returns expired spawn anchors.

- [ ] **Step 3: Wire `main.ts`**

Add `waveTelegraphs` to `SurfaceRun`. In `updateSurfaceWaves(...)`, first age telegraphs and spawn expired anchors, then request a new telegraph from the director. Add `renderSurfaceWaveTelegraphs(...)` before threats are drawn.

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
git add docs/superpowers/specs/2026-05-28-surface-wave-telegraphs-design.md docs/superpowers/plans/2026-05-28-surface-wave-telegraphs.md src/main.ts src/surface-balance.ts src/surface/wave-director.ts tests/surface-wave-director.spec.ts
git commit -m "feat: telegraph surface waves"
```
