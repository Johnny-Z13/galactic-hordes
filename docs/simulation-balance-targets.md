# Simulation Balance Targets

These targets are envelopes, not exact expected outputs. They exist to catch large balance shifts and guide tuning discussions.

| Policy | Median Survival | Median Final Clear | Destroyed Rate | Avg Planets | Zero-Planet Runs | Avg Nodes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| balanced | 4:00-20:00 | >= 12:00 | <= 65% | >= 1.2 | <= 20% | >= 1.5 |
| survival | 6:00-25:00 | >= 12:00 | <= 50% | >= 0.8 | <= 45% | >= 1.5 |
| planetHunter | 4:00-20:00 | >= 11:00 | <= 70% | >= 2.5 | <= 8% | >= 1.2 |
| greedyCache | 3:00-18:20 | >= 11:00 | <= 80% | >= 1.8 | <= 20% | >= 1.0 |
| routeRusher | 3:40-20:00 | >= 10:00 | <= 70% | >= 0.3 | <= 55% | >= 2.0 |
| stress | 1:00-15:00 | n/a | <= 100% | >= 0.2 | <= 65% | >= 0.8 |

Investigate any batch that misses procedural variety thresholds:

- Fewer than four route template families in a normal batch.
- Fewer than three planet archetype families in a normal batch.
- Median final clear time below the policy floor, especially for `balanced`.
- One death cause dominating more than 70% of destroyed runs outside stress presets.
- Too many zero-planet runs for the selected policy, especially for `planetHunter`.

These thresholds should move as the game model gets better. Update the targets and this document together.
