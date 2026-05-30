export interface RenderPerformanceInput {
  graphicsMode: string
  particles: number
  enemies: number
  bullets: number
  pickups: number
}

export function highLoadFromCounts(graphicsMode: string, particles: number, enemies: number, bullets: number, pickups: number) {
  return graphicsMode === 'LOW' || particles > 170 || enemies > 120 || bullets > 130 || pickups > 150
}

export function renderHighLoad({ graphicsMode, particles, enemies, bullets, pickups }: RenderPerformanceInput) {
  return highLoadFromCounts(graphicsMode, particles, enemies, bullets, pickups)
}

export function renderGlowAllowed(input: RenderPerformanceInput) {
  return input.graphicsMode === 'GLOW' && !renderHighLoad(input)
}

export function renderDprCap(graphicsMode: string) {
  if (graphicsMode === 'LOW') return 1
  if (graphicsMode === 'MED') return 1.25
  return 1.75
}
