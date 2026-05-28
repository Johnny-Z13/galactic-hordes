# Player Damage Vignette Implementation Plan

**Goal:** Add a clear screen-edge damage flash for ship and surface pilot hits.

**Architecture:** Create `src/combat/player-damage-feedback.ts` for pure flash creation and aging. `src/main.ts` owns the active flash and canvas rendering.

**Tech Stack:** TypeScript, Canvas 2D, Playwright test runner, Vite build.

---

### Task 1: Damage Feedback Helper

**Files:**
- Create: `src/combat/player-damage-feedback.ts`
- Create: `tests/player-damage-feedback.spec.ts`

- [x] **Step 1: Write failing tests**

Test shield, hull, critical, surface, and aging behavior.

- [x] **Step 2: Run RED**

Run: `npx playwright test tests/player-damage-feedback.spec.ts`

Expected: fails because the helper module and main wiring do not exist.

- [x] **Step 3: Implement helper**

Export `createPlayerDamageFlash(...)` and `advancePlayerDamageFlash(...)`.

### Task 2: Runtime Wiring

**Files:**
- Modify: `src/main.ts`

- [x] **Step 1: Trigger flashes from damage paths**

Create flashes after actual shield/hull/surface health damage, skipping invulnerable ignored hits.

- [x] **Step 2: Render edge vignette**

Draw a short-lived screen-edge flash over space and surface scenes.

### Task 3: Verification and Commit

- [x] **Step 1: Focused verification**

Run: `npx playwright test tests/player-damage-feedback.spec.ts tests/intro-juice.spec.ts tests/surface-suit.spec.ts`.

- [x] **Step 2: Full verification**

Run: `npx tsc --noEmit`, `npm run build`, `npx playwright test`, and `git diff --check`.

- [x] **Step 3: Browser smoke**

Use the harness to damage the ship, render, and confirm the active flash ages out with no page errors.

- [x] **Step 4: Commit**

Commit as `feat: add player damage vignette`.
