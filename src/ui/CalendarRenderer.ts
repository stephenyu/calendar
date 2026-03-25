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
import { generateGradient, getTextColor } from '../utils/GradientUtils.js';
import {
  normalizePeriods,
  getColorsForDate
} from '../core/CalendarGenerator.js';
import { parseDateInTimezone } from '../utils/DateUtils.js';

export interface DragCallbacks {
  onDragStart: (dateStr: string) => void;
  onDragMove: (dateStr: string) => void;
}

/**
 * Creates a month table element with highlighted dates based on periods
 */
export function createMonthTable(
  year: number,
  month: Month,
  periods: NormalizedPeriod[],
  usedPeriods: Set<number>,
  timezone: string,
  dragCallbacks?: DragCallbacks
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
  const prevMonthLastDay: number = new Date(year, month, 0).getDate();

  const totalCells: number = firstDay + daysInMonth;
  const weeks: number = Math.ceil(totalCells / 7);

  let currentDay: number = 1;
  let nextMonthDay: number = 1;

  for (let w = 0; w < weeks; w++) {
    const tr: HTMLTableRowElement = document.createElement('tr');

    for (let d = 0; d < 7; d++) {
      const td: HTMLTableCellElement = document.createElement('td');

      const cellIndex: number = w * 7 + d;
      if (cellIndex < firstDay) {
        // Previous month overflow
        td.textContent = (prevMonthLastDay - (firstDay - 1 - cellIndex)).toString();
        td.classList.add('out-of-month');
      } else if (currentDay <= daysInMonth) {
        td.textContent = currentDay.toString();

        const monthStr = (month + 1).toString().padStart(2, '0');
        const dayStr = currentDay.toString().padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;
        const dateObj: Date = parseDateInTimezone(dateStr, timezone);

        // Mark as interactive day cell with its date
        td.classList.add('day-cell');
        td.dataset.date = dateStr;

        const { colors, matchingPeriods } = getColorsForDate(
          dateObj,
          periods,
          usedPeriods
        );

        if (colors.length > 0) {
          td.style.background = generateGradient(colors);
          td.style.color = getTextColor(colors);
          td.classList.add('has-highlight');

          const labels = matchingPeriods
            .map(p => p.label)
            .filter(label => label)
            .join(', ');

          if (labels) {
            td.dataset.labels = labels;
          }
        }

        // Attach drag event listeners
        if (dragCallbacks) {
          td.addEventListener('mousedown', (e) => {
            e.preventDefault();
            dragCallbacks.onDragStart(dateStr);
          });
          td.addEventListener('mouseover', () => {
            dragCallbacks.onDragMove(dateStr);
          });
        }

        currentDay++;
      } else {
        // Next month overflow
        td.textContent = nextMonthDay.toString();
        td.classList.add('out-of-month');
        nextMonthDay++;
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
 * Exported for testing purposes
 */
export function createLegend(periods: NormalizedPeriod[]): HTMLDivElement {
  const legendDiv: HTMLDivElement = document.createElement('div');
  legendDiv.className = 'legend';

  for (const p of periods) {
    if (!p.label) { continue; }

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
 * Creates a global legend showing all periods with delete buttons
 */
function createGlobalLegend(
  periods: HighlightPeriod[],
  onDelete: (index: number) => void
): HTMLDivElement {
  const legendDiv: HTMLDivElement = document.createElement('div');
  legendDiv.className = 'legend';

  periods.forEach((p, i) => {
    const legendItem: HTMLDivElement = document.createElement('div');
    legendItem.className = 'legend-item';

    const legendColor: HTMLDivElement = document.createElement('div');
    legendColor.className = 'legend-color';
    legendColor.style.backgroundColor = p.color;

    const legendLabel: HTMLSpanElement = document.createElement('span');
    legendLabel.textContent = p.label ?? `Period ${i + 1}`;

    const deleteBtn: HTMLButtonElement = document.createElement('button');
    deleteBtn.className = 'legend-delete';
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Remove period';
    deleteBtn.addEventListener('click', () => onDelete(i));

    legendItem.appendChild(legendColor);
    legendItem.appendChild(legendLabel);
    legendItem.appendChild(deleteBtn);
    legendDiv.appendChild(legendItem);
  });

  return legendDiv;
}

/**
 * Generates calendar displays for multiple years with highlighted periods
 */
export function renderCalendar(
  container: HTMLDivElement,
  years: number[],
  highlightPeriods: HighlightPeriod[],
  timezone: string,
  dragCallbacks?: DragCallbacks,
  onDeletePeriod?: (order: number) => void,
  isDragging?: () => boolean
): void {
  container.innerHTML = '';

  const normalizedPeriods: NormalizedPeriod[] = normalizePeriods(
    highlightPeriods,
    timezone
  );

  const layoutWrapper: HTMLDivElement = document.createElement('div');
  layoutWrapper.className = 'calendar-layout';

  // Global legend on the left
  if (highlightPeriods.length > 0 && onDeletePeriod) {
    const globalLegend = createGlobalLegend(highlightPeriods, onDeletePeriod);
    layoutWrapper.appendChild(globalLegend);
  }

  const calendarContent: HTMLDivElement = document.createElement('div');
  calendarContent.className = 'calendar-content';

  for (const year of years) {
    const calendarDiv: HTMLDivElement = document.createElement('div');
    calendarDiv.className = 'calendar';

    const yearHeader: HTMLHeadingElement = document.createElement('h2');
    yearHeader.textContent = year.toString();
    calendarDiv.appendChild(yearHeader);

    const usedPeriods: Set<number> = new Set();

    const yearTable: HTMLTableElement = document.createElement('table');
    yearTable.className = 'year-table';

    const tbody: HTMLTableSectionElement = document.createElement('tbody');

    for (const rowMonths of MONTH_ROWS) {
      const tr: HTMLTableRowElement = document.createElement('tr');

      for (const monthIndex of rowMonths) {
        const td: HTMLTableCellElement = document.createElement('td');
        td.appendChild(
          createMonthTable(year, monthIndex, normalizedPeriods, usedPeriods, timezone, dragCallbacks)
        );
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }

    yearTable.appendChild(tbody);
    calendarDiv.appendChild(yearTable);

    calendarContent.appendChild(calendarDiv);
  }

  layoutWrapper.appendChild(calendarContent);
  container.appendChild(layoutWrapper);

  // Initialize tooltips after rendering
  initializeTooltips(container, isDragging);
}

/**
 * Initializes tooltip functionality for highlighted dates
 */
function initializeTooltips(
  container: HTMLDivElement,
  isDragging?: () => boolean
): void {
  let tooltip = document.getElementById('calendar-tooltip') as HTMLDivElement | null;

  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'calendar-tooltip';
    tooltip.className = 'calendar-tooltip';
    document.body.appendChild(tooltip);
  }

  const highlightedCells = container.querySelectorAll('td.has-highlight');

  highlightedCells.forEach((cell) => {
    const td = cell as HTMLTableCellElement;

    td.addEventListener('mouseenter', () => {
      if (isDragging && isDragging()) { return; }

      const labels = td.dataset.labels;

      if (labels && tooltip) {
        tooltip.textContent = labels;
        tooltip.style.display = 'block';

        const rect = td.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 5}px`;
      }
    });

    td.addEventListener('mouseleave', () => {
      if (tooltip) {
        tooltip.style.display = 'none';
      }
    });
  });
}
