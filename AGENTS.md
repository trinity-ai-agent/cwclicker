# AI Agent Guidelines for CW Keyer Idle Game

This file provides instructions for any agentic AI system working on this project. By following these guidelines, you will ensure high code quality, consistency, and alignment with the project's vanilla web stack.

## 1. Project Overview

**CW Keyer Idle Game** is a browser-based single-player idle game featuring a ham radio theme. Players tap a Morse code keyer to earn QSOs, which they spend on factories and licenses.
- **Tech Stack**: Vanilla JavaScript (ES6+), HTML5, CSS3, Web Audio API, `localStorage`.
- **Architecture**: No build step, no framework (React/Vue/Svelte are out of scope), no backend.
- **Key Modules**: Game Loop (`requestAnimationFrame`), Audio Context (lazy init), State/Storage Manager, UI/DOM Updater.

## 2. Build, Run, and Test Commands

Since this is a zero-build vanilla project, there is no standard `package.json` setup out of the box. Follow these practices:

### Running the Application
Serve the root directory using any local web server:
- Python: `python3 -m http.server 8000`
- Node/npx: `npx serve .` or `npx live-server`
- Avoid accessing `index.html` via `file://` protocol to prevent CORS issues with ES6 modules or Web Audio API.

### Linting & Formatting
No automated linters are currently installed. You must act as the linter:
- Ensure there are no unused variables.
- Ensure strict formatting according to the guidelines below.

### Testing
There is no automated test suite by default.
- If you are tasked with verifying pure logic (e.g., cost scaling math or factory generation), write a temporary pure Node.js script to log assertions, run it via `node temp-test.js`, and remove it once verified.
- For UI or Audio testing, you must rely on careful DOM construction and mock `window` APIs if attempting to run logic headlessly.

## 3. Code Style Guidelines

### 3.1 JavaScript Standards
- **Strict Mode**: Always use `"use strict";` at the top of JS files.
- **ES6+ Features**: Use `const` and `let` (never `var`). Use arrow functions, destructuring, template literals, and default parameters.
- **Modularity**: Use ES6 modules (`import` / `export`) to keep code organized. Separate concerns into logical files (e.g., `state.js`, `audio.js`, `ui.js`, `engine.js`).

### 3.2 Typing and Documentation
- Since there is no TypeScript, use **JSDoc** comments extensively for all functions, classes, and complex data structures. 
- Example:
  ```javascript
  /**
   * Calculates the cost of the next factory.
   * @param {number} baseCost - The initial cost of the factory.
   * @param {number} owned - The number of factories currently owned.
   * @returns {number} The cost of the next factory.
   */
  ```

### 3.3 Naming Conventions
- **Variables & Functions**: Use `camelCase` (e.g., `generateQso`, `isAudioEnabled`).
- **Classes**: Use `PascalCase` (e.g., `FactoryManager`, `GameLoop`).
- **Constants**: Use `UPPER_SNAKE_CASE` (e.g., `BASE_TICK_RATE`, `MAX_OFFLINE_HOURS`).
- **DOM Elements**: Prefix with `$` or use a clear descriptive name (e.g., `$keyerButton`, `qsoCounterDisplay`).

### 3.4 Formatting
- **Indentation**: 2 spaces.
- **Quotes**: Single quotes (`'`) for JS strings, double quotes (`"`) for HTML attributes.
- **Semicolons**: Always use semicolons.
- **Braces**: Always use braces for `if`/`else` statements, even for single lines.

### 3.5 Error Handling & Storage
- **localStorage**: Wrap all `localStorage` reads and writes in `try/catch` blocks. Browsers can throw `QuotaExceededError` or disable storage entirely in private modes.
- **Graceful Degradation**: If storage fails, log a warning to the console and allow the game to continue in memory.

### 3.6 DOM Manipulation & UI
- Prefer `document.querySelector` and `document.getElementById`.
- To attach events, use `addEventListener` rather than inline HTML attributes (e.g., `onclick`).
- Batch DOM updates when possible. Do not update the DOM on every `requestAnimationFrame` tick if the value hasn't changed. Throttle UI updates to improve performance.

### 3.7 Performance Considerations
- **Big Numbers**: Use JS `BigInt` or a custom string math approach for large QSO numbers, as idle games can easily exceed `Number.MAX_SAFE_INTEGER`.
- **Audio Context**: Browsers block autoplaying audio. Initialize the `AudioContext` only *after* the user's first interaction (click/touchstart).

## 4. Agent Operational Directives

- **Plan First**: Consult `.planning/` documents (e.g., `ROADMAP.md`, `REQUIREMENTS.md`) before writing code.
- **Incremental Changes**: Make small, verifiable changes. Do not rewrite large chunks of the architecture unless requested.
- **No Extraneous Dependencies**: Do NOT add npm packages or external libraries unless specifically instructed. The constraints specify Vanilla JS only.
- **Follow the Constraints**: This game is meant to be a humorous, simple clicker. Keep the code simple and readable. Don't overengineer abstractions.
