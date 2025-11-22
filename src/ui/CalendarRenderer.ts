/**
 * @fileoverview Calendar rendering utilities
 * Handles DOM manipulation for calendar generation
 */

import {
  HighlightPeriod,
  NormalizedPeriod,
  Month,
  MONTH_NAMES,
  MONTH_ROWS
} from '../types.js';
import { generateGradient } from '../utils/GradientUtils.js';
import {
  normalizePeriods,
  getColorsForDate
} from '../core/CalendarGenerator.js';
import { parseDateInTimezone } from '../utils/DateUtils.js';

/**
 * Creates a month table element with highlighted dates based on periods
 * @param year - The year for the month
 * @param month - The month (0-11, where 0 is January)
 * @param periods - Array of normalized period objects
 * @param usedPeriods - Set to track which periods are used (for legend)
 * @param timezone - IANA timezone string for date parsing
 * @returns The generated month table element
 */
export function createMonthTable(
  year: number,
  month: Month,
  periods: NormalizedPeriod[],
  usedPeriods: Set<number>,
  timezone: string
): HTMLTableElement {
  const monthTable: HTMLTableElement = document.createElement('table');
  monthTable.className = 'month-table';

  // Create header with month name
  const thead: HTMLTableSectionElement = document.createElement('thead');
  const monthNameRow: HTMLTableRowElement = document.createElement('tr');
  monthNameRow.className = 'month-name-row';
  const monthNameTh: HTMLTableCellElement = document.createElement('th');
  monthNameTh.colSpan = 7;
  monthNameTh.textContent = `${MONTH_NAMES[month]} ${year}`;
  monthNameRow.appendChild(monthNameTh);
  thead.appendChild(monthNameRow);

  // Create weekday header row
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

  // Create calendar body
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

        // Format date as YYYY-MM-DD and parse in the configured timezone
        const monthStr = (month + 1).toString().padStart(2, '0');
        const dayStr = currentDay.toString().padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;
        const dateObj: Date = parseDateInTimezone(dateStr, timezone);

        const colors: string[] = getColorsForDate(
          dateObj,
          periods,
          usedPeriods
        );

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
 * Creates a legend element for labeled periods
 * @param periods - Array of normalized periods to display in legend
 * @returns The generated legend div element
 */
export function createLegend(periods: NormalizedPeriod[]): HTMLDivElement {
  const legendDiv: HTMLDivElement = document.createElement('div');
  legendDiv.className = 'legend';

  for (const p of periods) {
    if (!p.label) {
      continue;
    }

    const legendItem: HTMLDivElement = document.createElement('div');
    legendItem.className = 'legend-item';

    const legendColor: HTMLDivElement = document.createElement('div');
    legendColor.className = 'legend-color';
    legendColor.style.backgroundColor = p.color;

    const legendLabel: HTMLSpanElement = document.createElement('span');
    legendLabel.textContent = p.label;

    legendItem.appendChild(legendColor);
    legendItem.appendChild(legendLabel);
    legendDiv.appendChild(legendItem);
  }

  return legendDiv;
}

/**
 * Generates calendar displays for multiple years with highlighted periods
 * @param container - DOM element to render calendar into
 * @param years - Array of years to display
 * @param highlightPeriods - Array of period objects to highlight
 * @param timezone - IANA timezone string for date interpretation
 */
export function renderCalendar(
  container: HTMLDivElement,
  years: number[],
  highlightPeriods: HighlightPeriod[],
  timezone: string
): void {
  container.innerHTML = '';

  // Normalize periods
  const normalizedPeriods: NormalizedPeriod[] = normalizePeriods(
    highlightPeriods,
    timezone
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
          createMonthTable(year, monthIndex, normalizedPeriods, usedPeriods, timezone)
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
      const legendDiv = createLegend(labeledPeriods);
      calendarDiv.appendChild(legendDiv);
    }

    container.appendChild(calendarDiv);
  }
}
