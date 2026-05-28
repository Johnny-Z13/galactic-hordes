# Sector Map Screen Module Design

## Goal

Move sector route planner rendering out of `VectorShooter` and into a focused UI module.

## Design

Create `src/ui/sector-map-screen.ts` with `showSectorMap(self: VectorShooter, message: string)`. The module owns the sector map DOM: header/status, starchart SVG lines, node buttons, legend, current-node copy, route choice cards, route debug readout, labels, node positioning, and node CSS class construction.

`VectorShooter.showSectorMap(...)` remains as a private delegate with the existing default message. Stateful route decisions stay in `main.ts`: launching a node, selecting routes, station service application, station memory, wave timing, and encounter behavior do not move. The UI module calls `self['launchSectorNode'](node.id)` from button handlers and uses read-only state from `self`.

Export `sectorNodeGlyph(...)` from the sector map UI module so station dock route mini-maps can share the same glyph vocabulary without keeping a UI-only helper on `VectorShooter`.

No route generation, balance tuning, CSS, station service math, save data, or gameplay behavior changes are included.

## Verification

- Source-level tests prove sector map DOM rendering lives in `src/ui/sector-map-screen.ts`.
- Existing sector-map/station tests continue to prove route and station call sites remain wired.
- TypeScript, focused tests, production build, full Playwright suite, and browser smoke must pass.
