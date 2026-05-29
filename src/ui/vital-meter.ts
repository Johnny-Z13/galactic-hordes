export function vitalCriticalClass(ratio: number): 'critical' | '' {
  return ratio <= 0.3 ? 'critical' : ''
}
