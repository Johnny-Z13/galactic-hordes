# Front Subscreen Module Design

## Intent

The title-adjacent Collection and Power Up screens are still built inline in `main.ts`. They are stable DOM screens, not gameplay systems, so extracting them continues the UI modularization without touching combat or rendering.

## Design

- Create `src/ui/front-subscreens.ts`.
- Move the `showCollection` and `showPowerUps` DOM construction into exported functions that accept `VectorShooter`.
- Keep private wrappers in `VectorShooter` so existing button callbacks stay unchanged.
- Let the new module call existing `renderCollectionScreen` and `renderMothershipMetaSystems` helpers directly.
- Remove the private `renderCollectionScreen()` wrapper from `VectorShooter` once it has no callers.

## Boundaries

This is a pure extraction. It does not change screen copy, visual classes, navigation callbacks, scroll restoration, or mothership progression behavior.
