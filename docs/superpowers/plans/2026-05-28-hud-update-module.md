# HUD Update Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract gameplay HUD display updates into `src/ui/hud.ts`.

**Architecture:** Keep `VectorShooter.updateHud()` as the existing update-loop entry point, but delegate display updates to `uiUpdateHud(this)`. Leave touch controls, perf HUD, HUD construction, and meter construction in `src/main.ts` for this slice.

**Tech Stack:** TypeScript, Vite, Playwright tests.

---

### Task 1: Structure Tests

**Files:**
- Modify: `tests/shield-hud.spec.ts`
- Modify: `tests/weapon-hud-readout.spec.ts`
- Modify: `tests/critical-health-hud.spec.ts`

- [ ] **Step 1: Add HUD module source readers**

```ts
const hudSource = () => readFileSync('src/ui/hud.ts', 'utf8')
```

- [ ] **Step 2: Move display-logic expectations from `main.ts` to `hud.ts`**

Assert that `main.ts` imports and delegates:

```ts
expect(main).toContain("import { updateHud as uiUpdateHud } from './ui/hud'")
expect(main).toContain('private updateHud() {')
expect(main).toContain('uiUpdateHud(this)')
```

Assert that `hud.ts` owns:

```ts
expect(hud).toContain('export function updateHud(self: VectorShooter)')
expect(hud).toContain('weaponHudReadout({')
expect(hud).toContain("self['ui'].shieldFill.classList.toggle('visible', self['player'].maxShield > 0)")
expect(hud).toContain("self['ui'].xpFill.classList.toggle('critical', vitalCriticalClass(oxygenRatio) === 'critical')")
expect(hud).toContain("self['updateTouchHud']()")
expect(hud).toContain("self['updatePerfHud']()")
```

- [ ] **Step 3: Verify red**

Run:

```bash
npx playwright test tests/shield-hud.spec.ts tests/weapon-hud-readout.spec.ts tests/critical-health-hud.spec.ts
```

Expected: fails because `src/ui/hud.ts` does not exist and `main.ts` still owns the HUD update logic.

### Task 2: HUD Module Extraction

**Files:**
- Create: `src/ui/hud.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Create `src/ui/hud.ts`**

Move the current body of `VectorShooter.updateHud()` into:

```ts
import { clamp, formatTime, type VectorShooter } from '../main'
import { dist2 } from '../math-utils'
import { weaponHudReadout } from '../weapon-signatures'
import { vitalCriticalClass } from './vital-meter'

export function updateHud(self: VectorShooter) {
  // Existing HUD display update logic, replacing `this.` with `self['...']`.
}
```

- [ ] **Step 2: Delegate from `main.ts`**

Add:

```ts
import { updateHud as uiUpdateHud } from './ui/hud'
```

Replace `updateHud()` with:

```ts
private updateHud() {
  uiUpdateHud(this)
}
```

- [ ] **Step 3: Remove display-only imports from `main.ts`**

Remove `weaponHudReadout` from the `weapon-signatures` import and remove the `vitalCriticalClass` import from `main.ts`.

### Task 3: Verification

**Files:**
- Read: `src/main.ts`
- Read: `src/ui/hud.ts`
- Read: tests listed above

- [ ] **Step 1: Run focused tests**

Run:

```bash
npx playwright test tests/shield-hud.spec.ts tests/weapon-hud-readout.spec.ts tests/critical-health-hud.spec.ts
```

Expected: all focused tests pass.

- [ ] **Step 2: Run gates**

Run:

```bash
npx tsc --noEmit
npm run build
npx playwright test
```

Expected: all commands exit 0.

- [ ] **Step 3: Browser smoke**

Reload `http://127.0.0.1:5176/?harness=1&resetProgress=1`, start a run, and confirm the HUD exposes score/time/hull/XP/weapon/resource text with no browser error logs.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-05-28-hud-update-module-design.md docs/superpowers/plans/2026-05-28-hud-update-module.md src/ui/hud.ts src/main.ts tests/shield-hud.spec.ts tests/weapon-hud-readout.spec.ts tests/critical-health-hud.spec.ts
git commit -m "refactor: extract hud update module"
```
