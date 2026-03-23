import { describe, expect, it } from 'vitest'
import { calculateUpgradeCost, GAME_CONSTANTS } from '../game'

describe('game constants helpers', () => {
  it('calculates upgrade costs using bigint math', () => {
    const cost = calculateUpgradeCost(500000000, 8)
    const expected = 500000000n * BigInt(GAME_CONSTANTS.UPGRADES.COST_MULTIPLIER_BASE) ** 9n

    expect(typeof cost).toBe('bigint')
    expect(cost).toBe(expected)
  })
})
