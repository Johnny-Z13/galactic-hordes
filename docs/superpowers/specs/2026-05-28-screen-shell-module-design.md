# Screen Shell Module Design

## Goal

Move static screen container construction out of `VectorShooter` and into a focused UI module.

## Design

Create `src/ui/screens.ts` with `makeScreens(self: VectorShooter)`. The module owns only the DOM shell that groups the app's overlay screens and the initial class assignment for those screen roots.

`VectorShooter.makeScreens()` remains as a thin delegate to `uiMakeScreens(this)`, preserving the constructor flow and keeping screen routing, `showOnly(...)`, and per-screen render methods in their current owners. This is a structure-only refactor: the title, collection, powerups, sector map, station, workbench, planet, game-over, and score screens keep their existing render/update paths.

The module will assign the common `screen` class to every screen root and preserve the special `screen gameover-screen` class for the game-over surface. It will not change visibility classes, CSS, keyboard routing, audio unlock behavior, or any screen content.

## Verification

- Source-level tests prove screen-shell construction lives in `src/ui/screens.ts`.
- Existing game-over tests are updated to assert the game-over class is preserved in the new module.
- TypeScript, focused tests, production build, full Playwright suite, and browser smoke must pass.
