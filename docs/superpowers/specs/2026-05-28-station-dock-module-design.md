# Station Dock Module Design

## Goal

Move station dock command-panel rendering out of `VectorShooter` and into a focused UI module.

## Design

Create `src/ui/station-dock.ts` with `showStationDock(self: VectorShooter, report: StationDockReport)`. The module owns the station dock screen DOM: header/status panel, services section, contact card, cargo manifest, route mini-map, section helper, service labels, and the visible-screen call.

`VectorShooter.showStationDock(...)` remains as a private delegate. It still records `stationDockReport`, enters the `station` state through the UI module, and existing callers do not change. Stateful route/workbench methods remain in `main.ts`; the UI module calls `self['openStationWorkbench']()` and `self['leaveStationForSectorMap']()` from button handlers.

`StationDockReport` becomes an exported interface for type-only use. No route generation, station service math, workbench flow, debrief memory, CSS, or sector-map behavior changes are included.

## Verification

- Source-level tests prove station dock DOM rendering lives in `src/ui/station-dock.ts`.
- Existing sector-map/station tests continue to prove route and station flow call sites remain wired.
- TypeScript, focused tests, production build, full Playwright suite, and browser smoke must pass.
