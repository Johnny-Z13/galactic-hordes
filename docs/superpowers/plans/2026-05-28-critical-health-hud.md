# Critical Health HUD Implementation Plan

**Goal:** Add a persistent critical-health warning state to the ship/suit health meter.

**Architecture:** Reuse `src/combat/player-damage-feedback.ts` for the pure threshold helper. `src/main.ts` toggles the HUD class and `src/style.css` owns the visual pulse.

---

### Task 1: Tests

- [x] **Step 1: Add failing tests**

Add helper threshold tests and source wiring tests.

- [x] **Step 2: Run RED**

Run: `npx playwright test tests/player-damage-feedback.spec.ts tests/critical-health-hud.spec.ts`.

### Task 2: Implementation

- [x] **Step 1: Add helper**

Export `vitalCriticalClass(...)`.

- [x] **Step 2: Wire HUD**

Toggle the class for ship and surface health in `updateHud()`.

### Task 3: Verification and Commit

- [x] **Step 1: Focused verification**

Run focused player damage, surface, and HUD tests.

- [x] **Step 2: Full verification**

Run TypeScript, build, full Playwright, and diff checks.

- [x] **Step 3: Browser smoke**

Use the harness to drop hull below critical and confirm the fill class appears.

- [x] **Step 4: Commit**

Commit as `feat: warn on critical health hud`.
