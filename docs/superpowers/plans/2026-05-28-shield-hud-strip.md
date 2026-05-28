# Shield HUD Strip Implementation Plan

**Goal:** Make ship shield charge readable through a compact visual strip in the hull meter.

**Architecture:** Extend the existing HUD meter builder with an optional overlay fill. Keep shield-specific update logic in `updateHud()` and shield presentation in CSS.

---

### Task 1: Tests

- [x] **Step 1: Add failing shield HUD tests**

Assert the HUD owns a shield fill element, wires it into the hull meter, updates it from shield ratio, and hides it during surface runs.

- [x] **Step 2: Run RED**

Run: `npx playwright test tests/shield-hud.spec.ts`.

### Task 2: Implementation

- [x] **Step 1: Add shield fill element**

Add `shieldFill` to the UI registry and append it to the hull meter bar.

- [x] **Step 2: Wire shield state**

Update shield width and state classes in ship mode; clear it in surface mode.

- [x] **Step 3: Style shield strip**

Add compact cyan strip styling and a dim depleted state.

### Task 3: Verification and Commit

- [x] **Step 1: Focused verification**

Run shield HUD, critical HUD, and TypeScript checks.

- [x] **Step 2: Browser smoke**

Use the harness to force full/depleted/no-surface shield states and inspect DOM styles.

- [x] **Step 3: Full verification**

Run production build, full Playwright, and diff checks.

- [x] **Step 4: Commit**

Commit as `feat: show shield buffer on hud`.
