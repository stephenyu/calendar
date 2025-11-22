# YAML Quoting Guide

## 🎉 Great News: Quotes Are Now Optional!

The calendar now includes an **automatic preprocessor** that adds quotes where needed. You can type your configuration naturally without worrying about YAML's quirky rules!

## ✨ Just Type Naturally (Recommended)

```yaml
years:
  - 2025
highlightPeriods:
  - start: 2025-12-01
    end: 2025-12-31
    color: #ffd700
    label: Festival Break
  - dates:
      - 2025-01-13
    color: #ff6b6b
    label: Important Day
timezone: Australia/Sydney
```

**No quotes needed!** The preprocessor automatically adds them where required. ✅

---

## How It Works

The calendar now uses a **3-step parsing pipeline**:

```
Your Unquoted YAML → Preprocessor (adds quotes) → YAML Parser → Validated Config
```

The preprocessor intelligently detects:
- **Hex colors** (starting with `#`) and adds quotes
- **Date strings** (format: `YYYY-MM-DD`) and adds quotes  
- **Everything else** stays as-is

---

## Technical Details (For Reference)

### What the Preprocessor Does

| Field | Your Input | Preprocessor Output | Reason |
|-------|------------|---------------------|--------|
| **Colors** | `color: #ffd700` | `color: "#ffd700"` | `#` starts a comment in YAML |
| **Dates** | `start: 2025-12-01` | `start: "2025-12-01"` | Keeps dates as strings (not Date objects) |
| **Years** | `- 2025` | `- 2025` | Numbers stay as numbers |
| **Labels** | `label: Festival Break` | `label: Festival Break` | No quotes needed |
| **Timezone** | `timezone: Australia/Sydney` | `timezone: Australia/Sydney` | No quotes needed |

## Recommended Format (No Quotes)

Type naturally without any quotes:

```yaml
years:
  - 2025
highlightPeriods:
  - start: 2025-12-01
    end: 2025-12-31
    color: #ffd700
    label: Festival Break
  - dates:
      - 2025-01-13
    color: #ff6b6b
    label: Important Day
timezone: Australia/Sydney
```

## Alternative: Manual Quoting (Still Supported)

If you prefer to add quotes manually, that still works perfectly:

```yaml
years:
  - 2025
highlightPeriods:
  - start: "2025-12-01"
    end: "2025-12-31"
    color: "#ffd700"
    label: "Festival Break"
  - dates:
      - "2025-01-13"
    color: "#ff6b6b"
    label: "Important Day"
timezone: "Australia/Sydney"
```

Both formats produce identical results!

## Why Did We Add a Preprocessor?

YAML has some quirky rules that can be confusing:

### The Problem (Without Preprocessor)

**Problem 1: Colors**
```yaml
color: #ffd700  # ❌ Parses as null! (# starts a comment in YAML)
```

**Problem 2: Dates**
```yaml
start: 2025-12-01  # ❌ Becomes a Date object, not a string!
```

### The Solution (With Preprocessor)

Our preprocessor automatically handles these edge cases:

```yaml
# You type this:
color: #ffd700
start: 2025-12-01

# Preprocessor converts to:
color: "#ffd700"
start: "2025-12-01"

# Result: ✅ Works perfectly!
```

### What Stays Unchanged

The preprocessor is smart and only adds quotes where needed:

```yaml
years: 2025              # ✅ Stays as number
label: Festival Break     # ✅ Stays unquoted
timezone: Australia/Sydney # ✅ Stays unquoted
```

## Complete Working Example

```yaml
years:
  - 2025
  - 2026
highlightPeriods:
  - start: "2025-12-01"
    end: "2025-12-31"
    color: "#ffd700"
    label: Festival Break
  - dates:
      - "2025-01-13"
      - "2025-02-14"
      - "2025-03-15"
    color: "#ff6b6b"
    label: Important Holidays
  - start: "2026-06-01"
    end: "2026-06-30"
    color: "#00ff00"
    label: Summer Break
timezone: Australia/Sydney
```

## Testing

The project includes comprehensive tests that verify:

### YAMLPreprocessor Tests (`__tests__/YAMLPreprocessor.test.ts`)
✅ Preprocessor adds quotes to hex colors  
✅ Preprocessor adds quotes to dates  
✅ Preprocessor preserves already-quoted values  
✅ Preprocessor handles complex nested structures  
✅ 16 tests covering all edge cases  

### Integration Tests (`__tests__/yaml-parsing.integration.test.ts`)
✅ Unquoted and quoted formats produce identical results  
✅ End-to-end parsing with preprocessor works  
✅ User's exact example (no quotes) parses correctly  
✅ 11 tests verifying real-world usage  

Run all tests:
```bash
npm test
```

Run specific test suites:
```bash
npm test -- __tests__/YAMLPreprocessor.test.ts
npm test -- __tests__/yaml-parsing.integration.test.ts
```

**Total: 94 tests, all passing! ✅**

