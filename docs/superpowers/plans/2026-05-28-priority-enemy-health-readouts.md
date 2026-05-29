# Priority Enemy Health Readouts Implementation Plan

**Goal:** Add compact health bars for damaged priority space enemies without cluttering ordinary hordes.

**Architecture:** Create `src/render/enemy-health-readout.ts` for pure target selection and readout sizing. `src/render/enemies.ts` owns the canvas drawing.

**Tech Stack:** TypeScript, Canvas 2D, Playwright test runner, Vite build.

---

### Task 1: Pure Readout Helper

**Files:**
- Create: `src/render/enemy-health-readout.ts`
- Create: `tests/enemy-health-readout.spec.ts`

- [x] **Step 1: Write failing tests**

Test priority filtering, high-load behavior, critical health coloring, and renderer wiring.

- [x] **Step 2: Run RED**

Run: `npx playwright test tests/enemy-health-readout.spec.ts`

Expected: fails until the renderer imports and draws readouts.

- [x] **Step 3: Implement helper**

Export `isPriorityEnemyHealthTarget(...)` and `enemyHealthReadout(...)`.

### Task 2: Renderer Wiring

**Files:**
- Modify: `src/render/enemies.ts`

- [x] **Step 1: Draw readouts after enemy bodies**

Call `renderEnemyHealthReadouts(view)` in normal and high-load render paths.

- [x] **Step 2: Keep bars compact and non-interactive**

Use screen-space dimensions, draw a dark track and colored fill, and skip offscreen targets.

### Task 3: Verification and Commit

- [x] **Step 1: Focused verification**

Run: `npx playwright test tests/enemy-health-readout.spec.ts tests/impact-feedback.spec.ts tests/damage-feedback.spec.ts`.

- [x] **Step 2: Full verification**

Run: `npx tsc --noEmit`, `npm run build`, `npx playwright test`, and `git diff --check`.

- [x] **Step 3: Browser smoke**

Open `http://127.0.0.1:5176/?harness=1&resetProgress=1`, damage a priority enemy, and confirm no console errors.

- [x] **Step 4: Commit**

Commit as `feat: add priority enemy health readouts`.
