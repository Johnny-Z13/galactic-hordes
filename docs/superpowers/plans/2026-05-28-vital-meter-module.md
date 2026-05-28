# Vital Meter Module Refactor Plan

**Goal:** Move shared HUD critical-threshold logic from combat feedback into a dedicated UI helper.

**Architecture:** Add `src/ui/vital-meter.ts` for persistent HUD meter state. Keep `src/combat/player-damage-feedback.ts` focused on transient hit flashes.

---

### Task 1: Tests

- [x] **Step 1: Add failing module test**

Add a spec importing `vitalCriticalClass` from `src/ui/vital-meter.ts`.

- [x] **Step 2: Run RED**

Run: `npx playwright test tests/vital-meter.spec.ts`.

### Task 2: Refactor

- [x] **Step 1: Add UI helper**

Move `vitalCriticalClass(...)` into `src/ui/vital-meter.ts`.

- [x] **Step 2: Update imports**

Point `src/main.ts` and HUD tests at the UI helper, and remove the combat export.

### Task 3: Verification and Commit

- [x] **Step 1: Focused verification**

Run vital meter, critical HUD, and player damage feedback specs.

- [x] **Step 2: Full verification**

Run TypeScript, production build, full Playwright, and diff checks.

- [x] **Step 3: Browser smoke**

Confirm critical hull and surface O2 classes still toggle through the harness.

- [x] **Step 4: Commit**

Commit as `refactor: move vital meter threshold to ui`.
