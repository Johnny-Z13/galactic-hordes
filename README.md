# Vector Shooter

Vector Shooter is a mobile-first portrait survival shooter: Vampire Survivors pressure, Asteroids movement, and Vectrex-style vector graphics. The ship auto-fires, so the player focuses on steering through hordes, landing on planets, salvaging mystery caches, and evolving the build at the ship workbench.

## Current Prototype

- Portrait-first 2D canvas game built with Vite and TypeScript.
- Thumb-anywhere mobile movement: drag in the playfield to steer.
- Auto-targeting ship fire with keyboard, touch, mouse, and gamepad support.
- Planet landing transitions into on-foot surface salvage.
- Endless procedural space sectors with deterministic planets and starfields.
- Workbench upgrades happen when returning to the ship.
- Weighted upgrade choices inspired by Vampire Survivors.
- Planet relics, weapon evolutions, limit breaks, treasure cores, and mystery cache ambushes.
- High scores with editable pilot names.
- LOW/MED/GLOW graphics modes for phones, low-GPU Macs, and high-end PCs.

## Mobile Controls

The default experience is designed for an iPhone-style portrait screen.

- Drag anywhere in the playfield to move.
- The ship auto-fires at nearby enemies.
- Tap `LAND` near a planet.
- On a planet, tap `BOARD` near the ship to leave.
- Tap `DASH` in space.
- Tap `PULSE` on planet surfaces.

The lower-right action buttons are protected from movement input, so tapping them will not accidentally steer the player.

## Desktop and Gamepad Controls

Keyboard:

- `WASD`: move
- `E` or `Enter`: land / interact / board
- `Shift`: dash
- `Space`: fire / mining pulse
- `P`: show or hide the performance meter

Gamepad:

- Left stick: move
- Right stick: aim
- Right trigger / A: fire
- B / RB: dash
- Y: land / interact / board

## Graphics Modes

Choose a mode from the title screen:

- `LOW`: default for mobile and low-GPU machines. Caps DPR, disables glow-heavy effects, uses batched horde rendering.
- `MED`: cleaner vectors and moderate effects.
- `GLOW`: high-end PC mode with richer Vectrex bloom, layered shockwaves, brighter orbitals, and heavier particles.

## Upgrade Loop

Vector Shooter does not open upgrade choices immediately on level-up. XP banks mutation signals. To spend them:

1. Survive in space and collect XP shards.
2. Land on a planet.
3. Salvage crystals, scrap, cores, and mystery caches.
4. Return to the ship.
5. Spend banked mutation signals at the workbench.

Workbench choices are weighted by rarity and biased toward upgrades already owned. Maxed upgrades disappear. If a maxed weapon has the right planet relic, an evolution can appear as a jackpot choice.

See [docs/upgrade-progression-design.md](docs/upgrade-progression-design.md) for the full progression design.

## Endless Exploration

Space is split into deterministic 3600px sectors around the player. The game keeps nearby sectors alive in memory and prunes distant ones, so travelling across boundaries feels seamless without turning the whole universe into one huge expensive scene.

Each sector has its own generated starfield and one to three planets. Planets have an archetype:

- `cache`: richer salvage and more jackpot odds
- `hostile`: heavier surface fights
- `repair`: safer dock with more hull repair
- `relic`: stronger rare-object odds
- `strange`: volatile mixed rewards and ambushes

Visited planets stay remembered for the run even if their sector is unloaded and regenerated later.

## Planet Salvage

Planets are mystery boxes. Landing can produce jackpot fields, hostile swarms, relic hunts, repair docks, volatile cache fields, or a quieter standard salvage run. Surface caches can grant:

- scrap
- crystals
- cores
- mutation signals
- rare relics
- ambushes
- evolution catalysts

Relics can unlock weapon evolutions, but many come with downsides.

## Development

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

The current local dev server usually runs at:

```text
http://127.0.0.1:5176/
```

## Design Direction

The goal is an addictive mobile survival loop:

> one more horde, one more planet, one more cache, one more mutation.

The game should stay readable and performant on low-end hardware while still offering a neon-heavy GLOW mode for stronger GPUs.
