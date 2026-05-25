import { formatCountRecord, formatSeconds, summarizeSimBatch } from './sim-metrics'
import { runSimPlaythrough } from './sim-runner'
import type { SimBatchOptions, SimDifficulty, SimPolicyId } from './sim-types'

declare const process: { argv: string[] }

const args = new Map(
  process.argv.slice(2).map((arg: string) => {
    const [key, value = 'true'] = arg.replace(/^--/, '').split('=')
    return [key, value] as const
  })
)

const options: SimBatchOptions = {
  seed: Number(args.get('seed') ?? 1000),
  runs: Number(args.get('runs') ?? 10),
  policy: (args.get('policy') ?? 'balanced') as SimPolicyId,
  maxSeconds: Number(args.get('maxSeconds') ?? 900),
  difficulty: (args.get('difficulty') ?? 'normal') as SimDifficulty
}

const runs = Array.from({ length: options.runs }, (_, index) => runSimPlaythrough({ ...options, seed: options.seed + index }))
const summary = summarizeSimBatch(options, runs)

console.log(`Simulation batch: ${options.runs} runs, ${options.policy}, ${options.difficulty}, seed ${options.seed}`)
console.log(`Survival: avg ${formatSeconds(summary.survival.averageSeconds)}, median ${formatSeconds(summary.survival.medianSeconds)}, best ${formatSeconds(summary.survival.bestSeconds)}, destroyed ${Math.round(summary.survival.destroyedRate * 100)}%`)
console.log(`Route: avg nodes ${summary.route.averageNodesCleared.toFixed(1)}, final reached ${summary.route.finalReached}/${options.runs}`)
console.log(`Route templates: ${formatCountRecord(summary.route.templateCounts) || 'none'}`)
console.log(`Planets: avg landings ${summary.planets.averageLandings.toFixed(1)}, archetypes ${formatCountRecord(summary.planets.archetypeCounts) || 'none'}`)
console.log(`Economy: scrap ${summary.economy.averageScrap.toFixed(1)}, crystal ${summary.economy.averageCrystal.toFixed(1)}, cores ${summary.economy.averageCores.toFixed(1)}, signals ${summary.economy.averageMutationSignals.toFixed(1)}`)
console.log(`Combat: kills ${summary.combat.averageKills.toFixed(1)}, damage ${summary.combat.averageDamageTaken.toFixed(1)}, deaths ${formatCountRecord(summary.combat.deathCauseCounts) || 'none'}`)
if (summary.balanceFlags.length) {
  console.log('Balance flags:')
  for (const flag of summary.balanceFlags) console.log(`- ${flag}`)
} else {
  console.log('Balance flags: none')
}
