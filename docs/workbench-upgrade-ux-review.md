# Workbench Upgrade UX Review

Date: 2026-05-24

## Current Diagnosis

The workbench has a strong progression model but the UI is carrying two jobs at once:

- It is an install surface for the current random workbench offers.
- It is also a full build manifest, unlock guide, maxed-system log, relic readout, and future-system list.

That makes the list feel endless. The useful information is present, but the player's immediate question is simple: "What can I install with this signal?" The current surface answers that question by highlighting rows inside a long canonical list. This preserves context, but it makes mobile use worse as the run gets deeper because every signal spend requires scanning past locked, standby, and maxed rows.

The right direction is to keep the build depth but stop treating every node as equal UI weight.

## Research Takeaways

Vampire Survivors separates immediate choices from reference/progression. Level-up offers are small; PowerUps are a separate purchasable stat surface with ranks, refunding, disabling, rerolls, skips, banishes, and seals; the Collection is a reference grid. Its evolution system creates deep build goals from base weapon plus catalyst rules, without requiring all possible upgrades to be visible during every choice.

20 Minutes Till Dawn is the clearest match for the workbench list problem. It uses compact upgrade trees grouped by type. Each tree starts with a first-tier upgrade, branches into second-tier upgrades, and can unlock a third-tier upgrade after taking one second-tier node. That creates visible depth without one endless flat list.

Deep Rock Galactic: Survivor uses weapon-specific progression with milestone overclocks. Weapon focus during a dive unlocks stronger modifier choices at levels 6, 12, and 18. The useful pattern here is "ordinary ranks inside a family, milestone choices at known thresholds."

Brotato keeps the shop decision compact and supports rerolling and locking. Locked shop items stay in place across rerolls and waves, which is a useful model for respecting the player's local context.

Hades' Mirror of Night uses a compact list of broad character upgrades, with paired alternate talents and resource refunding. The useful pattern is one row per system, with depth hidden behind a local toggle instead of every variant being shown at top level.

Warframe's mod screen is relevant because it groups upgrades by equipment, capacity, and slot compatibility. The important lesson is that deep systems become readable when the UI first asks "which equipment/bay are we editing?" before showing detailed modifiers.

## Proposed Workbench Model

Use a three-layer UI:

1. **Signal Offers**
   A compact, always-visible install area containing only actionable current offers: normal upgrade offers, relics, evolutions, and limit breaks. This should stay at the top of the workbench panel on desktop and become a sticky first band on mobile. It answers the immediate question.

2. **System Bays**
   Collapsible category bays for the full ship and astronaut progression. Only one bay should be open by default on mobile. Desktop can show a left bay rail plus a right detail panel.

3. **Bay Detail**
   A readable treelet inside the selected bay. It shows top-node progress, child nodes, unlock requirements, and evolution/catalyst routes for that bay only.

The workbench should no longer render all 23 current upgrade rows as one flat primary list.

## Bay Structure

Recommended first pass using existing upgrade buckets:

- **Weapons Bay**
  Pulse Cannon, Prism Barrel, Ghost Rounds, Rail Lattice, Echo Chamber, Option Orbs, Static Arc, Rift Needle.

- **Maneuver Bay**
  Drift Engine, Nav Ghost, Phase Rudder, Mine Wake.

- **Survival Bay**
  Halo Battery, Hull Stitcher, Salvage Hunger.

- **Cargo and Survey Bay**
  Signal Magnet, Luck Coil, Cargo Spine, Survey Array.

- **Spacesuit Bay**
  Exo-Lung, Skinweave Suit, Field Blaster.

Top-node upgrades should exist at the bay level, but they should not replace the leaves. A bay top node should be a small number of high-impact ranks that improve the family and change workbench routing. Examples:

- Weapons Bay rank: improves weapon offer weighting and unlocks weapon overclock milestones.
- Maneuver Bay rank: improves boost/dash handling and unlocks control-family offers.
- Survival Bay rank: improves shield/hull recovery rules and unlocks sustain offers.
- Cargo and Survey Bay rank: improves cache/relic/cargo outcomes and unlocks planetcraft offers.
- Spacesuit Bay rank: improves surface expedition readiness and unlocks suit branches earlier.

This gives the player a meaningful "upgrade the whole area" option without flattening the specialist upgrades.

## Mobile Layout

Mobile should use one vertical scroll surface with stable sections:

1. Header: signal count, rerolls, recycle action.
2. Sticky offer stack: up to 5 actionable cards. Cards should be 56-76px tall, full width, and never mixed with locked rows.
3. Bay accordions: compact rows with progress, owned ranks, unlocked count, and next milestone.
4. Open bay detail: only the selected bay expands into child nodes.

Locked nodes should be summarized unless the player expands the bay. Do not show the whole locked future list at full detail on mobile.

## Desktop Layout

Desktop can use a split workbench:

- Left: bay rail with progress meters and alert dots for current offers.
- Right: active bay detail tree.
- Top: current signal offers, either above both columns or as a right-side pinned strip.

The full manifest and collection can remain separate console tabs. The workbench tab should optimize for spending signals.

## Interaction Rules

- Spending a signal must preserve scroll position and selected bay.
- Rerolling must preserve scroll position and selected bay.
- Current offers must remain separate from locked and standby context.
- A bay row with a current offer gets an alert dot and "Offer ready" status.
- Locked child nodes show one-line requirements inside their bay only.
- Maxed nodes collapse to a completed chip unless the player opens detail.
- Special offers appear in the Signal Offers area and in a small "Special Signals" bay if needed.
- Limit breaks should not occupy the same visual weight as authored upgrade branches until normal progression is exhausted.

## Implementation Plan

### Phase 1: Grouped Manifest UI

Keep existing balance and roll logic. Add UI-only grouping:

- Add a `workbenchBayDefinitions` helper mapping existing upgrades to bays.
- Render Signal Offers first as standalone actionable buttons.
- Render bay accordions below, with only one expanded bay on mobile.
- Preserve selected bay and scroll across install and reroll.
- Move locked/standby rows into the bay detail.

This removes the endless flat list without changing upgrade math.

### Phase 2: Bay Top Nodes

Add persistent run-scoped bay ranks:

- `WorkbenchBayId`
- `workbenchBayRanks`
- `WorkbenchChoice` variant for bay upgrades
- max 3-5 ranks per bay
- bay rank effects should improve offer weighting, unlock thresholds, or family-level stats

Keep bay upgrades rare enough that they feel like strategic commitments, not mandatory taxes.

### Phase 3: Milestone Overclocks

Add milestone choices for maxed or near-maxed branches:

- weapon overclocks at rank 3/6 or max
- spacesuit modules after Survey Array rank 2 or Spacesuit Bay rank 1
- cargo/survey discoveries after Cargo Spine/Luck Coil investment
- survival sustain choices after shield/hull investment

These should be strong build-shaping choices, similar to evolutions, not another long row of small percentage upgrades.

## Sources

- Vampire Survivors PowerUps: https://vampire-survivors.fandom.com/wiki/PowerUps
- Vampire Survivors Evolution: https://vampire.survivors.wiki/w/Evolution
- Vampire Survivors Collection: https://vampire.survivors.wiki/w/Collection
- 20 Minutes Till Dawn upgrades: https://20minutestilldawn.wiki.gg/wiki/Upgrades
- Deep Rock Galactic: Survivor overclocks: https://deeprockgalactic.wiki.gg/wiki/Survivor:Overclocks
- Brotato shop: https://brotato.wiki.spellsandguns.com/Shop
- Hades Mirror of Night: https://hades.fandom.com/wiki/Mirror_of_Night
- Warframe Mods Guide: https://www.warframe.com/en/news/mods-guide
