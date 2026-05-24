# Sector Map Route Design

## Goal

The sector map adds a run-construction layer before each space node. It should make the player ask a useful question before launching:

> Do I want a safer recovery route, a planet-rich discovery route, or an intense hazard route with better payoff?

This is the FTL-inspired layer for Galactic Hordes. The map is not only a level selector; each node config changes the run texture.

## Run Structure

- A run starts at the mothership node.
- The player picks one connected forward node at a time.
- Clearing a combat node by docking at its route station marks that node complete and opens a named station menu before returning to the sector map.
- Space stations are safe run-only stops with docking fiction, repair, trade, route scan flavor, cargo manifest, and workbench service.
- Death wipes sector route progress.
- Permanent mothership meta upgrades survive death and remain managed from the mothership/game-over loop.
- The final node is the win condition for a run.

## Node Templates

Nodes are generated from a small catalog of route identities. Templates keep procedural generation readable because each node has one main promise:

- `safeDrift`: recovery space, low pressure, modest rewards.
- `planetCluster`: dense landing choices and discovery value.
- `asteroidBelt`: movement stress, fewer planets, better volatility rewards.
- `hunterLane`: enemy-forward combat with hunter-wing pressure.
- `derelictField`: cache-rich greed route with guardian pressure.
- `nebulaAnomaly`: unstable hazards and high-variance payoff.
- `freeport`: run-only service stop.
- `bossGate`: elite route check before the final sector.
- `finalStand`: climax node and win condition.

Generation uses fixed structural beats plus weighted variety:

- Column 1 always offers at least one safe drift and one planet cluster.
- The first launched route node has a shorter station timing so the player sees the map loop quickly.
- Opening space no longer forces a special nearby planet field; planet cadence comes from the selected sector node.
- Every generated node receives seeded texture: one or two visible sector modifiers, one enemy packet, one reward shape, and bounded wave timing/count jitter.
- Stations are fixed service anchors before mid and late pressure.
- Late boss gates are fixed route checks.
- Other slots are weighted by column depth, with duplicate templates in the same column discouraged.
- Route depth scales pressure and reward without replacing the template identity.

## Node Config

Every sector node has a readable config:

- `templateId`: the route identity that generated the node.
- `depth`: normalized run depth from start to final.
- `pace`: safe, mild, standard, intense, or boss.
- `theme`: open space, asteroid belt, planet cluster, derelict field, nebula, boss gate, or final stand.
- `waveOrder`: scouts, swarm, ambush, bulwark, or cathedral.
- `hazards`: clear, asteroids, hunterWing, derelictCache, or nebula.
- `modifiers`: seeded route personality tags such as quiet dead zones, rich salvage, aggressive hunters, asteroid storms, signal droughts, and old warzones.
- `enemyPacket`: the dominant contact family for the node, such as scout pickets, knife wings, alien blooms, mine screens, gunlines, or siege guards.
- `rewardShape`: bounded economy variance such as scrap-heavy, signal-bloom, lean-cache, relic-trace, or repair-cache nodes.
- `planets`: count range, density, and archetype bias.
- `enemies`: starting spawns, enemy bias, spawn pressure, and max-alive pressure.
- `waves`: timed enemy counts and optional designer notes.
- `hazardConfig`: asteroid behavior and encounter bias.
- `rewards`: resource pressure, chest cadence, and upgrade signal chance.
- `objective`: what the player is doing in the node.
- `readout`: short map-facing summary shown before launch.

This means a node can be described as more than "hostile" or "planet." Example:

- Safe drift: lower spawn pressure, simple scout waves, recovery-biased planets.
- Planet cluster: more landings than other routes, but capped so upgrade signals remain a deliberate route payoff.
- Asteroid belt: faster pressure, meteor event bias, fewer recovery beats.
- Hunter lane: high enemy pressure, hunter-wing encounter bias, stronger combat payoff.
- Derelict field: cache lure, lower chest interval, delayed guardian waves.
- Boss gate: heavy enemy recipes, shorter encounter gaps, elite spawn requirement.
- Station: no permanent meta upgrades, but a fiction-forward docking menu, run recovery, cargo manifest, and workbench agency.

## Runtime Effects

`src/sector-map.ts` is the source of truth for sector node config and route generation. `sectorNodeRunProfile()` converts a selected node into:

- enemy bias
- planet archetype bias
- spawn pressure multiplier
- reward multiplier
- boss requirement
- space encounter bias
- space encounter gap multiplier
- station services

`src/space-encounters.ts` accepts encounter bias from the active sector node. This lets map choices influence whether the player sees more meteor fronts, hunter wings, derelict caches, or alien blooms.

Current encounter families are logged in [enemy-alien-catalog.md](enemy-alien-catalog.md). In short: hunter wings bring fast ambush enemies, derelict caches create guarded reward detours, meteor fronts create cross-route hazard lines, asteroid fields force a short Asteroids-style weave-and-shoot pocket, and alien blooms splash `shard`, `helix`, and `prism` entities across strange/nebula routes.

## Procedural Variety

Randomness is seeded per map, so the same sector seed creates the same route texture while different runs produce different route personalities. The variability is intentionally bounded:

- Sector modifiers change pressure, encounter gaps, asteroid intensity, planet cadence, or signal odds by small multipliers.
- Enemy packets add a readable contact family without replacing the template's core identity.
- Reward shapes change the economy profile, not just total loot.
- Waves keep their authored labels and purpose, but their timing and enemy counts jitter within safe limits.

This gives runs a stronger first-minute personality while keeping the generated readout honest about risk and payoff.

## UI Rules

The map must stay portrait-mobile friendly:

- The graph is readable without horizontal scrolling.
- Choices are large touch targets below the graph on mobile.
- Desktop uses a wide graph plus detail rail.
- Node choice cards must show wave and hazard readouts before launch.
- Station docking screens should name the station and keep workbench, cargo, and route-map actions visible as explicit menu choices.

The player should understand the risk profile before committing. Hidden modifiers are allowed only if the visible readout gives the right expectation.

The map also carries a compact route debug readout for balancing. Each generated node row shows template, depth, pace, planet range, hazards, pressure, reward, and wave timing so fixed seeds can be inspected without playing the full run.

## Design Guardrails

- Do not let stations become permanent-upgrade shops. That would weaken death/retry stakes.
- Do not make every route intense. Mild routes are important because they make hard routes feel chosen.
- Do not mix every pressure source into one node. A node should have one primary identity and one secondary twist unless it is a boss/final node.
- Do not make node configs cosmetic. At least one runtime system should respond to each config family.
- Keep map progress run-local. The roguelike layer needs loss; the meta layer provides continuity.
