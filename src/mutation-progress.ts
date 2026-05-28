import { nextXpThreshold } from './run-balance'

export interface MutationProgress {
  level: number
  xp: number
  nextXp: number
}

export function applyMutationXp(progress: MutationProgress, gainedXp: number) {
  progress.xp += gainedXp
  let levelsGained = 0
  while (progress.xp >= progress.nextXp) {
    progress.xp -= progress.nextXp
    progress.level += 1
    progress.nextXp = nextXpThreshold(progress.nextXp)
    levelsGained += 1
  }
  return levelsGained
}

export function mutationXpReadout(progress: MutationProgress) {
  return `LV ${progress.level} // ${Math.floor(progress.xp)}/${Math.floor(progress.nextXp)}`
}
