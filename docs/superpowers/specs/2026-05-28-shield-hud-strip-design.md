# Shield HUD Strip Design

## Intent

Ship shields are a separate survival buffer, but the current HUD only shows them as a small numeric suffix on hull. In a horde fight, the player needs a quick visual read on whether shields are up, damaged, or depleted.

## Design Notes

- Keep the HUD compact by using the existing hull meter.
- Add a thin cyan shield strip inside the hull bar instead of a third meter.
- Show the strip only in ship flight when `maxShield > 0`.
- Scale the strip width by `shield / maxShield`.
- Use a dim depleted state when the shield system exists but has no charge.
- Hide the strip during surface runs, where the hull meter represents human health.
