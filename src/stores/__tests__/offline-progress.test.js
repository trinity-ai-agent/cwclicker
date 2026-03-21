import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../game'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

describe('Offline Progress', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('calculates offline QSOs based on production rate and time', () => {
    const store = useGameStore()

    // Calculate expected: 3/sec × 2 hours × 0.5 = 10800 QSOs
    const rate = 3 // QSOs per second
    const hours = 2
    const expectedQsos = Math.floor(rate * hours * 3600 * 0.5) // 10800

    const result = store.calculateOfflineProgress(hours, rate)

    expect(result).toBe(expectedQsos)
  })

  it('caps offline progress at 24 hours maximum', () => {
    const store = useGameStore()

    const rate = 1 // 1 QSO/sec
    const hours = 48 // 48 hours away

    const result = store.calculateOfflineProgress(hours, rate)

    // Should cap at 24 hours: 1 × 24 × 3600 × 0.5 = 43200
    const expectedMax = Math.floor(1 * 24 * 3600 * 0.5)
    expect(result).toBe(expectedMax)
  })

  it('returns 0 for negative or zero hours', () => {
    const store = useGameStore()

    expect(store.calculateOfflineProgress(-1, 10)).toBe(0)
    expect(store.calculateOfflineProgress(0, 10)).toBe(0)
  })

  it('returns 0 when production rate is 0', () => {
    const store = useGameStore()

    expect(store.calculateOfflineProgress(5, 0)).toBe(0)
    expect(store.calculateOfflineProgress(5, -1)).toBe(0)
  })

  it('calculates partial hours correctly', () => {
    const store = useGameStore()

    // 30 minutes (0.5 hours) at 2 QSO/sec
    const result = store.calculateOfflineProgress(0.5, 2)
    const expected = Math.floor(2 * 0.5 * 3600 * 0.5) // 1800

    expect(result).toBe(expected)
  })
})
