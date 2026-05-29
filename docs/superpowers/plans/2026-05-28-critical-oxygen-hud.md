# Critical Oxygen HUD Implementation Plan

**Goal:** Add a persistent critical-O2 warning state to the surface oxygen meter.

**Architecture:** Reuse `vitalCriticalClass(...)` from `src/combat/player-damage-feedback.ts`. `src/main.ts` toggles the class on the surface O2 fill only, and `src/style.css` owns the visual treatment.

---

### Task 1: Tests

- [x] **Step 1: Add failing tests**

Add source-wiring and CSS assertions for surface O2 critical meter state.

- [x] **Step 2: Run RED**

Run: `npx playwright test tests/critical-health-hud.spec.ts`.

### Task 2: Implementation

- [x] **Step 1: Wire O2 meter**

Toggle `critical` on `xpFill` while surface oxygen is low.

- [x] **Step 2: Add oxygen style**

Style `.hud-meter-fill.xp.critical` with a persistent warning pulse distinct from health.

### Task 3: Verification and Commit

- [x] **Step 1: Focused verification**

Run the critical HUD spec and TypeScript.

- [x] **Step 2: Full verification**

Run production build, full Playwright, and diff checks.

- [x] **Step 3: Browser smoke**

Use the harness to set low and high surface oxygen and confirm the O2 fill class toggles.

- [x] **Step 4: Commit**

Commit as `feat: warn on critical surface oxygen`.
