import { workbenchBalance } from '../powerup-balance'
import type { SurfaceEventKind } from '../surface-encounters'

export interface SurfaceSignalBankResult {
  banked: boolean
  pendingUpgrade: boolean
  nextBankedSignals: number
  nextOverflowSignals: number
  scrap: number
  crystal: number
  toast: string | null
}

export function surfaceSignalCap(event: SurfaceEventKind | null): number {
  const rewardBonus = event === 'horde' || event === 'jackpot'
    ? workbenchBalance.surfaceSignalCapRewardEventBonus
    : 0
  return workbenchBalance.surfaceSignalCapBase + rewardBonus
}

export function resolveSurfaceSignalBank(input: {
  event: SurfaceEventKind
  bankedSignals: number
  overflowSignals: number
}): SurfaceSignalBankResult {
  if (input.bankedSignals >= surfaceSignalCap(input.event)) {
    const nextOverflowSignals = input.overflowSignals + 1
    return {
      banked: false,
      pendingUpgrade: false,
      nextBankedSignals: input.bankedSignals,
      nextOverflowSignals,
      scrap: workbenchBalance.overflowSignalScrap,
      crystal: workbenchBalance.overflowSignalCrystal,
      toast: nextOverflowSignals === 1 ? 'SIGNAL BUFFER FULL: EXTRA SIGNALS CONVERT TO CARGO' : null
    }
  }

  return {
    banked: true,
    pendingUpgrade: true,
    nextBankedSignals: input.bankedSignals + 1,
    nextOverflowSignals: input.overflowSignals,
    scrap: 0,
    crystal: 0,
    toast: null
  }
}
