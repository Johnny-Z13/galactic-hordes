# Galactic Hordes Improvement Plan — Design

## Context

Galactic Hordes is a mobile-first portrait survival shooter (Vampire Survivors pressure +
Asteroids movement + Vectrex vectors + FTL-style route map). A full Claude Code review found
a sophisticated, well-engineered prototype with three fixable problems:

1. **The first 60 seconds are too quiet/slow** to hook a new mobile player. The deferred-upgrade
   model (XP banks "mutation signals" spent later at the workbench) means there is no dopamine
   until the first planet + workbench return, several minutes in.
2. **The survival-time curve is flat (~10 min median across every sim policy, including "stress")**
   because run length is gated by the fixed sector-map node count, not by build quality or skill.
3. **`main.ts` is a 9,840-line god-object** (one `VectorShooter` class, ~54 fields, 100+ methods)
   that is the looming maintainability risk.

Secondary: UI/graphics layout can be cleaner — the sector map is strong but slightly loose, the
in-game HUD/playfield reads empty, and the console screens could share a more consistent layout
rhythm.

The codebase is healthy underneath: clean typecheck, 213 Playwright tests passing (~5s), a
deterministic simulation lab, and excellent table-driven balance data. This plan builds on that
foundation rather than replacing it.

## Goals

- Make minute one loud, fast, and rewarding — without diluting the deferred-upgrade identity.
- Widen the survival-time distribution so build and risk decide how far you get.
- Shrink `main.ts` ~40–50% via targeted, behavior-preserving extraction.
- Make every UI surface cleaner and consistent via a shared layout system applied per-screen.
- Make the simulation lab's scope honest and tighten it toward the real source of truth.

## Non-Goals (declined during brainstorming)

- Deep architectural rework / full entity-component system / view-model layer. (Targeted
  extraction only; `VectorShooter` stays the orchestrator.)
- A full headless combat sim that runs the real combat loop. (Document the gap + light
  fidelity improvements only.)
- New content (enemies, audio, features), monetization, or performance work — out of scope
  for this plan.

## Key Decisions

| Decision | Choice |
| --- | --- |
| Sequencing | **Refactor first**, then design, then UI, then sim/polish |
| Refactor scope | **Targeted extraction** (highest-value seams; ~40–50% reduction) |
| Intro hook | **Keep deferral**, front-load density + fast non-upgrade rewards |
| Pacing | **Widen the distribution** — make build & risk matter |
| UI scope | All four surfaces, **shared layout system first** |
| Sim fidelity | **Document the gap + light improvements** (feed shared stats in) |

## Structure: Four Phases, Dependency-Sequenced

```
Phase 0 — Refactor Foundation   (enables everything; behavior-preserving)
Phase 1 — Design: Make It Fun   (intro hook, pacing curve, density)
Phase 2 — UI/Graphics Layout    (shared system first, then per-screen)
Phase 3 — Sim Fidelity + Polish (close the loop, document, verify)
```

**Phase gate:** every phase must end with `npx tsc --noEmit` clean **and** `npx playwright test`
213/213 (or higher) green before the next phase begins. Phase 0 is strictly behavior-preserving —
the existing test suite is the contract. Phases 1–2 add new tests. If a Phase 0 step needs a test
that does not yet exist to lock current behavior, that test is written *before* the extraction.

---

## Phase 0 — Refactor Foundation

**Goal:** Shrink `main.ts` ~40–50% by extracting the highest-value seams. No feature changes.

- **0.1 Extract enemy behaviors into a strategy table.** Convert the ~241-line `updateEnemies`
  if-ladder (`main.ts:2506`) into `enemyBehaviors[kind].update(enemy, ctx, dt)` in a new
  `src/enemy-behaviors.ts`. `ctx` is a narrow interface exposing only what behaviors need (player
  position, `spawnBullet`, `emitTrail`, `burst`, balance lookups, RNG). Keystone extraction — it
  also creates the seam Phase 3 uses to improve sim fidelity. Highest-risk step; lock behavior with
  tests first if needed.
- **0.2 Extract rendering into `src/render/` modules** taking `(ctx, state, camera)`. Mechanical
  move, no logic change. Targets `renderPlayer` (~207 lines), `renderSurfaceBiomeMotifs` (~169
  lines), and the enemy/horde renderers.
- **0.3 Extract UI-screen rendering into `src/ui/` modules.** `renderWorkbench*`,
  `renderMothershipConsole*`, `renderManifest*`, `renderCollection`, `renderDebrief`,
  `renderGameOver`. Large fraction of the file, unrelated to the game loop, and the exact code
  Phase 2 edits — so cleaning it now pays off twice.
- **0.4 Formalize the state machine.** Replace the triple if-chains in `update()`, `render()`, and
  `audioMood()` (`main.ts:1432 / 4925 / 1514`) with a single `states` record of
  `{ update, render, audioMood }` handlers. Adding a state becomes one edit.

**Stays the same:** `VectorShooter` remains the orchestrator holding game state. We extract
behavior and rendering, not state management. No view-model layer.

**New file layout:** `src/enemy-behaviors.ts`, `src/render/`, `src/ui/`.

**Verification:** `tsc --noEmit` clean + 213/213 green after each step.

---

## Phase 1 — Design: Make It Fun

**Goal:** Fix the quiet first minute and the flat pacing curve without touching the deferred-upgrade
identity. Built on the clean Phase 0 modules. Adds tests; uses the sim to verify pacing.

- **1.1 Front-load the intro hook (keep deferral).** Make minute one loud via density + fast
  non-upgrade rewards:
  - More starting enemies + faster initial spawn cadence in the intro node (`safeDrift` 1-1) and
    early game — tune `sector-map.ts` `enemies.startingSpawns` / `spawnMultiplier`.
  - Immediate juice: faster first kills, score popups, pickup glints, hit feedback.
  - A 30-second visible **"LAND HERE" objective** — promote the existing mothership "FIRST
    DIRECTIVE" into a live in-run waypoint/beacon to the first planet.
  - A guaranteed rich **first-planet payoff** — make the existing curated friendly tutorial
    planet land harder and sooner.
  - The workbench remains *the* upgrade moment; nothing here grants instant upgrades.
- **1.2 Screen-density floor.** Even safe nodes keep ambient motion (drifting debris, distant
  contacts, salvage glints, parallax) so the playfield never reads as empty black. World-density
  fix; pairs with the Phase 2 HUD work.
- **1.3 Widen the survival-time distribution.** Make build quality and risk decide how far you get:
  variable node counts per run (mobile-sane bounds), in-node pressure spikes a strong build
  survives but a weak one does not, and meaningful death-risk before the route's end.
- **1.4 Verify the curve in the sim.** Re-run all 6 policies. Success = a visibly wider survival
  distribution (lower floor + higher ceiling) vs. the current ~10-min clustering, with no balance
  regressions. Update `simulation-balance-targets.md` if envelopes legitimately shift.

**Tuning note:** 1.1 and 1.3 are tuning-heavy — each is "implement the mechanism, then a tuning
pass with eyes on the screen," not just passing tests.

**Verification:** new unit tests for intro-node config + objective wiring; sim batch showing the
widened curve; manual browser playtest of the first 60 seconds.

---

## Phase 2 — UI/Graphics Layout

**Goal:** Cleaner, consistent layout across every surface. Respects `docs/design.md` (cyan=nav,
yellow=action, green=complete, accordion disclosure, 44px touch targets).

- **2.1 Establish a shared layout system (foundation, hard dependency for 2.2–2.4).** Define
  reusable tokens in `style.css`: spacing scale, panel/grid rhythm, clipped-corner geometry,
  typographic hierarchy. Everything after applies these instead of one-off values.
- **2.2 In-game HUD / combat readability.** Tighten HUD bar hierarchy, minimap framing,
  target-reticle clarity, DASH button placement, contrast/spacing so combat reads at a glance on
  a phone. Pairs with 1.2 to fix "screen reads empty."
- **2.3 Sector map layout polish.** Tighten node-graph spacing/alignment, the briefing panel, and
  the dense node-card readouts (pace/waves/hazards/pressure/planets) for scannability.
- **2.4 Menu/console screens.** Apply the shared system to the mothership hub, Power Up / Meta
  Systems, Collection, workbench, and debrief — consistent accordion spacing, alignment grids,
  panel rhythm, so all five feel like one console.

**Ordering:** 2.1 first (dependency); then HUD → map → menus.

**Verification:** `responsive-ui.spec.ts` green at phone/iPad/desktop (extend where structure is
added); before/after screenshots via the headless harness at each breakpoint.

---

## Phase 3 — Sim Fidelity + Polish

**Goal:** Make the sim trustworthy and honest; final verification. Light investment.

- **3.1 Document the sim's scope honestly.** Update `simulation-balance-targets.md`,
  `simulation-model-notes.md`, and the README sim section to state plainly: the sim validates
  route/economy/pacing structure and models combat as an abstract pressure formula — so "0 balance
  flags" means the route economy is sound, **not** that combat feel is balanced.
- **3.2 Feed shared behavior stats into the sim.** Wire the sim's pressure model (`sim-space.ts`)
  to read enemy stats / attack cadence / roster bias from the Phase 0.1 shared behavior table where
  practical, so the model drifts less from real combat. Tightening of inputs, not a rewrite of
  `simulateSpaceNode`.
- **3.3 Final verification pass.** Full suite green + typecheck clean; sim batch across all 6
  policies showing the Phase 1 widened curve holds; manual end-to-end browser playtest (title →
  loud intro → first planet → workbench → deeper route) at phone + desktop; before/after
  screenshot set; a short written summary against the original review scorecard (did intro-hook,
  pacing, and maintainability actually move?).

---

## Overall Verification / Success Criteria

- **Maintainability:** `main.ts` reduced ~40–50%; enemy behaviors, rendering, and UI screens live
  in focused modules; state dispatch is a single table.
- **Fun:** the first 60 seconds read loud and rewarding in a manual playtest; the survival-time
  distribution is visibly wider in the sim (lower floor, higher ceiling).
- **UI:** all screens share a consistent layout system; HUD/playfield no longer read empty; the
  sector map and console screens are cleaner; `responsive-ui.spec.ts` green at all breakpoints.
- **Sim honesty:** docs state the sim's real scope; the model reads from the shared behavior table.
- **Always green:** every phase ends with typecheck clean and the full Playwright suite passing.
