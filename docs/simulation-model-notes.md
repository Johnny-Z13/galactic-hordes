# Simulation Model Notes

The simulation imports real balance and procedural modules where possible, then models playthrough outcomes at a higher level than the rendered game.

## Modeled

- Sector-map generation, route selection, template coverage, and node progress.
- Abstract space pressure from pace, wave order, hazards, enemy multipliers, and policy risk.
- Planet landing frequency, archetype coverage, surface scenarios, resources, and surface damage.
- Upgrade choice pressure through policy-weighted workbench choices.
- Station services, extraction outcomes, death causes, and economy summaries.

## Not Frame-Perfect

- Individual enemy steering, projectile geometry, collision timing, and canvas rendering.
- Exact pickup movement, player micro-dodging, and per-frame auto-fire targeting.
- Real browser FPS. Performance must be checked through Playwright/browser calibration, not the pure simulation.

## Calibration Rule

When a real browser sample and simulation disagree, treat the browser as evidence and adjust either the simulation model or the target envelope. Do not tune game balance from simulation output alone when the browser sample shows a different player experience.

## Determinism Rule

Simulation modules must use `SimRng` for stochastic decisions. Do not use `Math.random` in `src/sim`.
