# Critical Meter Row Design

## Intent

The pulsing fill communicates danger, but the meter label/value should also shift tone so low hull, low surface health, and low oxygen read at a glance during combat.

## Design Notes

- Use CSS `:has(...)` against existing critical fill classes; no extra DOM refs or update code.
- Keep health danger red/yellow and oxygen danger cyan/yellow.
- Emphasize border, label, and value only when the corresponding fill is critical.
- Keep the effect compact so the HUD does not become a distracting warning banner.
