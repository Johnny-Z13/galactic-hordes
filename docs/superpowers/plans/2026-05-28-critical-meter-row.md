# Critical Meter Row Polish Plan

**Goal:** Make critical HUD meters easier to read by styling the full meter row when a vital fill is critical.

**Architecture:** Use CSS selectors against the existing `.hud-meter-fill.*.critical` classes. Avoid extra JavaScript state.

---

### Task 1: Tests

- [x] **Step 1: Add failing CSS assertions**

Assert health and oxygen critical meter rows are styled from existing fill classes.

- [x] **Step 2: Run RED**

Run: `npx playwright test tests/critical-health-hud.spec.ts`.

### Task 2: Styling

- [x] **Step 1: Add health row emphasis**

Style the health meter border/meta/value through `:has(.hud-meter-fill.health.critical)`.

- [x] **Step 2: Add oxygen row emphasis**

Style the oxygen meter border/meta/value through `:has(.hud-meter-fill.xp.critical)`.

### Task 3: Verification and Commit

- [x] **Step 1: Focused verification**

Run critical HUD CSS tests and TypeScript.

- [x] **Step 2: Browser smoke**

Confirm critical fill classes still toggle in the harness.

- [x] **Step 3: Full verification**

Run production build, full Playwright, and diff checks.

- [x] **Step 4: Commit**

Commit as `feat: emphasize critical vital meters`.
