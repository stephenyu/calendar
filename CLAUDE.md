# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A TypeScript-based web calendar application. Users create customized yearly calendars with color-coded highlight periods, shareable via compressed URLs. Entirely client-side with no backend.

## Development Commands

```bash
npm run dev        # Compile TS, copy files, start Python server on port 8000
npm run build      # Production build to dist/ (minified)
npm test           # Run all tests
npm run test:watch # Tests in watch mode
npm run lint       # ESLint check
npm run lint:fix   # Auto-fix lint issues
npm run validate   # Lint + tests
```

Run a single test:
```bash
npm test -- path/to/test/file.test.ts
npm test -- -t "test name pattern"
```

### Dev Workflow Detail

`npm run dev` runs:
1. `npx tsc -p tsconfig.dev.json` → compiles `src/script-bundle.ts` to `dist/script-bundle.js`
2. Copies `dist/script-bundle.js` → `script.min.js` (no actual minification in dev)
3. Copies `src/style.css` → `style.min.css` (no actual minification in dev)
4. Starts `python3 -m http.server 8000`

After editing source files, rerun the tsc+copy steps and hard-refresh the browser (`Cmd+Shift+R`).

## Architecture — Two Parallel Implementations

**This is the most important thing to understand about this codebase.**

### 1. The Active Application: `src/script-bundle.ts`

`index.html` loads `./script.min.js`, which is compiled directly from `src/script-bundle.ts`. This file is **self-contained** — it has no imports from other `src/` files and inlines everything: type declarations, YAML parsing, date utilities, calendar rendering, drag selection, period management, URL compression, and DOM wiring.

**To change what users see, edit `src/script-bundle.ts` and rebuild.**

Both `tsconfig.dev.json` and `tsconfig.prod.json` use `src/script-bundle.ts` as their sole entry point.

### 2. The Modular Refactored Code (tested but not wired to `index.html`)

`src/CalendarApp.ts` and its subdirectories exist as a modular refactor but are **not loaded by `index.html`**:

- `src/core/CalendarGenerator.ts` — `normalizePeriods()`, `getColorsForDate()`
- `src/ui/CalendarRenderer.ts` — `createMonthTable()`, `createLegend()`
- `src/ui/DragSelector.ts`, `src/ui/PeriodEditor.ts`, `src/ui/ColorPicker.ts`
- `src/services/ConfigManager.ts`, `src/services/URLManager.ts`
- `src/utils/DateUtils.ts`, `src/utils/GradientUtils.ts`, `src/utils/YAMLPreprocessor.ts`
- `src/types.ts`, `src/opt.ts`

The tests in `__tests__/` cover these modular files. Changes to them do not affect the running application.

## Key Implementation Details

### URL Sharing
YAML config is compressed to a minimal JSON array format (years offset from 2024, date ranges as `[start, duration, color]`), then LZString-encoded into the URL hash. Restored on page load.

### Period Overlap / Gradients
When multiple highlight periods overlap on a date, `generateGradient()` blends all colors into a CSS gradient. A `usedPeriods` Set tracks which periods contributed to any cell (used for legend display).

### Calendar Layout (`script-bundle.ts`)
- Monday-first week layout
- Adjacent-month overflow dates rendered with class `out-of-month` (faded via CSS)
- Today's date gets class `today`
- Drag-to-select creates new highlight periods via mousedown/mouseover

### CSS Specificity
Day cell base styles use `.month-table tbody td` (specificity `0,1,2`). Overrides for variants like `out-of-month` or `today` must use `.month-table tbody td.<class>` to win.

### Date Handling
All dates parsed through `luxon.DateTime.fromISO()` and normalized to start-of-day before comparisons. Timezone defaults to system local.

## Code Style

- Single quotes, semicolons, 2-space indent
- `prefer const`, no unused vars (allow `_` prefix)
- No `console.log`, no `debugger`
- `.js` extensions in imports even for `.ts` source files (ES module resolution after compile)

## Commit Convention

```
feat(calendar): add PDF export
fix(modal): resolve color picker positioning
test(calendar): add leap year tests
```

## Deployment

- Target: GitHub Pages (`https://stephenyu.github.io/calendar/`)
- CI: `.github/workflows/ci.yml`
- Production build output: `dist/` (index.html, script.min.js, style.min.css — actually minified via terser/postcss)
