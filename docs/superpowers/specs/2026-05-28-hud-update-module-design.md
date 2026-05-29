# HUD Update Module Design

## Goal

Move Galactic Hordes HUD value updates out of `src/main.ts` into a focused UI module without changing the visible HUD, gameplay state flow, or touch controls.

## Design

`src/ui/hud.ts` owns the regular gameplay HUD text and meter updates:

- score, time, kill count, best score, weapon readout, and resources
- station distance text when a return beacon is active
- ship hull, shield strip, XP fill, and critical hull state
- surface health, oxygen fill, shield strip suppression, and critical oxygen state

`VectorShooter.updateHud()` remains the central caller in `src/main.ts`, but delegates to `uiUpdateHud(this)`. The new module calls `self['updateTouchHud']()` and `self['updatePerfHud']()` after the display update so the existing input/perf behavior stays in `main.ts`.

The module imports `weaponHudReadout`, `vitalCriticalClass`, and the small math helpers it needs directly. This removes HUD display dependency imports from `main.ts` and keeps title/front/scores/HUD screens moving toward the same UI-module boundary.

## Verification

- Source-level tests prove HUD display logic lives in `src/ui/hud.ts`.
- Existing shield, weapon readout, and critical meter tests are updated to check the new owner.
- TypeScript, production build, full Playwright suite, and browser smoke must pass.
