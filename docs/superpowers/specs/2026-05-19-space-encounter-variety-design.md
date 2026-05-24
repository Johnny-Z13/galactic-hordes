# Space Encounter Variety Design

## Goal

Make open-space play feel less like a smooth enemy-stat curve and more like a run with surprising local situations: weather, formations, and tempting risk-reward signals.

## First Slice

This pass adds a lightweight encounter director that periodically injects event families while the player is in space:

- **Meteor Front:** a readable line of large asteroids drifts across the player route. Asteroids damage the scout and enemies, creating temporary terrain and route pressure.
- **Asteroid Field:** a short procedural field phase dots drifting rocks around the route so the player has to steer and shoot through a temporary Asteroids-style pocket.
- **Hunter Wing:** a deliberate enemy formation spawns ahead of the player's travel vector, then closes in using existing fast enemy behaviors.
- **Derelict Cache:** a temporary off-route cache signal appears with a reward and guardians, turning navigation into a short detour decision.
- **Alien Bloom:** a strange ring of `shard`, `helix`, and `prism` entities unfurls ahead of travel, biased toward nebula, relic, lore, and strange-world pressure.

## Design Rules

- Events must be telegraphed with a toast before or as they appear.
- Events must be intermittent. Normal combat should still breathe between surprises.
- Events should use existing enemy, pickup, particle, and archive systems where practical.
- The player should be able to learn causes over time. Nearby planet archetype, elapsed run time, and planets visited influence the event pool.
- The sector map can bias the event pool. A node with `asteroids` should produce more Meteor Front pressure; a node with `hunterWing` should produce more formation ambushes; station and mild routes should leave more breathing room.
- The first implementation should avoid large architecture changes and avoid new dependencies.

## Architecture

- Add `src/space-encounters.ts` as the testable director module. It owns event IDs, cooldown timing, weighted event choice, meteor-front geometry, hunter-wing formation points, and derelict-cache placement.
- Keep gameplay state and rendering in `src/main.ts`, matching the existing single-file game loop style.
- Add tests in `tests/space-encounters.spec.ts` for event timing, planet-weighted choice, and placement geometry.

## Implementation Notes

- The director is a pure helper; `VectorShooter` stores the next-event time and active meteor/derelict objects.
- Sector node profiles pass encounter bias and cadence multipliers into the director, so map choices change open-space texture without hard-coding route logic into the encounter module.
- Meteor asteroids use world-space circles with velocity and lifetime. They collide with the player and enemies.
- Asteroid Field reuses the same asteroid hazard objects, keeps seeding around/ahead of the player for a timed window, and lets player bullets break larger rocks into smaller pieces.
- Hunter Wing spawns `razor`, `shard`, `lancer`, and `skimmer` enemies in formation using existing enemy behaviors.
- Derelict Cache uses a persistent `chest` pickup plus a rendered derelict marker and guardian enemies.
- Alien Bloom uses the newer strange space enemy set and is tracked in `docs/enemy-alien-catalog.md`.

## Non-Goals

- No full biome system yet.
- No new art pipeline for asteroids or wrecks.
- No changes to planet landing/surface encounters in this pass.
- No mothership upgrade tuning for event manipulation yet; this pass creates the hooks and first event vocabulary.
