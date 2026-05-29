# Surface Run Setup Objectives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move surface run setup and objective bookkeeping out of `src/main.ts` behind small, testable surface modules.

**Architecture:** Keep `VectorShooter` responsible for orchestration, audio, UI, persistence, and score side effects. Extract pure helpers for surface resource generation, cache spill/ambush generation, surface objective state, and event messaging into `src/surface/run-setup.ts` and `src/surface/objectives.ts`.

**Tech Stack:** TypeScript, Playwright test runner, Vite build.

---

### Task 1: Surface Run Setup Helpers

**Files:**
- Create: `src/surface/run-setup.ts`
- Modify: `src/main.ts`
- Test: `tests/surface-run-setup.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createSurfaceResourceNodes, surfaceEventMessage } from '../src/surface/run-setup'

test('surface resource setup builds cache nodes with safe positions and event values', () => {
  const resources = createSurfaceResourceNodes({
    count: 2,
    event: 'relic',
    firstVisit: true,
    openingLanding: false,
    planetColor: '#57fff3',
    roll: () => 0,
    eventPoint: (index) => ({ x: 100 + index, y: 200 + index }),
    safePoint: (point) => ({ x: point.x + 10, y: point.y + 20 })
  })

  expect(resources).toHaveLength(2)
  expect(resources[0]).toMatchObject({ kind: 'cache', x: 110, y: 220, color: '#fff27a', collected: false })
  expect(resources[1].value).toBeGreaterThan(0)
})

test('surface event messages live in run setup module', () => {
  expect(surfaceEventMessage('horde', true, 'horde')).toContain('HORDE')
  expect(surfaceEventMessage('standard', true)).toContain('UNKNOWN SURFACE')
})

test('main delegates surface resource setup and messages', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  expect(main).toContain("from './surface/run-setup'")
  expect(main).toContain('createSurfaceResourceNodes({')
  expect(main).toContain('surfaceEventMessage(')
  expect(main).not.toContain('private surfaceEventMessage(')
})
```

- [ ] **Step 2: Run tests to verify RED**

Run: `npx playwright test tests/surface-run-setup.spec.ts`

Expected: fails because `src/surface/run-setup.ts` does not exist.

- [ ] **Step 3: Implement setup helpers and delegate from `main.ts`**

Create `createSurfaceResourceNodes`, `surfaceEventMessage`, and small setup helpers only where they remove direct surface setup code from `VectorShooter`.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `npx playwright test tests/surface-run-setup.spec.ts`

Expected: all tests pass.

### Task 2: Surface Objective Helpers

**Files:**
- Create: `src/surface/objectives.ts`
- Modify: `src/main.ts`
- Test: `tests/surface-objectives.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { collectTouchedSurfaceResources, createSurfaceBossCacheDrops, createSurfaceCacheAmbushThreats, shouldPromptSurfaceReturn } from '../src/surface/objectives'

test('collectTouchedSurfaceResources marks only touched resources and returns them', () => {
  const resources = [
    { kind: 'cache' as const, x: 100, y: 100, radius: 18, value: 1, color: '#fff27a', collected: false },
    { kind: 'scrap' as const, x: 400, y: 100, radius: 14, value: 1, color: '#70a8ff', collected: false }
  ]

  const collected = collectTouchedSurfaceResources({ resources, pilot: { x: 110, y: 100 } })

  expect(collected).toEqual([resources[0]])
  expect(resources[0].collected).toBe(true)
  expect(resources[1].collected).toBe(false)
})

test('boss cache drops preserve the first cache reward and horde message', () => {
  const result = createSurfaceBossCacheDrops({
    count: 3,
    scenario: 'horde',
    level: 4,
    threat: { x: 500, y: 500, color: '#ff61d8' },
    random: () => 0,
    safePoint: (point) => point
  })

  expect(result.resources[0].kind).toBe('cache')
  expect(result.resources[1].kind).toBe('cache')
  expect(result.message).toContain('HORDE VAULT')
})

test('cache ambush helper creates chaser threats around the resource', () => {
  const threats = createSurfaceCacheAmbushThreats({
    resource: { x: 300, y: 300 },
    time: 60,
    count: 2,
    random: () => 0.5,
    safeThreatPoint: (point) => point
  })

  expect(threats).toHaveLength(2)
  expect(threats[0]).toMatchObject({ color: '#ff5d73', hit: 0, behavior: 'chaser' })
})

test('surface return prompt only appears after objective completion away from ship', () => {
  expect(shouldPromptSurfaceReturn({ collected: 2, total: 2, nearShip: false })).toBe(true)
  expect(shouldPromptSurfaceReturn({ collected: 1, total: 2, nearShip: false })).toBe(false)
  expect(shouldPromptSurfaceReturn({ collected: 2, total: 2, nearShip: true })).toBe(false)
})

test('main delegates surface objective bookkeeping', () => {
  const main = readFileSync('src/main.ts', 'utf8')
  expect(main).toContain("from './surface/objectives'")
  expect(main).toContain('collectTouchedSurfaceResources({')
  expect(main).toContain('createSurfaceBossCacheDrops({')
  expect(main).toContain('createSurfaceCacheAmbushThreats({')
  expect(main).toContain('shouldPromptSurfaceReturn({')
})
```

- [ ] **Step 2: Run tests to verify RED**

Run: `npx playwright test tests/surface-objectives.spec.ts`

Expected: fails because `src/surface/objectives.ts` does not exist.

- [ ] **Step 3: Implement objective helpers and delegate from `main.ts`**

Keep score, audio, artifacts, relics, and UI messages in `VectorShooter`. Move collision detection, boss cache drop construction, cache ambush threat construction, and completed-objective prompt checks into `src/surface/objectives.ts`.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `npx playwright test tests/surface-objectives.spec.ts tests/surface-run-setup.spec.ts`

Expected: all tests pass.

### Task 3: Verification and Commit

**Files:**
- Modify: no additional files expected

- [ ] **Step 1: Run focused verification**

Run: `npx playwright test tests/surface-run-setup.spec.ts tests/surface-objectives.spec.ts tests/surface-suit.spec.ts tests/surface-bullet-combat.spec.ts tests/surface-threat-behavior.spec.ts`

Expected: all tests pass.

- [ ] **Step 2: Run TypeScript and full suite**

Run: `npx tsc --noEmit`, `npm run build`, `npx playwright test`, and `git diff --check`.

Expected: all commands exit 0.

- [ ] **Step 3: Browser smoke**

Open `http://127.0.0.1:5176/?harness=1&resetProgress=1`, start a run, launch a planet route, and confirm no console errors.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/superpowers/plans/2026-05-28-surface-run-setup-objectives.md src/main.ts src/surface/run-setup.ts src/surface/objectives.ts tests/surface-run-setup.spec.ts tests/surface-objectives.spec.ts
git commit -m "refactor: extract surface run setup helpers"
```
