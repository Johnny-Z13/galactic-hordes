# Front Subscreen Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract Collection and Power Up front subscreen rendering from `src/main.ts` into `src/ui/front-subscreens.ts`.

**Architecture:** `src/ui/front-subscreens.ts` owns DOM construction for title-adjacent subscreens and calls existing collection/mothership render helpers. `VectorShooter` keeps small wrappers that delegate to the UI module.

**Tech Stack:** TypeScript, DOM APIs, Playwright source tests.

---

### Task 1: Tests and Extraction

**Files:**
- Create: `src/ui/front-subscreens.ts`
- Modify: `src/main.ts`
- Modify: `tests/artifacts-workbench.spec.ts`

- [x] **Step 1: Write failing source test**

Assert that `tests/artifacts-workbench.spec.ts` reads `src/ui/front-subscreens.ts`, expects exported `showCollection` and `showPowerUps`, and expects `main.ts` wrappers to delegate to `uiShowCollection` and `uiShowPowerUps`.

- [x] **Step 2: Verify red**

Run: `npx playwright test tests/artifacts-workbench.spec.ts`.
Expected: FAIL because `src/ui/front-subscreens.ts` does not exist and `main.ts` still renders both screens inline.

- [x] **Step 3: Create front subscreens module**

Move Collection and Power Up screen construction into `src/ui/front-subscreens.ts`.

- [x] **Step 4: Wire main wrappers**

Import `showCollection as uiShowCollection` and `showPowerUps as uiShowPowerUps` in `src/main.ts`; replace private method bodies with delegation.

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

Commit with message `refactor: extract front subscreen module`.
