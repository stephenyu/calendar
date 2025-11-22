/**
 * @fileoverview Customizable Calendar Application (Bundled for Development)
 * A web-based calendar application with YAML configuration support.
 * Features include multi-year view, color-coded periods, and URL sharing.
 *
 * @version 1.0.0
 * @author Stephen Yu
 */

// ============================================================================
// YAML PREPROCESSOR (inlined from utils/YAMLPreprocessor.ts)
// ============================================================================

/**
 * Detects if a string looks like a hex color (#fff, #ffd700, etc.)
 */
function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(value.trim());
}

/**
 * Detects if a string looks like a date (YYYY-MM-DD)
 */
function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

/**
 * Checks if a value is already quoted
 */
function isQuoted(value: string): boolean {
  const trimmed = value.trim();
  return (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  );
}

/**
 * Preprocesses YAML to add quotes where needed
 * Automatically quotes hex colors and dates
 */
function preprocessYAML(yaml: string): string {
  const lines = yaml.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    
    // Skip empty lines and comments
    if (line.trim() === '' || line.trim().startsWith('#')) {
      processedLines.push(line);
      continue;
    }

    const trimmedLine = line.trim();
    
    // Check if this is a simple array item
    if (trimmedLine.startsWith('-')) {
      const dashIndex = line.indexOf('-');
      const afterDash = line.substring(dashIndex + 1).trim();
      
      const colonInArrayItem = afterDash.indexOf(':');
      
      if (colonInArrayItem === -1) {
        // Simple array item: "  - 2025-01-01"
        if (afterDash && !isQuoted(afterDash)) {
          if (isHexColor(afterDash) || isDateString(afterDash)) {
            const beforeDash = line.substring(0, dashIndex + 1);
            processedLines.push(`${beforeDash} "${afterDash}"`);
            continue;
          }
        }
        processedLines.push(line);
        continue;
      } else {
        // Array item with key-value: "  - start: 2025-12-01"
        const beforeColon = afterDash.substring(0, colonInArrayItem);
        const afterColon = afterDash.substring(colonInArrayItem + 1).trim();
        
        if (afterColon && !isQuoted(afterColon)) {
          if (isHexColor(afterColon) || isDateString(afterColon)) {
            const beforeDash = line.substring(0, dashIndex + 1);
            processedLines.push(`${beforeDash} ${beforeColon}: "${afterColon}"`);
            continue;
          }
        }
        processedLines.push(line);
        continue;
      }
    }

    // Check if this is a key-value line
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      processedLines.push(line);
      continue;
    }

    const beforeColon = line.substring(0, colonIndex);
    const afterColon = line.substring(colonIndex + 1);

    if (afterColon.trim() === '') {
      processedLines.push(line);
      continue;
    }

    const value = afterColon.trim();

    if (isQuoted(value)) {
      processedLines.push(line);
      continue;
    }

    // Regular key-value pair
    if (isHexColor(value) || isDateString(value)) {
      const indent = beforeColon.match(/^\s*/)?.[0] || '';
      const key = beforeColon.trim();
      processedLines.push(`${indent}${key}: "${value}"`);
    } else {
      processedLines.push(line);
    }
  }

  return processedLines.join('\n');
}

// ============================================================================
// TYPE DEFINITIONS (inlined from types.ts)
// ============================================================================

// Configuration Types
interface CalendarConfig {
  years: number[];
  highlightPeriods: HighlightPeriod[];
  timezone?: string;
}

interface HighlightPeriod {
  start?: string;
  end?: string;
  dates?: string[];
  color: string;
  label?: string;
}

// Normalized Period Types (used internally)
interface NormalizedPeriod extends HighlightPeriod {
  order: number;
  startDate?: Date;
  endDate?: Date;
  dateObjects?: Date[];
}

// Compression/Decompression Types
type CompressedData = [
  number[], // compressed years
  CompressedPeriod[], // compressed highlight periods
  string? // timezone (optional for backward compatibility)
];

type CompressedPeriod =
  | [number, number, string, string?] // [start, dayDifference, color, label?] for date ranges
  | [number, string, string?] // [date, color, label?] for single dates
  | [number[], string, string?] // [dates array, color, label?] for multiple dates
  | (string | number)[]; // flexible array type for mixed content

// Utility Types
type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

type MonthName =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

// Constants
const MONTH_NAMES: MonthName[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const MONTH_ROWS: Month[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11]
];

// ============================================================================
// MAIN APPLICATION CODE
// ============================================================================

// External library declarations
declare const LZString: {
  compressToEncodedURIComponent(str: string): string;
  decompressFromEncodedURIComponent(str: string): string;
};

declare const jsyaml: {
  load(str: string): any;
  dump(obj: any): string;
};

declare const luxon: {
  DateTime: {
    fromISO(
      text: string,
      opts?: { zone?: string }
    ): {
      setZone(zone: string): {
        startOf(unit: string): {
          toJSDate(): Date;
        };
      };
      startOf(unit: string): {
        toJSDate(): Date;
      };
      toJSDate(): Date;
    };
    fromObject(
      obj: { year: number; month: number; day: number },
      opts?: { zone?: string }
    ): {
      startOf(unit: string): {
        toJSDate(): Date;
      };
      toJSDate(): Date;
    };
    local(): {
      zoneName: string;
    };
  };
};

// DOM Elements with proper type assertions
const configInput = document.getElementById(
  'config-input'
) as HTMLTextAreaElement;

const saveButton = document.getElementById('save-button') as HTMLButtonElement;

const calendarContainer = document.getElementById(
  'calendar-container'
) as HTMLDivElement;

const timezoneSelect = document.getElementById(
  'timezone-select'
) as HTMLSelectElement;

// Modal Elements
const modal = document.getElementById('color-picker-modal') as HTMLDivElement;

const closeBtn = modal?.querySelector('.close') as HTMLSpanElement;

const colorInput = document.getElementById('color-input') as HTMLInputElement;

const applyColorBtn = document.getElementById(
  'apply-color'
) as HTMLButtonElement;

// State
let lastHashPosition: number | null = null; // Remember where '#' was typed for color picker

// Event: Show modal when '#' is typed in config input
configInput.addEventListener('keydown', (e: KeyboardEvent): void => {
  if (e.key === '#') {
    // Wait until character is inserted
    setTimeout(() => {
      lastHashPosition = configInput.selectionStart! - 1;
      openModal();
    }, 0);
  }
});

/**
 * Opens the color picker modal and focuses the color input
 */
function openModal(): void {
  modal.style.display = 'block';
  colorInput.focus();
}

/**
 * Closes the color picker modal
 */
function closeModal(): void {
  modal.style.display = 'none';
}

closeBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e: Event): void => {
  if (e.target === modal) {
    closeModal();
  }
});

applyColorBtn.addEventListener('click', (): void => {
  const chosenColor: string = colorInput.value; // e.g. #ff0000
  if (lastHashPosition !== null) {
    insertColorAtPosition(chosenColor);
  }
  closeModal();
});

/**
 * Inserts a color value at the position where '#' was typed
 * @param color - The color value to insert (e.g., '#ff0000')
 */
function insertColorAtPosition(color: string): void {
  const text: string = configInput.value;
  const before: string = text.slice(0, lastHashPosition!);
  const after: string = text.slice(lastHashPosition! + 1); // remove the '#'
  const newText: string = before + color + after;
  configInput.value = newText;

  // Move the cursor after the inserted color
  const cursorPos: number = before.length + color.length;
  configInput.selectionStart = cursorPos;
  configInput.selectionEnd = cursorPos;
  configInput.focus();
  lastHashPosition = null;
}

/**
 * Gets the current timezone from the selector
 * @returns Timezone string or 'auto' for browser default
 */
function getCurrentTimezone(): string {
  const value = timezoneSelect.value;
  const timezone = value === 'auto' ? luxon.DateTime.local().zoneName : value;
  return timezone;
}

/**
 * Parses a date string (YYYY-MM-DD) in the specified timezone
 * Handles daylight savings and timezone offsets correctly
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @returns Date object set to midnight in the specified timezone
 */
function parseDateInTimezone(dateStr: string, timezone: string): Date {
  // Parse the date in the specified timezone at midnight
  const dt = luxon.DateTime.fromISO(dateStr, { zone: timezone });
  return dt.startOf('day').toJSDate();
}

/**
 * Generates calendar displays for multiple years with highlighted periods
 * @param years - Array of years to display
 * @param highlightPeriods - Array of period objects to highlight
 * @param timezone - IANA timezone string for date interpretation
 */
function generateCalendar(
  years: number[],
  highlightPeriods: HighlightPeriod[],
  timezone: string
): void {
  calendarContainer.innerHTML = '';

  // Normalize highlight periods using the specified timezone
  const normalizedPeriods: NormalizedPeriod[] = highlightPeriods.map(
    (period, index) => {
      const newPeriod: NormalizedPeriod = { ...period, order: index };
      if (period.start) {
        newPeriod.startDate = parseDateInTimezone(period.start, timezone);
      }
      if (period.end) {
        newPeriod.endDate = parseDateInTimezone(period.end, timezone);
      }
      if (period.dates) {
        newPeriod.dateObjects = period.dates.map((dateStr: string): Date => {
          return parseDateInTimezone(dateStr, timezone);
        });
      }
      return newPeriod;
    }
  );

  for (const year of years) {
    const calendarDiv: HTMLDivElement = document.createElement('div');
    calendarDiv.className = 'calendar';

    const yearHeader: HTMLHeadingElement = document.createElement('h2');
    yearHeader.textContent = year.toString();
    calendarDiv.appendChild(yearHeader);

    // Track which highlight periods are used this year
    const usedPeriods: Set<number> = new Set();

    // Create the year table
    const yearTable: HTMLTableElement = document.createElement('table');
    yearTable.className = 'year-table';

    const tbody: HTMLTableSectionElement = document.createElement('tbody');

    for (const rowMonths of MONTH_ROWS) {
      const tr: HTMLTableRowElement = document.createElement('tr');

      for (const monthIndex of rowMonths) {
        const td: HTMLTableCellElement = document.createElement('td');
        td.appendChild(
          createMonthTable(year, monthIndex, normalizedPeriods, usedPeriods)
        );
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }

    yearTable.appendChild(tbody);
    calendarDiv.appendChild(yearTable);

    // Add legend for labeled periods used this year
    const labeledPeriods: NormalizedPeriod[] = Array.from(usedPeriods)
      .map((i: number) => normalizedPeriods[i]!)
      .filter((p: NormalizedPeriod) => p.label);

    if (labeledPeriods.length > 0) {
      const legendDiv: HTMLDivElement = document.createElement('div');
      legendDiv.className = 'legend';

      for (const p of labeledPeriods) {
        const legendItem: HTMLDivElement = document.createElement('div');
        legendItem.className = 'legend-item';

        const legendColor: HTMLDivElement = document.createElement('div');
        legendColor.className = 'legend-color';
        legendColor.style.backgroundColor = p.color;

        const legendLabel: HTMLSpanElement = document.createElement('span');
        legendLabel.textContent = p.label!;

        legendItem.appendChild(legendColor);
        legendItem.appendChild(legendLabel);
        legendDiv.appendChild(legendItem);
      }

      calendarDiv.appendChild(legendDiv);
    }

    calendarContainer.appendChild(calendarDiv);
  }
}

/**
 * Creates a month table element with highlighted dates based on periods
 * @param year - The year for the month
 * @param month - The month (0-11, where 0 is January)
 * @param periods - Array of normalized period objects
 * @param usedPeriods - Set to track which periods are used (for legend)
 * @returns The generated month table element
 */
function createMonthTable(
  year: number,
  month: Month,
  periods: NormalizedPeriod[],
  usedPeriods: Set<number>
): HTMLTableElement {
  const monthTable: HTMLTableElement = document.createElement('table');
  monthTable.className = 'month-table';

  const thead: HTMLTableSectionElement = document.createElement('thead');
  const monthNameRow: HTMLTableRowElement = document.createElement('tr');
  monthNameRow.className = 'month-name-row';
  const monthNameTh: HTMLTableCellElement = document.createElement('th');
  monthNameTh.colSpan = 7;
  monthNameTh.textContent = `${MONTH_NAMES[month]} ${year}`;
  monthNameRow.appendChild(monthNameTh);
  thead.appendChild(monthNameRow);

  const weekdayRow: HTMLTableRowElement = document.createElement('tr');
  weekdayRow.className = 'weekday-row';
  const weekdays: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  for (const wday of weekdays) {
    const th: HTMLTableCellElement = document.createElement('th');
    th.textContent = wday;
    weekdayRow.appendChild(th);
  }
  thead.appendChild(weekdayRow);

  monthTable.appendChild(thead);

  const tbody: HTMLTableSectionElement = document.createElement('tbody');

  const firstDay: number = new Date(year, month, 1).getDay();
  const daysInMonth: number = new Date(year, month + 1, 0).getDate();

  // Total cells needed
  const totalCells: number = firstDay + daysInMonth;
  const weeks: number = Math.ceil(totalCells / 7);

  let currentDay: number = 1;

  for (let w = 0; w < weeks; w++) {
    const tr: HTMLTableRowElement = document.createElement('tr');

    for (let d = 0; d < 7; d++) {
      const td: HTMLTableCellElement = document.createElement('td');

      const cellIndex: number = w * 7 + d;
      if (cellIndex >= firstDay && currentDay <= daysInMonth) {
        // Valid day
        td.textContent = currentDay.toString();
        const dateObj: Date = new Date(year, month, currentDay);
        dateObj.setHours(0, 0, 0, 0);

        const colors: string[] = [];
        for (let i = 0; i < periods.length; i++) {
          const period: NormalizedPeriod = periods[i]!;
          if (period.startDate && period.endDate) {
            if (dateObj >= period.startDate && dateObj <= period.endDate) {
              colors.push(period.color);
              usedPeriods.add(i);
            }
          } else if (period.dateObjects) {
            for (const dObj of period.dateObjects) {
              if (dateObj.getTime() === dObj.getTime()) {
                colors.push(period.color);
                usedPeriods.add(i);
              }
            }
          }
        }

        if (colors.length > 0) {
          td.style.background = generateGradient(colors);
        }

        currentDay++;
      } else {
        // Blank cell
        td.textContent = '';
      }

      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }

  monthTable.appendChild(tbody);
  return monthTable;
}

/**
 * Generates a CSS linear gradient from multiple colors
 * @param colors - Array of CSS color values
 * @returns CSS linear-gradient string
 */
function generateGradient(colors: string[]): string {
  const percentage: number = 100 / colors.length;
  const colorStops: string[] = colors.map(
    (color: string, index: number): string => {
      const start: number = percentage * index;
      const end: number = percentage * (index + 1);
      return `${color} ${start}%, ${color} ${end}%`;
    }
  );
  return `linear-gradient(to bottom, ${colorStops.join(', ')})`;
}

/**
 * Compresses YAML configuration data for URL sharing
 * @param yamlString - The YAML configuration string
 * @returns Compressed JSON string or null if error
 */
function compressYAML(yamlString: string): string | null {
  try {
    const parsedData = jsyaml.load(yamlString) as CalendarConfig;

    const compressedData: CompressedData = [[], []];

    // Compress years (assume it's the first element in the array)
    if (parsedData.years) {
      const compressedYears: number[] = parsedData.years.map(
        (year: number) => year - 2024
      );
      compressedData[0] = compressedYears;
    }

    // Compress highlightPeriods (assume it's the second element in the array)
    if (parsedData.highlightPeriods) {
      const compressedHighlightPeriods: CompressedPeriod[] =
        parsedData.highlightPeriods.map(
          (period: HighlightPeriod): CompressedPeriod => {
            if (period.start && period.end && period.color) {
              // Compress date range
              const start: number = Math.floor(
                new Date(period.start).getTime() / 100000
              );
              const startDate: Date = new Date(period.start);
              const endDate: Date = new Date(period.end);
              const dayDifference: number = Math.ceil(
                (endDate.getTime() - startDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              const result: CompressedPeriod = [
                start,
                dayDifference,
                period.color
              ];
              if (period.label) { (result as [number, number, string, string]).push(period.label); }
              return result;
            } else if (period.dates && period.color) {
              // Optimise multiple dates
              const sortedDates: number[] = period.dates
                .map((date: string) =>
                  Math.floor(new Date(date).getTime() / 100000)
                )
                .sort((a: number, b: number) => a - b);

              if (sortedDates.length === 1) {
                // Single date: store directly
                const result: CompressedPeriod = [
                  sortedDates[0]!,
                  period.color
                ];
                if (period.label) { (result as [number, string, string]).push(period.label); }
                return result;
              } else {
                // Multiple dates: store as [base, diff1, diff2, ...]
                const baseDate: number = sortedDates[0]!;
                const differences: number[] = sortedDates
                  .slice(1)
                  .map(
                    (date: number) => (date - baseDate) / (86400000 / 100000)
                  );
                const result: CompressedPeriod = [
                  [baseDate, ...differences],
                  period.color
                ];
                if (period.label) { (result as [number[], string, string]).push(period.label); }
                return result;
              }
            }
            return period as unknown as CompressedPeriod;
          }
        );
      compressedData[1] = compressedHighlightPeriods;
    }

    // Add timezone (third element)
    if (parsedData.timezone && parsedData.timezone !== 'auto') {
      compressedData[2] = parsedData.timezone;
    }

    const jsonString: string = JSON.stringify(compressedData);
    return jsonString.slice(1, -1); // Remove the outer square brackets
  } catch (error) {
    console.error('Error compressing YAML:', error);
    return null;
  }
}

/**
 * Decompresses JSON data back to YAML configuration
 * @param compressedYamlString - The compressed JSON string
 * @returns YAML configuration string or null if error
 */
function decompressJSON(compressedYamlString: string): string | null {
  try {
    // Wrap the string in square brackets before parsing
    const jsonString: string = `[${compressedYamlString}]`;
    const parsedData = JSON.parse(jsonString) as CompressedData;

    const decompressedData: Partial<CalendarConfig> = {};

    // Decompress years (assume it's the first element in the array)
    if (parsedData[0]) {
      decompressedData.years = parsedData[0].map(
        (yearDistance: number) => yearDistance + 2024
      );
    }

    // Decompress highlightPeriods (assume it's the second element in the array)
    if (parsedData[1]) {
      decompressedData.highlightPeriods = parsedData[1].map(
        (period: CompressedPeriod): HighlightPeriod => {
          if (Array.isArray(period)) {
            // Detect a date range (start + dayDifference + color [+ label])
            if (
              typeof period[0] === 'number' &&
              typeof period[1] === 'number'
            ) {
              const startEpoch: number = period[0] * 100000;
              const startDate: string =
                new Date(startEpoch).toISOString().split('T')[0] || '';
              const dayDifference: number = period[1];
              const endDate: string =
                new Date(startEpoch + dayDifference * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0] || '';
              const result: HighlightPeriod = {
                start: startDate,
                end: endDate,
                color: period[2] as string
              };
              if (period[3]) { result.label = period[3] as string; }
              return result;

              // Detect single or multiple dates
            } else if (Array.isArray(period[0])) {
              // Multiple dates
              const baseDate: number = period[0][0]! * 100000;
              const differences: number[] = period[0].slice(1);
              const dates: string[] = [
                new Date(baseDate).toISOString().split('T')[0] || ''
              ];
              differences.forEach((diff: number) => {
                const previousDate: Date = new Date(
                  new Date(dates[dates.length - 1]!).getTime() + diff * 86400000
                );
                dates.push(previousDate.toISOString().split('T')[0] || '');
              });
              const result: HighlightPeriod = {
                dates,
                color: period[1] as string
              };
              if (period[2]) { result.label = period[2] as string; }
              return result;
            } else {
              // Single date
              const date: string =
                new Date((period[0] as number) * 100000)
                  .toISOString()
                  .split('T')[0] || '';
              const result: HighlightPeriod = {
                dates: [date],
                color: period[1] as string
              };
              if (period[2]) { result.label = period[2] as string; }
              return result;
            }
          }
          return period as HighlightPeriod;
        }
      );
    }

    // Decompress timezone (third element)
    if (parsedData[2]) {
      decompressedData.timezone = parsedData[2];
    }

    return jsyaml.dump(decompressedData);
  } catch (error) {
    console.error('Error decompressing JSON:', error);
    return null;
  }
}

/**
 * Retrieves and decompresses configuration from URL parameters
 * @returns Decompressed YAML configuration or null if not found/error
 */
function getConfigFromURL(): string | null {
  const params: URLSearchParams = new URLSearchParams(window.location.search);
  const configParam: string | null = params.get('config');
  if (configParam) {
    try {
      const compressedJSON: string =
        LZString.decompressFromEncodedURIComponent(configParam);
      return decompressJSON(compressedJSON);
    } catch (e) {
      const error = e as Error;
      console.error('[getConfigFromURL] Error:', error);
      alert(`Error decoding configuration from URL: ${error.message}`);
    }
  }
  return null;
}

/**
 * Updates the browser URL with compressed configuration data
 * @param config - The YAML configuration string to compress and store
 */
function updateURLWithConfig(config: string): void {
  const compressedJSON: string | null = compressYAML(config);
  if (compressedJSON) {
    const compressed: string =
      LZString.compressToEncodedURIComponent(compressedJSON);
    const newURL: string = `${window.location.protocol}//${window.location.host}${window.location.pathname}?config=${compressed}`;
    window.history.replaceState({ path: newURL }, '', newURL);
  }
}

// Save button event
saveButton.addEventListener('click', (): void => {
  const input: string = configInput.value;
  try {
    // Preprocess YAML to add quotes where needed
    const processedInput = preprocessYAML(input);
    const config = jsyaml.load(processedInput) as CalendarConfig;
    const years: number[] = config.years;
    const highlightPeriods: HighlightPeriod[] = config.highlightPeriods;
    const timezone: string = getCurrentTimezone();

    if (!Array.isArray(years) || !Array.isArray(highlightPeriods)) {
      throw new Error('Invalid configuration format.');
    }

    generateCalendar(years, highlightPeriods, timezone);

    // Add timezone to config before compressing
    const configWithTimezone = { ...config, timezone };
    updateURLWithConfig(jsyaml.dump(configWithTimezone));
  } catch (e) {
    const error = e as Error;
    console.error('[Save] Error:', error);
    alert(`Error parsing configuration: ${error.message}`);
  }
});

/**
 * Initializes the calendar application
 * Sets up default configuration or loads from URL parameters
 */
function init(): void {
  const configFromURL: string | null = getConfigFromURL();
  if (configFromURL) {
    configInput.value = configFromURL;

    // Try to extract and set timezone from config
    try {
      const processedConfig = preprocessYAML(configFromURL);
      const config = jsyaml.load(processedConfig) as CalendarConfig;
      if (config.timezone) {
        timezoneSelect.value = config.timezone;
      }
    } catch (e) {
      console.error('[Init] Error parsing config from URL:', e);
      // Ignore parsing errors, will be caught on save
    }
  } else {
    // Get current year dynamically for default showcase
    const currentYear: number = new Date().getFullYear();

    // Default configuration with showcase examples
    configInput.value = `years:
  - ${currentYear}
highlightPeriods:
  - start: '${currentYear}-12-01'
    end: '${currentYear}-12-31'
    color: '#ffd700'  # gold
    label: 'Festival Break'
  - dates:
      - '${currentYear}-01-13'
    color: '#ff6b6b'  # coral red
    label: 'Important Day'
`;
  }
  // Trigger a save to render the initial calendar
  saveButton.click();
}

init();
