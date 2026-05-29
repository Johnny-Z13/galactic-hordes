# Weapon HUD Readout Implementation Plan

**Goal:** Show the current space weapon identity and major active traits in the gameplay HUD.

**Architecture:** Extend `src/weapon-signatures.ts` with pure readout logic. Add one HUD chip in `src/main.ts` and small CSS sizing for the chip.

**Tech Stack:** TypeScript, DOM HUD, CSS, Playwright test runner, Vite build.

---

### Task 1: Pure Weapon Readout Helper

**Files:**
- Modify: `src/weapon-signatures.ts`
- Modify: `tests/weapon-signatures.spec.ts`

- [x] **Step 1: Write failing tests**

Test base readout, branch priority, evolved weapon priority, and trait count limits.

- [x] **Step 2: Run RED**

Run: `npx playwright test tests/weapon-signatures.spec.ts tests/weapon-hud-readout.spec.ts`

Expected: fails because `weaponHudReadout(...)` and HUD wiring do not exist.

- [x] **Step 3: Implement helper**

Export `weaponHudReadout(...)` with compact name and tag generation.

### Task 2: HUD Wiring

**Files:**
- Modify: `src/main.ts`
- Modify: `src/style.css`
- Create: `tests/weapon-hud-readout.spec.ts`

- [x] **Step 1: Add the weapon chip**

Add `ui.weapon`, append `this.chip('WEAPON', this.ui.weapon, 'weapon wide')`, and refresh it in `updateHud()`.

- [x] **Step 2: Style compactly**

Use existing HUD chip language and keep the readout stable on desktop and mobile.

### Task 3: Verification and Commit

- [x] **Step 1: Focused verification**

Run: `npx playwright test tests/weapon-signatures.spec.ts tests/weapon-hud-readout.spec.ts`.

- [x] **Step 2: Full verification**

Run: `npx tsc --noEmit`, `npm run build`, `npx playwright test`, and `git diff --check`.

- [x] **Step 3: Browser smoke**

Open `http://127.0.0.1:5176/?harness=1&resetProgress=1`, check the HUD weapon chip, and confirm no console errors.

- [x] **Step 4: Commit**

Commit as `feat: add weapon hud readout`.
