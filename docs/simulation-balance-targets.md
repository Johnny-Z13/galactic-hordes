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

| Policy | Opening 0-60s Kills | First Kill | First Landing | First Workbench |
| --- | ---: | ---: | ---: | ---: |
| balanced | >= 18.0 | <= 0:06 | <= 1:10 | <= 1:30 |
| survival | >= 14.0 | <= 0:08 | <= 1:25 | <= 1:50 |
| planetHunter | >= 16.0 | <= 0:08 | <= 1:10 | <= 1:35 |
| greedyCache | >= 16.0 | <= 0:08 | <= 1:20 | <= 1:45 |
| routeRusher | >= 12.0 | <= 0:10 | <= 1:50 | <= 2:10 |
| stress | >= 8.0 | <= 0:12 | <= 2:00 | <= 2:30 |

Investigate any batch that misses procedural variety thresholds:

- Fewer than four route template families in a normal batch.
- Fewer than three planet archetype families in a normal batch.
- Median final clear time below the policy floor, especially for `balanced`.
- One death cause dominating more than 70% of destroyed runs outside stress presets.
- Too many zero-planet runs for the selected policy, especially for `planetHunter`.
- Opening 0-60s kills, first kill, first landing, or first workbench drift outside the policy envelope.

These thresholds should move as the game model gets better. Update the targets and this document together.
