# v1.1.2 Compact Number Formatting - Design Spec

## Overview

Replace the current inline number formatting with a shared utility that displays large numbers in compact notation (e.g., `1.23K`, `1.23M`) while keeping small numbers readable (e.g., `999`).

## Problem

Currently there are **4 inline `formatNumber` implementations** across different components:

- `MigrationNotification.vue`
- `LicensePanel.vue`
- `OfflineProgressNotification.vue`
- Plus `toLocaleString()` usage directly in `App.vue` and `UpgradePanel.vue`

This duplication causes inconsistency and makes future maintenance harder.

## Solution

### File Location

Create `src/utils/format.js` with a single `formatNumber()` function.

### Behavior

| Value Range | Display Format                |
| ----------- | ----------------------------- |
| 0-999       | Full number (e.g., `999`)     |
| 1,000+      | 2 significant digits + suffix |
| 1,000,000+  | 2 significant digits + suffix |
| ...         | ...                           |

**Suffix Table:**

| Threshold                 | Suffix | Example  |
| ------------------------- | ------ | -------- |
| 1,000                     | K      | `1.23K`  |
| 1,000,000                 | M      | `1.23M`  |
| 1,000,000,000             | B      | `1.23B`  |
| 1,000,000,000,000         | T      | `1.23T`  |
| 1,000,000,000,000,000     | Qa     | `1.23Qa` |
| 1,000,000,000,000,000,000 | Qi     | `1.23Qi` |

**Rules:**

- Start abbreviating at exactly 1000 (not before)
- Variable precision based on magnitude:
  - `>= 100`: 0 decimal places (e.g., `100K`, `999Qa`)
  - `>= 10`: 1 decimal place (e.g., `10.0K`, `9.7Qa`)
  - `< 10`: 2 decimal places (e.g., `1.00K`, `9.01Qa`)
- Cap at Qi (quintillion) - no larger suffixes
- Uses bigint math for bigint inputs to avoid precision loss above Number.MAX_SAFE_INTEGER

### Implementation Details

**Algorithm:**

1. Handle edge cases: null, undefined, negative numbers
2. If value < 1000, return as-is (full number)
3. For bigint inputs: use bigint division and modulo to calculate decimal part
4. For number inputs: use Number math with variable precision
5. Return formatted string with appropriate decimal places based on magnitude

**Function Signature:**

```javascript
/**
 * Formats a number with compact notation (K, M, B, T, Qa, Qi)
 * @param {number|string|bigint} value - The number to format
 * @returns {string} Formatted string (e.g., "1.23K", "999")
 */
export function formatNumber(value)
```

### Files to Create

| File                  | Purpose                     |
| --------------------- | --------------------------- |
| `src/utils/format.js` | Shared formatNumber utility |

### Files to Update

| File                                             | Change                                                 |
| ------------------------------------------------ | ------------------------------------------------------ |
| `src/App.vue`                                    | Import and use `formatNumber` for QSOs display         |
| `src/components/LicensePanel.vue`                | Replace inline `toLocaleString` with `formatNumber`    |
| `src/components/UpgradePanel.vue`                | Replace `toLocaleString` with `formatNumber` for costs |
| `src/components/MigrationNotification.vue`       | Replace inline `formatNumber` with shared utility      |
| `src/components/OfflineProgressNotification.vue` | Replace inline `formatNumber` with shared utility      |

### Testing

- Add tests to verify compact formatting at each threshold
- Add tests for edge cases (0, negative, decimals)
- Update existing component tests to work with new format

## Rollout

- Bump VERSION to `1.1.2`
- Implement utility first with tests
- Update components one at a time, running tests after each
- All 171+ tests must pass before PR

## Compatibility

- This is purely cosmetic - no game state changes
- Saves will continue to work without migration
