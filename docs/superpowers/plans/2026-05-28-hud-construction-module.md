# HUD Construction Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move HUD DOM construction helpers into the existing HUD UI module.

**Architecture:** `src/ui/hud.ts` exports both `makeHud(self)` and `updateHud(self)`. `src/main.ts` keeps the constructor call and a private `makeHud()` delegate, while touch-control construction remains in `main.ts`.

**Tech Stack:** TypeScript, Vite, Playwright tests.

---

### Task 1: Structure Tests

**Files:**
- Modify: `tests/shield-hud.spec.ts`
- Modify: `tests/weapon-hud-readout.spec.ts`

- [ ] **Step 1: Update shield HUD ownership expectations**

```ts
expect(main).toContain("import { makeHud as uiMakeHud, updateHud as uiUpdateHud } from './ui/hud'")
expect(main).toContain('uiMakeHud(this)')
expect(main).not.toContain('private meter(')
expect(hud).toContain('export function makeHud(self: VectorShooter)')
expect(hud).toContain("meter('HULL', self['ui'].hull, self['ui'].hullFill, 'health', self['ui'].hullLabel, self['ui'].shieldFill)")
expect(hud).toContain("shieldFill.className = 'hud-meter-shield-fill'")
```

- [ ] **Step 2: Update weapon HUD ownership expectations**

```ts
expect(main).toContain("import { makeHud as uiMakeHud, updateHud as uiUpdateHud } from './ui/hud'")
expect(main).toContain('uiMakeHud(this)')
expect(main).not.toContain('private chip(')
expect(hud).toContain("const weapon = chip('WEAPON', self['ui'].weapon, 'weapon wide')")
expect(hud).toContain('weaponHudReadout')
```

- [ ] **Step 3: Verify red**

Run:

```bash
npx playwright test tests/shield-hud.spec.ts tests/weapon-hud-readout.spec.ts
```

Expected: fails because `main.ts` still owns `makeHud`, `meter`, and `chip`.

### Task 2: Extract Construction

**Files:**
- Modify: `src/ui/hud.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Add `makeHud` and helpers to `src/ui/hud.ts`**

```ts
export function makeHud(self: VectorShooter) {
  const hud = document.createElement('div')
  hud.className = 'hud'
  const top = document.createElement('div')
  top.className = 'topbar'
  const meters = document.createElement('div')
  meters.className = 'hud-meters'
  meters.append(
    meter('HULL', self['ui'].hull, self['ui'].hullFill, 'health', self['ui'].hullLabel, self['ui'].shieldFill),
    meter('XP', self['ui'].level, self['ui'].xpFill, 'xp', self['ui'].xpLabel)
  )
  const left = document.createElement('div')
  left.className = 'hud-cluster hud-cluster-left'
  left.append(chip('TIME', self['ui'].time), chip('SCORE', self['ui'].score))
  const weapon = chip('WEAPON', self['ui'].weapon, 'weapon wide')
  self['ui'].toast.className = 'toast'
  self['ui'].perf.className = 'perf'
  hud.append(top, self['ui'].toast, self['makeTouchControls']())
  top.append(meters, left, weapon)
  return hud
}
```

Add local `meter(...)` and `chip(...)` helpers in the module.

- [ ] **Step 2: Delegate `main.ts`**

Change the import:

```ts
import { makeHud as uiMakeHud, updateHud as uiUpdateHud } from './ui/hud'
```

Replace `makeHud()`:

```ts
private makeHud() {
  return uiMakeHud(this)
}
```

Delete private `meter(...)` and `chip(...)` from `main.ts`.

### Task 3: Verification

**Files:**
- Read: `src/ui/hud.ts`
- Read: `src/main.ts`
- Read: tests listed above

- [ ] **Step 1: Run focused tests**

Run:

```bash
npx playwright test tests/shield-hud.spec.ts tests/weapon-hud-readout.spec.ts
```

Expected: pass.

- [ ] **Step 2: Run gates**

Run:

```bash
npx tsc --noEmit
npm run build
npx playwright test
```

Expected: all commands exit 0.

- [ ] **Step 3: Browser smoke**

Reload `http://127.0.0.1:5176/?harness=1&resetProgress=1`, enter the mothership flow, and confirm HUD chips and meters render without console errors.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-05-28-hud-construction-module-design.md docs/superpowers/plans/2026-05-28-hud-construction-module.md src/ui/hud.ts src/main.ts tests/shield-hud.spec.ts tests/weapon-hud-readout.spec.ts
git commit -m "refactor: move hud construction into hud module"
```
