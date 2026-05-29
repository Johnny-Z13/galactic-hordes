# Vital Meter Module Design

## Intent

The critical threshold is now a HUD concept shared by ship hull, surface health, and surface oxygen. Keeping it in the player damage flash module couples persistent UI state to transient combat VFX.

## Design Notes

- Create a small UI helper for vital meter state.
- Keep the public behavior unchanged: ratios at or below `0.3` are `critical`.
- Let combat damage flash keep its own private hull critical threshold until that behavior needs a richer shared model.
- Update HUD tests to import the UI helper directly.
