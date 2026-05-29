# Sector Map Screen Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move sector route planner rendering into a focused UI module.

**Architecture:** `src/ui/sector-map-screen.ts` exports `showSectorMap(self, message)` and `sectorNodeGlyph(kind)`. `src/main.ts` imports the renderer as `uiShowSectorMap`, keeps `showSectorMap(...)` as a private delegate, and keeps route launching/progression logic local.

**Tech Stack:** TypeScript, Vite, Playwright tests.

---

### Task 1: Structure Tests

**Files:**
- Modify: `tests/sector-map-ui.spec.ts`

- [ ] **Step 1: Add sector map module source helper**

```ts
const sectorMapScreenSource = () => optionalSource('src/ui/sector-map-screen.ts')
```

- [ ] **Step 2: Update sector map ownership expectations**

```ts
const sectorMapScreen = sectorMapScreenSource()
expect(main).toContain("import { showSectorMap as uiShowSectorMap } from './ui/sector-map-screen'")
expect(main).toContain('private showSectorMap(message =')
expect(main).toContain('uiShowSectorMap(this, message)')
expect(main).not.toContain("panel.className = 'sector-map-panel'")
expect(main).not.toContain('private sectorNodePosition(')
expect(main).not.toContain('private sectorNodeClass(')
expect(main).not.toContain('private sectorNodeGlyph(')
expect(main).not.toContain('private sectorKindLabel(')
expect(sectorMapScreen).toContain('export function showSectorMap(self: VectorShooter, message: string)')
expect(sectorMapScreen).toContain("panel.className = 'sector-map-panel'")
expect(sectorMapScreen).toContain('function sectorNodePosition(')
expect(sectorMapScreen).toContain('function sectorNodeClass(')
expect(sectorMapScreen).toContain('export function sectorNodeGlyph(')
expect(sectorMapScreen).toContain('function sectorKindLabel(')
expect(sectorMapScreen).toContain("button.addEventListener('click', () => self['launchSectorNode'](node.id))")
```

- [ ] **Step 3: Verify red**

Run:

```bash
npx playwright test tests/sector-map-ui.spec.ts
```

Expected: fails because sector map rendering still lives in `main.ts`.

### Task 2: Extract Sector Map Renderer

**Files:**
- Create: `src/ui/sector-map-screen.ts`
- Modify: `src/main.ts`
- Modify: `src/ui/station-dock.ts`

- [ ] **Step 1: Create `src/ui/sector-map-screen.ts`**

Move the existing `showSectorMap`, `sectorNodePosition`, `sectorNodeClass`, `sectorNodeGlyph`, `sectorKindLabel`, `sectorWaveLabel`, `sectorNodeConfigSummary`, `sectorMapDebugReadout`, `sectorPlanetLabel`, and `sectorHazardsLabel` bodies into module functions. Import sector map helpers and types from `../sector-map`; import `type { VectorShooter }` from `../main`.

- [ ] **Step 2: Delegate `main.ts`**

Add:

```ts
import { showSectorMap as uiShowSectorMap } from './ui/sector-map-screen'
```

Replace `showSectorMap(...)` with:

```ts
private showSectorMap(message = 'Choose the next jump. Route progress resets on death; mothership upgrades persist.') {
  uiShowSectorMap(this, message)
}
```

Delete the moved sector map UI helper methods from `main.ts`.

- [ ] **Step 3: Reuse glyphs in station dock**

Import `sectorNodeGlyph` in `src/ui/station-dock.ts` and replace `self['sectorNodeGlyph'](node.kind)` with `sectorNodeGlyph(node.kind)`.

### Task 3: Verification

**Files:**
- Read: `src/ui/sector-map-screen.ts`
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

Reload `http://127.0.0.1:5176/?harness=1&resetProgress=1`, start the mothership flow, and confirm the route planner/mothership boot path has no browser errors.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-05-28-sector-map-screen-module-design.md docs/superpowers/plans/2026-05-28-sector-map-screen-module.md src/ui/sector-map-screen.ts src/ui/station-dock.ts src/main.ts tests/sector-map-ui.spec.ts
git commit -m "refactor: extract sector map screen"
```
