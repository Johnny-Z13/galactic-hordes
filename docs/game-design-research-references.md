# Game Design Research References

Last reviewed: 2026-05-26

This file collects reference links and design takeaways for future Galactic Hordes design passes. It is not a spec. Use it as context when working on discovery, route maps, stations, planets, archives, run summaries, and progression.

## Current Design Thesis

Galactic Hordes should lean into remembered journeys rather than a generic shop economy.

The strongest loop is:

1. Fight through space pressure.
2. Land on strange named planets.
3. Bring signals, relics, resources, and stories back to the ship.
4. Use stations as safe route beats, rumors, repairs, and short character moments.
5. End each run with a journey summary that makes the procedural route feel authored.

Avoid replacing XP with generic credits unless a later playtest proves that the current mutation-signal/workbench loop cannot carry long-term progression.

## Reference Links

### FTL: Route Risk, Beacons, And Experience-First Design

- GDC Vault: [Designing Without a Pitch - FTL Postmortem](https://gdcvault.com/play/1018034/Designing-Without-a-Pitch-FTL)
- FTL Wiki: [Beacons](https://ftl.fandom.com/wiki/Beacons)

Relevant takeaways:

- FTL's postmortem frames the original design around a primary fantasy: feeling like the captain of a starship. Mechanics and genre followed that target experience.
- Beacons give compact, readable route choices: distress, store, quest, exit, hazard, and other partial information.
- The map works because choices are legible without being fully solved.

How this maps to Galactic Hordes:

- Keep route cards actionable, but avoid turning every route into exact spreadsheet math.
- Stations can be equivalent to stores/safe beacons, but should carry fiction and run memory rather than permanent meta-upgrade shopping.
- "What feeling does this route promise?" matters more than raw pressure numbers.

### Slay The Spire: Layered Pathing Without Heavy Complexity

- Game Developer: [Road to the IGF: Mega Crit Games' Slay the Spire](https://www.gamedeveloper.com/game-platforms/road-to-the-igf-mega-crit-games-i-slay-the-spire-i-)

Relevant takeaways:

- Slay the Spire's route pathing was inspired by FTL.
- Anthony Giovannetti describes path choice as adding risk/reward planning and richness without much extra complexity.
- Replayability comes from permutations and quickly letting the player try new strategies.

How this maps to Galactic Hordes:

- Route choice should create build and survival planning, not just level selection.
- Keep route decisions mobile-simple: a few strong options, clear risk, one or two mysteries.
- Avoid adding too many station menus or economy layers unless they create meaningful pathing decisions.

### Hades: Safe Return, Character Memory, And Narrative Rewards

- Supergiant Games: [Hades FAQ](https://www.supergiantgames.com/blog/hades-faq/)
- Game Developer: [How Supergiant weaves narrative rewards into Hades' cycle of perpetual death](https://www.gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death)

Relevant takeaways:

- Hades makes repeated runs feel observed by using short reactive dialogue and contextual narrative rewards.
- The home base matters because characters remember attempts, failures, and progress.
- Narrative reward can coexist with fast replay loops when it is brief and contextual.

How this maps to Galactic Hordes:

- Space stations should remember the run in small, lightweight ways.
- A station contact, rumor, or service line can make a safe stop feel like a place without slowing the game.
- The mothership and debrief should reflect what happened, not just list resources.

### No Man's Sky: Named Discovery, Catalogue Value, And Space Stations

- Official site: [About No Man's Sky](https://www.nomanssky.com/about/)
- Official update notes: [Synthesis Update](https://www.nomanssky.com/synthesis-update/)

Relevant takeaways:

- No Man's Sky sells exploration as seeing, cataloguing, and optionally sharing things no one has seen before.
- The Discovery Page improvements call out faster access to planetary data and better sense of position.
- Space stations support ship outfitting, salvage, charts, trade terminals, and other services.

How this maps to Galactic Hordes:

- Planet names and archive entries do important emotional work.
- Even procedural planets need to feel like named places, not only archetype rolls.
- Stations can offer services, charts, and rumors, but Galactic Hordes should keep those run-only unless a future design explicitly expands the economy.

### Elite Dangerous: Exploration Credit And Long-Journey Identity

- Elite Dangerous Wiki: [Explorer](https://elite-dangerous.fandom.com/wiki/Explorer)
- Elite Dangerous Wiki: [Discovery Scanner](https://elite-dangerous.fandom.com/wiki/Discovery_Scanner)
- Elite Dangerous Journal docs: [Exploration journal events](https://elite-journal.readthedocs.io/en/latest/Exploration.html)

Relevant takeaways:

- Elite's exploration fantasy is strongly tied to scanning, mapping, selling exploration data, and first-discovery credit.
- The player's journey gains value through records: first discovered, first mapped, Codex entries, exploration statistics, and sold data.
- Travel distance and named destinations support the feeling of a personal expedition.

How this maps to Galactic Hordes:

- Run summaries should mention light years, named stations, planets found, discoveries logged, and route style.
- Archive entries should become more place-specific over time.
- The player does not need a huge galaxy UI to feel like an explorer; they need evidence that the game remembers where they went.

## Design Principles For Future Work

### Keep Mystery Partial, Not Opaque

Good route choice should answer:

- What is the main promise?
- What is the danger?
- What might be found?
- What remains uncertain?

Bad route choice either hides everything or reveals every multiplier.

### Make Stations Safe Points And Story Beats

Stations should be:

- safe breathing room;
- route memory;
- short character contact;
- repair/workbench/trade/scan service;
- rumor source;
- debrief anchor.

Stations should not become:

- permanent mothership upgrade shops;
- large inventory malls;
- mandatory lore dumps;
- repeated generic menus with no memory.

### Make Planets Feel Like Places

Planet improvements should prioritize:

- deterministic memorable names;
- biome/archetype-specific details;
- archive entries that preserve planet names;
- rare authored names or special cases;
- revisit memory where useful.

Avoid:

- only displaying "cache world" / "hostile world" labels;
- huge procedural text dumps;
- names too long for mobile orbit panels.

### Make The Debrief A Postcard

A good debrief should say what happened in human terms:

- distance travelled;
- stations docked;
- planets discovered;
- strangest contact;
- relics or lore recovered;
- skipped stations or deep-route risk;
- route style such as cautious, greedy, planet-hunter, or deep-route.

This is where procedural play becomes a remembered journey.

## Open Future Ideas

- Scanner-gated route information: early map shows vibes and rumors; upgraded scanner reveals exact planet counts, hazards, and pressure.
- Station rumor deck: rumors generated by stations, aliens, lore sites, and rare caches; rumors expire after a few jumps.
- Station contact memory: recurring dockmasters or cartographers who comment on skipped stations, relics, and route choices.
- Named planet archive: individual discovered planets persist into the collection, not only planet archetype categories.
- Revisit-state planets: a revisited planet can be quiet, stripped, hunted, changed, or newly active.
- Journey title generator: debrief names the run, such as "The Mercy Nine Circuit" or "Three Stations Past the Nebula."
- Run-only station trades: small single-pick offers using existing scrap/crystal, not a new credit economy.

## Current Implemented Slice

See:

- [Discovery And Station Memory Design](superpowers/specs/2026-05-26-discovery-station-memory-design.md)
- [Discovery Station Memory Implementation Plan](superpowers/plans/2026-05-26-discovery-station-memory.md)

Implemented systems:

- deterministic station names;
- station contacts and rumors;
- run-local station visit memory;
- route map `DOCKED` state;
- debrief light-years and stations-docked summary;
- expanded deterministic planet names.
