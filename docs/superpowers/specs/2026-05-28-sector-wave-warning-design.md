# Sector Wave Warning Design

## Goal

Make Galactic Hordes space-route wave arrivals readable before the authored sector wave spawns enemies.

## Design

Add a pure `space-wave-director` helper that derives the next unfired sector wave from the current node id, authored wave list, fired wave ids, and elapsed node time. The helper returns a compact warning readout only inside a tunable warning window.

`main.ts` uses the helper in two places: `updateSectorWaves(...)` uses the shared wave id helper when marking waves fired, and the space renderer draws a top-center warning panel during the final countdown.

## Rules

The warning does not change spawn timing or enemy counts. It previews the same sector-map waves that already exist. Fired waves never warn again. If no wave is inside the warning window, no warning panel is drawn.

## Testing

Tests cover wave id stability, warning countdown/progress, no warning outside the warning window, and `main.ts` wiring for the new helper and renderer.
