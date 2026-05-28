# Planet Popup Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move orbit planet popup rendering into a focused UI module.

**Architecture:** `src/ui/planet-screen.ts` exports `renderPlanet(self, planet)`. `src/main.ts` exports the `Planet` interface for type-only use, imports the renderer as `uiRenderPlanet`, and keeps `renderPlanet(...)` as a private delegate.

**Tech Stack:** TypeScript, Vite, Playwright tests.

---

### Task 1: Structure Tests

**Files:**
- Modify: `tests/planet-popups.spec.ts`

- [ ] **Step 1: Add planet popup module expectations**

```ts
const planetScreenSource = () => optionalSource('src/ui/planet-screen.ts')

expect(main).toContain("import { renderPlanet as uiRenderPlanet } from './ui/planet-screen'")
expect(main).toContain('private renderPlanet(p: Planet) {')
expect(main).toContain('uiRenderPlanet(this, p)')
expect(main).not.toContain("land.textContent = p.visited ? 'Dock' : 'Land and Salvage'")
expect(planet).toContain('export function renderPlanet(self: VectorShooter, p: Planet)')
expect(planet).toContain("land.textContent = p.visited ? 'Dock' : 'Land and Salvage'")
expect(planet).toContain("land.addEventListener('click', () => self['confirmLanding']())")
expect(planet).toContain("self['showOnly']('planet')")
```

- [ ] **Step 2: Verify red**

Run:

```bash
npx playwright test tests/planet-popups.spec.ts
```

Expected: fails because `src/ui/planet-screen.ts` does not exist and `main.ts` still owns the popup body.

### Task 2: Extract Popup Renderer

**Files:**
- Create: `src/ui/planet-screen.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Export `Planet` from `src/main.ts`**

Change:

```ts
interface Planet {
```

to:

```ts
export interface Planet {
```

- [ ] **Step 2: Create `src/ui/planet-screen.ts`**

```ts
import type { Planet, VectorShooter } from '../main'

export function renderPlanet(self: VectorShooter, p: Planet) {
  self['ui'].planet.innerHTML = ''
  const panel = document.createElement('div')
  panel.className = 'panel planet-panel'
  const h = document.createElement('h1')
  h.className = 'title'
  h.textContent = p.name
  const copy = document.createElement('p')
  copy.className = 'copy'
  const scanner = self['mothership'].departments.scanner
  const risk = planetRiskLabel(p)
  copy.textContent = p.visited
    ? `${p.biome.label}. The dock remembers you. It offers a small repair and a moment of quiet.`
    : scanner >= 3
      ? `${p.biome.label}. ${p.reward} Risk: ${risk}.`
      : scanner >= 1
        ? `${p.biome.label.toUpperCase()} // ${p.archetype.toUpperCase()} SIGNAL // ${p.reward}`
        : `${p.biome.label}. ${p.reward}`
  const row = document.createElement('div')
  row.className = 'button-row'
  const land = document.createElement('button')
  land.className = 'vector-button'
  land.textContent = p.visited ? 'Dock' : 'Land and Salvage'
  land.addEventListener('click', () => self['confirmLanding']())
  const leave = document.createElement('button')
  leave.className = 'vector-button secondary'
  leave.textContent = 'Break Orbit'
  leave.addEventListener('click', () => {
    self['state'] = 'playing'
    self['showOnly'](null)
  })
  row.append(land, leave)
  panel.append(h, copy, row)
  self['ui'].planet.append(panel)
  self['showOnly']('planet')
}

function planetRiskLabel(p: Planet) {
  if (p.archetype === 'horde') return 'EXTREME'
  if (p.archetype === 'hostile' || p.archetype === 'strange') return 'HOSTILE'
  if (p.archetype === 'relic' || p.archetype === 'cache') return 'UNSTABLE'
  return 'QUIET'
}
```

- [ ] **Step 3: Delegate `main.ts`**

Add:

```ts
import { renderPlanet as uiRenderPlanet } from './ui/planet-screen'
```

Replace `renderPlanet(...)` with:

```ts
private renderPlanet(p: Planet) {
  uiRenderPlanet(this, p)
}
```

Delete `planetRiskLabel(...)` from `main.ts`.

### Task 3: Verification

**Files:**
- Read: `src/ui/planet-screen.ts`
- Read: `src/main.ts`
- Read: `tests/planet-popups.spec.ts`

- [ ] **Step 1: Run focused tests**

Run:

```bash
npx playwright test tests/planet-popups.spec.ts
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

Reload `http://127.0.0.1:5176/?harness=1&resetProgress=1`, start the mothership flow, and confirm no browser errors. If a nearby planet is available through the harness, open the planet popup and verify it has the two expected buttons.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-05-28-planet-popup-module-design.md docs/superpowers/plans/2026-05-28-planet-popup-module.md src/ui/planet-screen.ts src/main.ts tests/planet-popups.spec.ts
git commit -m "refactor: extract orbit planet popup"
```
