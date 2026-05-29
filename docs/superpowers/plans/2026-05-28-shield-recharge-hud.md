# Shield Recharge HUD Implementation Plan

**Goal:** Show shield recharge lockout on the compact shield strip.

**Architecture:** Reuse `this.ui.shieldFill` and existing `player.shieldDelay`. Keep the presentation in CSS.

---

### Task 1: Tests

- [x] **Step 1: Add failing tests**

Assert `updateHud()` toggles `recharging` from `shieldDelay` and CSS styles the state.

- [x] **Step 2: Run RED**

Run: `npx playwright test tests/shield-hud.spec.ts`.

### Task 2: Implementation

- [x] **Step 1: Wire class**

Toggle `recharging` in ship mode and clear it in surface mode.

- [x] **Step 2: Style class**

Add a subtle shield recharge animation.

### Task 3: Verification and Commit

- [x] **Step 1: Focused verification**

Run shield HUD tests and TypeScript.

- [x] **Step 2: Browser smoke**

Use the harness to force shield delay active/inactive and surface mode.

- [x] **Step 3: Full verification**

Run production build, full Playwright, and diff checks.

- [x] **Step 4: Commit**

Commit as `feat: show shield recharge lockout`.
