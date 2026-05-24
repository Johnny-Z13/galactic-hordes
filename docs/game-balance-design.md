# Game Balance Architecture

Galactic Hordes needs balance data to be easy to inspect, edit, test, and document. Combat tuning must not be scattered as anonymous numbers through the game loop.

## Goals

- Keep the active testing difficulty explicit.
- Centralize enemy HP, damage, speed, attack cadence, spawn timing, and surface threat tuning.
- Preserve per-enemy personality while making numeric calibration table-driven.
- Generate balance documentation from the same source used by the game.
- Prevent README and balance docs from drifting when tuning changes.

## Source Of Truth

`src/game-balance.ts` is the source of truth for:

- active balance mode
- global difficulty multipliers
- space enemy base stats
- space enemy attack stats
- space enemy roster membership and sprite row assignment
- space spawn pressure
- boss cadence
- surface threat stats

`src/powerup-balance.ts` is the source of truth for:

- upgrade and relic definitions
- weapon fire cadence, projectile, evolution, and limit-break tuning
- pickup radii, merge behavior, and drop lifetime
- ship movement, dash, shield, surface suit, and upgrade application values
- planet cache, relic, alien gift, and workbench roll odds

`src/surface-balance.ts` is the source of truth for:

- planet surface world dimensions, spawn safe zones, resources, cache values, lore rewards, alien gifts, and ambush tuning
- planet alien catalog rows, planet boss catalog rows, boss behavior assignment, and strange surface threat motion tuning

`src/sector-map.ts` is the source of truth for run-route construction:

- sector node kinds and forward graph rules
- named node templates and depth-aware template selection rules
- node pace, theme, wave order, hazard tags, objective text, notes, and player-facing readouts
- per-node planet count and archetype bias
- per-node enemy starting spawns, enemy bias, spawn pressure, max-alive pressure, and timed wave counts
- per-node reward pressure, chest cadence, asteroid behavior, encounter bias, and encounter cadence
- station services that are explicitly run-only and do not purchase permanent mothership tiers

`src/run-balance.ts` is the source of truth for run-level tuning:

- starter ship hull, radius, speed, and XP curve
- spawn, boss, chest, and sector launch timers
- landing rewards, station services, mothership progression stats, and scoring

Runtime code may transform these values for elapsed time, planet count, sector node, or run state, but the underlying constants must live in source modules with descriptive names.

The readable roster log, with sprite sheet images, lives in [enemy-alien-catalog.md](enemy-alien-catalog.md).

## Difficulty Profiles

Profiles are named modes, not loose multipliers in random files:

- `testEasy`: temporary low-pressure mode for playtesting progression and planet loops.
- `normal`: intended baseline once tuning stabilizes.
- `hard`: future high-pressure calibration target.

The active mode is a single exported value in `src/game-balance.ts`. During development it may be set to `testEasy`; release builds should move back to `normal`.

## Documentation Hook

`scripts/update-balance-docs.mjs` reads `src/game-balance.ts`, `src/powerup-balance.ts`, `src/run-balance.ts`, `src/surface-balance.ts`, and `src/sector-map.ts`, then updates generated balance sections in:

- `README.md`
- `docs/game-balance-design.md`

`.githooks/pre-commit` runs the generator and stages updated docs. This keeps docs synchronized when balance data changes.

<!-- BALANCE-GENERATED:START -->
### Active Balance Snapshot

Active balance mode: `normal` (Normal).

| Multiplier | Value |
| --- | ---: |
| Enemy HP | 1 |
| Enemy damage | 1 |
| Enemy speed | 1 |
| Enemy projectile speed | 1 |
| Enemy attack cooldown | 1 |
| Spawn rate | 1 |
| Boss rate | 1 |
| Surface HP | 1 |
| Surface damage | 1 |
| Surface speed | 1 |

| Enemy | HP | Speed | Contact | Time Gate | Spawn Roll |
| --- | ---: | ---: | ---: | ---: | ---: |
| chaser | 34 | 123 | 13 | 0s | 1 |
| splinter | 23 | 158 | 13 | 25s | 0.82 |
| lancer | 60 | 154 | 13 | 55s | 0.7 |
| mine | 46 | 68 | 23 | 100s | 0.58 |
| brute | 170 | 98 | 19 | 180s | 0.39 |
| shooter | 72 | 118 | 13 | 120s | 0.49 |
| warden | 520 | 134 | 24 | 0s | 0 |
| razor | 92 | 335 | 17 | 205s | 0.18 |
| skimmer | 126 | 176 | 13 | 165s | 0.29 |
| shard | 84 | 392 | 18 | 145s | 0.33 |
| helix | 136 | 188 | 14 | 225s | 0.17 |
| prism | 180 | 142 | 16 | 250s | 0.12 |
| bulwark | 270 | 86 | 22 | 270s | 0.07 |
| siphon | 540 | 94 | 25 | 330s | 0.055 |
| dreadnought | 760 | 70 | 30 | 420s | 0.038 |
| cathedral | 980 | 56 | 34 | 560s | 0.024 |

### Power-Up Balance Snapshot

| System | Value |
| --- | ---: |
| Weapon base cooldown | 0.31s |
| Weapon minimum cooldown | 0.075s |
| Weapon base damage | 13 |
| XP pickup radius | 5.6 |
| XP merge radius max | 12.6 |
| Workbench base choices | 4 |
| Relic chance base | 0.18 |
| Surface gun damage | 18 |
| Surface health base | 86 |

### Run And Surface Balance Snapshot

| System | Value |
| --- | ---: |
| Starter hull | 100 |
| Starter speed | 270 |
| Starting XP threshold | 42 |
| XP growth multiplier | 1.24 |
| Chest respawn minimum | 38s |
| Intro node station timing | 43s |
| Station repair hull | 42 |
| Surface world | 1600 x 1180 |
| Surface cache safe distance | 240 |
| Surface ambush base count | 2 |
| Boss cache safe distance | 190 |

### Sector Node Config Snapshot

| Config Area | Values |
| --- | --- |
| Themes | `openSpace`, `asteroidBelt`, `planetCluster`, `derelictField`, `nebula`, `bossGate`, `finalStand` |
| Node templates | `mothership`, `safeDrift`, `planetCluster`, `asteroidBelt`, `hunterLane`, `derelictField`, `nebulaAnomaly`, `freeport`, `bossGate`, `finalStand` |
| Wave orders | `scouts`, `swarm`, `ambush`, `bulwark`, `cathedral` |
| Hazard tags | `clear`, `asteroids`, `hunterWing`, `derelictCache`, `nebula` |
| Generation rules | fixed launch/final nodes, guaranteed early safe and planet routes, fixed stations, late boss gates, weighted template variety |
| Planet config | count range, density, archetype bias |
| Enemy config | starting spawns, enemy bias, spawn multiplier, max alive multiplier |
| Wave config | trigger seconds, label, enemy counts, notes |
| Hazard config | asteroid density/damage/drift and encounter bias |
| Reward config | resource multiplier, chest interval multiplier, upgrade signal chance |

Generated from `src/game-balance.ts`, `src/powerup-balance.ts`, `src/run-balance.ts`, `src/surface-balance.ts`, and `src/sector-map.ts`. Do not edit this section by hand.
<!-- BALANCE-GENERATED:END -->
