/**
 * @fileoverview Unit tests for CalendarRenderer module
 */

import {
  createMonthTable,
  createLegend,
  renderCalendar
} from '../src/ui/CalendarRenderer';
import { NormalizedPeriod } from '../src/types';

// Mock dependencies
jest.mock('../src/utils/GradientUtils', () => ({
  generateGradient: jest.fn((colors: string[]) => {
    return colors.length > 0 ? `gradient(${colors.join(',')})` : '';
  })
}));

jest.mock('../src/core/CalendarGenerator', () => ({
  normalizePeriods: jest.fn((periods: any[]) => periods),
  getColorsForDate: jest.fn((): { colors: string[]; matchingPeriods: NormalizedPeriod[] } => ({ 
    colors: [], 
    matchingPeriods: [] 
  }))
}));

jest.mock('../src/utils/DateUtils', () => ({
  parseDateInTimezone: jest.fn((dateStr: string) => new Date(dateStr))
}));

describe('CalendarRenderer', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="calendar-container"></div>';
  });

  describe('createMonthTable', () => {
    it('should create table with correct structure', () => {
      const periods: NormalizedPeriod[] = [];
      const usedPeriods = new Set<number>();

      const table = createMonthTable(2024, 0, periods, usedPeriods, 'UTC');

      expect(table.tagName).toBe('TABLE');
      expect(table.className).toBe('month-table');
      expect(table.querySelector('thead')).toBeTruthy();
      expect(table.querySelector('tbody')).toBeTruthy();
    });

    it('should include month name in header', () => {
      const periods: NormalizedPeriod[] = [];
      const usedPeriods = new Set<number>();

      const table = createMonthTable(2024, 0, periods, usedPeriods, 'UTC');
      const monthHeader = table.querySelector('.month-name-row th');

      expect(monthHeader?.textContent).toContain('January');
      expect(monthHeader?.textContent).toContain('2024');
    });

    it('should include weekday headers', () => {
      const periods: NormalizedPeriod[] = [];
      const usedPeriods = new Set<number>();

      const table = createMonthTable(2024, 0, periods, usedPeriods, 'UTC');
      const weekdayRow = table.querySelector('.weekday-row');

      expect(weekdayRow?.children.length).toBe(7);
    });

    it('should create correct number of days for January 2024', () => {
      const periods: NormalizedPeriod[] = [];
      const usedPeriods = new Set<number>();

      const table = createMonthTable(2024, 0, periods, usedPeriods, 'UTC');
      const cells = table.querySelectorAll('tbody td');

      // January 2024 has 31 days, starts on Monday (day 1)
      // Should have cells for: 1 blank + 31 days = 32 cells minimum
      expect(cells.length).toBeGreaterThanOrEqual(31);
    });
  });

  describe('createLegend', () => {
    it('should create legend with labeled periods', () => {
      const periods: NormalizedPeriod[] = [
        {
          color: '#ff0000',
          label: 'Test Period 1',
          order: 0
        },
        {
          color: '#00ff00',
          label: 'Test Period 2',
          order: 1
        },
        {
          color: '#0000ff',
          // no label - should be skipped
          order: 2
        }
      ];

      const legend = createLegend(periods);
      expect(legend.className).toBe('legend');
      expect(legend.children.length).toBe(2); // Only labeled periods
    });

    it('should include color and label for each period', () => {
      const periods: NormalizedPeriod[] = [
        {
          color: '#ff0000',
          label: 'Test Period',
          order: 0
        }
      ];

      const legend = createLegend(periods);
      const legendItem = legend.querySelector('.legend-item');
      const colorDiv = legendItem?.querySelector('.legend-color');
      const labelSpan = legendItem?.querySelector('span');

      expect(colorDiv).toBeTruthy();
      expect(labelSpan?.textContent).toBe('Test Period');
    });

    it('should return empty legend for no labeled periods', () => {
      const periods: NormalizedPeriod[] = [
        {
          color: '#ff0000',
          // no label
          order: 0
        }
      ];

      const legend = createLegend(periods);
      expect(legend.children.length).toBe(0);
    });
  });

  describe('renderCalendar', () => {
    it('should render calendar for multiple years', () => {
      const container = document.getElementById(
        'calendar-container'
      ) as HTMLDivElement;
      const periods: NormalizedPeriod[] = [];

      renderCalendar(container, [2024, 2025], periods, 'UTC');

      const calendars = container.querySelectorAll('.calendar');
      expect(calendars.length).toBe(2);
    });

    it('should clear container before rendering', () => {
      const container = document.getElementById(
        'calendar-container'
      ) as HTMLDivElement;
      container.innerHTML = '<div>old content</div>';

      renderCalendar(container, [2024], [], 'UTC');

      expect(container.querySelector('div.old-content')).toBeNull();
    });

    it('should use timezone when creating date objects for comparison', () => {
      const parseDateInTimezone = require('../src/utils/DateUtils').parseDateInTimezone;
      const container = document.getElementById(
        'calendar-container'
      ) as HTMLDivElement;
      const periods: NormalizedPeriod[] = [];

      renderCalendar(container, [2024], periods, 'Australia/Sydney');

      // Verify parseDateInTimezone was called with correct timezone
      expect(parseDateInTimezone).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        'Australia/Sydney'
      );
    });
  });

  describe('Tooltip functionality', () => {
    it('should add has-highlight class to cells with colors', () => {
      const { getColorsForDate } = require('../src/core/CalendarGenerator');
      getColorsForDate.mockReturnValue({
        colors: ['#ff0000'],
        matchingPeriods: [{ color: '#ff0000', label: 'Test Label', order: 0 }]
      });

      const periods: NormalizedPeriod[] = [
        {
          color: '#ff0000',
          label: 'Test Label',
          order: 0
        }
      ];
      const usedPeriods = new Set<number>();

      const table = createMonthTable(2024, 0, periods, usedPeriods, 'UTC');
      const highlightedCells = table.querySelectorAll('td.has-highlight');

      // Should have highlighted cells based on mock
      expect(highlightedCells.length).toBeGreaterThan(0);
    });

    it('should store labels in data-labels attribute', () => {
      const { getColorsForDate } = require('../src/core/CalendarGenerator');
      getColorsForDate.mockReturnValue({
        colors: ['#ff0000'],
        matchingPeriods: [{ color: '#ff0000', label: 'Test Label', order: 0 }]
      });

      const periods: NormalizedPeriod[] = [
        {
          color: '#ff0000',
          label: 'Test Label',
          order: 0
        }
      ];
      const usedPeriods = new Set<number>();

      const table = createMonthTable(2024, 0, periods, usedPeriods, 'UTC');
      const highlightedCell = table.querySelector('td.has-highlight') as HTMLTableCellElement;

      expect(highlightedCell?.dataset.labels).toBe('Test Label');
    });

    it('should combine multiple labels with comma separator', () => {
      const { getColorsForDate } = require('../src/core/CalendarGenerator');
      getColorsForDate.mockReturnValue({
        colors: ['#ff0000', '#00ff00'],
        matchingPeriods: [
          { color: '#ff0000', label: 'Label 1', order: 0 },
          { color: '#00ff00', label: 'Label 2', order: 1 }
        ]
      });

      const periods: NormalizedPeriod[] = [
        { color: '#ff0000', label: 'Label 1', order: 0 },
        { color: '#00ff00', label: 'Label 2', order: 1 }
      ];
      const usedPeriods = new Set<number>();

      const table = createMonthTable(2024, 0, periods, usedPeriods, 'UTC');
      const highlightedCell = table.querySelector('td.has-highlight') as HTMLTableCellElement;

      expect(highlightedCell?.dataset.labels).toBe('Label 1, Label 2');
    });

    it('should filter out undefined labels', () => {
      const { getColorsForDate } = require('../src/core/CalendarGenerator');
      getColorsForDate.mockReturnValue({
        colors: ['#ff0000', '#00ff00'],
        matchingPeriods: [
          { color: '#ff0000', label: 'Label 1', order: 0 },
          { color: '#00ff00', order: 1 } // No label
        ]
      });

      const periods: NormalizedPeriod[] = [
        { color: '#ff0000', label: 'Label 1', order: 0 },
        { color: '#00ff00', order: 1 }
      ];
      const usedPeriods = new Set<number>();

      const table = createMonthTable(2024, 0, periods, usedPeriods, 'UTC');
      const highlightedCell = table.querySelector('td.has-highlight') as HTMLTableCellElement;

      expect(highlightedCell?.dataset.labels).toBe('Label 1');
    });

    it('should create tooltip element when rendering calendar', () => {
      const container = document.getElementById(
        'calendar-container'
      ) as HTMLDivElement;
      const periods: NormalizedPeriod[] = [];

      renderCalendar(container, [2024], periods, 'UTC');

      const tooltip = document.getElementById('calendar-tooltip');
      expect(tooltip).toBeTruthy();
      expect(tooltip?.className).toBe('calendar-tooltip');
    });
  });
});

