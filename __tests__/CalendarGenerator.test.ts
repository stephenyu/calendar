/**
 * @fileoverview Unit tests for CalendarGenerator module
 */

import {
  normalizePeriods,
  getColorsForDate
} from '../src/core/CalendarGenerator';
import { HighlightPeriod, NormalizedPeriod } from '../src/types';

// Mock DateUtils
jest.mock('../src/utils/DateUtils', () => ({
  parseDateInTimezone: jest.fn((dateStr: string) => {
    return new Date(dateStr + 'T00:00:00Z');
  })
}));

describe('CalendarGenerator', () => {
  describe('normalizePeriods', () => {
    it('should normalize periods with date ranges', () => {
      const periods: HighlightPeriod[] = [
        {
          start: '2024-01-01',
          end: '2024-01-31',
          color: '#ff0000',
          label: 'Test'
        }
      ];

      const result = normalizePeriods(periods, 'UTC');
      expect(result).toHaveLength(1);
      expect(result[0]?.startDate).toBeDefined();
      expect(result[0]?.endDate).toBeDefined();
      expect(result[0]?.order).toBe(0);
      expect(result[0]?.color).toBe('#ff0000');
    });

    it('should normalize periods with individual dates', () => {
      const periods: HighlightPeriod[] = [
        {
          dates: ['2024-01-15', '2024-01-20'],
          color: '#00ff00'
        }
      ];

      const result = normalizePeriods(periods, 'UTC');
      expect(result).toHaveLength(1);
      expect(result[0]?.dateObjects).toBeDefined();
      expect(result[0]?.dateObjects?.length).toBe(2);
    });

    it('should preserve order', () => {
      const periods: HighlightPeriod[] = [
        { start: '2024-01-01', end: '2024-01-31', color: '#ff0000' },
        { start: '2024-02-01', end: '2024-02-28', color: '#00ff00' },
        { dates: ['2024-03-01'], color: '#0000ff' }
      ];

      const result = normalizePeriods(periods, 'UTC');
      expect(result[0]?.order).toBe(0);
      expect(result[1]?.order).toBe(1);
      expect(result[2]?.order).toBe(2);
    });
  });

  describe('getColorsForDate', () => {
    it('should return colors and matching periods for date within range', () => {
      const periods: NormalizedPeriod[] = [
        {
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-01-31T00:00:00Z'),
          color: '#ff0000',
          label: 'Test Period',
          order: 0
        }
      ];
      const usedPeriods = new Set<number>();
      const testDate = new Date('2024-01-15T00:00:00Z');

      const result = getColorsForDate(testDate, periods, usedPeriods);
      expect(result.colors).toContain('#ff0000');
      expect(result.matchingPeriods).toHaveLength(1);
      expect(result.matchingPeriods[0]?.label).toBe('Test Period');
      expect(usedPeriods.has(0)).toBe(true);
    });

    it('should return empty arrays for date outside range', () => {
      const periods: NormalizedPeriod[] = [
        {
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-01-31T00:00:00Z'),
          color: '#ff0000',
          order: 0
        }
      ];
      const usedPeriods = new Set<number>();
      const testDate = new Date('2024-02-15T00:00:00Z');

      const result = getColorsForDate(testDate, periods, usedPeriods);
      expect(result.colors).toHaveLength(0);
      expect(result.matchingPeriods).toHaveLength(0);
      expect(usedPeriods.has(0)).toBe(false);
    });

    it('should return colors and periods for matching individual dates', () => {
      const periods: NormalizedPeriod[] = [
        {
          dateObjects: [
            new Date('2024-01-15T00:00:00Z'),
            new Date('2024-01-20T00:00:00Z')
          ],
          color: '#00ff00',
          label: 'Individual Dates',
          order: 0
        }
      ];
      const usedPeriods = new Set<number>();
      const testDate = new Date('2024-01-15T00:00:00Z');

      const result = getColorsForDate(testDate, periods, usedPeriods);
      expect(result.colors).toContain('#00ff00');
      expect(result.matchingPeriods).toHaveLength(1);
      expect(result.matchingPeriods[0]?.label).toBe('Individual Dates');
      expect(usedPeriods.has(0)).toBe(true);
    });

    it('should return multiple colors and periods for overlapping periods', () => {
      const periods: NormalizedPeriod[] = [
        {
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-01-31T00:00:00Z'),
          color: '#ff0000',
          label: 'Period 1',
          order: 0
        },
        {
          startDate: new Date('2024-01-15T00:00:00Z'),
          endDate: new Date('2024-02-15T00:00:00Z'),
          color: '#00ff00',
          label: 'Period 2',
          order: 1
        }
      ];
      const usedPeriods = new Set<number>();
      const testDate = new Date('2024-01-20T00:00:00Z');

      const result = getColorsForDate(testDate, periods, usedPeriods);
      expect(result.colors).toContain('#ff0000');
      expect(result.colors).toContain('#00ff00');
      expect(result.colors.length).toBe(2);
      expect(result.matchingPeriods).toHaveLength(2);
      expect(result.matchingPeriods[0]?.label).toBe('Period 1');
      expect(result.matchingPeriods[1]?.label).toBe('Period 2');
    });

    it('should include periods without labels in matching periods', () => {
      const periods: NormalizedPeriod[] = [
        {
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-01-31T00:00:00Z'),
          color: '#ff0000',
          // No label
          order: 0
        }
      ];
      const usedPeriods = new Set<number>();
      const testDate = new Date('2024-01-15T00:00:00Z');

      const result = getColorsForDate(testDate, periods, usedPeriods);
      expect(result.colors).toHaveLength(1);
      expect(result.matchingPeriods).toHaveLength(1);
      expect(result.matchingPeriods[0]?.label).toBeUndefined();
    });
  });
});

