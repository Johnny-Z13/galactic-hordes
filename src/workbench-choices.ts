import type { Evolution, LimitId, Relic, Upgrade } from './powerup-balance'

export type WorkbenchChoice =
  | { kind: 'upgrade'; upgrade: Upgrade }
  | { kind: 'evolution'; evolution: Evolution }
  | { kind: 'limit'; id: LimitId; name: string; description: string }
  | { kind: 'relic'; relic: Relic }
