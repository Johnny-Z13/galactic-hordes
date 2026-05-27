# Phase 0 — Refactor Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Shrink `src/main.ts` (~9,840 lines) by ~40–50% through behavior-preserving extraction of enemy behaviors, rendering, UI screens, and the state-dispatch map — with the existing 213-test Playwright suite as the correctness contract.

**Architecture:** `VectorShooter` in `src/main.ts` remains the orchestrator that owns game state. We extract (1) per-enemy AI into a `src/enemy-behaviors.ts` strategy table driven through a narrow context interface, (2) canvas rendering into `src/render/` modules taking `(ctx, view)`, (3) UI-screen rendering into `src/ui/` modules, and (4) the per-state `update`/`render`/`audioMood` dispatch into a single `states` record. No state-management rewrite, no view-model layer.

**Tech Stack:** TypeScript, Vite, Playwright (test runner). Tests run with `npx playwright test`; typecheck with `npx tsc --noEmit`.

**Critical rule for this phase:** Every task is behavior-preserving. The full suite must stay green. We never change *what* the game does, only *where the code lives*. When a task moves logic, the moved code is copied verbatim (only `this.` references rewired through the context/parameters) — no "while I'm here" improvements.

---

## Prerequisites (one-time, before Task 1)

- [ ] **Step 1: Confirm clean baseline**

Run: `npx tsc --noEmit`
Expected: no output (exit 0).

Run: `npx playwright test`
Expected: `213 passed` (or more).

If either fails, STOP — the baseline is not green and extraction is unsafe.

- [ ] **Step 2: Confirm enemy-behavior characterization test does not exist yet**

Run: `ls tests/enemy-behaviors.spec.ts`
Expected: `No such file` — confirms we are adding it, not overwriting.

---

## Task 1: Characterization test for enemy update (safety net for Task 2)

`updateEnemies` (`src/main.ts:2506-2747`) has no direct unit test — it is only exercised indirectly. Before extracting it we pin its observable behavior deterministically so the extraction can be proven equivalent.

**Files:**
- Create: `tests/enemy-behaviors.spec.ts`

- [ ] **Step 1: Read the current `updateEnemies` and its helpers to confirm signatures**

Read `src/main.ts:2506-2747` (the loop), `:2797-2811` (`tryDashRam`), `:2812-2836` (`emitEnemyTrail`), `:2837-3009` (the five `fire*` helpers), and the imports at the top of the file for `spaceEnemyBehavior`, `balancedSpaceEnemyDefinition`, `enemyAttackCooldown`, `isSpriteEnemyKind`, `isGiantEnemyKind`. Note them — Task 2 reuses them.

- [ ] **Step 2: Write a characterization test that drives the real game headlessly**

This test loads the running game via the dev server harness (the same approach the existing specs use) and asserts that a deterministic enemy update produces stable, sensible motion. Because the loop reads private state, we test through observable effects: an enemy moves toward the player and stays within its speed cap.

```typescript
import { expect, test } from '@playwright/test'

const URL = 'http://127.0.0.1:5176/?harness=1'

test('chaser pursues the player and respects its speed cap', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)

  // Drive into a combat node, then sample enemy/player positions twice and
  // confirm the nearest enemy closed distance to the player between samples.
  const closed = await page.evaluate(async () => {
    const g = (window as any).__vectorShooter
    // Force a deterministic playing state with one chaser near origin.
    g.debugSpawnSingleEnemy?.('chaser', 400, 0)
    const player = g.debugPlayerPosition?.() ?? { x: 0, y: 0 }
    const before = g.debugNearestEnemyDistance?.() ?? Infinity
    g.debugStepEnemies?.(0.1)
    const after = g.debugNearestEnemyDistance?.() ?? Infinity
    return { before, after, player }
  })

  expect(closed.after).toBeLessThan(closed.before)
})
```

NOTE: This test depends on small debug hooks added in Step 3. Keep the hooks behind the existing `?harness=1` gate so they never ship in normal play.

- [ ] **Step 3: Add the minimal debug hooks behind the harness gate**

In `src/main.ts`, inside `installHarnessIfRequested()` (`:9736`), extend the `window.__galacticHarness` object — and additionally expose the methods on `window.__vectorShooter` is already done at file end. Add these methods to the class and call-wire them only when the harness is requested:

```typescript
// Add as private methods on VectorShooter:
private debugSpawnSingleEnemy(kind: EnemyKind, x: number, y: number) {
  this.enemies.length = 0
  this.spawnEnemyOfKind(kind, this.player.x + x, this.player.y + y)
  this.rebuildEnemyGrid()
}
private debugPlayerPosition() { return { x: this.player.x, y: this.player.y } }
private debugNearestEnemyDistance() {
  let best = Infinity
  for (const e of this.enemies) best = Math.min(best, Math.sqrt(dist2(e, this.player)))
  return best
}
private debugStepEnemies(dt: number) { this.updateEnemies(dt); this.rebuildEnemyGrid() }
```

Then inside `installHarnessIfRequested()`, after the existing `window.__galacticHarness = {...}` assignment, expose them:

```typescript
const w = window as unknown as Record<string, unknown>
w.debugSpawnSingleEnemy = (kind: EnemyKind, x: number, y: number) => this.debugSpawnSingleEnemy(kind, x, y)
w.debugPlayerPosition = () => this.debugPlayerPosition()
w.debugNearestEnemyDistance = () => this.debugNearestEnemyDistance()
w.debugStepEnemies = (dt: number) => this.debugStepEnemies(dt)
```

Update the test in Step 2 to read these from `window` directly rather than off `__vectorShooter` if the property lookup differs. Verify `spawnEnemyOfKind` exists; if the real spawn method has a different name, grep `private spawn` in `src/main.ts` and use the actual one.

- [ ] **Step 4: Start the dev server and run the test**

Run (background): `npm run dev`
Then run: `npx playwright test tests/enemy-behaviors.spec.ts -v`
Expected: PASS — nearest-enemy distance decreased after one 0.1s step.

- [ ] **Step 5: Run the full suite to confirm no regression from the debug hooks**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `214 passed` (213 + the new one).

- [ ] **Step 6: Commit**

```bash
git add tests/enemy-behaviors.spec.ts src/main.ts
git commit -m "test: characterization test + harness debug hooks for enemy update"
```

---

## Task 2: Extract enemy AI into `src/enemy-behaviors.ts`

Move the per-kind dispatch body out of `updateEnemies` into a strategy table. The shared tail (speed cap, damping, integration, trail, contact collision — `src/main.ts:2725-2745`) STAYS in `updateEnemies`. Behaviors receive a narrow context object so they never touch `VectorShooter` directly.

**Files:**
- Create: `src/enemy-behaviors.ts`
- Modify: `src/main.ts` (`updateEnemies` body; add a `makeEnemyBehaviorContext()` helper)
- Test: `tests/enemy-behaviors.spec.ts` (already covers equivalence via Task 1)

- [ ] **Step 1: Define the behavior context interface in `src/enemy-behaviors.ts`**

The context exposes ONLY what the per-kind branches in `src/main.ts:2516-2724` use. From reading that code, behaviors need: the player position, current run time, `spawnHostileBullet`, `burst`, `emitEnemyTrail`, the five `fire*` helpers, `damagePlayer`, `killEnemy`, and the `hunger` multiplier.

```typescript
import type { EnemyKind } from './main-types' // see Step 2 note on types
import { spaceEnemyBehavior } from './game-balance'
import type { Vec, Enemy, balancedSpaceEnemyDefinition } from './main-types'

export interface EnemyBehaviorContext {
  readonly playerX: number
  readonly playerY: number
  readonly time: number
  readonly hunger: number
  spawnHostileBullet(b: { x: number; y: number; vx: number; vy: number; life: number; damage: number; radius: number; color: string }): void
  burst(x: number, y: number, color: string, count: number, speed: number): void
  emitEnemyTrail(e: Enemy, color: string, intensity?: number): void
  fireHelixSpikes(e: Enemy, def: ReturnType<typeof balancedSpaceEnemyDefinition>, toP: Vec): void
  firePrismFan(e: Enemy, def: ReturnType<typeof balancedSpaceEnemyDefinition>, toP: Vec): void
  fireSiphonVortex(e: Enemy, def: ReturnType<typeof balancedSpaceEnemyDefinition>): void
  fireDreadnoughtBroadside(e: Enemy, def: ReturnType<typeof balancedSpaceEnemyDefinition>, toP: Vec): void
  fireCathedralLattice(e: Enemy, def: ReturnType<typeof balancedSpaceEnemyDefinition>, toP: Vec): void
  damagePlayer(amount: number): void
  killEnemy(e: Enemy, reward: boolean): void
}

// Return value tells updateEnemies whether the enemy was consumed (mine/lancer kill)
// so the loop can `continue` past the shared tail.
export type EnemyBehaviorResult = 'consumed' | 'alive'
```

NOTE on types: `Enemy`, `Vec`, `EnemyKind`, and `balancedSpaceEnemyDefinition` are currently declared in `src/main.ts`. To import them without a circular dependency, FIRST extract the shared type/interface declarations (`Vec`, `Enemy`, `EnemyKind`, `Bullet`) into a new `src/main-types.ts` and re-import them in `main.ts`. Do that as Step 1a below.

- [ ] **Step 1a: Extract shared entity types into `src/main-types.ts`**

Cut the `interface Vec`, `interface Enemy`, `interface Bullet`, and the `type EnemyKind`/`PickupKind` (and any other types the behaviors reference) declarations from `src/main.ts` into `src/main-types.ts`, then add `import type { Vec, Enemy, Bullet, EnemyKind } from './main-types'` at the top of `main.ts`.

Run: `npx tsc --noEmit`
Expected: clean. (Pure move; no logic.)

Run: `npx playwright test`
Expected: `214 passed`.

Commit:
```bash
git add src/main-types.ts src/main.ts
git commit -m "refactor: extract shared entity types into main-types.ts"
```

- [ ] **Step 2: Write the behavior table by copying each `if (e.kind === ...)` branch verbatim**

In `src/enemy-behaviors.ts`, create:

```typescript
export type EnemyBehaviorFn = (
  e: Enemy,
  ctx: EnemyBehaviorContext,
  dt: number,
  def: ReturnType<typeof balancedSpaceEnemyDefinition>
) => EnemyBehaviorResult

export const enemyBehaviors: Partial<Record<EnemyKind, EnemyBehaviorFn>> = { /* filled below */ }
```

For each kind in `src/main.ts:2516-2724`, copy the branch body, replacing:
- `this.player.x/y` → `ctx.playerX/playerY`
- `this.stats.time` → `ctx.time`
- `hunger` → `ctx.hunger`
- `this.bullets.push({...})` → `ctx.spawnHostileBullet({...})`
- `this.burst(...)` → `ctx.burst(...)`
- `this.emitEnemyTrail(...)` → `ctx.emitEnemyTrail(...)`
- `this.fireHelixSpikes(...)` etc. → `ctx.fireHelixSpikes(...)` etc.
- `this.damagePlayer(...)` → `ctx.damagePlayer(...)`
- `this.killEnemy(e, false); continue` → `ctx.killEnemy(e, false); return 'consumed'`
- branches that don't kill → `return 'alive'`

`behavior.<kind>` tuning stays as `spaceEnemyBehavior.<kind>` imported from `game-balance`. The per-enemy stats (`enemyBalance` in the original) are passed in as the 4th parameter `def` to keep behaviors pure. The signature for EVERY behavior is exactly:

```typescript
(e: Enemy, ctx: EnemyBehaviorContext, dt: number, def: ReturnType<typeof balancedSpaceEnemyDefinition>) => EnemyBehaviorResult
```

Inside each branch, the original `enemyBalance` references become `def`. The original `toP` (computed in the loop as `norm(this.player.x - e.x, this.player.y - e.y)`) is recomputed at the top of each behavior from `ctx.playerX/playerY` so behaviors are self-contained.

Copy ALL kinds present in the original: `chaser`/`splinter`, `brute`, `shooter`, `razor`, `skimmer`, `shard`, `helix`, `prism`, `bulwark`, `siphon`, `dreadnought`, `cathedral`, `lancer`, `mine`, `warden`.

- [ ] **Step 3: Rewire `updateEnemies` to call the table**

Replace the if-ladder body (between the `const toP = ...` line and the shared-tail `const max = ...` line, i.e. `src/main.ts:2515-2724`) with:

```typescript
const def = balancedSpaceEnemyDefinition(e.kind)
const behaviorFn = enemyBehaviors[e.kind]
if (behaviorFn) {
  const result = behaviorFn(e, this.enemyBehaviorCtx, dt, def)
  if (result === 'consumed') continue
}
```

Keep the `const toP = norm(...)` computation if any behavior still needs it via ctx; otherwise behaviors recompute it themselves from `ctx.playerX/Y`. The shared tail (`src/main.ts:2725-2745`) is UNCHANGED.

Add a cached context built once per frame (or once and mutated):
```typescript
private get enemyBehaviorCtx(): EnemyBehaviorContext {
  return {
    playerX: this.player.x,
    playerY: this.player.y,
    time: this.stats.time,
    hunger: this.relics.has('hungryCompass') ? 1.08 : 1,
    spawnHostileBullet: (b) => { this.bullets.push({ ...b, pierce: 0, hostile: true }) },
    burst: (x, y, c, n, s) => this.burst(x, y, c, n, s),
    emitEnemyTrail: (e, c, i) => this.emitEnemyTrail(e, c, i),
    fireHelixSpikes: (e, d, t) => this.fireHelixSpikes(e, d, t),
    firePrismFan: (e, d, t) => this.firePrismFan(e, d, t),
    fireSiphonVortex: (e, d) => this.fireSiphonVortex(e, d),
    fireDreadnoughtBroadside: (e, d, t) => this.fireDreadnoughtBroadside(e, d, t),
    fireCathedralLattice: (e, d, t) => this.fireCathedralLattice(e, d, t),
    damagePlayer: (a) => this.damagePlayer(a),
    killEnemy: (e, r) => this.killEnemy(e, r)
  }
}
```

- [ ] **Step 4: Typecheck and run the characterization test**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test tests/enemy-behaviors.spec.ts -v` → PASS (chaser still closes distance).

- [ ] **Step 5: Run the FULL suite**

Run: `npx playwright test`
Expected: `214 passed`. If any combat/spawn/balance spec fails, the copy diverged — diff the moved branch against the original `src/main.ts` git history and fix the transcription. Do NOT change game numbers.

- [ ] **Step 6: Commit**

```bash
git add src/enemy-behaviors.ts src/main.ts
git commit -m "refactor: extract enemy AI into enemy-behaviors strategy table"
```

---

## Task 3: Extract space/surface scene rendering into `src/render/`

Mechanical move of canvas-drawing methods. They take `(ctx, view)` where `view` is a read-only snapshot of what they need. Start with the biggest, most self-contained: `renderSurfaceBiomeMotifs` (`src/main.ts:5069`, ~169 lines).

**Files:**
- Create: `src/render/surface-biomes.ts`
- Modify: `src/main.ts` (`renderSurfaceBiomeMotifs` → thin call)

- [ ] **Step 1: Identify the inputs `renderSurfaceBiomeMotifs` reads**

Read `src/main.ts:5069-5238`. List every `this.` access. Typical: `this.surface`, biome seed, `this.graphicsMode`, camera transform helpers. These become the `view` parameter fields.

- [ ] **Step 2: Move the function verbatim into `src/render/surface-biomes.ts`**

```typescript
import type { GraphicsMode } from '../main-types'

export interface SurfaceBiomeView {
  ctx: CanvasRenderingContext2D
  biome: string
  seed: number
  glow: boolean
  // ...exact fields discovered in Step 1
}

export function renderSurfaceBiomeMotifs(view: SurfaceBiomeView): void {
  // exact body copied from main.ts:5069-5238, with `this.X` → `view.X`
  // and `ctx` taken from view.ctx
}
```

- [ ] **Step 3: Replace the method body in `main.ts` with a delegating call**

```typescript
private renderSurfaceBiomeMotifs(ctx: CanvasRenderingContext2D) {
  renderSurfaceBiomeMotifs({ ctx, biome: this.surface!.planet.biome, seed: /* exact */, glow: this.allowGlow(), /* ...*/ })
}
```

Add `import { renderSurfaceBiomeMotifs } from './render/surface-biomes'` (alias to avoid name clash, e.g. `as drawSurfaceBiomeMotifs`, and call that).

- [ ] **Step 4: Typecheck and run the suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `214 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/render/surface-biomes.ts src/main.ts
git commit -m "refactor: extract surface biome rendering into render/surface-biomes"
```

- [ ] **Step 6: Repeat the same move for `renderPlayer` (`src/main.ts:6323-6530`)**

Create `src/render/player.ts` with `renderPlayer(view: PlayerView)`. Discover its `this.` reads (player state, build ranks for visible signatures, dash/trail/shield state, graphics mode, camera). Move verbatim, delegate, typecheck, run suite (`214 passed`), commit:

```bash
git add src/render/player.ts src/main.ts
git commit -m "refactor: extract player rendering into render/player"
```

- [ ] **Step 7: Repeat for the enemy renderers**

Move `renderEnemies`, `renderSpaceSpriteEnemy`, `renderPrioritySpriteEnemies`, `renderHordeEnemies`, `renderEnemyLod` (`src/main.ts:6625-7043`) into `src/render/enemies.ts`. These share state — move them together as one module with one `renderEnemies(view)` entry point and module-private helpers. Typecheck, run suite (`214 passed`), commit:

```bash
git add src/render/enemies.ts src/main.ts
git commit -m "refactor: extract enemy rendering into render/enemies"
```

---

## Task 4: Extract UI-screen rendering into `src/ui/`

These methods build DOM/canvas for menus and have nothing to do with the game loop. They are the code Phase 2 will edit, so isolating them now pays off twice. Move one screen per commit.

**Files:**
- Create: `src/ui/workbench.ts`, `src/ui/mothership-console.ts`, `src/ui/collection.ts`, `src/ui/debrief.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Move the workbench screen**

Grep `private renderWorkbench` in `src/main.ts` to list all related methods (`renderWorkbench`, `renderWorkbenchManifest`, etc.). Move them into `src/ui/workbench.ts` as exported functions taking a `WorkbenchView` (the data they read) plus callbacks for the actions they trigger (install, recycle, close). Delegate from thin methods in `main.ts`.

- [ ] **Step 2: Typecheck and run the suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `214 passed`. The `artifacts-workbench.spec.ts` suite directly exercises this — it is the safety net.

- [ ] **Step 3: Commit**

```bash
git add src/ui/workbench.ts src/main.ts
git commit -m "refactor: extract workbench UI into ui/workbench"
```

- [ ] **Step 4: Repeat for mothership console, collection, and debrief**

For each of `renderMothershipConsole*` → `src/ui/mothership-console.ts`, `renderCollection*` → `src/ui/collection.ts`, `renderDebrief`/`renderGameOver` → `src/ui/debrief.ts`: move verbatim with a view + callbacks, delegate, typecheck, run suite (`214 passed`), commit one per screen:

```bash
git add src/ui/mothership-console.ts src/main.ts
git commit -m "refactor: extract mothership console UI into ui/mothership-console"
# then collection, then debrief, each its own commit
```

`mothership-progression.spec.ts` and `artifacts-workbench.spec.ts` guard these.

---

## Task 5: Formalize the state-dispatch map

Replace the three hand-maintained if-chains in `update()` (`src/main.ts:1432`), `render()` (`:4925`), and `audioMood()` (`:1514`) with one `states` record.

**Files:**
- Create: `src/game-states.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Define the handler shape in `src/game-states.ts`**

```typescript
import type { GameState } from './main-types'

export interface StateHandler {
  update?(dt: number): void
  render?(ctx: CanvasRenderingContext2D): void
  audioMood?(): string
}
export type StateHandlers = Partial<Record<GameState, StateHandler>>
```

- [ ] **Step 2: Build the handlers map inside `VectorShooter` (keep methods, just route them)**

In `main.ts`, create `private readonly stateHandlers: StateHandlers = { ... }` mapping each state to the EXISTING private methods (e.g. `landing: { update: (dt) => this.updateLanding(dt), render: (ctx) => { /* landing render block */ } }`). Copy the exact bodies from the current if-chains. The `playing` state keeps the big inline update body — wrap it in a method `updatePlaying(dt)` first (verbatim move of `src/main.ts:1465-1500`), then reference it.

- [ ] **Step 3: Replace the if-chains with lookups**

`update(dt)` becomes: audio update (unchanged) → `const h = this.stateHandlers[this.state]; if (h?.update) { h.update(dt); return }` → fall through to the default `playing` path only if no handler. Same pattern for `render()` and `audioMood()`. Preserve the exact early-return semantics (e.g. the `alien`/`lore` shared block).

- [ ] **Step 4: Typecheck and run the FULL suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `214 passed`. State transitions are covered by `game-over-return.spec.ts`, `onboarding-planets.spec.ts`, and the surface/landing specs.

- [ ] **Step 5: Manual smoke test in the browser**

With `npm run dev` running, drive title → mothership → sector map → combat node → (take damage to trigger) game over → back to title. Confirm every transition still works (the if-chain→map conversion is the highest-risk-of-subtle-break step).

- [ ] **Step 6: Commit**

```bash
git add src/game-states.ts src/main.ts
git commit -m "refactor: replace state if-chains with a state-handler map"
```

---

## Task 6: Phase 0 verification gate

- [ ] **Step 1: Confirm the line-count reduction goal**

Run: `(Get-Content src/main.ts | Measure-Object -Line).Lines` (PowerShell) or `wc -l src/main.ts`.
Expected: meaningfully below ~9,840 — target ~5,000–6,000 (≈40–50% reduction). If the file is still near 9K, an extraction was incomplete; review which large method bodies remain inline.

- [ ] **Step 2: Full green gate**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → all passing (`214`+).

- [ ] **Step 3: Confirm no behavior changed**

Run a `balanced` sim batch and compare against the pre-refactor numbers from the review (survival avg ~10:28, destroyed ~35%, no balance flags):

Run: `npm run sim -- --runs=40 --policy=balanced --seed=5000 --maxSeconds=1800`
Expected: `Balance flags: none` and numbers within normal seed variance of the baseline. (The sim does not import the extracted render/UI code, so this mainly confirms balance-module imports are intact.)

- [ ] **Step 4: Remove the harness debug hooks if they are noise, or keep them gated**

The Task 1 debug hooks are behind `?harness=1` and harmless in production. Keep them — they are useful for Phase 1/3 playtest automation. No action unless they leaked outside the gate (verify by grepping that `debugStepEnemies` is only referenced inside `installHarnessIfRequested`).

- [ ] **Step 5: Final Phase 0 commit / tag**

```bash
git add -A
git commit -m "chore: Phase 0 refactor foundation complete"
git tag phase-0-complete
```

---

## Notes for the implementer

- **Never change a number.** This phase moves code; it does not tune. Any HP, speed, cooldown, color, or offset that changes is a transcription bug.
- **One extraction per commit.** If a step's suite run is red, revert that single commit's working changes and re-do the move more carefully — don't pile fixes on a broken move.
- **The suite is the contract.** 214 green (213 original + the Task 1 characterization test) after every task. If you must add a test to lock behavior before a move, do it first and commit it separately.
- **Circular imports:** `main-types.ts` (Task 2 Step 1a) is the shared dependency. Extracted modules import from `main-types.ts` and balance modules, never from `main.ts`.
- **Dev server:** several tests need `npm run dev` running on port 5176. Start it once in the background before the test runs that hit `http://127.0.0.1:5176`.
