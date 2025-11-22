# Code Analysis & Refactoring Plan

## Executive Summary

As a senior engineer review, this codebase demonstrates good TypeScript usage and functionality, but suffers from **Single Responsibility Principle (SRP) violations** and **tight coupling**. The main `script.ts` file (685 lines) handles too many concerns, making it difficult to test, maintain, and extend.

## Current Architecture Issues

### 1. Single Responsibility Violations

**`script.ts` currently handles:**
- ✅ DOM element selection and manipulation
- ✅ Event handling (save button, color picker, modal)
- ✅ Calendar generation and rendering
- ✅ Date parsing and timezone conversion
- ✅ YAML parsing and validation
- ✅ URL compression/decompression
- ✅ Color picker modal management
- ✅ Configuration management
- ✅ Application initialization

**Problem:** One file doing everything violates SRP and makes testing difficult.

### 2. Testing Gaps

**Current test coverage issues:**
- ❌ Tests mock functions that aren't actually imported
- ❌ No unit tests for individual functions
- ❌ No tests for date parsing/timezone logic
- ❌ No tests for calendar generation
- ❌ No tests for compression/decompression
- ❌ No integration tests
- ❌ Tests don't verify actual behavior

### 3. Code Duplication

- `script.ts` and `script-bundle.ts` contain duplicate code
- Compression logic exists in both `script.ts` and `opt.ts` (though `opt.ts` seems unused)

### 4. Tight Coupling

- Functions directly access global DOM elements
- No dependency injection
- Hard to test in isolation
- External libraries (luxon, jsyaml, LZString) are global, not injected

### 5. Missing Abstractions

- No clear separation between business logic and UI
- No service layer for configuration management
- No repository pattern for URL state management

## Proposed Architecture

### Module Structure

```
src/
├── utils/
│   ├── DateUtils.ts          # Date parsing, timezone handling
│   └── GradientUtils.ts      # Color gradient generation
├── services/
│   ├── ConfigManager.ts      # YAML parsing, validation, defaults
│   └── URLManager.ts         # URL compression/decompression
├── ui/
│   ├── ColorPicker.ts        # Modal management
│   └── CalendarRenderer.ts   # Calendar DOM generation
├── core/
│   └── CalendarGenerator.ts  # Calendar generation logic
└── CalendarApp.ts            # Main orchestrator/controller
```

### Responsibility Separation

#### 1. **DateUtils** (`utils/DateUtils.ts`)
- `parseDateInTimezone(dateStr, timezone): Date`
- `getCurrentTimezone(): string`
- Pure functions, easily testable
- No DOM dependencies

#### 2. **GradientUtils** (`utils/GradientUtils.ts`)
- `generateGradient(colors): string`
- Pure function, easily testable

#### 3. **ConfigManager** (`services/ConfigManager.ts`)
- `parseYAML(yamlString): CalendarConfig`
- `validateConfig(config): ValidationResult`
- `getDefaultConfig(): CalendarConfig`
- Handles YAML parsing and validation

#### 4. **URLManager** (`services/URLManager.ts`)
- `compressConfig(config): string | null`
- `decompressConfig(compressed): CalendarConfig | null`
- `getConfigFromURL(): CalendarConfig | null`
- `updateURLWithConfig(config): void`
- Handles URL state management

#### 5. **CalendarRenderer** (`ui/CalendarRenderer.ts`)
- `renderCalendar(container, years, periods, timezone): void`
- `createMonthTable(year, month, periods, usedPeriods): HTMLTableElement`
- `createLegend(periods): HTMLDivElement`
- Pure DOM manipulation, no business logic

#### 6. **ColorPicker** (`ui/ColorPicker.ts`)
- `openModal(): void`
- `closeModal(): void`
- `insertColorAtPosition(color, position): void`
- Handles modal UI interactions

#### 7. **CalendarGenerator** (`core/CalendarGenerator.ts`)
- `normalizePeriods(periods, timezone): NormalizedPeriod[]`
- `generateCalendar(years, periods, timezone): CalendarData`
- Business logic for calendar generation

#### 8. **CalendarApp** (`CalendarApp.ts`)
- Main orchestrator
- Coordinates all modules
- Handles event listeners
- Initialization logic

## Testing Strategy

### Unit Tests (per module)

#### DateUtils Tests
- ✅ Parse dates in different timezones
- ✅ Handle daylight savings transitions
- ✅ Get current timezone correctly
- ✅ Edge cases (invalid dates, invalid timezones)

#### ConfigManager Tests
- ✅ Parse valid YAML
- ✅ Handle invalid YAML gracefully
- ✅ Validate configuration structure
- ✅ Generate default config
- ✅ Handle missing required fields

#### URLManager Tests
- ✅ Compress/decompress round-trip
- ✅ Handle invalid compressed data
- ✅ Extract config from URL
- ✅ Update URL correctly
- ✅ Handle missing URL params

#### CalendarGenerator Tests
- ✅ Normalize periods correctly
- ✅ Handle date ranges
- ✅ Handle individual dates
- ✅ Handle multiple dates
- ✅ Timezone conversion

#### CalendarRenderer Tests
- ✅ Generate correct HTML structure
- ✅ Render months correctly
- ✅ Handle leap years
- ✅ Generate legends
- ✅ Apply colors correctly

#### GradientUtils Tests
- ✅ Generate gradients from single color
- ✅ Generate gradients from multiple colors
- ✅ Handle edge cases

### Integration Tests

- ✅ Full calendar generation flow
- ✅ Save button → render calendar
- ✅ URL loading → render calendar
- ✅ Color picker → insert color → save

### E2E Tests (Future)

- ✅ User can enter config and see calendar
- ✅ User can share URL and load calendar
- ✅ User can use color picker

## Refactoring Benefits

1. **Testability**: Each module can be tested in isolation
2. **Maintainability**: Clear separation of concerns
3. **Extensibility**: Easy to add new features
4. **Reusability**: Modules can be reused elsewhere
5. **Type Safety**: Better TypeScript support with smaller modules
6. **Performance**: Easier to optimize individual modules

## Migration Strategy

1. ✅ Create new module structure
2. ✅ Extract functions to modules (keeping old code working)
3. ✅ Write tests for each module
4. ✅ Update main script to use new modules
5. ✅ Remove old code
6. ✅ Update build process if needed

## Code Quality Metrics

### Before Refactoring
- Largest file: 685 lines (`script.ts`)
- Functions per file: ~15
- Test coverage: ~20%
- Coupling: High (everything in one file)

### After Refactoring (Target)
- Largest file: <200 lines
- Functions per file: 3-5
- Test coverage: >80%
- Coupling: Low (dependency injection)

## Risk Assessment

**Low Risk:**
- Module extraction (pure refactoring)
- Adding tests (no behavior change)

**Medium Risk:**
- Updating main script (needs careful testing)
- Build process changes

**Mitigation:**
- Keep old code working during refactoring
- Write tests first (TDD approach)
- Incremental migration

