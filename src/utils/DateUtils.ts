/**
 * @fileoverview Date utility functions for timezone-aware date parsing
 * Handles date parsing in specific timezones using Luxon
 */

// External library declarations (loaded from CDN in browser)
declare const luxon: {
  DateTime: {
    fromISO(
      text: string,
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

/**
 * Gets the current timezone from the selector or browser default
 * @param timezoneValue - The timezone selector value ('auto' or IANA timezone)
 * @returns IANA timezone string
 */
export function getCurrentTimezone(timezoneValue: string): string {
  return timezoneValue === 'auto' ? luxon.DateTime.local().zoneName : timezoneValue;
}

/**
 * Parses a date string (YYYY-MM-DD) in the specified timezone
 * Handles daylight savings and timezone offsets correctly
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @returns Date object set to midnight in the specified timezone
 */
export function parseDateInTimezone(dateStr: string, timezone: string): Date {
  const dt = luxon.DateTime.fromISO(dateStr, { zone: timezone });
  return dt.startOf('day').toJSDate();
}

/**
 * Normalizes a date to midnight in local time (for comparison)
 * @param date - Date object to normalize
 * @returns Date object set to midnight
 */
export function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Checks if a date falls within a date range (inclusive)
 * @param date - Date to check
 * @param startDate - Start of range
 * @param endDate - End of range
 * @returns True if date is within range
 */
export function isDateInRange(
  date: Date,
  startDate: Date,
  endDate: Date
): boolean {
  const normalizedDate = normalizeDate(date);
  const normalizedStart = normalizeDate(startDate);
  const normalizedEnd = normalizeDate(endDate);
  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}

/**
 * Checks if a date matches another date (same day)
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return normalizeDate(date1).getTime() === normalizeDate(date2).getTime();
}

