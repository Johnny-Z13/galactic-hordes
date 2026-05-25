# Simulation Balance Targets

These targets are envelopes, not exact expected outputs. They exist to catch large balance shifts and guide tuning discussions.

| Policy | Median Survival | Destroyed Rate | Avg Planets | Avg Nodes |
| --- | ---: | ---: | ---: | ---: |
| balanced | 4:00-20:00 | <= 65% | >= 1.2 | >= 1.5 |
| survival | 6:00-25:00 | <= 50% | >= 0.8 | >= 1.5 |
| planetHunter | 4:00-20:00 | <= 70% | >= 2.5 | >= 1.2 |
| greedyCache | 3:00-18:20 | <= 80% | >= 1.8 | >= 1.0 |
| routeRusher | 3:40-20:00 | <= 70% | >= 0.3 | >= 2.0 |
| stress | 1:00-15:00 | <= 95% | >= 0.2 | >= 0.8 |

Investigate any batch that misses procedural variety thresholds:

- Fewer than four route template families in a normal batch.
- Fewer than three planet archetype families in a normal batch.
- One death cause dominating more than 70% of destroyed runs outside stress presets.

These thresholds should move as the game model gets better. Update the targets and this document together.
