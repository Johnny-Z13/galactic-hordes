import type { GameState } from './main'

export interface StateHandler {
  update?(dt: number): void
  render?(ctx: CanvasRenderingContext2D): void
}

export type StateHandlers = Partial<Record<GameState, StateHandler>>
