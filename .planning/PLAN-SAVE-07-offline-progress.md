# Offline Progress Calculation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement SAVE-07: Calculate and award QSOs earned while the player was offline (rate × hours × 0.5, max 24h)

**Architecture:** Extend the existing save system in `game.js` to track last save timestamp, calculate offline time on load, and display earnings in a dismissible notification component.

**Tech Stack:** Vue 3, Pinia, Vitest for testing

---

## Prerequisites

- [ ] Review existing save/load implementation in `src/stores/game.js`
- [ ] Review existing test patterns in `src/stores/__tests__/game.test.js`

---

## File Structure

**Files to modify:**
- `src/stores/game.js` - Add offline progress calculation to load() and lastSaveTime tracking to save()
- `src/App.vue` - Add notification display for offline earnings

**Files to create:**
- `src/components/OfflineProgressNotification.vue` - UI component to display offline earnings
- `src/stores/__tests__/offline-progress.test.js` - Unit tests for offline progress logic

---

## Chunk 1: Core Offline Progress Logic

### Task 1.1: Write Test for Offline Progress Calculation

**Files:**
- Create: `src/stores/__tests__/offline-progress.test.js`

- [ ] **Step 1: Create test file**

```javascript
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
    
    // Set up player with some factories producing 1 QSO/sec
    store.factoryCounts = { 'elmer': 1 } // 0.1/sec, but let's use a simpler factory
    store.factoryCounts = { 'straight-key': 10 } // 0.3/sec each = 3/sec total
    
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/stores/__tests__/offline-progress.test.js`
Expected: FAIL - calculateOfflineProgress is not defined

- [ ] **Step 3: Commit test file**

```bash
git add src/stores/__tests__/offline-progress.test.js
git commit -m "test: add offline progress calculation tests"
```

---

### Task 1.2: Implement Offline Progress Logic in Game Store

**Files:**
- Modify: `src/stores/game.js`

- [ ] **Step 1: Add lastSaveTime to save() function**

Find the save() function around line 393-408 and modify it:

```javascript
/**
 * Saves the current game state to localStorage.
 */
function save() {
  try {
    const state = {
      qsos: qsos.value.toString(),
      licenseLevel: licenseLevel.value,
      factoryCounts: factoryCounts.value,
      fractionalQSOs: fractionalQSOs.value,
      audioSettings: audioSettings.value,
      lotteryState: lotteryState.value,
      purchasedUpgrades: Array.from(purchasedUpgrades.value),
      lastSaveTime: Date.now() // Add this line
    }
    localStorage.setItem('cw-keyer-game', JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save game state:', e)
  }
}
```

- [ ] **Step 2: Add calculateOfflineProgress function**

Add this function before the return statement in the store (around line 455):

```javascript
/**
 * Calculates QSOs earned while offline.
 * Formula: rate × hours × 0.5, capped at 24 hours
 * @param {number} hours - Hours offline
 * @param {number} rate - QSOs per second production rate
 * @returns {number} QSOs earned (integer)
 */
function calculateOfflineProgress(hours, rate) {
  // Validate inputs
  if (!hours || hours <= 0 || !rate || rate <= 0) {
    return 0
  }
  
  // Cap at 24 hours maximum
  const cappedHours = Math.min(hours, 24)
  
  // Calculate: rate × hours × 3600 seconds/hour × 0.5 efficiency
  const qsosEarned = rate * cappedHours * 3600 * 0.5
  
  return Math.floor(qsosEarned)
}
```

- [ ] **Step 3: Modify load() to calculate and apply offline progress**

Find the load() function around line 413-454 and add offline progress handling at the end (before the catch block):

```javascript
/**
 * Loads the game state from localStorage.
 */
function load() {
  try {
    const saved = localStorage.getItem('cw-keyer-game')
    if (saved) {
      const state = JSON.parse(saved)
      qsos.value = BigInt(state.qsos || '0')
      licenseLevel.value = state.licenseLevel || 1
      factoryCounts.value = state.factoryCounts || {}
      fractionalQSOs.value = state.fractionalQSOs || 0
      
      if (state.audioSettings) {
        audioSettings.value = {
          volume: state.audioSettings.volume ?? 0.5,
          frequency: state.audioSettings.frequency ?? 600,
          isMuted: state.audioSettings.isMuted ?? false
        }
      }

      // Restore lottery state (check if bonus/storm has expired)
      if (state.lotteryState) {
        const now = Date.now()
        lotteryState.value = {
          lastTriggerTime: state.lotteryState.lastTriggerTime || 0,
          isBonusAvailable: state.lotteryState.isBonusAvailable && now < state.lotteryState.bonusAvailableEndTime,
          bonusFactoryId: state.lotteryState.bonusFactoryId || null,
          bonusEndTime: state.lotteryState.bonusEndTime || 0,
          bonusAvailableEndTime: state.lotteryState.bonusAvailableEndTime || 0,
          phenomenonTitle: state.lotteryState.phenomenonTitle || '',
          isSolarStorm: state.lotteryState.isSolarStorm && now < state.lotteryState.solarStormEndTime,
          solarStormEndTime: state.lotteryState.solarStormEndTime || 0
        }
      }

      // Restore purchased upgrades
      if (state.purchasedUpgrades) {
        purchasedUpgrades.value = new Set(state.purchasedUpgrades)
      }

      // ADD THIS BLOCK: Calculate offline progress
      if (state.lastSaveTime) {
        const now = Date.now()
        const offlineMs = now - state.lastSaveTime
        const offlineHours = offlineMs / (1000 * 60 * 60) // Convert to hours
        
        // Only calculate if offline for more than 1 minute (to avoid spam on refresh)
        if (offlineHours > 0.016) { // 1 minute = ~0.016 hours
          const productionRate = getTotalQSOsPerSecond()
          const offlineQsos = calculateOfflineProgress(offlineHours, productionRate)
          
          if (offlineQsos > 0) {
            qsos.value = qsos.value + BigInt(offlineQsos)
            
            // Store offline earnings info for UI display
            const roundedHours = Math.min(Math.ceil(offlineHours), 24)
            offlineEarnings.value = {
              qsos: offlineQsos,
              hours: roundedHours,
              rate: productionRate
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load game state:', e)
  }
}
```

- [ ] **Step 4: Add offlineEarnings reactive state**

Near the top of the store (around line 16), add the offlineEarnings ref:

```javascript
// ... existing refs ...
const lotteryState = ref({
  lastTriggerTime: 0,
  isBonusAvailable: false,
  bonusFactoryId: null,
  bonusEndTime: 0,
  bonusAvailableEndTime: 0,
  phenomenonTitle: '',
  isSolarStorm: false,
  solarStormEndTime: 0
})

// ADD THIS: Track offline earnings for UI display
const offlineEarnings = ref(null)
```

- [ ] **Step 5: Add offlineEarnings to return statement**

Find the return statement (around line 485) and add offlineEarnings and calculateOfflineProgress:

```javascript
return {
  qsos,
  licenseLevel,
  factoryCounts,
  fractionalQSOs,
  audioSettings,
  lotteryState,
  purchasedUpgrades,
  offlineEarnings, // ADD THIS
  tapKeyer,
  addPassiveQSOs,
  getFactoryCost,
  getBulkCost,
  buyFactory,
  getTotalQSOsPerSecond,
  updateAudioSettings,
  activateLotteryBonus,
  getLotteryMultiplier,
  getAvailableUpgrades,
  buyUpgrade,
  getUpgradeMultiplier,
  clearExpiredBonus,
  calculateOfflineProgress, // ADD THIS
  save,
  load
}
```

- [ ] **Step 6: Add dismissOfflineEarnings function**

Add this function after calculateOfflineProgress:

```javascript
/**
 * Dismisses the offline earnings notification.
 */
function dismissOfflineEarnings() {
  offlineEarnings.value = null
}
```

And add it to the return statement as well.

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test src/stores/__tests__/offline-progress.test.js`
Expected: All tests pass

- [ ] **Step 8: Commit changes**

```bash
git add src/stores/game.js
git commit -m "feat: implement offline progress calculation (SAVE-07)

- Track lastSaveTime in save data
- Calculate QSOs earned while offline: rate × hours × 0.5
- Cap at 24 hours maximum
- Only calculate if offline > 1 minute
- Store earnings in offlineEarnings for UI display"
```

---

## Chunk 2: UI Component for Offline Progress

### Task 2.1: Create OfflineProgressNotification Component

**Files:**
- Create: `src/components/OfflineProgressNotification.vue`

- [ ] **Step 1: Create the component**

```vue
<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()

/**
 * Formats a number with commas for display.
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  return num.toLocaleString('en-US')
}

/**
 * Dismisses the notification.
 */
function dismiss() {
  store.dismissOfflineEarnings()
}

/**
 * Computed property to check if there's offline earnings to display.
 */
const hasOfflineEarnings = computed(() => {
  return store.offlineEarnings !== null && store.offlineEarnings.qsos > 0
})

/**
 * Formats the time display (e.g., "2 hours", "30 minutes").
 */
const timeDisplay = computed(() => {
  if (!store.offlineEarnings) return ''
  
  const hours = store.offlineEarnings.hours
  
  if (hours >= 1) {
    return hours === 1 ? '1 hour' : `${hours} hours`
  } else {
    const minutes = Math.round(hours * 60)
    return minutes === 1 ? '1 minute' : `${minutes} minutes`
  }
})
</script>

<template>
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="hasOfflineEarnings"
      class="fixed bottom-4 right-4 max-w-md bg-terminal-bg border-2 border-terminal-amber rounded-lg p-4 shadow-lg z-50"
      role="alert"
      aria-live="polite"
    >
      <div class="flex items-start gap-3">
        <!-- Icon -->
        <div class="text-2xl">⏰</div>
        
        <!-- Content -->
        <div class="flex-1">
          <h3 class="text-terminal-amber font-bold mb-1">
            Welcome Back!
          </h3>
          
          <p class="text-terminal-green text-sm mb-2">
            While you were away for {{ timeDisplay }}, your stations earned:
          </p>
          
          <div class="text-2xl font-bold text-terminal-amber mb-1">
            {{ formatNumber(store.offlineEarnings.qsos) }} QSOs
          </div>
          
          <p class="text-xs text-gray-400">
            (at {{ store.offlineEarnings.rate.toFixed(1) }} QSOs/sec with 50% offline efficiency)
          </p>
        </div>
        
        <!-- Close button -->
        <button
          @click="dismiss"
          class="text-gray-400 hover:text-terminal-green transition-colors"
          aria-label="Dismiss offline earnings notification"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fill-rule="evenodd" 
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
              clip-rule="evenodd" 
            />
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>
```

- [ ] **Step 2: Add component to App.vue**

Modify `src/App.vue` to include the notification component:

Find the imports section (around line 1-17) and add:
```javascript
import OfflineProgressNotification from './components/OfflineProgressNotification.vue'
```

Find the template section and add the component before the closing `</div>` of the main container:
```vue
    <!-- Offline Progress Notification -->
    <OfflineProgressNotification />
    
  </div>
  </ErrorBoundary>
</template>
```

- [ ] **Step 3: Verify component renders**

Run: `npm run dev`
Open: http://localhost:5173
Test:
1. Play the game, buy some factories
2. Close the browser tab
3. Wait a few minutes
4. Reopen the game
5. Expected: Notification appears showing offline earnings

- [ ] **Step 4: Commit**

```bash
git add src/components/OfflineProgressNotification.vue src/App.vue
git commit -m "feat: add offline progress notification UI

- Create OfflineProgressNotification component
- Display QSOs earned while away with time duration
- Show production rate and efficiency info
- Add dismiss button with smooth transitions"
```

---

## Chunk 3: Documentation and Final Verification

### Task 3.1: Update Requirements Document

**Files:**
- Modify: `.planning/REQUIREMENTS.md`

- [ ] **Step 1: Mark SAVE-07 as complete**

Find line 83 in `.planning/REQUIREMENTS.md`:
```markdown
- [ ] **SAVE-07**: Offline progress calculation (rate × hours × 0.5, max 24h)
```

Change to:
```markdown
- [x] **SAVE-07**: Offline progress calculation (rate × hours × 0.5, max 24h)
```

- [ ] **Step 2: Update traceability table**

Find the traceability section (around line 143) and update SAVE-07 status.

- [ ] **Step 3: Commit**

```bash
git add .planning/REQUIREMENTS.md
git commit -m "docs: mark SAVE-07 as complete in requirements"
```

---

### Task 3.2: Update Project State

**Files:**
- Modify: `.planning/STATE.md`

- [ ] **Step 1: Update phase status**

Find the Phase Status table and update Phase 5 to reflect completion of the save system:

```markdown
## Phase Status

| Phase | Status | Plans | Progress |
|-------|--------|-------|----------|
| 1 | ✓ | 3/3 | 100% |
| 2 | ✓ | 3/3 | 100% |
| 3 | ✓ | 3/3 | 100% |
| 4 | ✓ | 4/4 | 100% |
| 5 | ✓ | 3/3 | 100% |
| 6 | ○ | 0/3 | 0% |
| 7 | ○ | 0/4 | 0% |

**Overall:** 21/27 plans complete (78%)
```

- [ ] **Step 2: Update Phase 5 details**

Find the Phase 5 section and mark all plans as complete:

```markdown
### Phase 5: Save System
**Status:** ✓ Complete
**Goal:** Progress persists across sessions

**Plans:**
1. ✓ **Save Manager** - localStorage auto-save
2. ✓ **Import/Export** - Base64 clipboard operations  
3. ✓ **Offline Progress** - Calculate earnings while away

**Requirements (7 total):**
- ✓ SAVE-01: Auto-save every 30 seconds
- ✓ SAVE-02: Save to localStorage
- ✓ SAVE-03: Load on game start
- ✓ SAVE-04: Handle localStorage errors gracefully
- ✓ SAVE-05: Export save data (base64 to clipboard)
- ✓ SAVE-06: Import save data (paste base64)
- ✓ SAVE-07: Offline progress calculation (rate × hours × 0.5, max 24h)
```

- [ ] **Step 3: Update Next Actions**

```markdown
## Next Actions

1. Move to Phase 6 planning: Run `/gsd-plan-phase 6` to create detailed plan for UI/UX Polish
2. Or consider the project feature-complete for v1 and move to bug fixing

**All 54 v1 requirements are now implemented!**
```

- [ ] **Step 4: Commit**

```bash
git add .planning/STATE.md
git commit -m "docs: update STATE.md - Phase 5 complete, all 54 v1 requirements done"
```

---

### Task 3.3: Run Full Test Suite

**Files:**
- Test: All test files

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 2: Run lint check**

Run: `npm run lint:check`
Expected: No linting errors

- [ ] **Step 3: Run format check**

Run: `npm run format:check`
Expected: No formatting issues

- [ ] **Step 4: Build verification**

Run: `npm run build`
Expected: Build completes successfully

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(phase-5): complete offline progress calculation (SAVE-07)

- Implement calculateOfflineProgress: rate × hours × 0.5, max 24h
- Track lastSaveTime in save data
- Calculate and apply offline QSOs on game load
- Show dismissible notification with earnings details
- All 54 v1 requirements now complete

Closes SAVE-07"
```

---

## Success Criteria Verification

After completing all tasks, verify:

- [ ] **SAVE-07**: Offline progress calculation works correctly
  - Test: Buy factories, close game, wait, reopen
  - Expected: Notification shows QSOs earned with correct math

**Formula verification:**
- Player has 1 factory producing 1 QSO/sec
- Offline for 2 hours
- Expected: 1 × 2 × 3600 × 0.5 = 3,600 QSOs

**Cap verification:**
- Player offline for 48 hours  
- Expected: Capped at 24 hours worth of earnings

**Threshold verification:**
- Player offline for 30 seconds
- Expected: No notification (below 1 minute threshold)

---

## Files Modified Summary

**Modified (2):**
1. `src/stores/game.js` - Added offline progress logic, lastSaveTime tracking
2. `src/App.vue` - Added notification component
3. `.planning/REQUIREMENTS.md` - Marked SAVE-07 complete
4. `.planning/STATE.md` - Updated Phase 5 status

**Created (2):**
1. `src/stores/__tests__/offline-progress.test.js` - Unit tests
2. `src/components/OfflineProgressNotification.vue` - UI component

---

*Implementation plan for SAVE-07: Offline Progress Calculation*
*Estimated time: 45-60 minutes*
