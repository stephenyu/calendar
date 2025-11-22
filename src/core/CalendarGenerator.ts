/**
 * @fileoverview Core calendar generation logic
 * Handles normalization of periods and calendar data structure
 */

import {
  HighlightPeriod,
  NormalizedPeriod
} from '../types.js';
import { parseDateInTimezone } from '../utils/DateUtils.js';

/**
 * Normalizes highlight periods by converting date strings to Date objects
 * @param periods - Array of highlight periods with date strings
 * @param timezone - IANA timezone string for date interpretation
 * @returns Array of normalized periods with Date objects
 */
export function normalizePeriods(
  periods: HighlightPeriod[],
  timezone: string
): NormalizedPeriod[] {
  return periods.map((period, index) => {
    const normalized: NormalizedPeriod = { ...period, order: index };

    if (period.start) {
      normalized.startDate = parseDateInTimezone(period.start, timezone);
    }

    if (period.end) {
      normalized.endDate = parseDateInTimezone(period.end, timezone);
    }

    if (period.dates) {
      normalized.dateObjects = period.dates.map((dateStr: string): Date => {
        return parseDateInTimezone(dateStr, timezone);
      });
    }

    return normalized;
  });
}

/**
 * Checks if a date matches any period and returns matching colors
 * @param date - Date to check
 * @param periods - Array of normalized periods
 * @param usedPeriods - Set to track which periods are used (mutated)
 * @returns Array of colors for matching periods
 */
export function getColorsForDate(
  date: Date,
  periods: NormalizedPeriod[],
  usedPeriods: Set<number>
): string[] {
  const colors: string[] = [];

  for (let i = 0; i < periods.length; i++) {
    const period: NormalizedPeriod = periods[i]!;

    // Check date range
    if (period.startDate && period.endDate) {
      if (date >= period.startDate && date <= period.endDate) {
        colors.push(period.color);
        usedPeriods.add(i);
      }
    } else if (period.dateObjects) {
      // Check individual dates
      for (const dObj of period.dateObjects) {
        if (date.getTime() === dObj.getTime()) {
          colors.push(period.color);
          usedPeriods.add(i);
          break; // Found match, no need to check other dates in this period
        }
      }
    }
  }

  return colors;
}
