export type GameState = 'title' | 'mothership' | 'collection' | 'powerups' | 'sectorMap' | 'station' | 'playing' | 'paused' | 'levelup' | 'planet' | 'landing' | 'surface' | 'alien' | 'lore' | 'takeoff' | 'dying' | 'debrief' | 'gameover' | 'scores'

export interface StateHandler {
  update?(dt: number): void
  render?(ctx: CanvasRenderingContext2D): void
}

export type StateHandlers = Partial<Record<GameState, StateHandler>>
