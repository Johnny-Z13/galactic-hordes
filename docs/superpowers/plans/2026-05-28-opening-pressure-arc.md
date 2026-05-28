# Opening Pressure Arc Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the first safe drift route node deliver a readable three-beat combat opener before the station decision.

**Architecture:** Keep the change data-driven in the sector map configuration. The sector node continues to feed the existing HUD, simulation, wave director, and route UI without new runtime systems.

**Tech Stack:** TypeScript, Playwright test runner, existing sector map and simulation helpers.

---

## File Structure

- Modify `src/sector-map.ts`: tune `safeDrift` wave list and objective/readout copy.
- Modify `tests/sector-map.spec.ts`: lock the three-beat safe drift wave grammar and active route copy.
- Optionally modify `tests/run-objective-readout.spec.ts`: only if current expected strings fail after the objective/readout copy changes.

## Task 1: Characterize First Safe Drift Opening Beats

**Files:**
- Modify: `tests/sector-map.spec.ts`

- [ ] **Step 1: Write the failing test**

Add this test near the existing sector map wave grammar tests:

```ts
test('first safe drift creates a three beat opening combat arc', () => {
  const map = createSectorMap(17)
  const safe = map.nodes.find((node) => node.column === 1 && node.config.templateId === 'safeDrift')!
  const waveTimes = safe.config.waves.map((wave) => wave.atSeconds)
  const waveLabels = safe.config.waves.map((wave) => wave.label)

  expect(waveTimes.length).toBeGreaterThanOrEqual(3)
  expect(waveTimes[0]).toBeLessThanOrEqual(14)
  expect(waveTimes[1]).toBeGreaterThanOrEqual(24)
  expect(waveTimes[1]).toBeLessThanOrEqual(32)
  expect(waveTimes[2]).toBeGreaterThanOrEqual(39)
  expect(waveTimes[2]).toBeLessThanOrEqual(46)
  expect(waveLabels.join(' // ')).toContain('Contact')
  expect(waveLabels.join(' // ')).toContain('Flank')
  expect(waveLabels.join(' // ')).toContain('Decision')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/sector-map.spec.ts --grep "first safe drift creates"`

Expected: FAIL because safe drift currently has fewer than three wave beats.

- [ ] **Step 3: Implement minimal wave grammar**

In `src/sector-map.ts`, replace the `safeDrift` wave list with:

```ts
waves: [
  { atSeconds: 12, label: 'Contact scouts', enemies: scaleEnemyCounts({ chaser: 2 }, depth, 0.22), notes: 'Immediate contact so the route starts with shooting.' },
  { atSeconds: 28, label: 'Flank drift', enemies: scaleEnemyCounts({ chaser: 3, splinter: 1 }, depth, 0.3), notes: 'Small mixed flank before the player settles into collection.' },
  { atSeconds: 43, label: 'Decision pickets', enemies: scaleEnemyCounts({ chaser: 4, splinter: 2 }, depth, 0.36), notes: 'Pressure arrives as the station/cache decision comes online.' }
],
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/sector-map.spec.ts --grep "first safe drift creates"`

Expected: PASS.

## Task 2: Make Safe Drift Copy Action-Oriented

**Files:**
- Modify: `tests/sector-map.spec.ts`
- Modify: `src/sector-map.ts`

- [ ] **Step 1: Write the failing test**

Add this test near the sector decision intel tests:

```ts
test('safe drift objective frames combat collection and station choice', () => {
  const map = createSectorMap(22)
  const safe = map.nodes.find((node) => node.column === 1 && node.config.templateId === 'safeDrift')!

  expect(safe.config.objective).toBe('Clear scouts, bank signal, then dock or chase cache.')
  expect(safe.config.readout).toBe('Opening route. Scouts, signal, station choice.')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/sector-map.spec.ts --grep "safe drift objective frames"`

Expected: FAIL because current copy says recover/scout and safe drift.

- [ ] **Step 3: Implement minimal copy update**

In `src/sector-map.ts` inside the `safeDrift` config, set:

```ts
objective: 'Clear scouts, bank signal, then dock or chase cache.',
readout: 'Opening route. Scouts, signal, station choice.',
notes: ['Opening breather with enough pressure to teach shooting, collection, and docking.']
```

- [ ] **Step 4: Run focused route/objective tests**

Run: `npx playwright test tests/sector-map.spec.ts tests/run-objective-readout.spec.ts`

Expected: PASS, or update expected strings only where they directly assert the old safe drift copy.

## Task 3: Verification And Commit

**Files:**
- Modify: `src/sector-map.ts`
- Modify: `tests/sector-map.spec.ts`
- Possibly modify: `tests/run-objective-readout.spec.ts`

- [ ] **Step 1: Run TypeScript**

Run: `npx tsc --noEmit`

Expected: exit code 0.

- [ ] **Step 2: Run focused gameplay tests**

Run: `npx playwright test tests/sector-map.spec.ts tests/run-objective-readout.spec.ts tests/intro-juice.spec.ts tests/sim-runner.spec.ts tests/sim-space.spec.ts`

Expected: all tests pass.

- [ ] **Step 3: Run full suite**

Run: `npx playwright test`

Expected: all tests pass.

- [ ] **Step 4: Browser smoke**

Open or reload `http://127.0.0.1:5176/?harness=1&resetProgress=1`, start the run, enter the first route screen, and confirm there are no console errors.

- [ ] **Step 5: Commit**

```bash
git add src/sector-map.ts tests/sector-map.spec.ts tests/run-objective-readout.spec.ts docs/superpowers/specs/2026-05-28-opening-pressure-arc-design.md docs/superpowers/plans/2026-05-28-opening-pressure-arc.md
git commit -m "feat(route): sharpen opening pressure arc"
```
