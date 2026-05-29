import type { Enemy } from './main-types'

const GRID_CELL = 180
const GRID_STRIDE = 1000

export class EnemySpatialGrid {
  private buckets = new Map<number, Enemy[]>()
  private scratch: Enemy[] = []

  clear() {
    this.buckets.clear()
    this.scratch.length = 0
  }

  rebuild(enemies: Enemy[]) {
    this.buckets.clear()
    for (const enemy of enemies) {
      if (enemy.hp <= 0) continue
      const key = this.key(enemy.x, enemy.y)
      let bucket = this.buckets.get(key)
      if (!bucket) {
        bucket = []
        this.buckets.set(key, bucket)
      }
      bucket.push(enemy)
    }
  }

  nearby(x: number, y: number) {
    const cx = Math.floor(x / GRID_CELL)
    const cy = Math.floor(y / GRID_CELL)
    this.scratch.length = 0
    for (let gx = cx - 1; gx <= cx + 1; gx += 1) {
      for (let gy = cy - 1; gy <= cy + 1; gy += 1) {
        const bucket = this.buckets.get(gx * GRID_STRIDE + gy)
        if (bucket) this.scratch.push(...bucket)
      }
    }
    return this.scratch
  }

  private key(x: number, y: number) {
    return Math.floor(x / GRID_CELL) * GRID_STRIDE + Math.floor(y / GRID_CELL)
  }
}
