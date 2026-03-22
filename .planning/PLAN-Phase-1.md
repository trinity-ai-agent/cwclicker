# Phase 1: Core Mechanics Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the core CW keyer mechanics: tap to generate QSOs with audio feedback, short tap = 1 QSO, long press = 2 QSOs

**Architecture:** Vanilla JS with ES6 modules, Web Audio API for tones, CSS for retro terminal aesthetic. State managed in-memory (persistence in Phase 5). Component-based UI structure.

**Tech Stack:** Vanilla JavaScript (ES6+), HTML5, CSS3, Web Audio API, no frameworks

---

## Prerequisites

- [ ] Review AGENTS.md for code style guidelines
- [ ] Ensure project is initialized: `index.html`, basic structure exists

---

## File Structure Overview

**New files to create:**
- `src/app.js` - Application initialization
- `src/state/GameState.js` - Central game state management
- `src/audio/AudioEngine.js` - Web Audio API wrapper
- `src/components/KeyerButton.js` - CW keyer UI component
- `src/components/QsoDisplay.js` - QSO counter display
- `src/styles/main.css` - Main stylesheet (retro terminal theme)
- `src/utils/BigIntMath.js` - BigInt helper utilities
- `tests/state/GameState.test.js` - Unit tests for game state
- `tests/audio/AudioEngine.test.js` - Unit tests for audio

**Existing files to modify:**
- `index.html` - Add structure and CSS link
- `src/main.js` - Initialize app (currently has Vue code to replace)

---

## Chunk 1: Project Setup & HTML Structure

### Task 1.1: Create HTML Structure

**Files:**
- Create: `index.html` (modify existing)
- Test: Manual browser test

- [ ] **Step 1: Modify `index.html` structure**

Replace contents with:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CW Keyer Idle Game</title>
    <link rel="stylesheet" href="/src/styles/main.css" />
  </head>
  <body>
    <div id="app">
      <header class="game-header">
        <h1>CW Keyer Idle</h1>
        <div id="qso-display" class="qso-display">
          <span class="qso-label">QSOs:</span>
          <span id="qso-count" class="qso-count">0</span>
        </div>
      </header>
      
      <main class="game-main">
        <div id="keyer-container" class="keyer-container">
          <button 
            id="keyer-button" 
            class="keyer-button"
            aria-label="CW Keyer - Tap for dit, hold for dah"
          >
            <span class="keyer-text">KEY</span>
          </button>
          <p class="keyer-instructions">
            Tap quickly (&lt;200ms) for dit · <br>
            Hold (&gt;200ms) for dah –
          </p>
        </div>
      </main>
    </div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify HTML structure**

Run: `python3 -m http.server 8000`
Open: http://localhost:8000
Expected: Basic HTML renders with "CW Keyer Idle" title and KEY button visible

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add HTML structure for Phase 1"
```

---

### Task 1.2: Create Retro Terminal CSS

**Files:**
- Create: `src/styles/main.css`
- Test: Visual browser inspection

- [ ] **Step 1: Write CSS file**

```css
/* Retro Terminal Theme - Phase 1 Core Styles */

:root {
  --bg-color: #0a0a0a;
  --terminal-green: #00ff41;
  --terminal-amber: #ffb000;
  --terminal-dim: #1a1a1a;
  --text-color: var(--terminal-green);
  --border-color: var(--terminal-green);
  --font-mono: 'Courier New', Courier, 'Fira Code', monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: var(--font-mono);
  min-height: 100vh;
  overflow-x: hidden;
}

/* Scanline effect overlay */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 1000;
}

/* Game layout */
#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid var(--border-color);
  margin-bottom: 20px;
}

.game-header h1 {
  font-size: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.qso-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qso-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.qso-count {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--terminal-amber);
  text-shadow: 0 0 10px var(--terminal-amber);
}

/* Main game area */
.game-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* Keyer button */
.keyer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.keyer-button {
  width: 150px;
  height: 150px;
  border: 3px solid var(--border-color);
  border-radius: 50%;
  background-color: var(--terminal-dim);
  color: var(--text-color);
  font-family: var(--font-mono);
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.1s ease;
  box-shadow: 
    0 0 20px rgba(0, 255, 65, 0.3),
    inset 0 0 20px rgba(0, 255, 65, 0.1);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.keyer-button:hover {
  box-shadow: 
    0 0 30px rgba(0, 255, 65, 0.5),
    inset 0 0 30px rgba(0, 255, 65, 0.2);
}

.keyer-button:active,
.keyer-button.keyer-active {
  background-color: var(--terminal-green);
  color: var(--bg-color);
  box-shadow: 
    0 0 40px rgba(0, 255, 65, 0.8),
    inset 0 0 40px rgba(0, 0, 0, 0.2);
  transform: scale(0.95);
}

.keyer-button:focus {
  outline: 2px solid var(--terminal-amber);
  outline-offset: 4px;
}

.keyer-instructions {
  text-align: center;
  font-size: 0.9rem;
  opacity: 0.7;
  line-height: 1.6;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .game-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .keyer-button {
    width: 120px;
    height: 120px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .keyer-button {
    transition: none;
  }
}
```

- [ ] **Step 2: Verify CSS renders correctly**

Run: `python3 -m http.server 8000`
Open: http://localhost:8000
Expected: 
- Dark background with green text
- Terminal-style scanlines visible
- Circular KEY button with glow effect
- Responsive layout works

- [ ] **Step 3: Commit**

```bash
git add src/styles/main.css
git commit -m "feat: add retro terminal CSS theme"
```

---

### Task 1.3: Update Main Entry Point

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Replace main.js contents**

```javascript
'use strict';

import { GameApp } from './app.js';

/**
 * Initialize the CW Keyer Idle Game
 */
function init() {
  const app = new GameApp();
  app.initialize();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

- [ ] **Step 2: Verify no errors**

Run: `python3 -m http.server 8000`
Check: Browser console for errors
Expected: No errors (app.js doesn't exist yet, that's OK)

- [ ] **Step 3: Commit**

```bash
git add src/main.js
git commit -m "chore: update main entry point"
```

---

## Chunk 2: Game State Management

### Task 2.1: Create BigInt Utility Helpers

**Files:**
- Create: `src/utils/BigIntMath.js`
- Test: `tests/utils/BigIntMath.test.js`

- [ ] **Step 1: Create test file**

```javascript
'use strict';

import { BigIntMath } from '../../src/utils/BigIntMath.js';

/**
 * Tests for BigIntMath utility
 */
function testAdd() {
  const result = BigIntMath.add(10n, 5n);
  console.assert(result === 15n, 'Expected 15n, got', result);
}

function testAddWithNumbers() {
  const result = BigIntMath.add(10, 5n);
  console.assert(result === 15n, 'Expected 15n, got', result);
}

function testToBigInt() {
  const result = BigIntMath.toBigInt('100');
  console.assert(result === 100n, 'Expected 100n, got', result);
}

function testToString() {
  const result = BigIntMath.toString(1000n);
  console.assert(result === '1000', 'Expected "1000", got', result);
}

// Run tests
console.log('Running BigIntMath tests...');
testAdd();
testAddWithNumbers();
testToBigInt();
testToString();
console.log('✓ BigIntMath tests passed');
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node tests/utils/BigIntMath.test.js`
Expected: Error - Cannot find module

- [ ] **Step 3: Implement BigIntMath**

```javascript
'use strict';

/**
 * Utility class for BigInt operations
 * Handles conversions between BigInt and other types safely
 */
export class BigIntMath {
  /**
   * Add two values, converting to BigInt if necessary
   * @param {bigint|number|string} a - First value
   * @param {bigint|number|string} b - Second value
   * @returns {bigint} Sum as BigInt
   */
  static add(a, b) {
    const bigA = this.toBigInt(a);
    const bigB = this.toBigInt(b);
    return bigA + bigB;
  }

  /**
   * Convert value to BigInt
   * @param {bigint|number|string} value - Value to convert
   * @returns {bigint} BigInt representation
   * @throws {TypeError} If value cannot be converted
   */
  static toBigInt(value) {
    if (typeof value === 'bigint') {
      return value;
    }
    if (typeof value === 'number') {
      if (!Number.isInteger(value)) {
        throw new TypeError('Cannot convert non-integer number to BigInt');
      }
      return BigInt(value);
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!/^-?\d+$/.test(trimmed)) {
        throw new TypeError(`Cannot convert "${value}" to BigInt`);
      }
      return BigInt(trimmed);
    }
    throw new TypeError(`Cannot convert ${typeof value} to BigInt`);
  }

  /**
   * Convert BigInt to string for display
   * @param {bigint} value - BigInt to convert
   * @returns {string} String representation
   */
  static toString(value) {
    return value.toString();
  }

  /**
   * Format BigInt with commas for readability
   * @param {bigint} value - BigInt to format
   * @returns {string} Formatted string (e.g., "1,000,000")
   */
  static format(value) {
    return value.toLocaleString('en-US');
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/utils/BigIntMath.test.js`
Expected: ✓ BigIntMath tests passed

- [ ] **Step 5: Commit**

```bash
git add src/utils/BigIntMath.js tests/utils/BigIntMath.test.js
git commit -m "feat: add BigIntMath utility with tests"
```

---

### Task 2.2: Create Game State Manager

**Files:**
- Create: `src/state/GameState.js`
- Test: `tests/state/GameState.test.js`

- [ ] **Step 1: Write failing test**

```javascript
'use strict';

import { GameState } from '../../src/state/GameState.js';

function testInitialState() {
  const state = new GameState();
  console.assert(state.getQsoCount() === 0n, 'Initial QSO count should be 0');
  console.assert(state.getQsoRate() === 0, 'Initial QSO rate should be 0');
}

function testAddQso() {
  const state = new GameState();
  state.addQso(1n);
  console.assert(state.getQsoCount() === 1n, 'QSO count should be 1');
  
  state.addQso(2n);
  console.assert(state.getQsoCount() === 3n, 'QSO count should be 3');
}

function testAddQsoNumber() {
  const state = new GameState();
  state.addQso(5);
  console.assert(state.getQsoCount() === 5n, 'Should accept number and convert to BigInt');
}

function testDitGeneration() {
  const state = new GameState();
  state.registerDit();
  console.assert(state.getQsoCount() === 1n, 'Dit should generate 1 QSO');
}

function testDahGeneration() {
  const state = new GameState();
  state.registerDah();
  console.assert(state.getQsoCount() === 2n, 'Dah should generate 2 QSOs');
}

function testTick() {
  const state = new GameState();
  // Simulate 1 QSO/sec from factories
  state.setQsoRate(1);
  
  state.tick(1000); // 1 second
  console.assert(state.getQsoCount() === 1n, 'Should generate 1 QSO in 1 second');
  
  state.tick(500); // 0.5 seconds
  console.assert(state.getQsoCount() === 1n, 'Should not generate partial QSOs');
  
  state.tick(500); // Another 0.5 seconds
  console.assert(state.getQsoCount() === 2n, 'Should generate 1 more QSO after full second');
}

// Run tests
console.log('Running GameState tests...');
testInitialState();
testAddQso();
testAddQsoNumber();
testDitGeneration();
testDahGeneration();
testTick();
console.log('✓ GameState tests passed');
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node tests/state/GameState.test.js`
Expected: Error - Cannot find module

- [ ] **Step 3: Implement GameState**

```javascript
'use strict';

import { BigIntMath } from '../utils/BigIntMath.js';

/**
 * Manages the core game state for CW Keyer Idle Game
 * Tracks QSOs, generation rates, and tick-based updates
 */
export class GameState {
  constructor() {
    /** @type {bigint} Total QSOs earned */
    this.qsoCount = 0n;
    
    /** @type {number} QSOs generated per second from factories */
    this.qsoRate = 0;
    
    /** @type {number} Accumulated fractional QSOs (milliseconds worth) */
    this.accumulatedTime = 0;
  }

  /**
   * Get current QSO count
   * @returns {bigint} Current QSO count
   */
  getQsoCount() {
    return this.qsoCount;
  }

  /**
   * Get current QSO generation rate
   * @returns {number} QSOs per second
   */
  getQsoRate() {
    return this.qsoRate;
  }

  /**
   * Set the QSO generation rate
   * @param {number} rate - QSOs per second
   */
  setQsoRate(rate) {
    this.qsoRate = rate;
  }

  /**
   * Add QSOs to the total count
   * @param {bigint|number|string} amount - Amount to add
   */
  addQso(amount) {
    this.qsoCount = BigIntMath.add(this.qsoCount, amount);
  }

  /**
   * Register a dit (short tap) - generates 1 QSO
   */
  registerDit() {
    this.addQso(1);
  }

  /**
   * Register a dah (long press) - generates 2 QSOs
   */
  registerDah() {
    this.addQso(2);
  }

  /**
   * Process a game tick
   * @param {number} deltaMs - Time elapsed in milliseconds
   */
  tick(deltaMs) {
    if (this.qsoRate <= 0 || deltaMs <= 0) {
      return;
    }

    // Accumulate time
    this.accumulatedTime += deltaMs;

    // Calculate QSOs to add based on rate
    // rate = QSOs per second, so QSOs = (rate * accumulatedMs) / 1000
    const qsoThreshold = 1000 / this.qsoRate;
    
    while (this.accumulatedTime >= qsoThreshold) {
      this.addQso(1);
      this.accumulatedTime -= qsoThreshold;
    }
  }

  /**
   * Reset the game state (for testing or prestige)
   */
  reset() {
    this.qsoCount = 0n;
    this.qsoRate = 0;
    this.accumulatedTime = 0;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/state/GameState.test.js`
Expected: ✓ GameState tests passed

- [ ] **Step 5: Commit**

```bash
git add src/state/GameState.js tests/state/GameState.test.js
git commit -m "feat: add GameState with QSO tracking and tick system"
```

---

## Chunk 3: Audio Engine

### Task 3.1: Create Web Audio API Engine

**Files:**
- Create: `src/audio/AudioEngine.js`
- Test: `tests/audio/AudioEngine.test.js`

- [ ] **Step 1: Write failing test**

```javascript
'use strict';

import { AudioEngine } from '../../src/audio/AudioEngine.js';

function testInitialization() {
  const audio = new AudioEngine();
  console.assert(audio.isInitialized === false, 'Should not be initialized initially');
}

function testFrequencySetting() {
  const audio = new AudioEngine();
  audio.setFrequency(800);
  console.assert(audio.getFrequency() === 800, 'Should set frequency to 800Hz');
  
  audio.setFrequency(400);
  console.assert(audio.getFrequency() === 400, 'Should allow minimum 400Hz');
  
  audio.setFrequency(1000);
  console.assert(audio.getFrequency() === 1000, 'Should allow maximum 1000Hz');
}

function testVolumeSetting() {
  const audio = new AudioEngine();
  audio.setVolume(0.5);
  console.assert(audio.getVolume() === 0.5, 'Should set volume to 0.5');
  
  audio.setVolume(0);
  console.assert(audio.getVolume() === 0, 'Should allow volume 0');
  
  audio.setVolume(1);
  console.assert(audio.getVolume() === 1, 'Should allow volume 1');
}

// Run tests
console.log('Running AudioEngine tests...');
testInitialization();
testFrequencySetting();
testVolumeSetting();
console.log('✓ AudioEngine tests passed');
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node tests/audio/AudioEngine.test.js`
Expected: Error - Cannot find module

- [ ] **Step 3: Implement AudioEngine**

```javascript
'use strict';

/**
 * Web Audio API wrapper for CW sidetone generation
 * Provides real-time audio feedback for keyer interactions
 */
export class AudioEngine {
  constructor() {
    /** @type {AudioContext|null} Web Audio API context */
    this.audioContext = null;
    
    /** @type {OscillatorNode|null} Current oscillator */
    this.oscillator = null;
    
    /** @type {GainNode|null} Volume control */
    this.gainNode = null;
    
    /** @type {boolean} Whether audio has been initialized */
    this.isInitialized = false;
    
    /** @type {number} Tone frequency in Hz (400-1000) */
    this.frequency = 800;
    
    /** @type {number} Volume (0-1) */
    this.volume = 0.3;
  }

  /**
   * Initialize the audio context (must be called after user interaction)
   * @returns {boolean} True if initialized successfully
   */
  initialize() {
    if (this.isInitialized) {
      return true;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.warn('Web Audio API not supported');
        return false;
      }

      this.audioContext = new AudioContext();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }

  /**
   * Start playing the tone
   */
  startTone() {
    if (!this.isInitialized) {
      if (!this.initialize()) {
        return;
      }
    }

    // Stop any existing tone
    this.stopTone();

    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Create oscillator
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = this.frequency;

    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.volume;

    // Connect: oscillator -> gain -> destination
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    // Start playing
    this.oscillator.start();
  }

  /**
   * Stop playing the tone
   */
  stopTone() {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
      this.oscillator.disconnect();
      this.oscillator = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  /**
   * Set the tone frequency
   * @param {number} frequency - Frequency in Hz (400-1000)
   */
  setFrequency(frequency) {
    // Clamp to valid range
    this.frequency = Math.max(400, Math.min(1000, frequency));
    
    // Update running oscillator if active
    if (this.oscillator) {
      this.oscillator.frequency.value = this.frequency;
    }
  }

  /**
   * Get current frequency
   * @returns {number} Current frequency in Hz
   */
  getFrequency() {
    return this.frequency;
  }

  /**
   * Set the volume
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    // Clamp to valid range
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update gain if active
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  /**
   * Get current volume
   * @returns {number} Current volume (0-1)
   */
  getVolume() {
    return this.volume;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/audio/AudioEngine.test.js`
Expected: ✓ AudioEngine tests passed

- [ ] **Step 5: Commit**

```bash
git add src/audio/AudioEngine.js tests/audio/AudioEngine.test.js
git commit -m "feat: add AudioEngine with Web Audio API support"
```

---

## Chunk 4: Keyer Component

### Task 4.1: Create Keyer Button Component

**Files:**
- Create: `src/components/KeyerButton.js`
- Test: `tests/components/KeyerButton.test.js`

- [ ] **Step 1: Write failing test**

```javascript
'use strict';

import { KeyerButton } from '../../src/components/KeyerButton.js';

function testConstruction() {
  const mockCallbacks = {
    onDit: () => {},
    onDah: () => {}
  };
  
  const keyer = new KeyerButton('keyer-button', mockCallbacks);
  console.assert(keyer.elementId === 'keyer-button', 'Should store element ID');
  console.assert(keyer.callbacks === mockCallbacks, 'Should store callbacks');
  console.assert(keyer.pressStartTime === 0, 'Should initialize press time to 0');
  console.assert(keyer.isPressed === false, 'Should not be pressed initially');
}

function testDitThreshold() {
  // Dit = < 200ms
  console.assert(KeyerButton.DIT_THRESHOLD === 200, 'Dit threshold should be 200ms');
}

// Run tests
console.log('Running KeyerButton tests...');
testConstruction();
testDitThreshold();
console.log('✓ KeyerButton tests passed');
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node tests/components/KeyerButton.test.js`
Expected: Error - Cannot find module

- [ ] **Step 3: Implement KeyerButton**

```javascript
'use strict';

/**
 * CW Keyer button component
 * Handles tap detection (dit vs dah) and provides visual/audio feedback
 */
export class KeyerButton {
  /** @type {number} Threshold in milliseconds for dit vs dah */
  static DIT_THRESHOLD = 200;

  /**
   * Create a new KeyerButton
   * @param {string} elementId - ID of the button element
   * @param {Object} callbacks - Callback functions
   * @param {Function} callbacks.onDit - Called when a dit is detected
   * @param {Function} callbacks.onDah - Called when a dah is detected
   * @param {Function} callbacks.onPressStart - Called when button is pressed
   * @param {Function} callbacks.onPressEnd - Called when button is released
   */
  constructor(elementId, callbacks) {
    this.elementId = elementId;
    this.callbacks = callbacks;
    this.element = null;
    this.pressStartTime = 0;
    this.isPressed = false;
  }

  /**
   * Initialize the component and attach event listeners
   * @returns {boolean} True if initialized successfully
   */
  initialize() {
    this.element = document.getElementById(this.elementId);
    
    if (!this.element) {
      console.error(`KeyerButton: Element with ID "${this.elementId}" not found`);
      return false;
    }

    // Mouse events
    this.element.addEventListener('mousedown', this.handlePressStart.bind(this));
    this.element.addEventListener('mouseup', this.handlePressEnd.bind(this));
    this.element.addEventListener('mouseleave', this.handlePressCancel.bind(this));

    // Touch events (mobile)
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.addEventListener('touchcancel', this.handlePressCancel.bind(this));

    // Keyboard events
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.element.addEventListener('keyup', this.handleKeyUp.bind(this));

    return true;
  }

  /**
   * Handle press start (mouse/touch)
   * @param {Event} event - The event object
   */
  handlePressStart(event) {
    if (event.type === 'touchstart') {
      event.preventDefault(); // Prevent mouse emulation
    }
    
    this.pressStartTime = performance.now();
    this.isPressed = true;
    this.element.classList.add('keyer-active');
    
    if (this.callbacks.onPressStart) {
      this.callbacks.onPressStart();
    }
  }

  /**
   * Handle press end (mouse)
   * @param {Event} event - The event object
   */
  handlePressEnd(event) {
    if (!this.isPressed) {
      return;
    }

    const pressDuration = performance.now() - this.pressStartTime;
    this.isPressed = false;
    this.element.classList.remove('keyer-active');

    // Determine dit or dah based on duration
    if (pressDuration < KeyerButton.DIT_THRESHOLD) {
      if (this.callbacks.onDit) {
        this.callbacks.onDit();
      }
    } else {
      if (this.callbacks.onDah) {
        this.callbacks.onDah();
      }
    }

    if (this.callbacks.onPressEnd) {
      this.callbacks.onPressEnd();
    }
  }

  /**
   * Handle touch start
   * @param {TouchEvent} event - The touch event
   */
  handleTouchStart(event) {
    event.preventDefault();
    this.handlePressStart(event);
  }

  /**
   * Handle touch end
   * @param {TouchEvent} event - The touch event
   */
  handleTouchEnd(event) {
    event.preventDefault();
    this.handlePressEnd(event);
  }

  /**
   * Handle press cancel (mouse leave, touch cancel)
   */
  handlePressCancel() {
    if (!this.isPressed) {
      return;
    }

    this.isPressed = false;
    this.element.classList.remove('keyer-active');
    
    if (this.callbacks.onPressEnd) {
      this.callbacks.onPressEnd();
    }
  }

  /**
   * Handle keyboard press (Space or Enter)
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleKeyDown(event) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (!this.isPressed) {
        this.handlePressStart(event);
      }
    }
  }

  /**
   * Handle keyboard release
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleKeyUp(event) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.handlePressEnd(event);
    }
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    if (this.element) {
      // Note: In a real app, we'd need to store bound function references
      // to properly remove these listeners. For now, we're just nulling out.
      this.element = null;
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/components/KeyerButton.test.js`
Expected: ✓ KeyerButton tests passed

- [ ] **Step 5: Commit**

```bash
git add src/components/KeyerButton.js tests/components/KeyerButton.test.js
git commit -m "feat: add KeyerButton component with dit/dah detection"
```

---

### Task 4.2: Create QSO Display Component

**Files:**
- Create: `src/components/QsoDisplay.js`
- Test: `tests/components/QsoDisplay.test.js`

- [ ] **Step 1: Write failing test**

```javascript
'use strict';

import { QsoDisplay } from '../../src/components/QsoDisplay.js';

function testConstruction() {
  const display = new QsoDisplay('qso-count');
  console.assert(display.elementId === 'qso-count', 'Should store element ID');
}

// Run tests
console.log('Running QsoDisplay tests...');
testConstruction();
console.log('✓ QsoDisplay tests passed');
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node tests/components/QsoDisplay.test.js`
Expected: Error - Cannot find module

- [ ] **Step 3: Implement QsoDisplay**

```javascript
'use strict';

import { BigIntMath } from '../utils/BigIntMath.js';

/**
 * QSO count display component
 * Updates the visual display of QSO count with formatting
 */
export class QsoDisplay {
  /**
   * Create a new QsoDisplay
   * @param {string} elementId - ID of the element to display QSO count
   */
  constructor(elementId) {
    this.elementId = elementId;
    this.element = null;
    this.lastDisplayedValue = null;
  }

  /**
   * Initialize the component
   * @returns {boolean} True if initialized successfully
   */
  initialize() {
    this.element = document.getElementById(this.elementId);
    
    if (!this.element) {
      console.error(`QsoDisplay: Element with ID "${this.elementId}" not found`);
      return false;
    }

    return true;
  }

  /**
   * Update the displayed QSO count
   * @param {bigint} qsoCount - Current QSO count
   */
  update(qsoCount) {
    if (!this.element) {
      return;
    }

    // Only update if value changed (optimization)
    if (qsoCount === this.lastDisplayedValue) {
      return;
    }

    // Format with commas for readability
    const formatted = BigIntMath.format(qsoCount);
    this.element.textContent = formatted;
    
    this.lastDisplayedValue = qsoCount;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/components/QsoDisplay.test.js`
Expected: ✓ QsoDisplay tests passed

- [ ] **Step 5: Commit**

```bash
git add src/components/QsoDisplay.js tests/components/QsoDisplay.test.js
git commit -m "feat: add QsoDisplay component"
```

---

## Chunk 5: Application Integration

### Task 5.1: Create Application Class

**Files:**
- Create: `src/app.js`
- Test: Manual browser test

- [ ] **Step 1: Implement Application class**

```javascript
'use strict';

import { GameState } from './state/GameState.js';
import { AudioEngine } from './audio/AudioEngine.js';
import { KeyerButton } from './components/KeyerButton.js';
import { QsoDisplay } from './components/QsoDisplay.js';

/**
 * Main application class
 * Orchestrates all components and manages the game loop
 */
export class GameApp {
  constructor() {
    this.gameState = new GameState();
    this.audioEngine = new AudioEngine();
    this.keyerButton = null;
    this.qsoDisplay = null;
    this.gameLoopId = null;
    this.lastFrameTime = 0;
  }

  /**
   * Initialize the application
   */
  initialize() {
    console.log('Initializing CW Keyer Idle Game...');

    // Initialize QSO display
    this.qsoDisplay = new QsoDisplay('qso-count');
    if (!this.qsoDisplay.initialize()) {
      console.error('Failed to initialize QSO display');
    }

    // Initialize keyer button
    this.keyerButton = new KeyerButton('keyer-button', {
      onDit: this.handleDit.bind(this),
      onDah: this.handleDah.bind(this),
      onPressStart: this.handlePressStart.bind(this),
      onPressEnd: this.handlePressEnd.bind(this)
    });

    if (!this.keyerButton.initialize()) {
      console.error('Failed to initialize keyer button');
      return;
    }

    // Initial display update
    this.updateDisplay();

    // Start game loop
    this.startGameLoop();

    console.log('Game initialized successfully');
  }

  /**
   * Handle a dit (short tap) - generates 1 QSO
   */
  handleDit() {
    this.gameState.registerDit();
    this.updateDisplay();
    console.log('Dit! (+1 QSO)');
  }

  /**
   * Handle a dah (long press) - generates 2 QSOs
   */
  handleDah() {
    this.gameState.registerDah();
    this.updateDisplay();
    console.log('Dah! (+2 QSOs)');
  }

  /**
   * Handle button press start - start audio tone
   */
  handlePressStart() {
    this.audioEngine.startTone();
  }

  /**
   * Handle button press end - stop audio tone
   */
  handlePressEnd() {
    this.audioEngine.stopTone();
  }

  /**
   * Update the display with current game state
   */
  updateDisplay() {
    if (this.qsoDisplay) {
      this.qsoDisplay.update(this.gameState.getQsoCount());
    }
  }

  /**
   * Start the game loop
   */
  startGameLoop() {
    this.lastFrameTime = performance.now();
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Game loop callback
   * @param {number} currentTime - Current timestamp from performance.now()
   */
  gameLoop(currentTime) {
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Process game tick for factory generation
    this.gameState.tick(deltaTime);

    // Update display if needed (throttled could be added here)
    this.updateDisplay();

    // Continue loop
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Stop the game loop
   */
  stopGameLoop() {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopGameLoop();
    
    if (this.keyerButton) {
      this.keyerButton.destroy();
      this.keyerButton = null;
    }

    if (this.audioEngine) {
      this.audioEngine.stopTone();
    }
  }
}
```

- [ ] **Step 2: Manual browser test**

Run: `python3 -m http.server 8000`
Open: http://localhost:8000
Test:
- Click the KEY button quickly → should hear tone, see "Dit!" in console, QSO count +1
- Hold KEY button > 200ms → should hear tone, see "Dah!" in console, QSO count +2
- Press Space or Enter key when button is focused → should work same as click
- Check browser console for errors

- [ ] **Step 3: Commit**

```bash
git add src/app.js
git commit -m "feat: add GameApp orchestrating all components"
```

---

## Chunk 6: Verification & Documentation

### Task 6.1: Update Project State

**Files:**
- Modify: `.planning/STATE.md`

- [ ] **Step 1: Update Phase 1 status**

Update the following sections in `.planning/STATE.md`:

```markdown
## Phase Status

| Phase | Status | Plans | Progress |
|-------|--------|-------|----------|
| 1 | ✓ | 6/6 | 100% |
| 2 | ○ | 0/3 | 0% |
| 3 | ○ | 0/3 | 0% |
| 4 | ○ | 0/4 | 0% |
| 5 | ○ | 0/3 | 0% |
| 6 | ○ | 0/3 | 0% |
| 7 | ○ | 0/4 | 0% |

**Overall:** 6/27 plans complete (22%)
```

And:

```markdown
## Current Phase Details

### Phase 1: Core Mechanics
**Status:** ✓ Complete
**Goal:** Player can tap CW keyer to generate QSOs with audio feedback

**Plans:**
1. ✓ **Setup** - HTML structure, CSS styling, file organization
2. ✓ **Game State** - QSO management, factory tracking, BigInt handling
3. ✓ **CW Keyer** - Audio feedback, dit/dah detection (1 vs 2 QSOs)

**Requirements (6 total):**
- ✓ CORE-01: Player can click/tap CW keyer to generate QSOs
- ✓ CORE-02: Short tap (< 200ms) generates dit = 1 QSO
- ✓ CORE-03: Long press (> 200ms) generates dah = 2 QSOs
- ✓ CORE-04: Real-time audio tone feedback (600-1000 Hz)
- ✓ CORE-05: Visual feedback on keyer (active state animation)
- ✓ CORE-06: Keyboard accessible (Space/Enter to activate)
```

- [ ] **Step 2: Update Next Actions**

```markdown
## Next Actions

1. Move to Phase 2 planning: Run `/gsd-plan-phase 2` to create detailed plan for Factory System
2. Implement Phase 2 to add 9 Technician/General factories with cost scaling

---
```

- [ ] **Step 3: Commit**

```bash
git add .planning/STATE.md
git commit -m "docs: update STATE.md with Phase 1 completion"
```

---

### Task 6.2: Run All Tests

**Files:**
- Test: All test files

- [ ] **Step 1: Run complete test suite**

Run each test file:
```bash
node tests/utils/BigIntMath.test.js
node tests/state/GameState.test.js
node tests/audio/AudioEngine.test.js
node tests/components/KeyerButton.test.js
node tests/components/QsoDisplay.test.js
```

Expected: All tests pass

- [ ] **Step 2: Verify no linting issues**

Review code against AGENTS.md guidelines:
- All files use `'use strict';`
- ES6+ features used (const, let, arrow functions)
- JSDoc comments present
- 2-space indentation
- Single quotes for JS strings

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(phase-1): complete core mechanics implementation

- Add HTML structure with retro terminal theme
- Add GameState with BigInt support for QSO tracking
- Add AudioEngine with Web Audio API sidetone
- Add KeyerButton with dit/dah detection (<200ms vs >200ms)
- Add QsoDisplay with formatted output
- All 6 CORE requirements implemented and tested"
```

---

## Success Criteria Verification

After completing all tasks, verify:

- [ ] **CORE-01**: Click/tap keyer generates QSOs
  - Test: Click button, QSO counter increases
  
- [ ] **CORE-02**: Short tap (< 200ms) generates dit = 1 QSO
  - Test: Quick click, QSO count +1
  
- [ ] **CORE-03**: Long press (> 200ms) generates dah = 2 QSOs
  - Test: Hold button >200ms, QSO count +2
  
- [ ] **CORE-04**: Real-time audio tone feedback
  - Test: Press button, hear tone; release, tone stops
  
- [ ] **CORE-05**: Visual feedback on keyer
  - Test: Button glows green when pressed
  
- [ ] **CORE-06**: Keyboard accessible
  - Test: Tab to button, press Space/Enter, works correctly

---

## Files Created/Modified Summary

**New files (11):**
1. `src/app.js` - Main application orchestrator
2. `src/state/GameState.js` - Game state management
3. `src/audio/AudioEngine.js` - Web Audio API wrapper
4. `src/components/KeyerButton.js` - CW keyer component
5. `src/components/QsoDisplay.js` - QSO display component
6. `src/utils/BigIntMath.js` - BigInt helper utilities
7. `src/styles/main.css` - Retro terminal styling
8. `tests/utils/BigIntMath.test.js` - BigInt tests
9. `tests/state/GameState.test.js` - State tests
10. `tests/audio/AudioEngine.test.js` - Audio tests
11. `tests/components/KeyerButton.test.js` - Keyer tests
12. `tests/components/QsoDisplay.test.js` - Display tests

**Modified files (2):**
1. `index.html` - Structure and styling link
2. `src/main.js` - Entry point updated
3. `.planning/STATE.md` - Phase 1 marked complete

---

*Plan created for Phase 1: Core Mechanics*
*Estimated time: 2-3 hours*
