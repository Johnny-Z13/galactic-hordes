# Planet Popup Module Design

## Goal

Move the orbit planet popup renderer out of `VectorShooter` and into a focused UI module.

## Design

Create `src/ui/planet-screen.ts` with `renderPlanet(self: VectorShooter, planet: Planet)`. The module owns the orbit popup panel shown before landing: title, scanner/risk copy, Land/Dock button, Break Orbit button, panel attachment, and the final `showOnly('planet')` call.

`VectorShooter.renderPlanet(...)` remains as a thin delegate to `uiRenderPlanet(this, planet)`. Landing confirmation stays in `main.ts` because it mutates run state, scoring, artifacts, repairs, upgrades, enemy/chest spawns, and workbench flow. Lore and alien surface panels also stay in `main.ts` for now because they are tightly coupled to reward resolution.

The module will also own the small `planetRiskLabel(...)` helper because that helper only supports orbit popup copy. No CSS, landing math, planet generation, scanner progression, or surface encounter behavior changes are included.

## Verification

- Source-level tests prove orbit popup rendering lives in `src/ui/planet-screen.ts`.
- Existing planet popup layout tests continue to cover all three planet panel surfaces.
- TypeScript, focused tests, production build, full Playwright suite, and browser smoke must pass.
