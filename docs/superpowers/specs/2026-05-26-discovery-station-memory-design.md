# Discovery And Station Memory Design

## Research Notes

External references support a narrow change: add memory, partial mystery, and named places before adding a broad shop economy.

- FTL validates route maps with partly known beacons: stores, distress beacons, quest markers, exit beacons, and scanner-improved information make pathing readable without making every result certain. GDC's FTL postmortem also frames the game around the target feeling of being a starship captain before genre mechanics.
- Slay the Spire validates route choice as a second strategic layer. Mega Crit described pathing as extra risk/reward and planning richness without much complexity.
- Hades validates reactive safe-return storytelling. Its narrative makes repeat attempts feel watched and remembered through short contextual events.
- No Man's Sky and Elite Dangerous validate discovery identity. Named discoveries, catalog pages, first-discovered credit, and better discovery-page usability make procedural places feel owned and revisitable.

Sources:

- https://gdcvault.com/play/1018034/Designing-Without-a-Pitch-FTL
- https://ftl.fandom.com/wiki/Beacons
- https://www.gamedeveloper.com/game-platforms/road-to-the-igf-mega-crit-games-i-slay-the-spire-i-
- https://www.supergiantgames.com/blog/hades-faq/
- https://www.gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death
- https://www.nomanssky.com/about/
- https://www.nomanssky.com/synthesis-update/
- https://elite-dangerous.fandom.com/wiki/Explorer

## Design Verdict

Do not replace XP with credits. Galactic Hordes already has a stronger identity: space combat creates mutation signals, planet landings create discovery and resources, and workbench visits turn both into build commitment. A generic credit shop would flatten that loop.

The right move is to make the current loop feel more remembered and less mechanical. Stations should become the run's safe storytelling beats. Planets should become named discoveries rather than category examples. The route map should keep useful choice, but its emotional payload should come from rumors and named places, not only exact pressure metrics.

## Implemented Slice

This spec covers the first implementation slice:

1. Station visit memory.
2. Deterministic station contacts and rumors.
3. Persistent station context on the sector map after departure.
4. Better debrief journey summary.
5. Expanded procedural planet names.

Future work, intentionally not included here:

- Station purchase offers.
- Quest chains across multiple stations.
- Player-renamable discoveries.
- Scanner-gated route information.
- Revisit-state planet events.

## Player Experience

The player should feel that a run leaves a trail:

- "I docked at Space Station 43."
- "The cartographer warned me about a relic trace."
- "I found RED OSSUARY and later the debrief remembered it."
- "The station did not vanish; the map records where I docked."

This does not add menu weight. Station interactions remain compact and mobile-friendly.

## Station Memory

Every station docking creates one run-local `StationVisitRecord`.

Fields:

- `nodeId`: sector node that produced the docking.
- `stationName`: deterministic station name.
- `nodeLabel`: route berth label.
- `dockedAtSeconds`: run time when docked.
- `services`: station services available or implied.
- `repaired`, `scrap`, `crystal`, `workbenchSignals`: concrete service results.
- `contactName`, `contactRole`: deterministic station character.
- `rumor`: short route/discovery hook.

Duplicate dock reports for the same node must not create duplicate records.

## Station Presentation

The station dock screen gains a compact contact panel:

- Character name and role.
- One rumor line.

The sector map should mark completed nodes that had a station dock as `DOCKED`, and the current-node panel should show the station name plus contact line when relevant.

This fixes the station-vanishing illusion at the run layer: the player leaves the physical docking berth, but the route map now remembers the station as a visited place.

## Debrief

The debrief should show:

- Resource recovery as before.
- Discoveries logged as before.
- Distance travelled in light years.
- Number of stations docked.
- A short station route line, using station names.

Distance is a readable fiction metric, not a physics simulation:

`lightYears = nodesCleared * 31 + planetsVisited * 7 + stationsDocked * 11 + skippedStations * 19`

## Planet Names

Planet names should be deterministic but richer. Replace the current small prefix/suffix arrays with an exported generator using:

- Archetype-specific prefixes.
- Biome-specific middle terms.
- Archetype-specific suffixes.
- Rare named specials for some deterministic seeds.

The generated name must stay short enough for mobile orbit panels. Target: two or three words.

## Technical Shape

Create:

- `src/station-memory.ts`: deterministic station names, contacts, rumors, station visit records, and journey distance.
- `src/planet-names.ts`: deterministic planet naming.

Modify:

- `src/main.ts`: store station visits, enrich dock UI, mark docked nodes on sector map, include journey summary in debrief, use new planet name generator.
- Tests for station memory, planet naming, and UI source integration.

## Acceptance Criteria

- Docking at a route station records exactly one station visit.
- Freeport station nodes also record station visits with their services.
- Leaving a station for the route map leaves a visible station memory in the map UI.
- Debrief includes distance and station count.
- Planet name generation produces varied deterministic names beyond the old small vocabulary.
- Existing simulation and sector-map behavior remains valid.
