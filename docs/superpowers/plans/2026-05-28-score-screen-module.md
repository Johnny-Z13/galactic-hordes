# Score Screen Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the high-score screen renderer from `src/main.ts` into a focused UI module.

**Architecture:** `src/ui/scores.ts` renders the scores panel and invokes existing `VectorShooter` methods for navigation and reset. `src/main.ts` keeps a small private `showScores()` wrapper that delegates to the UI module.

**Tech Stack:** TypeScript, DOM APIs, Playwright source tests.

---

### Task 1: Tests and Extraction

**Files:**
- Create: `src/ui/scores.ts`
- Modify: `src/main.ts`
- Modify: `tests/artifacts-workbench.spec.ts`

- [x] **Step 1: Write failing source test**

Assert that `tests/artifacts-workbench.spec.ts` reads `src/ui/scores.ts`, expects reset button copy there, and expects `main.ts` to import and delegate to `uiShowScores`.

- [x] **Step 2: Verify red**

Run: `npx playwright test tests/artifacts-workbench.spec.ts`.
Expected: FAIL because `src/ui/scores.ts` does not exist and `main.ts` still renders the screen inline.

- [x] **Step 3: Create scores module**

Move the current high-score panel construction into `src/ui/scores.ts` as `showScores(self: VectorShooter)`.

- [x] **Step 4: Wire main wrapper**

Import `showScores as uiShowScores` in `src/main.ts` and replace the private `showScores()` body with `uiShowScores(this)`.

- [x] **Step 5: Verify focused checks**

Run: `npx tsc --noEmit` and `npx playwright test tests/artifacts-workbench.spec.ts`.
Expected: both pass.

### Task 2: Completion

- [x] **Step 1: Run build**

Run: `npm run build`.
Expected: build exits 0.

- [x] **Step 2: Run full tests**

Run: `npx playwright test`.
Expected: all tests pass.

- [x] **Step 3: Browser smoke**

Load the harness page and click a visible button. Expected: no console or page errors.

- [x] **Step 4: Commit**

Commit with message `refactor: extract score screen module`.
