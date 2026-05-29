export const damageFeedbackConfig = {
  hitFlash: { durationSeconds: 0.08, dashRamDurationSeconds: 0.12, color: '#ff5d73' }
} as const

export function hitFlashColor(hit: boolean, fallback: string): string {
  return hit ? damageFeedbackConfig.hitFlash.color : fallback
}
