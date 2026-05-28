# Title Screen Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract Galactic Hordes title screen DOM rendering into a focused UI module.

**Architecture:** Keep `VectorShooter.showTitle()` as the state transition method and delegate rendering to `src/ui/title-screen.ts`. The new module follows the existing `scores.ts` and `front-subscreens.ts` pattern by accepting `VectorShooter` and using bracket access for private game methods.

**Tech Stack:** TypeScript, Vite asset imports, Playwright test runner.

---

### Task 1: Structure Test

**Files:**
- Modify: `tests/artifacts-workbench.spec.ts`
- Read: `src/main.ts`
- Read: `src/ui/title-screen.ts`

- [ ] **Step 1: Add a failing source-level test**

```ts
const titleSource = () => readFileSync(resolve(process.cwd(), 'src/ui/title-screen.ts'), 'utf8')

test('title screen rendering lives in a focused ui module', () => {
  const main = source()
  const title = titleSource()

  expect(main).toContain("import { showTitle as uiShowTitle } from './ui/title-screen'")
  expect(main).toContain('private showTitle() {')
  expect(main).toContain('uiShowTitle(this)')
  expect(main).not.toContain("import titleLogoMarkUrl from './assets/title-logo-mark.png'")
  expect(main).not.toContain("wordmark.innerHTML = '<span>GALACTIC</span><span>HORDES</span>'")
  expect(title).toContain("import titleLogoMarkUrl from '../assets/title-logo-mark.png'")
  expect(title).toContain('export function showTitle(self: VectorShooter)')
  expect(title).toContain("self['state'] = 'title'")
  expect(title).toContain("quit.textContent = 'Quit'")
  expect(title).toContain("start.textContent = 'Start'")
  expect(title).toContain("self['showMothership']()")
  expect(title).toContain("self['showOnly']('title')")
})
```

- [ ] **Step 2: Verify red**

Run: `npx playwright test tests/artifacts-workbench.spec.ts -g "title screen rendering lives in a focused ui module"`

Expected: failure because `src/ui/title-screen.ts` does not exist and `main.ts` still owns the title screen implementation.

### Task 2: Module Extraction

**Files:**
- Create: `src/ui/title-screen.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Create the module**

Move the current body of `VectorShooter.showTitle()` into:

```ts
import titleLogoMarkUrl from '../assets/title-logo-mark.png'
import type { VectorShooter } from '../main'

export function showTitle(self: VectorShooter) {
  self['state'] = 'title'
  self['ui'].title.innerHTML = ''
  self['ui'].title.className = 'screen title-screen'
  const recordCount = Object.keys(self['mothership'].archive.records).length
  const maxedDepartments = Object.values(self['mothership'].departments).filter((tier) => tier > 0).length
  // Existing DOM construction follows unchanged, replacing `this.` with `self['...']`.
}
```

- [ ] **Step 2: Delegate from `main.ts`**

Import the module:

```ts
import { showTitle as uiShowTitle } from './ui/title-screen'
```

Replace the `showTitle()` body with:

```ts
private showTitle() {
  uiShowTitle(this)
}
```

- [ ] **Step 3: Remove the old asset import**

Remove:

```ts
import titleLogoMarkUrl from './assets/title-logo-mark.png'
```

### Task 3: Verification

**Files:**
- Read: `tests/artifacts-workbench.spec.ts`
- Read: `src/main.ts`
- Read: `src/ui/title-screen.ts`

- [ ] **Step 1: Run focused test**

Run: `npx playwright test tests/artifacts-workbench.spec.ts -g "title screen rendering lives in a focused ui module"`

Expected: pass.

- [ ] **Step 2: Run compile/build/test gates**

Run: `npx tsc --noEmit`

Expected: exit 0.

Run: `npm run build`

Expected: exit 0.

Run: `npx playwright test`

Expected: all tests pass.

- [ ] **Step 3: Browser smoke**

Open or reload `http://127.0.0.1:5176/?harness=1&resetProgress=1`, verify the title screen renders Galactic Hordes, menu buttons exist, and clicking Options or Scores does not log browser errors.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-05-28-title-screen-module-design.md docs/superpowers/plans/2026-05-28-title-screen-module.md tests/artifacts-workbench.spec.ts src/main.ts src/ui/title-screen.ts
git commit -m "refactor: extract title screen module"
```
