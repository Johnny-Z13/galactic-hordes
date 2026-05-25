# Simulation Playthrough Lab

The Simulation Playthrough Lab runs deterministic abstract playthroughs of Galactic Hordes. It is for balance review, procedural coverage checks, and quick regression detection. It is not a frame-perfect replay of the canvas game.

## Dashboard

Run:

```bash
npm run sim:lab
```

Open:

```txt
http://127.0.0.1:5177/sim-lab.html
```

Useful presets:

- `Quick 10`: fast gut check for normal balance.
- `Balance 50`: broader normal tuning pass.
- `Planet Variety`: surface and archetype coverage.
- `Economy Sweep`: reward and cache pressure.
- `Late Pressure`: stress-style route and hazard pressure.

The dashboard shows survival, route progress, final reach count, planet landings, economy, combat damage, balance flags, charts, and a seed-by-seed run table. Use `Export JSON` when you want to keep a report for comparison.

## CLI

Run:

```bash
npm run sim -- --runs=10 --policy=balanced --seed=1000
```

Useful options:

```bash
npm run sim -- --runs=50 --policy=planetHunter --seed=2000 --maxSeconds=1200
npm run sim -- --runs=30 --policy=greedyCache --difficulty=normal
npm run sim:sweep
```

Use `npm run sim:sweep` before merging broad balance changes that affect route generation, enemy pressure, planet rewards, upgrade rolls, or run progression.

## Policies

- `balanced`: cautious normal play.
- `survival`: avoids risk and prefers defensive upgrades.
- `planetHunter`: lands often and tests surface variety.
- `greedyCache`: chases rewards and exposes economy exploits.
- `routeRusher`: clears route nodes quickly.
- `stress`: pushes pressure and reward systems beyond normal play.

## Reading Results

Use median survival, destroyed rate, route template variety, planet archetype variety, and resource averages as directional signals. Investigate balance flags before changing tuning values.

For a single bad run, copy the seed from the table and rerun:

```bash
npm run sim -- --runs=1 --seed=1004 --policy=balanced
```
