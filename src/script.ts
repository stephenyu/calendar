/**
 * @fileoverview Customizable Calendar Application
 * A web-based calendar application with YAML configuration support.
 * Features include multi-year view, color-coded periods, and URL sharing.
 *
 * @version 1.0.0
 * @author Stephen Yu
 */

console.log('========================================');
console.log('[APP START] Calendar application script loaded');
console.log('[APP START] Timestamp:', new Date().toISOString());
console.log('[APP START] User Agent:', navigator.userAgent);
console.log('[APP START] Current URL:', window.location.href);
console.log('========================================');

import {
  CalendarConfig,
  HighlightPeriod,
  NormalizedPeriod,
  CompressedData,
  CompressedPeriod,
  MONTH_NAMES,
  MONTH_ROWS,
  Month
} from './types.js';

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
console.log('[DOM] Starting DOM element initialization');
console.log('[DOM] Document ready state:', document.readyState);

const configInput = document.getElementById(
  'config-input'
) as HTMLTextAreaElement;
console.log('[DOM] configInput:', configInput ? 'Found' : 'NOT FOUND');

const saveButton = document.getElementById('save-button') as HTMLButtonElement;
console.log('[DOM] saveButton:', saveButton ? 'Found' : 'NOT FOUND');

const calendarContainer = document.getElementById(
  'calendar-container'
) as HTMLDivElement;
console.log('[DOM] calendarContainer:', calendarContainer ? 'Found' : 'NOT FOUND');

const timezoneSelect = document.getElementById(
  'timezone-select'
) as HTMLSelectElement;
console.log('[DOM] timezoneSelect:', timezoneSelect ? 'Found' : 'NOT FOUND');

console.log('[DOM] Main elements summary:', {
  configInput: !!configInput,
  saveButton: !!saveButton,
  calendarContainer: !!calendarContainer,
  timezoneSelect: !!timezoneSelect
});

// Modal Elements
console.log('[DOM] Loading modal elements');
const modal = document.getElementById('color-picker-modal') as HTMLDivElement;
console.log('[DOM] modal:', modal ? 'Found' : 'NOT FOUND');

const closeBtn = modal?.querySelector('.close') as HTMLSpanElement;
console.log('[DOM] closeBtn:', closeBtn ? 'Found' : 'NOT FOUND');

const colorInput = document.getElementById('color-input') as HTMLInputElement;
console.log('[DOM] colorInput:', colorInput ? 'Found' : 'NOT FOUND');

const applyColorBtn = document.getElementById(
  'apply-color'
) as HTMLButtonElement;
console.log('[DOM] applyColorBtn:', applyColorBtn ? 'Found' : 'NOT FOUND');

console.log('[DOM] Modal elements summary:', {
  modal: !!modal,
  closeBtn: !!closeBtn,
  colorInput: !!colorInput,
  applyColorBtn: !!applyColorBtn
});

// Check if external libraries are loaded
console.log('[Libraries] Checking external dependencies');
console.log('[Libraries] jsyaml:', typeof jsyaml !== 'undefined' ? 'LOADED' : 'NOT LOADED');
console.log('[Libraries] LZString:', typeof LZString !== 'undefined' ? 'LOADED' : 'NOT LOADED');
console.log('[Libraries] luxon:', typeof luxon !== 'undefined' ? 'LOADED' : 'NOT LOADED');
console.log('[Libraries] Summary:', {
  jsyaml: typeof jsyaml !== 'undefined',
  LZString: typeof LZString !== 'undefined',
  luxon: typeof luxon !== 'undefined'
});

// State
let lastHashPosition: number | null = null; // Remember where '#' was typed for color picker

// Event: Show modal when '#' is typed in config input
console.log('[Events] Setting up event listeners');
configInput.addEventListener('keydown', (e: KeyboardEvent): void => {
  if (e.key === '#') {
    console.log('[ColorPicker] Hash key detected, opening modal');
    // Wait until character is inserted
    setTimeout(() => {
      lastHashPosition = configInput.selectionStart! - 1;
      openModal();
    }, 0);
  }
});
console.log('[Events] Keydown listener attached to configInput');

/**
 * Opens the color picker modal and focuses the color input
 */
function openModal(): void {
  console.log('[ColorPicker] Opening modal');
  modal.style.display = 'block';
  colorInput.focus();
}

/**
 * Closes the color picker modal
 */
function closeModal(): void {
  console.log('[ColorPicker] Closing modal');
  modal.style.display = 'none';
}

closeBtn.addEventListener('click', closeModal);
console.log('[Events] Close button listener attached');

window.addEventListener('click', (e: Event): void => {
  if (e.target === modal) {
    closeModal();
  }
});
console.log('[Events] Window click listener attached');

applyColorBtn.addEventListener('click', (): void => {
  console.log('[ColorPicker] Apply color button clicked');
  const chosenColor: string = colorInput.value; // e.g. #ff0000
  console.log('[ColorPicker] Chosen color:', chosenColor);
  if (lastHashPosition !== null) {
    insertColorAtPosition(chosenColor);
  }
  closeModal();
});
console.log('[Events] Apply color button listener attached');

/**
 * Inserts a color value at the position where '#' was typed
 * @param color - The color value to insert (e.g., '#ff0000')
 */
function insertColorAtPosition(color: string): void {
  console.log('[ColorPicker] Inserting color at position:', lastHashPosition);
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
  console.log('[ColorPicker] Color inserted successfully');
}

/**
 * Gets the current timezone from the selector
 * @returns Timezone string or 'auto' for browser default
 */
function getCurrentTimezone(): string {
  console.log('[Timezone] Getting current timezone');
  const value = timezoneSelect.value;
  const timezone = value === 'auto' ? luxon.DateTime.local().zoneName : value;
  console.log('[Timezone] Selected value:', value, '-> Timezone:', timezone);
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
  console.log('[DateParse] Parsing date:', dateStr, 'in timezone:', timezone);
  // Parse the date in the specified timezone at midnight
  const dt = luxon.DateTime.fromISO(dateStr, { zone: timezone });
  const result = dt.startOf('day').toJSDate();
  console.log('[DateParse] Result:', result.toISOString());
  return result;
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
  console.log('[generateCalendar] Starting calendar generation');
  console.log('[generateCalendar] Years:', years);
  console.log('[generateCalendar] Periods:', highlightPeriods.length);
  console.log('[generateCalendar] Timezone:', timezone);
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
  console.log('[Gradient] Generating gradient for', colors.length, 'colors:', colors);
  const percentage: number = 100 / colors.length;
  const colorStops: string[] = colors.map(
    (color: string, index: number): string => {
      const start: number = percentage * index;
      const end: number = percentage * (index + 1);
      return `${color} ${start}%, ${color} ${end}%`;
    }
  );
  const gradient = `linear-gradient(to bottom, ${colorStops.join(', ')})`;
  console.log('[Gradient] Result:', gradient);
  return gradient;
}

/**
 * Compresses YAML configuration data for URL sharing
 * @param yamlString - The YAML configuration string
 * @returns Compressed JSON string or null if error
 */
function compressYAML(yamlString: string): string | null {
  console.log('[Compress] Starting YAML compression');
  try {
    console.log('[Compress] Parsing YAML');
    const parsedData = jsyaml.load(yamlString) as CalendarConfig;
    console.log('[Compress] Parsed data:', parsedData);

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
    const result = jsonString.slice(1, -1); // Remove the outer square brackets
    console.log('[Compress] Compression complete, length:', result.length);
    return result;
  } catch (error) {
    console.error('[Compress] Error compressing YAML:', error);
    return null;
  }
}

/**
 * Decompresses JSON data back to YAML configuration
 * @param compressedYamlString - The compressed JSON string
 * @returns YAML configuration string or null if error
 */
function decompressJSON(compressedYamlString: string): string | null {
  console.log('[Decompress] Starting JSON decompression');
  console.log('[Decompress] Input length:', compressedYamlString?.length || 0);
  try {
    // Wrap the string in square brackets before parsing
    const jsonString: string = `[${compressedYamlString}]`;
    console.log('[Decompress] Parsing JSON');
    const parsedData = JSON.parse(jsonString) as CompressedData;
    console.log('[Decompress] Parsed data:', parsedData);

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

    const result = jsyaml.dump(decompressedData);
    console.log('[Decompress] Decompression complete');
    console.log('[Decompress] Result YAML:', result);
    return result;
  } catch (error) {
    console.error('[Decompress] Error decompressing JSON:', error);
    return null;
  }
}

/**
 * Retrieves and decompresses configuration from URL parameters
 * @returns Decompressed YAML configuration or null if not found/error
 */
function getConfigFromURL(): string | null {
  console.log('[getConfigFromURL] Checking for config parameter');
  const params: URLSearchParams = new URLSearchParams(window.location.search);
  const configParam: string | null = params.get('config');
  console.log('[getConfigFromURL] Config param:', configParam ? 'Found' : 'Not found');
  if (configParam) {
    try {
      console.log('[getConfigFromURL] Decompressing config');
      const compressedJSON: string =
        LZString.decompressFromEncodedURIComponent(configParam);
      console.log('[getConfigFromURL] Compressed JSON length:', compressedJSON.length);
      const decompressed: string | null = decompressJSON(compressedJSON);
      console.log('[getConfigFromURL] Decompression successful');
      return decompressed;
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
  console.log('[URL] Updating URL with config');
  const compressedJSON: string | null = compressYAML(config);
  if (compressedJSON) {
    console.log('[URL] Compressing with LZString');
    const compressed: string =
      LZString.compressToEncodedURIComponent(compressedJSON);
    console.log('[URL] Compressed length:', compressed.length);
    const newURL: string = `${window.location.protocol}//${window.location.host}${window.location.pathname}?config=${compressed}`;
    console.log('[URL] New URL length:', newURL.length);
    window.history.replaceState({ path: newURL }, '', newURL);
    console.log('[URL] URL updated successfully');
  } else {
    console.error('[URL] Failed to compress config');
  }
}

// Save button event
saveButton.addEventListener('click', (): void => {
  console.log('[Save] Save button clicked');
  const input: string = configInput.value;
  console.log('[Save] Config input length:', input.length);
  try {
    console.log('[Save] Parsing YAML config');
    const config = jsyaml.load(input) as CalendarConfig;
    const years: number[] = config.years;
    const highlightPeriods: HighlightPeriod[] = config.highlightPeriods;
    const timezone: string = getCurrentTimezone();
    console.log('[Save] Years:', years);
    console.log('[Save] Periods:', highlightPeriods.length);
    console.log('[Save] Timezone:', timezone);

    if (!Array.isArray(years) || !Array.isArray(highlightPeriods)) {
      throw new Error('Invalid configuration format.');
    }

    console.log('[Save] Generating calendar');
    generateCalendar(years, highlightPeriods, timezone);

    // Add timezone to config before compressing
    const configWithTimezone = { ...config, timezone };
    console.log('[Save] Updating URL with config');
    updateURLWithConfig(jsyaml.dump(configWithTimezone));
    console.log('[Save] Save complete');
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
  console.log('[Init] Starting calendar initialization');
  console.log('[Init] Current URL:', window.location.href);
  console.log('[Init] Search params:', window.location.search);

  const configFromURL: string | null = getConfigFromURL();
  if (configFromURL) {
    console.log('[Init] Config loaded from URL');
    configInput.value = configFromURL;

    // Try to extract and set timezone from config
    try {
      const config = jsyaml.load(configFromURL) as CalendarConfig;
      if (config.timezone) {
        console.log('[Init] Timezone from config:', config.timezone);
        timezoneSelect.value = config.timezone;
      }
    } catch (e) {
      console.error('[Init] Error parsing config from URL:', e);
      // Ignore parsing errors, will be caught on save
    }
  } else {
    console.log('[Init] No URL config found, using default');
    // Get current year dynamically for default showcase
    const currentYear: number = new Date().getFullYear();
    console.log('[Init] Current year:', currentYear);

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
    console.log('[Init] Default config set in textarea');
  }
  // Trigger a save to render the initial calendar
  console.log('[Init] Triggering save button click');
  saveButton.click();
  console.log('[Init] Initialization complete');
}

console.log('[APP] Calling init() function');
init();
console.log('[APP] init() function called - script execution complete');
