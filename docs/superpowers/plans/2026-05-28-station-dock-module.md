# Station Dock Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move station dock command-panel rendering into a focused UI module.

**Architecture:** `src/ui/station-dock.ts` exports `showStationDock(self, report)`. `src/main.ts` exports `StationDockReport` for type-only use, imports the renderer as `uiShowStationDock`, and keeps `showStationDock(...)` as a private delegate.

**Tech Stack:** TypeScript, Vite, Playwright tests.

---

### Task 1: Structure Tests

**Files:**
- Modify: `tests/sector-map-ui.spec.ts`

- [ ] **Step 1: Add station dock module source helper**

```ts
const optionalSource = (path: string) => {
  try {
    return readFileSync(resolve(process.cwd(), path), 'utf8')
  } catch {
    return ''
  }
}
const stationDockSource = () => optionalSource('src/ui/station-dock.ts')
```

- [ ] **Step 2: Update station ownership expectations**

```ts
const stationDock = stationDockSource()
expect(main).toContain("import { showStationDock as uiShowStationDock } from './ui/station-dock'")
expect(main).toContain('private showStationDock(report: StationDockReport) {')
expect(main).toContain('uiShowStationDock(this, report)')
expect(main).not.toContain("panel.className = 'station-command-panel'")
expect(main).not.toContain('private stationCommandSection(')
expect(main).not.toContain('private stationRouteMap(')
expect(stationDock).toContain('export function showStationDock(self: VectorShooter, report: StationDockReport)')
expect(stationDock).toContain("panel.className = 'station-command-panel'")
expect(stationDock).toContain('function stationCommandSection(')
expect(stationDock).toContain('function stationRouteMap(')
expect(stationDock).toContain("workbench.addEventListener('click', () => self['openStationWorkbench']())")
expect(stationDock).toContain("route.addEventListener('click', () => self['leaveStationForSectorMap']())")
```

- [ ] **Step 3: Verify red**

Run:

```bash
npx playwright test tests/sector-map-ui.spec.ts
```

Expected: fails because station dock rendering still lives in `main.ts`.

### Task 2: Extract Station Renderer

**Files:**
- Create: `src/ui/station-dock.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Export `StationDockReport` from `src/main.ts`**

Change:

```ts
interface StationDockReport {
```

to:

```ts
export interface StationDockReport {
```

- [ ] **Step 2: Create `src/ui/station-dock.ts`**

Move the existing `showStationDock`, `stationCommandSection`, `stationRouteMap`, and `stationServiceLabel` bodies into module functions that use `self['...']` for `VectorShooter` access. Import `availableSectorChoices` from `../sector-map` and `type { SectorStationService }` from `../sector-map`.

- [ ] **Step 3: Delegate `main.ts`**

Add:

```ts
import { showStationDock as uiShowStationDock } from './ui/station-dock'
```

Replace `showStationDock(...)` with:

```ts
private showStationDock(report: StationDockReport) {
  uiShowStationDock(this, report)
}
```

Delete `stationCommandSection`, `stationRouteMap`, and `stationServiceLabel` from `main.ts`.

### Task 3: Verification

**Files:**
- Read: `src/ui/station-dock.ts`
- Read: `src/main.ts`
- Read: `tests/sector-map-ui.spec.ts`

- [ ] **Step 1: Run focused tests**

Run:

```bash
npx playwright test tests/sector-map-ui.spec.ts
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

Reload `http://127.0.0.1:5176/?harness=1&resetProgress=1`, start the mothership flow, and confirm no browser errors. Full station rendering is covered by the focused source tests and full suite unless the route loop is quickly reachable.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-05-28-station-dock-module-design.md docs/superpowers/plans/2026-05-28-station-dock-module.md src/ui/station-dock.ts src/main.ts tests/sector-map-ui.spec.ts
git commit -m "refactor: extract station dock screen"
```
