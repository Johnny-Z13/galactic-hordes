# Screen Shell Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move static screen shell construction into a focused UI module.

**Architecture:** `src/ui/screens.ts` exports `makeScreens(self)`. `src/main.ts` imports it as `uiMakeScreens` and keeps a private `makeScreens()` delegate so the constructor and app shell assembly stay unchanged.

**Tech Stack:** TypeScript, Vite, Playwright tests.

---

### Task 1: Structure Tests

**Files:**
- Modify: `tests/artifacts-workbench.spec.ts`
- Modify: `tests/game-over-return.spec.ts`

- [ ] **Step 1: Add screen module ownership expectations**

```ts
const screensSource = () => readFileSync(resolve(process.cwd(), 'src/ui/screens.ts'), 'utf8')

const screens = screensSource()
expect(main).toContain("import { makeScreens as uiMakeScreens } from './ui/screens'")
expect(main).toContain('uiMakeScreens(this)')
expect(main).not.toContain('const screenList = [this.ui.title')
expect(screens).toContain('export function makeScreens(self: VectorShooter)')
expect(screens).toContain("const screenList = [self['ui'].title")
expect(screens).toContain("self['ui'].gameover.className = 'screen gameover-screen'")
```

- [ ] **Step 2: Verify red**

Run:

```bash
npx playwright test tests/artifacts-workbench.spec.ts tests/game-over-return.spec.ts
```

Expected: fails because `src/ui/screens.ts` does not exist and `main.ts` still owns `makeScreens`.

### Task 2: Extract Screen Shell Construction

**Files:**
- Create: `src/ui/screens.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Create `src/ui/screens.ts`**

```ts
import type { VectorShooter } from '../main'

export function makeScreens(self: VectorShooter) {
  const wrap = document.createElement('div')
  const screenList = [
    self['ui'].title,
    self['ui'].collection,
    self['ui'].powerups,
    self['ui'].sectorMap,
    self['ui'].station,
    self['ui'].levelup,
    self['ui'].planet,
    self['ui'].gameover,
    self['ui'].scores
  ]
  for (const screen of screenList) {
    screen.className = 'screen'
    wrap.append(screen)
  }
  self['ui'].gameover.className = 'screen gameover-screen'
  return wrap
}
```

- [ ] **Step 2: Delegate `main.ts`**

Add:

```ts
import { makeScreens as uiMakeScreens } from './ui/screens'
```

Replace `makeScreens()` with:

```ts
private makeScreens() {
  return uiMakeScreens(this)
}
```

### Task 3: Verification

**Files:**
- Read: `src/ui/screens.ts`
- Read: `src/main.ts`
- Read: tests listed above

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

Reload `http://127.0.0.1:5176/?harness=1&resetProgress=1`, verify the title screen renders, click through to the mothership, and confirm no browser errors.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-05-28-screen-shell-module-design.md docs/superpowers/plans/2026-05-28-screen-shell-module.md src/ui/screens.ts src/main.ts tests/artifacts-workbench.spec.ts tests/game-over-return.spec.ts
git commit -m "refactor: extract screen shell construction"
```
