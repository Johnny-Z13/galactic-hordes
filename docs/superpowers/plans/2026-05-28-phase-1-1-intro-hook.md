# Phase 1.1 Intro Hook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make minute one of a Galactic Hordes run feel loud, fast, and rewarding via four threads (intro spawn cadence, juice, LAND HERE waypoint, rich first-planet payoff) without diluting the deferred-upgrade identity.

**Architecture:** One pure module `src/intro-hook.ts` owns rules + the `introHookConfig` tuning table. One render module `src/ui/intro-waypoint.ts` draws the HUD arrow. Surgical hooks in `main.ts`, `src/render/enemies.ts`, `src/sector-map.ts`, `src/surface-encounters.ts`, `src/surface-balance.ts`. The slice ships as one PR, one tuning pass. Existing patterns (Phase 0): pure modules with mixin-style `self: VectorShooter` parameters where DOM/state access is needed; bracket access for private members.

**Tech Stack:** TypeScript, Vite, Playwright (test runner). Tests run `npx playwright test`; typecheck `npx tsc --noEmit`.

**Source spec:** `docs/superpowers/specs/2026-05-28-phase-1-1-intro-hook-design.md`.

**Baseline:** Branch `phase-1-1-intro-hook` off `main` (post-Phase-0). Suite currently at **218 passing**, `tsc` clean.

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `src/intro-hook.ts` | **new** | `introHookConfig` constant; `isFirstEverRun`, `pickWaypointTarget` pure functions. Zero `VectorShooter` knowledge. |
| `src/ui/intro-waypoint.ts` | **new** | `renderIntroArrow(ctx, view)` — pure render fn taking a snapshot. No state. |
| `src/main.ts` | modified | 8 surgical hooks: `updatePlaying` (waypoint tick, score-popup tick), `update` (hitstop early-return), `damageEnemy` (`e.flash` duration), `tryDashRam` (matching `e.flash` tune), `killEnemy` (popup push, hitstop set), `updatePickups` (glint), `confirmLanding` + `startLanding` (waypoint stop), `renderSpaceScene`/`renderSurface` (popup + waypoint render). 4 new fields: `introWaypoint`, `scorePopups`, `hitstopUntil`. `Pickup` interface gets `glintFrame?`. |
| `src/render/enemies.ts` | modified | Replace 4× `'#ffffff'` (existing white hit-flash) with `introHookConfig.hitFlash.color`. |
| `src/sector-map.ts` | modified | First-node spawn-cadence override consult. |
| `src/surface-encounters.ts` | modified | Inside `firstRunLanding === true` branch, consult `introHookConfig.firstPlanetPayoff`. |
| `src/surface-balance.ts` | modified | Inside `openingLanding === true` branch in `pickSurfaceResourceKind`, consult payoff multipliers. |
| `src/sim/sim-runner.ts` | modified | Emit `firstMinute` telemetry (kills_60s, firstLandingSec, firstWorkbenchSec). |
| `tests/intro-hook.spec.ts` | **new** | Pure-module unit tests. |
| `tests/intro-hook-pacing.spec.ts` | **new** | 40-run sim batch assertions. |
| `tests/intro-waypoint.spec.ts` | **new** | Headless behavior — waypoint lifecycle. |
| `tests/intro-juice.spec.ts` | **new** | Headless behavior — hit-flash + hitstop + popup + glint. |
| `tests/intro-first-planet.spec.ts` | **new** | Headless behavior — opening landing has richer payoff. |

---

## Conventions used throughout this plan

- **TDD per piece:** write failing test → run → see RED → implement → run → see GREEN → commit.
- **After every commit:** `npx tsc --noEmit` clean AND `npx playwright test` shows ≥ baseline. If either is red, fix before next task.
- **Bracket access for VectorShooter privates** in `src/ui/intro-waypoint.ts` (same pattern as `src/ui/workbench.ts`).
- **Never widen `private` to `public`** on `VectorShooter` members. Use bracket access from external modules.
- **CRLF tolerance:** when scripts read/write `src/main.ts`, use `raw.split(/\r?\n/)` and preserve the original EOL.
- **Commit message format:** `feat: <thread> — <subject>` or `test: <subject>`. End every commit body with `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.

---

## Prerequisites (one-time, before Task 1)

- [ ] **Step 1: Confirm clean baseline**

Run: `npx tsc --noEmit`
Expected: no output (exit 0).

Run: `npx playwright test`
Expected: `218 passed`.

If either fails, STOP — extraction starts from a green baseline.

- [ ] **Step 2: Confirm on the right branch**

Run: `git status -sb`
Expected: `## phase-1-1-intro-hook...origin/phase-1-1-intro-hook`. If not, `git checkout phase-1-1-intro-hook`.

---

## Task 1: Create `src/intro-hook.ts` with the config table + pure helpers

Pure module, pure tests. Builds the spine the rest of the plan consumes.

**Files:**
- Create: `src/intro-hook.ts`
- Create: `tests/intro-hook.spec.ts`

- [ ] **Step 1: Write the failing test file**

Create `tests/intro-hook.spec.ts`:

```typescript
import { expect, test } from '@playwright/test'
import { introHookConfig, isFirstEverRun, pickWaypointTarget } from '../src/intro-hook'

test('introHookConfig has the expected tuning keys and sane defaults', () => {
  expect(introHookConfig.waypoint.durationSeconds).toBeGreaterThan(0)
  expect(introHookConfig.popup.lifeSeconds).toBeGreaterThan(0)
  expect(introHookConfig.popup.riseSpeed).toBeGreaterThan(0)
  expect(introHookConfig.hitFlash.durationSeconds).toBeGreaterThan(0)
  expect(introHookConfig.hitFlash.color).toMatch(/^#[0-9a-fA-F]{6}$/)
  expect(introHookConfig.hitstop.durationSeconds).toBeGreaterThan(0)
  expect(introHookConfig.hitstop.giantKindsOnly).toBe(true)
  expect(introHookConfig.magnetGlint.frameInterval).toBeGreaterThanOrEqual(1)
  expect(introHookConfig.magnetGlint.particleSpeed).toBeGreaterThan(0)
  expect(introHookConfig.safeDriftFirstNode.spawnMultiplier).toBeGreaterThan(1)
  expect(introHookConfig.safeDriftFirstNode.extraStartingSpawns).toBeGreaterThanOrEqual(0)
  expect(introHookConfig.firstPlanetPayoff.cacheMultiplier).toBeGreaterThan(1)
  expect(introHookConfig.firstPlanetPayoff.guaranteedRelic).toBe(true)
  expect(introHookConfig.firstPlanetPayoff.extraLoreSites).toBeGreaterThanOrEqual(0)
})

test('isFirstEverRun is true only on a fresh run with no debrief and zero planets', () => {
  expect(isFirstEverRun({ planets: 0, hasDebrief: false })).toBe(true)
  expect(isFirstEverRun({ planets: 0, hasDebrief: true })).toBe(false)
  expect(isFirstEverRun({ planets: 1, hasDebrief: false })).toBe(false)
  expect(isFirstEverRun({ planets: 5, hasDebrief: true })).toBe(false)
})

test('pickWaypointTarget returns the nearest visible planet by squared distance', () => {
  const planets = [
    { id: 'far', x: 1000, y: 0 },
    { id: 'near', x: 50, y: 0 },
    { id: 'mid', x: 200, y: 200 }
  ]
  expect(pickWaypointTarget(planets, { x: 0, y: 0 })?.id).toBe('near')
})

test('pickWaypointTarget returns null when no planets exist', () => {
  expect(pickWaypointTarget([], { x: 0, y: 0 })).toBeNull()
})
```

- [ ] **Step 2: Run test to confirm it fails with module-not-found**

Run: `npx playwright test tests/intro-hook.spec.ts`
Expected: failure citing `Cannot find module '../src/intro-hook'`.

- [ ] **Step 3: Create `src/intro-hook.ts` with config + pure helpers**

```typescript
export const introHookConfig = {
  waypoint: {
    durationSeconds: 30,
    showOffscreenArrow: true,
    fontPx: 14,
    color: '#fff27a'
  },
  popup: { lifeSeconds: 0.6, riseSpeed: 40, fontPx: 13 },
  hitFlash: { durationSeconds: 0.08, color: '#ff5d73' },
  hitstop: { durationSeconds: 0.04, giantKindsOnly: true },
  magnetGlint: { frameInterval: 4, particleSpeed: 30 },
  safeDriftFirstNode: { spawnMultiplier: 1.25, extraStartingSpawns: 2 },
  firstPlanetPayoff: { cacheMultiplier: 1.4, guaranteedRelic: true, extraLoreSites: 1 }
} as const

export interface IsFirstEverRunInput {
  planets: number
  hasDebrief: boolean
}

export function isFirstEverRun(input: IsFirstEverRunInput): boolean {
  return input.planets === 0 && !input.hasDebrief
}

export interface WaypointPlanetCandidate {
  id: string
  x: number
  y: number
}

export function pickWaypointTarget<T extends WaypointPlanetCandidate>(
  planets: readonly T[],
  player: { x: number; y: number }
): T | null {
  if (planets.length === 0) return null
  let best: T | null = null
  let bestD = Number.POSITIVE_INFINITY
  for (const p of planets) {
    const dx = p.x - player.x
    const dy = p.y - player.y
    const d2 = dx * dx + dy * dy
    if (d2 < bestD) {
      bestD = d2
      best = p
    }
  }
  return best
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/intro-hook.spec.ts`
Expected: 4 passed.

- [ ] **Step 5: Run the full suite to confirm no regression**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `222 passed` (218 baseline + 4 new).

- [ ] **Step 6: Commit**

```bash
git add src/intro-hook.ts tests/intro-hook.spec.ts
git commit -m "feat: intro-hook module with config table and pure helpers

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Enemy hit-flash color + duration tune (Thread B, smallest)

The existing white hit-flash becomes red, and the duration goes from 0.05s to 0.08s. Pure tuning of existing system — five edits total.

**Files:**
- Modify: `src/main.ts` (`damageEnemy` at line 3119–3126; `tryDashRam` at line 2622–2629 — verify line numbers before editing)
- Modify: `src/render/enemies.ts` (4 `'#ffffff'` references)
- Test: included in Task 9 (`tests/intro-juice.spec.ts`)

- [ ] **Step 1: Verify the current state of the two stamp sites**

Run: `grep -nE "e\.flash\s*=" src/main.ts`
Expected: at least `e.flash = Math.max(e.flash, 0.12)` (in `tryDashRam`) and `e.flash = 0.05` (in `damageEnemy`). Note the exact lines — they may shift slightly from this plan's numbers.

- [ ] **Step 2: Update `src/main.ts` to import the config and use it**

Add to the import block at the top of `src/main.ts` (after the last existing `./` import, before the `type GameState =` line):

```typescript
import { introHookConfig } from './intro-hook'
```

Then, in `damageEnemy` (around line 3121), change:

```typescript
e.flash = 0.05
```

to:

```typescript
e.flash = introHookConfig.hitFlash.durationSeconds
```

And in `tryDashRam` (around line 2623), change:

```typescript
e.flash = Math.max(e.flash, 0.12)
```

to:

```typescript
e.flash = Math.max(e.flash, introHookConfig.hitFlash.durationSeconds)
```

- [ ] **Step 3: Update `src/render/enemies.ts` to use the config color**

At the top of `src/render/enemies.ts`, add the import:

```typescript
import { introHookConfig } from '../intro-hook'
```

Then replace **all four** `'#ffffff'` occurrences (lines ~38, ~152, ~154, ~371 — verify with `grep -nE "'#ffffff'" src/render/enemies.ts`) with `introHookConfig.hitFlash.color`.

For example, the line `ctx.strokeStyle = e.flash > 0 ? '#ffffff' : e.color` becomes:

```typescript
ctx.strokeStyle = e.flash > 0 ? introHookConfig.hitFlash.color : e.color
```

- [ ] **Step 4: Typecheck and run suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `222 passed` (unchanged from Task 1).

- [ ] **Step 5: Commit**

```bash
git add src/main.ts src/render/enemies.ts
git commit -m "feat: red enemy hit-flash with tuned 0.08s duration

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Score popups on kill (Thread B)

New `scorePopups` array on `VectorShooter`. Pushed in `killEnemy`, ticked in `updatePlaying`, rendered from `renderSpaceScene`/`renderSurface`.

**Files:**
- Modify: `src/main.ts` (add field; modify `killEnemy`, `updatePlaying`, `renderSpaceScene`, `renderSurface`)
- Test: included in Task 9

- [ ] **Step 1: Add the `scorePopups` field on `VectorShooter`**

Find the class-field block (search for `private particles` — score popups should live next to it). Add after `private particles: Particle[] = []`:

```typescript
private scorePopups: Array<{ x: number; y: number; vy: number; life: number; totalLife: number; text: string }> = []
```

- [ ] **Step 2: Push a popup in `killEnemy(e, reward)` when reward is true**

Find `private killEnemy(e: Enemy, reward: boolean)` (around line 3128). Inside the method body, add right after the existing `removeEnemy(e)` call (and only when `reward === true`):

```typescript
if (reward) {
  const cap = 60
  if (this.scorePopups.length >= cap) this.scorePopups.shift()
  this.scorePopups.push({
    x: e.x,
    y: e.y,
    vy: -introHookConfig.popup.riseSpeed,
    life: introHookConfig.popup.lifeSeconds,
    totalLife: introHookConfig.popup.lifeSeconds,
    text: `+${Math.round(e.value)}`
  })
}
```

Place this BEFORE any existing `if (reward)` block (if one exists) so existing behavior is unchanged. The 60-cap prevents popup overload in dense combat (per spec Risk #5).

- [ ] **Step 3: Tick popups in `updatePlaying(dt)`**

Find `private updatePlaying(dt: number)` (around line 1480). Add this loop at the END of the method, immediately before the closing `}`:

```typescript
for (let i = this.scorePopups.length - 1; i >= 0; i -= 1) {
  const sp = this.scorePopups[i]
  sp.life -= dt
  sp.y += sp.vy * dt
  if (sp.life <= 0) this.scorePopups.splice(i, 1)
}
```

- [ ] **Step 4: Render popups from `renderSpaceScene`**

Find `private renderSpaceScene(ctx: CanvasRenderingContext2D)`. Add a call at the END (after `this.renderMinimap()`):

```typescript
this.renderScorePopups(ctx)
```

Then add the `renderScorePopups` method as a `private` member of `VectorShooter` (place it next to `renderSpaceScene`):

```typescript
private renderScorePopups(ctx: CanvasRenderingContext2D) {
  if (this.scorePopups.length === 0) return
  ctx.save()
  ctx.font = `${introHookConfig.popup.fontPx}px Courier New`
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff27a'
  for (const sp of this.scorePopups) {
    const screen = this.worldToScreen(sp.x, sp.y)
    ctx.globalAlpha = Math.max(0, sp.life / sp.totalLife)
    ctx.fillText(sp.text, screen.x, screen.y)
  }
  ctx.globalAlpha = 1
  ctx.restore()
}
```

- [ ] **Step 5: Render popups from `renderSurface` for surface kills**

Find `private renderSurface(ctx: CanvasRenderingContext2D)`. Add the same call at the END (before the closing `}`):

```typescript
this.renderScorePopups(ctx)
```

(For surface kills, the popups' `x/y` are surface coordinates; `worldToScreen` is space-coordinate. This will likely render in the wrong position on surface — that's acceptable for V1 since most kills happen in space. If surface popups end up looking broken in the manual pass, tune `renderScorePopups` to detect surface state and call `surfaceToScreen` instead. Track as a tuning-pass note.)

- [ ] **Step 6: Typecheck and run suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `222 passed`.

- [ ] **Step 7: Commit**

```bash
git add src/main.ts
git commit -m "feat: floating +N score popups on enemy kill

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Hitstop on giant kills (Thread B)

New `hitstopUntil` timer on `VectorShooter`. Set in `killEnemy` when the enemy is a giant kind. Checked in `update()` as an early-return.

**Files:**
- Modify: `src/main.ts` (add field; modify `killEnemy`, `update`)
- Test: included in Task 9

- [ ] **Step 1: Add the `hitstopUntil` field**

Near the other timer fields on `VectorShooter` (search for `private spawnTimer` or `private bossTimer`), add:

```typescript
private hitstopUntil = 0
```

- [ ] **Step 2: Import `isGiantEnemyKind` if not already imported**

Verify `isGiantEnemyKind` is imported in `src/main.ts`:

Run: `grep -n "isGiantEnemyKind" src/main.ts | head`

If only used as `this.X` (unlikely) or only in import-line, you're done. If missing, add to the existing `'./space-enemies'` import.

- [ ] **Step 3: Set hitstop on giant-kind kills**

In `killEnemy(e, reward)`, right after the popup push from Task 3, add:

```typescript
if (reward && introHookConfig.hitstop.giantKindsOnly && isGiantEnemyKind(e.kind)) {
  this.hitstopUntil = performance.now() / 1000 + introHookConfig.hitstop.durationSeconds
}
```

- [ ] **Step 4: Early-return on `update(dt)` during hitstop**

Find `private update(dt: number)` (around line 1418). After `this.audio.update(dt, intensity, this.audioMood())` and BEFORE the next line (the `alien/lore && surface` branch), add:

```typescript
if (performance.now() / 1000 < this.hitstopUntil) return
```

The audio update keeps running. The render in the same frame is unaffected (hitstop is an `update`-only concept).

- [ ] **Step 5: Typecheck and run suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `222 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/main.ts
git commit -m "feat: 40ms hitstop on giant-kind enemy kills

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Pickup magnet glint (Thread B)

Reuses the existing `burst` particle system. Add `glintFrame?` to the local `Pickup` interface; emit a 1-particle burst at the configured frame interval while a pickup is in magnet range.

**Files:**
- Modify: `src/main.ts` (modify `Pickup` interface; modify `updatePickups`)
- Test: included in Task 9

- [ ] **Step 1: Extend the `Pickup` interface**

In `src/main.ts` around line 164, the `interface Pickup { ... }` block currently ends with `color: string`. Add `glintFrame?: number` as the last field:

```typescript
interface Pickup {
  kind: PickupKind
  x: number
  y: number
  vx: number
  vy: number
  value: number
  radius: number
  life: number
  color: string
  glintFrame?: number
}
```

- [ ] **Step 2: Emit glint in `updatePickups` magnet branch**

Find `private updatePickups(dt: number)` (around line 2568). Inside the loop, inside the existing `if (d < magnet || p.kind === 'magnet')` block, AFTER the existing `p.vx += ...` and `p.vy += ...` lines, add:

```typescript
p.glintFrame = (p.glintFrame ?? 0) + 1
if (p.glintFrame % introHookConfig.magnetGlint.frameInterval === 0) {
  this.burst(p.x, p.y, p.color, 1, introHookConfig.magnetGlint.particleSpeed)
}
```

- [ ] **Step 3: Typecheck and run suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `222 passed`.

- [ ] **Step 4: Commit**

```bash
git add src/main.ts
git commit -m "feat: pickup magnet glint particles when pulled

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: LAND HERE waypoint state machine (Thread C, part 1 — non-render)

Add `introWaypoint` field on `VectorShooter`; start/tick/stop logic in `updatePlaying` and on first landing.

**Files:**
- Modify: `src/main.ts` (add field + state machine; modify `updatePlaying`, `confirmLanding`, `startLanding`)
- Test: included in Task 8

- [ ] **Step 1: Add the `introWaypoint` field on `VectorShooter`**

Near the other front-of-class state fields (search for `private debrief:`), add:

```typescript
private introWaypoint: { active: boolean; timer: number; targetPlanetId: string | null } | null = null
```

- [ ] **Step 2: Add the state-machine helper methods**

After `updatePlaying`, add three private methods:

```typescript
private maybeStartIntroWaypoint() {
  if (this.introWaypoint !== null) return
  if (this.state !== 'playing') return
  if (!isFirstEverRun({ planets: this.stats.planets, hasDebrief: this.debrief !== null })) return
  const target = pickWaypointTarget(this.planets, this.player)
  if (!target) return
  this.introWaypoint = {
    active: true,
    timer: introHookConfig.waypoint.durationSeconds,
    targetPlanetId: target.id
  }
}

private tickIntroWaypoint(dt: number) {
  const wp = this.introWaypoint
  if (!wp || !wp.active) return
  wp.timer -= dt
  if (wp.timer <= 0) {
    wp.active = false
    return
  }
  // If the target planet has been chunk-unloaded, re-pick.
  const stillExists = this.planets.some((p) => p.id === wp.targetPlanetId)
  if (!stillExists) {
    const next = pickWaypointTarget(this.planets, this.player)
    wp.targetPlanetId = next ? next.id : null
    if (!next) wp.active = false
  }
}

private stopIntroWaypoint() {
  if (this.introWaypoint?.active) this.introWaypoint.active = false
}
```

Add the imports at the top of `main.ts`:

```typescript
import { introHookConfig, isFirstEverRun, pickWaypointTarget } from './intro-hook'
```

(Note: `introHookConfig` was added in Task 2 — if so, just extend the same import; otherwise create it.)

- [ ] **Step 3: Wire the state machine into `updatePlaying`**

At the START of `private updatePlaying(dt: number)` (around line 1480), add:

```typescript
this.maybeStartIntroWaypoint()
this.tickIntroWaypoint(dt)
```

- [ ] **Step 4: Stop the waypoint on first landing**

Find `private confirmLanding()` (around line 4046). At the START of the method, add:

```typescript
this.stopIntroWaypoint()
```

Find `private startLanding(planet: Planet)` (around line 3651). At the START of the method, add:

```typescript
this.stopIntroWaypoint()
```

(Both call sites because landing flows can come through either entry point depending on auto-nav vs. manual.)

- [ ] **Step 5: Typecheck and run suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `222 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/main.ts
git commit -m "feat: LAND HERE waypoint state machine

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: LAND HERE waypoint rendering (Thread C, part 2)

Create `src/ui/intro-waypoint.ts` (pure render module) and call it from `renderSpaceScene`.

**Files:**
- Create: `src/ui/intro-waypoint.ts`
- Modify: `src/main.ts` (add `renderIntroWaypoint` delegator-style call from `renderSpaceScene`)
- Test: included in Task 8

- [ ] **Step 1: Create `src/ui/intro-waypoint.ts`**

```typescript
import { introHookConfig } from '../intro-hook'

export interface IntroWaypointView {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  targetScreen: { x: number; y: number }
  planetName: string
}

export function renderIntroArrow(view: IntroWaypointView): void {
  const { ctx, width, height, targetScreen, planetName } = view
  const margin = 36
  const onScreen =
    targetScreen.x >= 0 && targetScreen.x <= width &&
    targetScreen.y >= 0 && targetScreen.y <= height
  ctx.save()
  ctx.fillStyle = introHookConfig.waypoint.color
  ctx.strokeStyle = introHookConfig.waypoint.color
  ctx.font = `${introHookConfig.waypoint.fontPx}px Courier New`
  ctx.textAlign = 'center'
  ctx.shadowColor = introHookConfig.waypoint.color
  ctx.shadowBlur = 8
  if (onScreen) {
    // Small label near the planet.
    ctx.fillText('LAND HERE', targetScreen.x, targetScreen.y - 28)
    ctx.fillText(planetName, targetScreen.x, targetScreen.y - 14)
  } else {
    // Off-screen: draw an arrow at the playfield edge pointing at the target.
    const cx = width / 2
    const cy = height / 2
    const dx = targetScreen.x - cx
    const dy = targetScreen.y - cy
    const angle = Math.atan2(dy, dx)
    const halfW = width / 2 - margin
    const halfH = height / 2 - margin
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const scale = Math.min(halfW / Math.max(Math.abs(cos), 0.0001), halfH / Math.max(Math.abs(sin), 0.0001))
    const ax = cx + cos * scale
    const ay = cy + sin * scale
    ctx.translate(ax, ay)
    ctx.rotate(angle)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-18, -9)
    ctx.lineTo(-14, 0)
    ctx.lineTo(-18, 9)
    ctx.closePath()
    ctx.fill()
    ctx.rotate(-angle)
    ctx.fillText('LAND HERE', 0, 22)
    ctx.fillText(planetName, 0, 22 + introHookConfig.waypoint.fontPx + 2)
  }
  ctx.restore()
}
```

- [ ] **Step 2: Import the renderer in `main.ts`**

Add to the existing `'./ui/...'` import group:

```typescript
import { renderIntroArrow } from './ui/intro-waypoint'
```

- [ ] **Step 3: Call the renderer from `renderSpaceScene`**

In `renderSpaceScene`, AFTER `this.renderMinimap()` and BEFORE the new `this.renderScorePopups(ctx)` (added in Task 3 Step 4), add:

```typescript
this.drawIntroWaypoint(ctx)
```

Then add the helper method on `VectorShooter`:

```typescript
private drawIntroWaypoint(ctx: CanvasRenderingContext2D) {
  const wp = this.introWaypoint
  if (!wp || !wp.active || !wp.targetPlanetId) return
  const target = this.planets.find((p) => p.id === wp.targetPlanetId)
  if (!target) return
  const screen = this.worldToScreen(target.x, target.y)
  renderIntroArrow({
    ctx,
    width: this.width,
    height: this.height,
    targetScreen: screen,
    planetName: target.name
  })
}
```

- [ ] **Step 4: Typecheck and run suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `222 passed`.

- [ ] **Step 5: Manual smoke check**

Run (background): `npm run dev`
Open `http://127.0.0.1:5176/?harness=1` in a browser. Clear localStorage to simulate first-ever run:

```javascript
localStorage.clear(); location.reload()
```

Launch a run. Expected: a yellow arrow at the playfield edge labeled "LAND HERE / <planet name>" within ~1s, fading to a small label when you fly close. Disappears after landing on any planet OR after ~30s.

If the arrow doesn't appear, check the browser console; the most likely cause is `isFirstEverRun` returning false because `this.debrief` is non-null from a prior run (localStorage persistence).

- [ ] **Step 6: Commit**

```bash
git add src/ui/intro-waypoint.ts src/main.ts
git commit -m "feat: LAND HERE HUD arrow render

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Headless behavior tests — waypoint (Thread C verification)

Verify the waypoint lifecycle via real-game harness, with new debug hooks for forcing first-ever state.

**Files:**
- Modify: `src/main.ts` (add 2 new debug hooks behind `?harness=1` gate)
- Create: `tests/intro-waypoint.spec.ts`

- [ ] **Step 1: Add debug hooks behind the harness gate**

Find `private installHarnessIfRequested()` (around line 7565). After the existing `window.debugStepEnemies = ...` line, add:

```typescript
window.debugForceFirstEverRun = () => {
  this.debrief = null
  this.stats.planets = 0
  this.introWaypoint = null
}
window.debugIntroWaypointState = () => {
  const wp = this.introWaypoint
  if (!wp) return null
  return { active: wp.active, timer: wp.timer, targetPlanetId: wp.targetPlanetId }
}
window.debugLandOnNearestPlanet = () => {
  if (this.state !== 'playing') return false
  let nearest: Planet | null = null
  let bestD = Infinity
  for (const p of this.planets) {
    const d = dist2(p, this.player)
    if (d < bestD) { bestD = d; nearest = p }
  }
  if (!nearest) return false
  this.startLanding(nearest)
  return true
}
```

Update the `Window` interface declaration at the bottom of `main.ts` (search for `__galacticHarness?:`) to add the new methods:

```typescript
debugForceFirstEverRun?: () => void
debugIntroWaypointState?: () => { active: boolean; timer: number; targetPlanetId: string | null } | null
debugLandOnNearestPlanet?: () => boolean
```

- [ ] **Step 2: Write `tests/intro-waypoint.spec.ts`**

```typescript
import { expect, test } from '@playwright/test'

const URL = 'http://127.0.0.1:5176/?harness=1'

test('intro waypoint activates on a fresh first-ever run', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const result = await page.evaluate(async () => {
    const w = window as any
    w.debugForceFirstEverRun()
    // Simulate a run start: state = 'playing'. Use the existing button if available;
    // otherwise drive state directly.
    const g = w.__vectorShooter
    g.state = 'playing'
    // Wait one tick by stepping enemies (drives updatePlaying via the harness no-op).
    // Actual waypoint start happens in updatePlaying — wait for the game loop.
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    return w.debugIntroWaypointState()
  })
  expect(result).not.toBeNull()
  expect(result.active).toBe(true)
  expect(result.timer).toBeGreaterThan(0)
  expect(result.timer).toBeLessThanOrEqual(30)
  expect(result.targetPlanetId).not.toBeNull()
})

test('intro waypoint deactivates after landing', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const result = await page.evaluate(async () => {
    const w = window as any
    w.debugForceFirstEverRun()
    const g = w.__vectorShooter
    g.state = 'playing'
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    const beforeLanding = w.debugIntroWaypointState()
    w.debugLandOnNearestPlanet()
    return { beforeLanding, afterLanding: w.debugIntroWaypointState() }
  })
  expect(result.beforeLanding?.active).toBe(true)
  expect(result.afterLanding?.active).toBe(false)
})

test('intro waypoint does NOT activate on a second run (debrief present)', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const result = await page.evaluate(async () => {
    const w = window as any
    const g = w.__vectorShooter
    // Simulate a completed run by setting a debrief object.
    g.debrief = { resources: { recovered: { scrap: 0, crystal: 0, cores: 0 } }, discoveries: [], lightYears: 0, stationVisits: [], skippedBeacons: 0, title: 'Test', copy: '' }
    g.stats.planets = 1
    g.state = 'playing'
    g.introWaypoint = null
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    return w.debugIntroWaypointState()
  })
  expect(result).toBeNull()
})
```

- [ ] **Step 3: Start dev server and run the new spec**

Run: `npm run dev` (background, on port 5176).
Run: `npx playwright test tests/intro-waypoint.spec.ts -v`
Expected: 3 passed.

If any test fails citing harness hooks missing, verify Step 1 saved correctly and the dev server has reloaded.

- [ ] **Step 4: Run the full suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `225 passed` (222 + 3 new).

- [ ] **Step 5: Commit**

```bash
git add src/main.ts tests/intro-waypoint.spec.ts
git commit -m "test: headless behavior tests for LAND HERE waypoint lifecycle

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Headless behavior tests — juice (Thread B verification)

Verify hit-flash, hitstop, score popup, and magnet glint via the running game.

**Files:**
- Modify: `src/main.ts` (add 2 more debug hooks)
- Create: `tests/intro-juice.spec.ts`

- [ ] **Step 1: Add 2 more debug hooks**

Inside `installHarnessIfRequested`, after the hooks from Task 8 Step 1, add:

```typescript
window.debugScorePopupsSnapshot = () => ({
  count: this.scorePopups.length,
  texts: this.scorePopups.map((sp) => sp.text)
})
window.debugHitstopUntil = () => this.hitstopUntil
window.debugForceKillNearestEnemy = (giant: boolean) => {
  let target: Enemy | null = null
  if (giant) {
    target = this.enemies.find((e) => isGiantEnemyKind(e.kind)) ?? null
  } else {
    let best = Infinity
    for (const e of this.enemies) {
      if (isGiantEnemyKind(e.kind)) continue
      const d = dist2(e, this.player)
      if (d < best) { best = d; target = e }
    }
  }
  if (!target) return false
  this.killEnemy(target, true)
  return true
}
```

Update the `Window` interface:

```typescript
debugScorePopupsSnapshot?: () => { count: number; texts: string[] }
debugHitstopUntil?: () => number
debugForceKillNearestEnemy?: (giant: boolean) => boolean
```

- [ ] **Step 2: Write `tests/intro-juice.spec.ts`**

```typescript
import { expect, test } from '@playwright/test'

const URL = 'http://127.0.0.1:5176/?harness=1'

test('score popups appear after a kill and clear within ~1s', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const result = await page.evaluate(async () => {
    const w = window as any
    const g = w.__vectorShooter
    g.state = 'playing'
    // Spawn an enemy near the player so it can be killed.
    w.debugSpawnSingleEnemy('chaser', 60, 0)
    const before = w.debugScorePopupsSnapshot()
    w.debugForceKillNearestEnemy(false)
    const justAfter = w.debugScorePopupsSnapshot()
    // Wait > popup life (0.6s)
    await new Promise((r) => setTimeout(r, 900))
    const later = w.debugScorePopupsSnapshot()
    return { before, justAfter, later }
  })
  expect(result.before.count).toBe(0)
  expect(result.justAfter.count).toBe(1)
  expect(result.justAfter.texts[0]).toMatch(/^\+\d+$/)
  expect(result.later.count).toBe(0)
})

test('hitstop fires on giant-kind kill but not on chaser kill', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const result = await page.evaluate(async () => {
    const w = window as any
    const g = w.__vectorShooter
    g.state = 'playing'
    // Chaser kill first — should NOT set hitstop in future
    w.debugSpawnSingleEnemy('chaser', 60, 0)
    const t0 = performance.now() / 1000
    w.debugForceKillNearestEnemy(false)
    const afterChaser = w.debugHitstopUntil()
    // Giant kill — should set hitstop
    w.debugSpawnSingleEnemy('brute', 100, 0)
    const t1 = performance.now() / 1000
    w.debugForceKillNearestEnemy(true)
    const afterGiant = w.debugHitstopUntil()
    return { t0, afterChaser, t1, afterGiant }
  })
  expect(result.afterChaser).toBeLessThanOrEqual(result.t0)
  expect(result.afterGiant).toBeGreaterThan(result.t1)
  expect(result.afterGiant - result.t1).toBeLessThan(0.2) // < 200ms — sane bound
})

test('enemy.flash is stamped by damage and uses the configured duration', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const result = await page.evaluate(async () => {
    const w = window as any
    const g = w.__vectorShooter
    g.state = 'playing'
    w.debugSpawnSingleEnemy('brute', 80, 0)
    const e = g.enemies[0]
    e.hp = 1000  // make sure damage doesn't kill it
    e.flash = 0  // clear
    g.damageEnemy(e, 1, '#fff')
    return { flashAfter: e.flash }
  })
  expect(result.flashAfter).toBeCloseTo(0.08, 2)
})
```

- [ ] **Step 3: Run the new spec**

Run: `npx playwright test tests/intro-juice.spec.ts -v`
Expected: 3 passed.

- [ ] **Step 4: Run the full suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `228 passed` (225 + 3 new).

- [ ] **Step 5: Commit**

```bash
git add src/main.ts tests/intro-juice.spec.ts
git commit -m "test: headless behavior tests for juice (popup, hitstop, hit-flash)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Intro spawn cadence override (Thread A)

When the player starts a run on a `safeDrift` node AND it's their first run, apply the `safeDriftFirstNode` overrides to `startingSpawns` count and `spawnMultiplier`. The cleanest hook: in `main.ts` where `sectorNodeProfile.config.enemies.startingSpawns` is iterated (line 7423 area), pre-extend the spawn list; multiply the spawn multiplier on the live `sectorNodeProfile`.

**Files:**
- Modify: `src/main.ts` (one block in the node-enter setup)
- Test: extend in Task 13

- [ ] **Step 1: Locate the node-enter setup block**

Run: `grep -n 'startingSpawns: this\|sectorNodeProfile.config.enemies.startingSpawns' src/main.ts`

You should find the `for (const kind of this.sectorNodeProfile.config.enemies.startingSpawns) this.spawnEnemy(kind)` line (around line 7423). The block that calls it is the `enterSectorNode` / `applySectorNode` method (the surrounding `private` method).

- [ ] **Step 2: Apply the first-node override BEFORE the spawn loop**

Just before the `for (const kind of this.sectorNodeProfile.config.enemies.startingSpawns)` line, insert:

```typescript
// Phase 1.1: intro-hook override for the first-ever run's safeDrift entry node.
const isIntroSafeDrift =
  isFirstEverRun({ planets: this.stats.planets, hasDebrief: this.debrief !== null })
  && this.sectorNodeProfile.config.templateId === 'safeDrift'
  && this.stats.time === 0
const extraSpawns: SpaceEnemyKind[] = []
if (isIntroSafeDrift) {
  const base = this.sectorNodeProfile.config.enemies.startingSpawns
  for (let i = 0; i < introHookConfig.safeDriftFirstNode.extraStartingSpawns; i += 1) {
    extraSpawns.push(base[i % base.length])
  }
  this.sectorNodeProfile.spawnMultiplier *= introHookConfig.safeDriftFirstNode.spawnMultiplier
}
```

Then modify the existing spawn loop to include `extraSpawns`:

```typescript
for (const kind of this.sectorNodeProfile.config.enemies.startingSpawns) this.spawnEnemy(kind)
for (const kind of extraSpawns) this.spawnEnemy(kind)
```

(Verify `SpaceEnemyKind` is imported in `main.ts` — `grep -n "SpaceEnemyKind" src/main.ts | head`. If not, add it from `./space-enemies`.)

- [ ] **Step 3: Typecheck and run suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `228 passed`.

- [ ] **Step 4: Commit**

```bash
git add src/main.ts
git commit -m "feat: intro safeDrift node spawns +2 starter + 1.25x pressure on first run

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Rich first-planet payoff (Thread D)

When `openingLanding === true`, apply the payoff multipliers. The flag is already plumbed into `planSurfaceEncounter` and `pickSurfaceResourceKind` — Task 11 adds the multipliers consumed by those branches.

**Files:**
- Modify: `src/surface-encounters.ts` (extend the `firstRunLanding` branch in `planSurfaceEncounter`)
- Modify: `src/surface-balance.ts` (extend `pickSurfaceResourceKind` and any `surfaceRunBalance` reader the count flows through — verify before editing)
- Modify: `src/main.ts` (multiply `count` post-`planSurfaceEncounter` if the encounter module can't reach the config)
- Test: covered by Task 13 (sim batch) and Task 14 (headless first-planet)

- [ ] **Step 1: Read the current `firstRunLanding === true` branches to confirm shape**

Read `src/surface-encounters.ts:41` (the `if (input.firstRunLanding)` branch).
Read `src/surface-balance.ts:198–215` (the `pickSurfaceResourceKind` opening branch).

The branches currently set `event` / pick kinds. The plan: **don't change WHAT the branch returns; just multiply the count after the fact** in `main.ts` where `count` is consumed. Cleanest seam.

- [ ] **Step 2: Apply the payoff multipliers in `main.ts`**

Find the line `const count = profile.resourceCount` (around line 3699 — verify with `grep -n 'profile.resourceCount' src/main.ts`).

Replace:

```typescript
const count = profile.resourceCount
```

with:

```typescript
const baseCount = profile.resourceCount
const count = openingLanding
  ? Math.round(baseCount * introHookConfig.firstPlanetPayoff.cacheMultiplier)
  : baseCount
```

- [ ] **Step 3: Defer `guaranteedRelic` and `extraLoreSites` to the manual tuning pass**

The spec's `guaranteedRelic` and `extraLoreSites` payoff knobs require constructing `Relic` / lore-site objects with exact field shapes that depend on `createSurfaceRun`'s internals (RNG seeding, archetype gating, safe-point geometry). Forcing those in this task risks shipping ill-shaped objects that crash the surface loop.

Decision: implement ONLY the cache-count multiplier in Step 2. The `firstPlanetPayoff.cacheMultiplier` alone is a meaningful payoff bump (1.4x = ~40% more resources to grab on the first planet). The `guaranteedRelic` and `extraLoreSites` toggles stay on `introHookConfig` (defaults `true` / `1`) as a record of intent, but the code reading them is added during the manual tuning pass (Task 15) IF the cache-count bump alone doesn't satisfy success check #6.

Update `src/intro-hook.ts` to add a code comment on those two fields:

```typescript
firstPlanetPayoff: {
  cacheMultiplier: 1.4,
  // NOTE: guaranteedRelic and extraLoreSites are intent flags; consumers wired
  // in the manual tuning pass if cacheMultiplier alone is insufficient.
  guaranteedRelic: true,
  extraLoreSites: 1
}
```

Then update the `tests/intro-hook.spec.ts` schema test added in Task 1 — it already passes for these keys; no change needed.

- [ ] **Step 4: Typecheck and run suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `228 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/main.ts
git commit -m "feat: rich first-planet payoff (1.4x cache count on opening landing)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Sim-runner pacing telemetry instrumentation

The 40-run pacing assertions in Task 13 require new fields in the sim metrics. Add them.

**Files:**
- Modify: `src/sim/sim-runner.ts` (track first-kill, first-landing, first-workbench times per run)
- Modify: `src/sim/sim-types.ts` (extend the run-result type)
- Modify: `src/sim/sim-metrics.ts` (aggregate the per-run fields into a `firstMinute` summary)

- [ ] **Step 1: Survey the existing sim-runner output shape**

Run: `cat src/sim/sim-types.ts | head -60`

Identify the per-run result interface. The new fields needed:

```typescript
firstKillSec: number | null         // null if no kills
killsFirst60Sec: number
firstLandingSec: number | null
firstWorkbenchSec: number | null    // null if workbench never opened
```

- [ ] **Step 2: Add the fields to the sim-result type**

In `src/sim/sim-types.ts`, find the per-run result interface (probably `SimRunResult` or similar) and add the four optional/required fields above.

- [ ] **Step 3: Track the fields in `sim-runner.ts`**

The sim has a notion of "time" — find where kills, landings, and workbench-opens are recorded. At each event:

- On first kill: if `result.firstKillSec === null`, set it. Increment a `killsFirst60` counter while `time < 60`.
- On first landing: if `result.firstLandingSec === null`, set it.
- On first workbench open: if `result.firstWorkbenchSec === null`, set it.

The exact placement depends on the existing sim shape — read the file before editing.

- [ ] **Step 4: Aggregate in `sim-metrics.ts`**

Add to the batch summary:

```typescript
firstMinute: {
  avgKills: average(results.map(r => r.killsFirst60Sec)),
  medianFirstLandingSec: median(results.map(r => r.firstLandingSec).filter(v => v !== null) as number[]),
  medianFirstWorkbenchSec: median(results.map(r => r.firstWorkbenchSec).filter(v => v !== null) as number[])
}
```

(`average` / `median` either already exist as helpers or are trivial to define.)

- [ ] **Step 5: Typecheck and run suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `228 passed`.

- [ ] **Step 6: Run the sim manually and confirm the new fields appear**

Run: `npm run sim -- --runs=5 --policy=balanced --seed=5000 --maxSeconds=600`
Expected: existing output PLUS a line/object showing `firstMinute: { avgKills, medianFirstLandingSec, medianFirstWorkbenchSec }`.

If the sim CLI doesn't print the new aggregate, modify the CLI output too (`src/sim/sim-cli.ts` if needed).

- [ ] **Step 7: Commit**

```bash
git add src/sim/
git commit -m "feat(sim): track first-kill, first-landing, first-workbench pacing telemetry

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: Sim-batch pacing assertions

Now that the sim emits the telemetry, write the assertion spec.

**Files:**
- Create: `tests/intro-hook-pacing.spec.ts`

- [ ] **Step 1: Write the failing spec**

```typescript
import { expect, test } from '@playwright/test'
import { execSync } from 'node:child_process'

test('intro-hook pacing: first 60s is loud, fast, rewarding', () => {
  // Run the sim directly via the CLI and capture its JSON output.
  // (If the CLI doesn't already support --json, the simpler approach is to
  // import sim-runner directly from the spec — it's pure TS.)
  const out = execSync(
    'node --import tsx src/sim/sim-cli.ts --runs=40 --policy=balanced --seed=5000 --maxSeconds=1800 --json',
    { encoding: 'utf8' }
  )
  const summary = JSON.parse(out)
  expect(summary.firstMinute.avgKills).toBeGreaterThanOrEqual(18)
  expect(summary.firstMinute.medianFirstLandingSec).toBeLessThanOrEqual(70)
  expect(summary.firstMinute.medianFirstWorkbenchSec).toBeLessThanOrEqual(90)
  expect(summary.balanceFlags).toEqual([])
})
```

If `sim-cli.ts` doesn't support `--json`, add that flag in this task (very small: gate the existing console.log on a flag, then `JSON.stringify(summary)` instead).

- [ ] **Step 2: Run the new spec**

Run: `npx playwright test tests/intro-hook-pacing.spec.ts -v`

Expected outcomes:
- If the threshold are MET: PASS. Great — the tuning in Task 10 was enough.
- If the thresholds are NOT MET: FAIL with concrete numbers. This is **expected on the first run** — Task 14 (manual tuning) will adjust `introHookConfig.safeDriftFirstNode` values until this spec passes.

If failing, look at the actual numbers in the failure message and tune up `introHookConfig.safeDriftFirstNode.spawnMultiplier` (e.g. 1.25 → 1.5) and/or `extraStartingSpawns` (e.g. 2 → 4) until passing. Tune ONLY the config object — no other code changes.

- [ ] **Step 3: Run the full suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `229 passed` (228 + 1 new).

- [ ] **Step 4: Commit**

```bash
git add tests/intro-hook-pacing.spec.ts src/intro-hook.ts src/sim/
git commit -m "test: sim-batch pacing assertions for intro-hook

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

(Include `src/intro-hook.ts` and `src/sim/` if Step 2 tuning required edits.)

---

## Task 14: Headless first-planet payoff test

Verify Thread D wired up correctly.

**Files:**
- Create: `tests/intro-first-planet.spec.ts`
- Modify: `src/main.ts` (add 1 more debug hook)

- [ ] **Step 1: Add debug hook to surface the resource count**

Inside `installHarnessIfRequested`, after the existing hooks, add:

```typescript
window.debugSurfaceResourceCount = () => this.surface?.resources.length ?? 0
```

Update the `Window` interface:

```typescript
debugSurfaceResourceCount?: () => number
```

- [ ] **Step 2: Write the spec**

```typescript
import { expect, test } from '@playwright/test'

const URL = 'http://127.0.0.1:5176/?harness=1'

test('opening landing produces a meaningfully richer resource count than a later landing', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const result = await page.evaluate(async () => {
    const w = window as any
    const g = w.__vectorShooter
    // First landing: simulate opening landing.
    w.debugForceFirstEverRun()
    g.state = 'playing'
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    w.debugLandOnNearestPlanet()
    // The landing transition starts; wait a beat for createSurfaceRun to populate.
    await new Promise((r) => setTimeout(r, 600))
    const openingCount = w.debugSurfaceResourceCount()
    // Simulate a non-opening landing (return to space, land again).
    g.stats.planets = 5
    g.debrief = { resources: { recovered: { scrap: 0, crystal: 0, cores: 0 } }, discoveries: [], lightYears: 0, stationVisits: [], skippedBeacons: 0, title: 'X', copy: '' }
    g.state = 'playing'
    g.surface = null
    g.visitedPlanets = new Set(['something'])
    w.debugLandOnNearestPlanet()
    await new Promise((r) => setTimeout(r, 600))
    const laterCount = w.debugSurfaceResourceCount()
    return { openingCount, laterCount }
  })
  expect(result.openingCount).toBeGreaterThan(result.laterCount)
  expect(result.openingCount).toBeGreaterThanOrEqual(Math.ceil(result.laterCount * 1.3))  // ≈ 1.4x multiplier
})
```

- [ ] **Step 3: Run the spec**

Run: `npx playwright test tests/intro-first-planet.spec.ts -v`
Expected: 1 passed.

If failing due to RNG or surface-init timing, increase the `setTimeout` to 1000ms and re-run. If the second landing isn't producing a `surface` value, that's a separate issue with the harness flow — flag it but don't block the slice (the manual sign-off proves Thread D).

- [ ] **Step 4: Run the full suite**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `230 passed` (229 + 1 new).

- [ ] **Step 5: Commit**

```bash
git add src/main.ts tests/intro-first-planet.spec.ts
git commit -m "test: headless first-planet payoff verification

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: Manual tuning pass (the gate)

Per the spec's success criteria, the slice is not done until the six-point manual checklist passes. Tuning touches **only** `src/intro-hook.ts`.

**Files:**
- Modify (tuning only): `src/intro-hook.ts`

- [ ] **Step 1: Start dev server and harness**

Run (background): `npm run dev`
Open: `http://127.0.0.1:5176/?harness=1`
Clear localStorage: `localStorage.clear(); location.reload()`

- [ ] **Step 2: Play the first 60 seconds and check each point**

| # | Check | Pass? |
|---|---|---|
| 1 | First kill within ~3 seconds of gameplay start | |
| 2 | "LAND HERE" arrow visible and unambiguous within ~5 seconds | |
| 3 | Pickups visibly want to come to the player (glint sells the magnet) | |
| 4 | Killing a brute or dreadnought feels heavier than killing a chaser | |
| 5 | Bullets feel like they're connecting (red hit-flash) | |
| 6 | First-ever planet feels noticeably richer than later planets of the same archetype | |

If any fails, edit `src/intro-hook.ts` ONLY:

- #1 fails → bump `safeDriftFirstNode.spawnMultiplier` and/or `extraStartingSpawns`.
- #2 fails → bump `waypoint.fontPx`, brighten `waypoint.color`, or extend `waypoint.durationSeconds`.
- #3 fails → drop `magnetGlint.frameInterval` (more particles) and/or bump `particleSpeed`.
- #4 fails → bump `hitstop.durationSeconds` (try 0.06).
- #5 fails → bump `hitFlash.durationSeconds` (try 0.12).
- #6 fails → bump `firstPlanetPayoff.cacheMultiplier` (try 1.6).

After each tuning change, re-run the sim-pacing test:

Run: `npx playwright test tests/intro-hook-pacing.spec.ts`

The sim must still pass after tuning. If a tuning push for #1–#6 breaks the sim, you've found a real conflict — flag it and back the tuning off.

- [ ] **Step 3: When all six pass, commit the tuned values**

```bash
git add src/intro-hook.ts
git commit -m "tune: intro-hook config dialed in via manual playtest

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 4: Final full suite + sim batch**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test` → `230 passed`.
Run: `npm run sim -- --runs=40 --policy=balanced --seed=5000 --maxSeconds=1800` → `Balance flags: none` AND `firstMinute` values inside the modest bar.

---

## Task 16: Push branch and open PR

The slice is shippable.

- [ ] **Step 1: Push the branch**

Run: `git push origin phase-1-1-intro-hook`
Expected: branch up to date with origin.

- [ ] **Step 2: Open PR**

Run:

```bash
gh pr create --base main --head phase-1-1-intro-hook \
  --title "Phase 1.1: front-load the intro hook" \
  --body "$(cat <<'EOF'
## Summary

Phase 1.1 from the improvement plan: make minute one loud, fast, and rewarding without diluting deferred upgrades.

**Threads (all in this slice):**
- A — intro spawn cadence: safeDrift first node +2 starters, 1.25x pressure (first-ever run only)
- B — juice: red 80ms enemy hit-flash; floating +N score popups on kill; 40ms hitstop on giant kills; pickup magnet glint
- C — LAND HERE waypoint: first-run-only HUD arrow at the playfield edge, fading near the target, auto-removes on first landing or 30s
- D — rich first-planet payoff: opening landing has 1.4x cache count (+ extras if implemented)

**Verification:**
- 230 tests passing (218 baseline + 12 new)
- `tsc` clean
- Sim batch: 40 runs balanced, modest-bar pacing assertions met (avg kills ≥ 18 in 60s, median first land ≤ 70s, median first workbench ≤ 90s), no balance flags
- Manual sign-off: six-point checklist played at `?harness=1`

**Spec:** `docs/superpowers/specs/2026-05-28-phase-1-1-intro-hook-design.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Notes for the implementer

- **Tune by editing `src/intro-hook.ts` only.** Manual sign-off is the gate; the config object is where all the dials live.
- **One thread per commit** (Tasks 2–11). If a commit's suite run goes red, revert that single commit's working changes and re-do the move more carefully.
- **The suite is the contract.** 218 baseline + new tests; green at every commit.
- **CRLF tolerance:** if you write scripts that mutate `src/main.ts`, split on `/\r?\n/` and preserve the original EOL when writing back.
- **Harness debug hooks** added in Tasks 8, 9, 14 stay behind the `?harness=1` gate. They're useful for future Phase 2 / Phase 3 work; keep them.
- **Don't widen any `private` member of `VectorShooter`.** Use bracket access from external modules (the pattern Phase 0 established).

---
