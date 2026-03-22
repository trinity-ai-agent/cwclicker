const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi']

const BIGINT_DIVISORS = [
  1n,
  1000n,
  1000000n,
  1000000000n,
  1000000000000n,
  1000000000000000n,
  1000000000000000000n,
]

/**
 * Formats a number with compact notation (K, M, B, T, Qa, Qi)
 * Uses bigint math for bigint inputs to avoid precision loss.
 * @param {number|string|bigint} value - The number to format
 * @returns {string} Formatted string (e.g., "1.23K", "999")
 */
export function formatNumber(value) {
  if (value === null || value === undefined) {
    return '0'
  }

  if (typeof value === 'bigint') {
    return formatBigInt(value)
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (isNaN(parsed)) {
      return '0'
    }
    return formatNumber(parsed)
  }

  if (typeof value === 'number') {
    if (isNaN(value)) {
      return '0'
    }
    return formatNumberInternal(value)
  }

  return String(value)
}

/**
 * Formats a number using Number math (for regular numbers)
 */
function formatNumberInternal(num) {
  if (num < 1000) {
    return num.toString()
  }

  for (let i = BIGINT_DIVISORS.length - 1; i >= 1; i--) {
    const divisor = Number(BIGINT_DIVISORS[i])
    if (num >= divisor) {
      const scaled = num / divisor
      if (scaled >= 100) {
        return Math.round(scaled) + SUFFIXES[i]
      } else if (scaled >= 10) {
        return scaled.toFixed(1) + SUFFIXES[i]
      } else {
        return scaled.toFixed(2) + SUFFIXES[i]
      }
    }
  }

  return num.toString()
}

/**
 * Formats a bigint using bigint math to avoid precision loss
 */
function formatBigInt(value) {
  if (value < 1000n) {
    return value.toString()
  }

  for (let i = BIGINT_DIVISORS.length - 1; i >= 1; i--) {
    if (value >= BIGINT_DIVISORS[i]) {
      const divisor = BIGINT_DIVISORS[i]
      const quotient = value / divisor
      const remainder = value % divisor

      if (quotient >= 100n) {
        return quotient.toString() + SUFFIXES[i]
      } else if (quotient >= 10n) {
        const decimalPart = (remainder * 10n) / divisor
        return `${quotient}.${decimalPart}` + SUFFIXES[i]
      } else {
        const decimalPart = (remainder * 100n) / divisor
        const decimalStr = decimalPart.toString().padStart(2, '0')
        return `${quotient}.${decimalStr}` + SUFFIXES[i]
      }
    }
  }

  return value.toString()
}
