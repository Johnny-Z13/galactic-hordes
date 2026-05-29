# Local Hex Frontier Map Design

## Goal

Replace the current left-to-right sector route with a local hex frontier map that feels like a familiar but open star cluster. The run should no longer read as a linear board. It should read as a connected journey through adjacent systems, with the completed route forming a visible string of hexes.

The first version stays finite and shippable: a seeded local cluster around the mothership with edge hexes that imply later expansion. The data model should make future outward generation straightforward, but this spec does not require true infinite exploration.

## Player Fantasy

The map should feel closer to an old space navigation chart than a modern mission select screen:

- Named local systems near the origin, with a few names becoming recognizable over repeated runs.
- A sparse, readable starfield/hex chart rather than a heavy card grid.
- Any-direction movement through adjacent sectors.
- Frontier edges that suggest the map can grow later.
- Stations as physical jump infrastructure on hex borders, not abstract route nodes.

## Core Loop

1. The run starts at the mothership origin hex.
2. The player chooses one adjacent available hex.
3. The selected hex becomes the active sector and supplies the existing run profile: planets, hazards, enemies, waves, rewards, and objective copy.
4. During the sector, a station beacon appears on the exit edge tied to the next jump route.
5. Docking at that edge station completes the active hex.
6. Completion opens adjacent unvisited hexes from the completed hex.
7. The player repeats this, forming a connected route string through the local frontier.

The player cannot jump to arbitrary distant hexes. Movement is adjacent-only, and progression still depends on docking.

## Map Topology

Use axial hex coordinates:

- `q`: column-like diagonal coordinate.
- `r`: row-like diagonal coordinate.
- `s`: derived as `-q-r` when needed for distance calculations.

The generated local cluster should initially include a radius of roughly 2 to 3 around the mothership, producing about 19 to 37 playable map cells. This is enough to support branching without overbuilding an infinite galaxy.

Each hex stores:

- Stable `id`, such as `h:q:r`.
- `q` and `r`.
- `kind`, reusing current sector node kinds where possible.
- `label`, using generated local system names.
- `completed`.
- `charted`, for visible known cells.
- `frontier`, for rim cells that imply outward extension later.
- `stationEdges`, describing which hex-side exits have jump stations.
- Existing `SectorNodeConfig` or a renamed equivalent run config.

The current route string can be derived from completed nodes and edges, but the map should also track the current hex id directly.

## Sector Identity

Keep the existing route templates as the first layer of content:

- `safeDrift`
- `planetCluster`
- `asteroidBelt`
- `hunterLane`
- `derelictField`
- `nebulaAnomaly`
- `freeport`
- `bossGate`
- `finalStand`

The visual map changes first; the combat/surface content does not need to be redesigned in the first implementation. This limits risk and preserves current balance work.

Template placement should be spatial rather than column-based:

- Origin and near-origin hexes bias toward safer, familiar systems.
- Medium-distance hexes mix planet clusters, hunter lanes, derelicts, and anomalies.
- Rim hexes bias toward higher-risk anomalies, boss gates, and frontier labels.
- Stations appear as edge infrastructure and may also correspond to service-heavy hexes when appropriate.

## Station Edge Rules

Stations should be positioned on hex borders, not in the center of the map as normal sector choices.

For V1:

- When the player enters a hex, choose one or more valid exit edges that connect to adjacent charted hexes.
- The return beacon/station system should use the selected exit edge as its fiction and map destination.
- Docking completes the current hex and opens the adjacent hexes connected through available exit edges.
- If a sector is a station/service sector, it can still offer repair/workbench/trade/scan, but the map representation remains an edge station or station-marked hex edge.

This keeps the existing docking loop meaningful while making travel spatial.

## UI Design

The sector map screen becomes a hex star chart.

Primary layout:

- Main graph: large hex field.
- Side/details panel: selected hex readout, current route status, planet count, hazard/risk/reward summary, station edge notes.
- Compact status strip: cleared hexes, open jumps, scrap/resources.

Hex visual states:

- Current: bright core and pulsing border.
- Completed: connected line/string highlight through prior hexes.
- Available adjacent: brighter border and selectable.
- Charted but locked: dim outline.
- Frontier/rim: faint outline with `FRONTIER` or `UNCHARTED EDGE` hint.

The UI should avoid large center overlays. It should feel like a playable navigation surface, not a dashboard. The star map can be decorative but must remain readable on mobile.

## Data Flow

Current flow:

- `createSectorMap()` creates column/row nodes.
- `availableSectorChoices()` exposes connected next-column nodes.
- `selectSectorNode()` moves to a selected route node.
- Completing/docking marks the node complete.
- `showSectorMap()` renders nodes and route options.

Target flow:

- `createSectorMap()` or a successor creates axial hex nodes.
- `availableSectorChoices()` returns adjacent unvisited charted hexes connected to the current completed hex.
- `selectSectorNode()` remains the route-entry function, but validates adjacency instead of next-column edges.
- `completeSectorNode()` completes the current hex and can reveal neighboring frontier cells in a later phase.
- `showSectorMap()` renders axial hex positions and station edge markers.

Keep the public route API names where practical during V1 to reduce blast radius in `main.ts`, station docking, tests, and HUD logic.

## Compatibility

The first implementation should preserve:

- Existing run profile consumption in `main.ts`.
- Existing station docking screen behavior after docking.
- Existing route service model: repair, workbench, trade, scan.
- Existing debrief station memory.
- Existing sector template balance values where possible.

Tests that assert strictly left-to-right columns will need to be replaced with adjacency and axial-distance assertions.

## Error Handling

If a map seed creates an invalid route state:

- Fall back to a safe origin cluster with at least three adjacent choices.
- Guarantee every available choice has a run config.
- Guarantee docking cannot leave the player with zero valid choices unless the run has reached a terminal/final sector.
- Ignore invalid selection ids by returning the map unchanged, matching current behavior.

## Testing Plan

Add or update tests for:

- Hex map starts at origin and uses axial coordinates.
- Available choices are adjacent to the current completed hex.
- Selecting non-adjacent or locked hexes is rejected.
- Completing a hex opens neighboring unvisited charted cells.
- Station edge metadata exists for available routes.
- Existing sector templates still produce run profiles.
- Sector map UI renders hex-specific classes and station edge markers.
- Mobile/responsive CSS keeps the hex map and choice details readable.

Browser verification should include:

- Launch to map.
- Select an adjacent hex.
- Enter play.
- Dock at station.
- Return to map with the completed route string visible and new adjacent choices open.

## Out Of Scope For V1

- Infinite galaxy generation.
- Persistent galaxy save across multiple runs.
- Full star naming/lore overhaul.
- Rebalancing every sector template.
- New combat content for hex-specific sectors.
- Multi-hop route planning beyond the next adjacent jump.

## Open Extension Path

After V1, frontier rim cells can become true expansion points:

- Generate new hex rings when the player reaches the rim.
- Persist discovered named systems.
- Add faction/biome regions across hex clusters.
- Let station services differ by border direction or local system identity.

The V1 model should avoid assumptions that only a fixed local map exists.
