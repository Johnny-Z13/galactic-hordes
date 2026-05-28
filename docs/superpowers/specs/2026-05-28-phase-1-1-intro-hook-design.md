# Phase 1.1 — Front-load the Intro Hook — Design

Date: 2026-05-28
Status: V1 design direction
Source: brainstormed from `docs/superpowers/specs/2026-05-27-galactic-hordes-improvement-plan-design.md` Phase 1.1.

## Goal

Make minute one of a Galactic Hordes run feel loud, fast, and rewarding — without diluting the deferred-upgrade identity. The workbench remains *the* upgrade moment; nothing in this slice grants instant upgrades.

## Scope (the five threads, shipped as one slice)

| Thread | What |
| --- | --- |
| **A — Intro spawn cadence** | Tune `safeDrift` first-node spawn count and cadence so first 60s have visible combat density. |
| **B — Immediate juice** | Floating `+N` score popups on kill; brief hitstop on giant-kind kills; pickup magnet glint/trail; **enemy red flash on bullet hit**. |
| **C — LAND HERE waypoint** | A first-run-only diegetic HUD edge arrow pointing at the nearest plantable target. Auto-removes on first landing or at 30s. |
| **D — Rich first-planet payoff** | When `openingLanding === true`, multiply resource count, guarantee one relic spawn, and add one extra lore site. |

All five threads ship together as one PR, one tuning pass, one design.

## Non-goals (explicit)

- No instant upgrade rewards in minute one. The workbench is still where builds happen.
- No audio additions in this slice (could justify hours of taste-tuning by itself).
- No new art assets.
- No mothership progression changes — that system is already shipped (see `docs/superpowers/specs/2026-05-17-galactic-hordes-mothership-progression-design.md`).
- No restructuring of `sector-map.ts` or `surface-encounters.ts` beyond consulting the new config table.
- No "feel" assertions in CI. Manual sign-off owns feel.

## Success criteria

Two layers, both required:

1. **Sim-batch floor** (modest bar — assertions in `tests/intro-hook-pacing.spec.ts`):
   - `avgKills` in first 60s ≥ **18**
   - median `firstLandingSec` ≤ **70**
   - median `firstWorkbenchSec` ≤ **90**
   - `balanceFlags` empty

2. **Manual sign-off** — six checks played at `npm run dev` with `?harness=1`:
   - First kill within ~3 seconds
   - "LAND HERE" arrow is visible and unambiguous within ~5 seconds
   - Pickups visibly want to come to the player (glint sells the magnet)
   - Killing a brute / dreadnought feels heavier than killing a chaser
   - Bullets feel like they're connecting (hit-flash)
   - First-ever planet feels noticeably richer than later planets of the same archetype

The slice is not done until both pass. Tuning during the manual pass touches *only* the `introHookConfig` table — no code changes.

## Architecture

One new pure module owns the rules; surgical hooks elsewhere wire effects. Mirrors the Phase 0 pattern (`enemy-behaviors.ts`, `space-encounters.ts`).

### New modules

- **`src/intro-hook.ts`** — pure module. Exports:
  - `introHookConfig` — the single tuning table (numbers; no code).
  - `isFirstEverRun(state)` — pure predicate (`stats.planets === 0 && !debrief`).
  - `pickWaypointTarget(planets, player)` — pure function returning the planet to point at, or `null`.
  - No DOM, no `VectorShooter` reference. Testable in isolation, same as `space-encounters.ts`.

- **`src/ui/intro-waypoint.ts`** — render-only module. Exports `renderIntroArrow(ctx, view)` matching the existing `src/render/` pattern: pure render, takes a snapshot, no game-state access.

### Modified files

- **`src/main.ts`** — wires the slice in:
  - New `introWaypoint: { active, timer, targetPlanetId } | null` field.
  - New `scorePopups: Array<{ x, y, vy, life, totalLife, text }>` field.
  - New `hitstopUntil: number` field.
  - Hooks in `updatePlaying`, `update`, `updateBullets` (collision), `updateEnemies` tail, `killEnemy`, `updatePickups`, `confirmLanding`/`startLanding`, `renderSpaceScene`. Each hook is ≤ 5 lines.

- **`src/main-types.ts`** — no change. `Enemy.flash` already exists; `Pickup` is declared in `main.ts:164` (not main-types.ts). Add `glintFrame?: number` to that local `Pickup` interface instead.

- **`src/render/enemies.ts`** — replace the four existing `'#ffffff'` references (the current white hit-flash) with `introHookConfig.hitFlash.color`. They override `strokeStyle`, not `fillStyle`.

- **`src/sector-map.ts`** — at first-node construction, if template `safeDrift` and this is the first node of a new run, apply `introHookConfig.safeDriftFirstNode` overrides to `enemies.startingSpawns` / `enemies.spawnMultiplier`.

- **`src/surface-balance.ts` / `src/surface-encounters.ts`** — extend the existing `firstRunLanding === true` branches in `planSurfaceEncounter` and `pickSurfaceResourceKind` to apply `introHookConfig.firstPlanetPayoff` multipliers (cache count, guaranteed relic, extra lore sites). No new branches — just multipliers inside existing branches.

- **`src/sim/sim-runner.ts`** — emit `firstMinute` telemetry per run: `kills_first_60s`, `firstLandingSec`, `firstWorkbenchSec`. (Check first if these already exist; this is part of the slice work, not separate.)

## Components

### 1. `IntroWaypoint` (thread C)

- **State on VectorShooter:** `introWaypoint: { active: boolean; timer: number; targetPlanetId: string | null } | null`.
- **Lifecycle (driven from `updatePlaying`):**
  - **Start:** first frame where `introWaypoint === null && isFirstEverRun(this) && state === 'playing'`. Pick target via `pickWaypointTarget(this.planets, this.player)`. Set `active: true, timer: introHookConfig.waypoint.durationSeconds, targetPlanetId: target.id`.
  - **Tick:** decrement `timer` by `dt`. If target planet no longer exists in `this.planets` (chunk unload), re-pick. If `timer <= 0`, set `active: false`.
  - **Stop on landing:** in `confirmLanding`/`startLanding`, set `introWaypoint.active = false` if active.
- **Invariant:** never re-activates within a run. Never activates on a non-first-ever run.
- **Render:** `renderIntroArrow(ctx, { targetWorldPos, playerWorldPos, label, viewportW, viewportH })`. If target on-screen, render a small label near the planet. If off-screen, render a directional arrow at the playfield edge with the `LAND HERE` label and planet name.

### 2. `ScorePopup` (thread B)

- **State:** `scorePopups: Array<{ x, y, vy, life, totalLife, text }>` on VectorShooter.
- **Spawn:** in `killEnemy(e, reward=true)`, push `{ x: e.x, y: e.y, vy: -introHookConfig.popup.riseSpeed, life: introHookConfig.popup.lifeSeconds, totalLife: same, text: '+' + scoreForKind(e.kind) }`.
- **Update:** in `updatePlaying`, decrement `life` by `dt`; increment `y` by `vy * dt`; drop expired entries.
- **Render:** called from `renderSpaceScene` (and `renderSurface` for surface kills). Drawn after particles, before HUD. Alpha = `life / totalLife`.

### 3. `EnemyHitFlash` (your addition) — **REVISED: existing system, change color + tune duration**

Verified during planning: a hit-flash system **already exists** on `Enemy`. There's a `flash: number` field on the `Enemy` interface (`main-types.ts:41`), stamped at `main.ts:3121` inside `damageEnemy(e, amount, color)` (the centralized bullet → enemy damage entry point) with duration `0.05s`, and ticked down in the enemy-update tail (`main.ts:2537`). The renderer (`src/render/enemies.ts:38, 152, 154, 371`) currently overrides `strokeStyle` to `'#ffffff'` (white) while `flash > 0`. The asks reduce to:

- **Tune duration:** bump `e.flash = 0.05` to `e.flash = introHookConfig.hitFlash.durationSeconds` (default `0.08`) at `main.ts:3121`. Also bump the dash-ram path at `main.ts:2623` for consistency (`Math.max(e.flash, 0.12)` → `Math.max(e.flash, introHookConfig.hitFlash.durationSeconds)`).
- **Change color:** replace the four `'#ffffff'` references in `src/render/enemies.ts` with `introHookConfig.hitFlash.color` (default `'#ff5d73'`). Note: this affects `strokeStyle` (the enemy outline), not `fillStyle` — enemies are stroked vector shapes, not filled.
- **No type changes, no new tick code, no new stamp code.**

### 4. `Hitstop` (thread B)

- **State:** `hitstopUntil: number` on VectorShooter (seconds, `performance.now() / 1000`-based).
- **Trigger:** in `killEnemy(e, reward=true)`, *only if* `isGiantEnemyKind(e.kind)`, set `hitstopUntil = performance.now() / 1000 + introHookConfig.hitstop.durationSeconds`.
- **Effect:** in top-level `update(dt)`, after `audio.update(...)` and before the dispatch map, add: `if (performance.now() / 1000 < this.hitstopUntil) return`. Audio and render continue unaffected.

### 5. `PickupMagnetGlint` (thread B)

- **Type extension:** `glintFrame?: number` on `Pickup` in `main-types.ts`.
- **Effect:** in `updatePickups` magnet-pull branch, increment `p.glintFrame = (p.glintFrame ?? 0) + 1`. If `p.glintFrame % introHookConfig.magnetGlint.frameInterval === 0`, call `this.burst(p.x, p.y, p.color, 1, introHookConfig.magnetGlint.particleSpeed)`. Reuses existing burst system — zero new render code.

### 6. Intro spawn cadence (thread A)

- **Tuning, not new code path.** `introHookConfig.safeDriftFirstNode` exports `spawnMultiplier` and `extraStartingSpawns`. At first-node construction in `sector-map.ts`, if `templateId === 'safeDrift'` and the node is the first of a new run, apply the overrides. Existing system reads them.

### 7. Rich first-planet payoff (thread D)

- **Tuning, not new code path.** Existing `firstRunLanding === true` branches in `planSurfaceEncounter` and `pickSurfaceResourceKind` apply multipliers from `introHookConfig.firstPlanetPayoff`:
  - `cacheMultiplier: 1.4` — boost cache resource count
  - `guaranteedRelic: true` — force at least one relic spawn
  - `extraLoreSites: 1` — add one to the lore-site count

### 8. `introHookConfig` — the tuning table

Single source of truth for every number in the slice:

```ts
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
```

All manual tuning happens by editing this object.

## Data flow (the eleven touchpoints)

| Hook site | One-line change |
| --- | --- |
| `updatePlaying` (`main.ts`) | start / tick / stop waypoint state |
| `update` (`main.ts`) | early-return on `hitstopUntil` |
| `damageEnemy` (`main.ts:3119`) | tune `e.flash` duration from `0.05` to `introHookConfig.hitFlash.durationSeconds` (existing stamp site) |
| `tryDashRam` (`main.ts:2622`) | matching tune on the dash-ram damage path's `e.flash` stamp |
| `killEnemy` (`main.ts`) | push score popup; if giant, set `hitstopUntil` |
| `updatePickups` magnet branch | conditional glint `this.burst` |
| `confirmLanding` / `startLanding` | deactivate waypoint |
| `renderSpaceScene` (`main.ts`) | call score-popup render + waypoint render |
| `src/render/enemies.ts` (4 sites) | replace `'#ffffff'` with `introHookConfig.hitFlash.color` |
| `src/sector-map.ts` first-node ctor | apply `safeDriftFirstNode` overrides |
| `surface-encounters.ts` / `surface-balance.ts` first-landing branches | apply `firstPlanetPayoff` multipliers |

## Testing

Four layers; first three are CI.

### Layer 1 — Pure-module unit tests

**`tests/intro-hook.spec.ts`** — covers `isFirstEverRun` truth table, `pickWaypointTarget` correctness, `introHookConfig` schema validity. Pure data, runs in ms.

### Layer 2 — Sim-batch pacing assertions

**`tests/intro-hook-pacing.spec.ts`** — runs the 40-run balanced sim batch, asserts modest-bar thresholds (avg kills ≥ 18 in first 60s, median first landing ≤ 70s, median first workbench ≤ 90s, balance flags empty). Requires `sim-runner` to emit `firstMinute` telemetry; adding that instrumentation is part of this slice.

### Layer 3 — Headless behavior tests

Three small specs driving real game via `?harness=1`:

- **`tests/intro-waypoint.spec.ts`** — fresh first-ever-run state shows waypoint; landing deactivates it; second run never activates it. Uses new harness hooks `getIntroWaypointState`, `debugForceFirstEverRun`, `debugLandOnNearestPlanet` (added to `installHarnessIfRequested`).
- **`tests/intro-juice.spec.ts`** — bullet hits → `hitFlash > 0`; giant-kind kill → `hitstopUntil` future; chaser kill → no hitstop; kill emits a popup; magnet pull emits glint particles.
- **`tests/intro-first-planet.spec.ts`** — opening landing has meaningfully higher resource count than a non-opening landing on the same archetype.

### Layer 4 — Manual sign-off (gating)

Six-point checklist played at `npm run dev` (see Success Criteria). Tuning during this pass touches *only* `introHookConfig`.

### Suite total

- Existing: 218 passing
- New: ~17 new cases across 4 specs
- Target: ~235 passing after this slice. Green at every commit.

## Risks and unknowns

1. **Sim telemetry gap.** `sim-runner.ts` may not currently track `firstWorkbenchSec` or `kills_first_60s`. Confirmed plan: instrument it as part of the slice if missing. Worth a 30-minute spike at plan-execution start.
2. **Tuning lift.** Hitting `avgKills ≥ 18` in 60s may require more aggressive `safeDrift` spawn changes than the modest `1.25× multiplier + 2 extra starting spawns` proposes. The manual tuning pass adjusts the config table until both layers pass.
3. **First-ever-run detection.** `stats.planets === 0 && !debrief` is the working definition. If the mothership state has a `runsCompleted` counter, prefer that. To be confirmed at implementation start.
4. **Hit-flash visibility on sprite enemies.** Vector enemies are stroked (the color override works directly). Sprite-rendered enemies (`isSpriteEnemyKind`) use a sheet — the current `flash` system may already dim them via `ctx.globalAlpha` (see `src/render/enemies.ts:152`) rather than tinting. If the red tint isn't visible on sprite kinds in playtest, a tasteful alternative is to add a brief brighter outline/glow burst around the sprite. To be verified during the manual tuning pass.
5. **Score popup overload.** In dense combat, hundreds of popups could overlap and add render cost. Cap the array length (e.g. drop oldest at 60 active) — cheap insurance.

## Non-architectural decisions captured during brainstorm

- Sim metric + manual sign-off (not manual-only, not numbers-only).
- All five threads in one slice (not phased).
- HUD edge arrow for the waypoint (not toast cascade; not both).
- First-run-only firm expiry (no soft-reminder mode; not every-run).
- Four juice elements (popups, hit-flash, hitstop, glint) in scope. "Louder bullet impact" cut as redundant with hit-flash.
- Modest sim bar (kills ≥ 18, land ≤ 70s, workbench ≤ 90s; not ambitious; not mechanism-only).
- Approach 1: one coherent slice, one PR, one tuning pass.
