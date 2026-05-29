# HUD Construction Module Design

## Goal

Move Galactic Hordes HUD DOM construction into `src/ui/hud.ts` so HUD creation and HUD value updates live in one focused UI module.

## Design

`src/ui/hud.ts` will export `makeHud(self: VectorShooter)` alongside the existing `updateHud(self)`. `makeHud` owns the HUD container, topbar, meter shells, chip shells, toast/perf class assignment, and the weapon chip layout. Small local helpers `meter(...)` and `chip(...)` stay private to the module.

`VectorShooter.makeHud()` remains as a thin delegate to `uiMakeHud(this)` so the constructor flow stays unchanged. Touch controls remain in `main.ts` for this slice because they own active stick state, action button handlers, and nearby-interaction queries. `makeHud` calls `self['makeTouchControls']()` just as the old method did.

This keeps the refactor low risk: no CSS changes, no layout redesign, and no gameplay state changes.

## Verification

- Source-level tests prove HUD construction lives in `src/ui/hud.ts`.
- Existing weapon and shield HUD tests are updated to assert the new owner.
- TypeScript, production build, full Playwright suite, and browser smoke must pass.
