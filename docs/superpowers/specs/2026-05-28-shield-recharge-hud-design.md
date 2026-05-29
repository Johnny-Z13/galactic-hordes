# Shield Recharge HUD Design

## Intent

After a shield hit, the buffer does not regenerate until `shieldDelay` expires. The new shield strip should communicate that lockout so players understand why the buffer is not immediately refilling.

## Design Notes

- Reuse the existing shield strip; do not add another HUD row.
- Add a `recharging` class while `maxShield > 0` and `shieldDelay > 0`.
- Clear `recharging` during surface runs.
- Use a restrained cyan flicker so the state reads as shield recovery, not hull danger.
