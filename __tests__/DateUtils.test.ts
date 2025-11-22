/**
 * @fileoverview Unit tests for DateUtils module
 */

import {
  getCurrentTimezone,
  parseDateInTimezone,
  normalizeDate,
  isDateInRange,
  isSameDay
} from '../src/utils/DateUtils';

// Mock luxon
const mockLuxon = {
  DateTime: {
    fromISO: jest.fn(),
    local: jest.fn()
  }
};

(global as any).luxon = mockLuxon;

describe('DateUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentTimezone', () => {
    it('should return the provided timezone when not "auto"', () => {
      expect(getCurrentTimezone('America/New_York')).toBe('America/New_York');
      expect(getCurrentTimezone('UTC')).toBe('UTC');
    });

    it('should return browser timezone when value is "auto"', () => {
      mockLuxon.DateTime.local.mockReturnValue({
        zoneName: 'America/Los_Angeles'
      });
      expect(getCurrentTimezone('auto')).toBe('America/Los_Angeles');
    });
  });

  describe('parseDateInTimezone', () => {
    it('should parse date string in specified timezone', () => {
      const mockDate = new Date('2024-01-15T00:00:00Z');
      mockLuxon.DateTime.fromISO.mockReturnValue({
        startOf: jest.fn().mockReturnValue({
          toJSDate: jest.fn().mockReturnValue(mockDate)
        })
      });

      const result = parseDateInTimezone('2024-01-15', 'America/New_York');
      expect(result).toBe(mockDate);
      expect(mockLuxon.DateTime.fromISO).toHaveBeenCalledWith('2024-01-15', {
        zone: 'America/New_York'
      });
    });
  });

  describe('normalizeDate', () => {
    it('should set time to midnight', () => {
      const date = new Date('2024-01-15T14:30:45');
      const normalized = normalizeDate(date);

      expect(normalized.getHours()).toBe(0);
      expect(normalized.getMinutes()).toBe(0);
      expect(normalized.getSeconds()).toBe(0);
      expect(normalized.getMilliseconds()).toBe(0);
    });

    it('should preserve date components', () => {
      const date = new Date('2024-01-15T14:30:45');
      const normalized = normalizeDate(date);

      expect(normalized.getFullYear()).toBe(2024);
      expect(normalized.getMonth()).toBe(0); // January
      expect(normalized.getDate()).toBe(15);
    });
  });

  describe('isDateInRange', () => {
    it('should return true for date within range', () => {
      const date = new Date('2024-01-15');
      const start = new Date('2024-01-10');
      const end = new Date('2024-01-20');

      expect(isDateInRange(date, start, end)).toBe(true);
    });

    it('should return true for date equal to start', () => {
      const date = new Date('2024-01-10');
      const start = new Date('2024-01-10');
      const end = new Date('2024-01-20');

      expect(isDateInRange(date, start, end)).toBe(true);
    });

    it('should return true for date equal to end', () => {
      const date = new Date('2024-01-20');
      const start = new Date('2024-01-10');
      const end = new Date('2024-01-20');

      expect(isDateInRange(date, start, end)).toBe(true);
    });

    it('should return false for date before range', () => {
      const date = new Date('2024-01-05');
      const start = new Date('2024-01-10');
      const end = new Date('2024-01-20');

      expect(isDateInRange(date, start, end)).toBe(false);
    });

    it('should return false for date after range', () => {
      const date = new Date('2024-01-25');
      const start = new Date('2024-01-10');
      const end = new Date('2024-01-20');

      expect(isDateInRange(date, start, end)).toBe(false);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date('2024-01-15T10:00:00');
      const date2 = new Date('2024-01-15T20:00:00');

      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2024-01-15T10:00:00');
      const date2 = new Date('2024-01-16T10:00:00');

      expect(isSameDay(date1, date2)).toBe(false);
    });
  });
});

