# Screen Visibility Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move common screen visibility toggling into the existing screen UI module.

**Architecture:** `src/ui/screens.ts` exports `showOnly(self, which)` alongside `makeScreens(self)`. `src/main.ts` imports it as `uiShowOnly` and keeps the private `showOnly(...)` method as a delegate so existing callers remain unchanged.

**Tech Stack:** TypeScript, Vite, Playwright tests.

---

### Task 1: Structure Tests

**Files:**
- Modify: `tests/artifacts-workbench.spec.ts`

- [ ] **Step 1: Add visibility ownership expectations**

```ts
expect(main).toContain("import { makeScreens as uiMakeScreens, showOnly as uiShowOnly } from './ui/screens'")
expect(main).toContain('private showOnly(which: GameState | null) {')
expect(main).toContain('uiShowOnly(this, which)')
expect(main).not.toContain('const screens: Partial<Record<GameState, HTMLElement>> = {')
expect(screens).toContain('export function showOnly(self: VectorShooter, which: GameState | null)')
expect(screens).toContain('const screens: Partial<Record<GameState, HTMLElement>> = {')
expect(screens).toContain("el?.classList.toggle('visible', name === which)")
```

- [ ] **Step 2: Verify red**

Run:

```bash
npx playwright test tests/artifacts-workbench.spec.ts
```

Expected: fails because `main.ts` still owns the visibility map.

### Task 2: Extract Visibility Mapping

**Files:**
- Modify: `src/ui/screens.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Export `showOnly` from `src/ui/screens.ts`**

```ts
import type { GameState, VectorShooter } from '../main'

export function showOnly(self: VectorShooter, which: GameState | null) {
  const screens: Partial<Record<GameState, HTMLElement>> = {
    title: self['ui'].title,
    collection: self['ui'].collection,
    powerups: self['ui'].powerups,
    sectorMap: self['ui'].sectorMap,
    station: self['ui'].station,
    levelup: self['ui'].levelup,
    planet: self['ui'].planet,
    gameover: self['ui'].gameover,
    scores: self['ui'].scores
  }
  for (const [name, el] of Object.entries(screens)) {
    el?.classList.toggle('visible', name === which)
  }
}
```

- [ ] **Step 2: Delegate `main.ts`**

Change:

```ts
import { makeScreens as uiMakeScreens, showOnly as uiShowOnly } from './ui/screens'
```

Replace `showOnly(...)` with:

```ts
private showOnly(which: GameState | null) {
  uiShowOnly(this, which)
}
```

### Task 3: Verification

**Files:**
- Read: `src/ui/screens.ts`
- Read: `src/main.ts`
- Read: `tests/artifacts-workbench.spec.ts`

- [ ] **Step 1: Run focused tests**

Run:

```bash
npx playwright test tests/artifacts-workbench.spec.ts tests/game-over-return.spec.ts
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

Reload `http://127.0.0.1:5176/?harness=1&resetProgress=1`, verify title is visible, click Start, verify mothership is visible, and confirm no browser errors.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-05-28-screen-visibility-module-design.md docs/superpowers/plans/2026-05-28-screen-visibility-module.md src/ui/screens.ts src/main.ts tests/artifacts-workbench.spec.ts
git commit -m "refactor: move screen visibility into screens module"
```
