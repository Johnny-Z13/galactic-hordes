import { expect, test } from '@playwright/test'
import { createSimRng, pickWeighted } from '../src/sim/sim-rng'

test('simulation rng repeats the same sequence for the same seed', () => {
  const a = createSimRng(42)
  const b = createSimRng(42)

  expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()])
})

test('simulation rng produces different sequences for different seeds', () => {
  const a = createSimRng(42)
  const b = createSimRng(43)

  expect([a.next(), a.next(), a.next()]).not.toEqual([b.next(), b.next(), b.next()])
})

test('weighted picker ignores zero weights and returns a stable choice', () => {
  const rng = createSimRng(7)
  const choices = [
    { value: 'skip', weight: 0 },
    { value: 'take', weight: 10 }
  ]

  expect(pickWeighted(choices, rng)).toBe('take')
})

test('weighted picker rejects empty positive weight sets', () => {
  const rng = createSimRng(9)

  expect(() => pickWeighted([{ value: 'none', weight: 0 }], rng)).toThrow('positive weight')
})
