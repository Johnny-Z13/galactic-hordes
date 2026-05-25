import { summarizeSimBatch } from './sim-metrics'
import { runSimPlaythrough } from './sim-runner'
import type { SimBatchOptions } from './sim-types'

type WorkerRequest = { kind: 'runBatch'; options: SimBatchOptions }

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  if (event.data.kind !== 'runBatch') return

  const { options } = event.data
  const runs = []
  for (let index = 0; index < options.runs; index += 1) {
    runs.push(runSimPlaythrough({ ...options, seed: options.seed + index }))
    self.postMessage({ kind: 'progress', completed: index + 1, total: options.runs })
  }
  self.postMessage({ kind: 'summary', summary: summarizeSimBatch(options, runs) })
}
