# Title Screen Module Design

## Goal

Move the Galactic Hordes title screen DOM construction out of `src/main.ts` into a focused UI module while keeping the public game flow unchanged.

## Design

`src/ui/title-screen.ts` owns only the title menu DOM: top actions, logo cargo count, wordmark, launch/navigation buttons, reset confirmation button, and footer stats. It receives the existing `VectorShooter` instance and calls the same private methods through the current UI-module bracket-access pattern used by `scores.ts` and `front-subscreens.ts`.

`VectorShooter.showTitle()` remains the single state transition entry point in `src/main.ts`, but becomes a thin delegate to `uiShowTitle(this)`. This keeps keyboard handling, reset flows, game over return, and other callers stable while shrinking the central class.

The module imports `title-logo-mark.png` directly, so `main.ts` no longer needs asset knowledge for the title screen. This gives the title screen the same ownership style as the mothership, score, collection, and power-up screens.

## Verification

- A structure test proves `src/main.ts` delegates to `src/ui/title-screen.ts`.
- The test also proves the new module owns the title-specific labels, asset import, footer stats, and callbacks.
- TypeScript, production build, Playwright tests, and an in-browser title/menu smoke pass must run after implementation.
