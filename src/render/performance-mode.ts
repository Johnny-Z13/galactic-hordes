export interface RenderPerformanceInput {
  graphicsMode: string
  particles: number
  enemies: number
  bullets: number
  pickups: number
}

export function renderHighLoad({ graphicsMode, particles, enemies, bullets, pickups }: RenderPerformanceInput) {
  return graphicsMode === 'LOW' || particles > 170 || enemies > 120 || bullets > 130 || pickups > 150
}

export function renderGlowAllowed(input: RenderPerformanceInput) {
  return input.graphicsMode === 'GLOW' && !renderHighLoad(input)
}
