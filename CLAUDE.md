# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A TypeScript-based web calendar application with YAML configuration support. Users can create customized yearly calendars with color-coded highlight periods, shareable via compressed URLs. The application is entirely client-side with no backend.

## Core Technologies

- **TypeScript**: Primary development language (ES2020 target, UMD module format)
- **Dependencies**: js-yaml (YAML parsing), luxon (date handling)
- **Build Tools**: terser (JS minification), postcss-cli with cssnano (CSS minification)
- **Testing**: Jest with jsdom environment, ts-jest for TypeScript support
- **Linting**: ESLint with TypeScript support and Standard config

## Development Commands

### Common Workflows
- `npm run dev` - Compile TypeScript, copy files, start Python dev server on port 8000
- `npm run build` - Production build to dist/ folder (tries TypeScript first, falls back to JavaScript)
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Check TypeScript and JavaScript code quality
- `npm run lint:fix` - Auto-fix linting issues
- `npm run validate` - Run both linting and tests
- `npm run clean` - Remove build artifacts

### Running Single Tests
```bash
npm test -- path/to/test/file.test.js
npm test -- -t "test name pattern"
```

## Architecture

### Module Structure

**src/types.ts** - Central type definitions for entire application:
- `CalendarConfig`: Top-level YAML configuration structure
- `HighlightPeriod`: Individual date ranges/dates with colors
- `NormalizedPeriod`: Internal representation with parsed dates and ordering
- `CompressedData`: Array-based format for URL compression
- Constants: MONTH_NAMES, DAY_NAMES, MONTH_ROWS

**src/script.ts** (main entry point) - Calendar rendering and DOM manipulation:
- DOM event handlers (color picker modal, save button)
- `generateCalendar()`: Main rendering function that creates yearly calendar HTML
- `normalizePeriods()`: Converts HighlightPeriod to NormalizedPeriod with parsed dates
- Date highlighting logic and overlap handling (gradients for overlapping periods)
- Legend generation for labeled periods
- URL state management (load/save from hash)

**src/script-bundle.ts** - Bundled version that includes opt.ts for self-contained builds

**src/opt.ts** - YAML compression/decompression utilities:
- `compressYAML()`: Converts YAML to compact JSON array format
- `decompressYAML()`: Converts compressed format back to YAML
- Uses LZString for additional URL-safe compression
- Date compression uses Unix timestamp division for space efficiency

### Build System

**scripts/build.js** - Node.js build script:
1. Attempts TypeScript compilation (tsconfig.prod.json)
2. Falls back to JavaScript if TypeScript fails
3. Minifies with terser (JavaScript) and postcss (CSS)
4. Copies HTML and LICENSE to dist/
5. Creates serve.js for local testing

**TypeScript Configuration**:
- `tsconfig.json`: Main config (ES2020, UMD output, strict type checking)
- `tsconfig.dev.json`: Development build (excludes tests)
- `tsconfig.prod.json`: Production build (likely has production-specific settings)

### Date Handling

The application uses **luxon** for timezone-aware date parsing:
- All dates parsed through `luxon.DateTime.fromISO()` with optional timezone
- Timezone defaults to system local timezone
- Dates normalized to start-of-day for consistent comparisons
- Month indices in JavaScript: 0 (January) to 11 (December)

### URL Compression Strategy

1. Parse YAML configuration
2. Compress to minimal JSON array format (years offset from 2024, date ranges as [start, duration, color])
3. Apply LZString compression for URL encoding
4. Store in URL hash for shareable links
5. Reverse process on page load to restore configuration

## Code Style Requirements

### TypeScript Rules (ESLint)
- Single quotes, semicolons required
- 2-space indentation
- No unused variables (allow `_` prefix for intentionally unused)
- No `console.log` (warn level) or `debugger` statements
- Prefer const over let
- No `any` type allowed (relaxed in this project)
- JSDoc not required for TypeScript (types are self-documenting)

### Commit Convention
Follow Conventional Commits format:
```
type(scope): description

feat(calendar): add PDF export
fix(modal): resolve color picker positioning
docs(readme): update installation instructions
test(calendar): add leap year tests
```

## Testing

- Test environment: jsdom (simulates browser DOM)
- Test files: `__tests__/**/*.test.js` or `__tests__/**/*.test.ts`
- Setup file: `jest.setup.js` (runs before each test)
- Module alias: `@/` maps to `src/`
- Global mocks: jsyaml, LZString available in tests

### Test Coverage Expectations
- Maintain above 80% coverage (per CONTRIBUTING.md)
- Include positive and negative test cases
- Mock external dependencies (js-yaml, LZString, luxon)

## Key Implementation Details

### Period Overlap Handling
When multiple highlight periods overlap on a single date:
1. Periods are normalized and assigned order indices
2. Overlapping dates receive gradient backgrounds blending all applicable colors
3. `usedPeriods` Set tracks which periods contributed to the calendar

### Color Picker Feature
- Triggered by typing `#` in YAML config textarea
- Opens modal with native HTML color input
- Inserts selected hex color at cursor position
- Modal closable via X button or clicking outside

### Calendar Generation Flow
1. Parse YAML config with js-yaml
2. Validate years array and highlightPeriods
3. Normalize periods (parse dates, assign order)
4. Generate year containers
5. For each year: create 4x3 month grid
6. For each month: create calendar table with day cells
7. Apply colors/gradients to highlighted dates
8. Generate legend for labeled periods
9. Track which periods were actually used

## Deployment

- **Target**: GitHub Pages (https://stephenyu.github.io/calendar/)
- **CI**: GitHub Actions workflow at `.github/workflows/ci.yml`
- **Build Output**: All production files in `dist/` folder (index.html, script.min.js, style.min.css)
- **Server**: Run `npm run serve:dist` to test built application locally

## Important Patterns

### Date Comparison
Always normalize dates to start-of-day using luxon before comparisons:
```typescript
const date = luxon.DateTime.fromISO(dateStr).startOf('day').toJSDate();
```

### TypeScript Import Paths
Use `.js` extensions in imports even though source files are `.ts`:
```typescript
import { CalendarConfig } from './types.js';
```
This ensures compatibility with ES module resolution after compilation.

### Build Fallback Strategy
The build script attempts TypeScript compilation first, then falls back to JavaScript if it fails. This dual-source approach maintains backward compatibility during migration.
