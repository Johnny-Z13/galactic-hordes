# Screen Visibility Module Design

## Goal

Move screen visibility toggling into `src/ui/screens.ts` so the screen module owns both screen roots and the common visible-state mapping.

## Design

`src/ui/screens.ts` will export `showOnly(self: VectorShooter, which: GameState | null)`. It uses the same screen-root map currently in `VectorShooter.showOnly(...)` and toggles the `visible` class according to the requested screen.

`VectorShooter.showOnly(...)` remains as a thin private delegate to `uiShowOnly(this, which)`. This preserves every existing caller and keeps state transitions in `main.ts` and the per-screen modules. The screen module does not decide when screens appear; it only applies the DOM visibility state.

No routing, keyboard handling, modal content, CSS, or game state changes are included in this slice.

## Verification

- Source-level tests prove `src/ui/screens.ts` owns the visibility map and `main.ts` delegates to it.
- Existing title/front-screen tests continue to prove call sites use `self['showOnly'](...)` normally.
- TypeScript, focused tests, production build, full Playwright suite, and browser smoke must pass.
