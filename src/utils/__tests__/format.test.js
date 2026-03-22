import { formatNumber } from '../format.js'

describe('formatNumber', () => {
  test('returns full number for values under 1000', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(999)).toBe('999')
  })

  test('formats 1000 as 1.00K', () => {
    expect(formatNumber(1000)).toBe('1.00K')
  })

  test('formats values at each threshold', () => {
    expect(formatNumber(1010)).toBe('1.01K')
    expect(formatNumber(1100)).toBe('1.10K')
    expect(formatNumber(10000)).toBe('10.0K')
    expect(formatNumber(100000)).toBe('100K')
    expect(formatNumber(1000000)).toBe('1.00M')
    expect(formatNumber(1000000000)).toBe('1.00B')
    expect(formatNumber(1000000000000)).toBe('1.00T')
    expect(formatNumber(1000000000000000)).toBe('1.00Qa')
    expect(formatNumber(1000000000000000000)).toBe('1.00Qi')
  })

  test('handles BigInt input', () => {
    expect(formatNumber(1000n)).toBe('1.00K')
  })

  test('handles BigInt above Number.MAX_SAFE_INTEGER without precision loss', () => {
    const hugeNumber = 9007199254740993n
    expect(formatNumber(hugeNumber)).toBe('9.00Qa')
  })

  test('handles very large BigInt values', () => {
    expect(formatNumber(1000000000000000000n)).toBe('1.00Qi')
    expect(formatNumber(1234567890000000000n)).toBe('1.23Qi')
    expect(formatNumber(100000000000000000n)).toBe('100Qa')
  })

  test('handles string input', () => {
    expect(formatNumber('1000')).toBe('1.00K')
  })

  test('handles edge cases', () => {
    expect(formatNumber(null)).toBe('0')
    expect(formatNumber(undefined)).toBe('0')
    expect(formatNumber(-500)).toBe('-500')
  })
})
