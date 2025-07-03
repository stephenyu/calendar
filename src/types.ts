/**
 * @fileoverview TypeScript type definitions for the Calendar Application
 * Defines interfaces for YAML configuration, calendar data structures, and DOM elements
 */

// Configuration Types
export interface CalendarConfig {
  years: number[];
  highlightPeriods: HighlightPeriod[];
}

export interface HighlightPeriod {
  start?: string;
  end?: string;
  dates?: string[];
  color: string;
  label?: string;
}

// Normalized Period Types (used internally)
export interface NormalizedPeriod extends HighlightPeriod {
  order: number;
  startDate?: Date;
  endDate?: Date;
  dateObjects?: Date[];
}

// Compression/Decompression Types
export type CompressedData = [
  number[], // compressed years
  CompressedPeriod[] // compressed highlight periods
];

export type CompressedPeriod =
  | [number, number, string, string?] // [start, dayDifference, color, label?] for date ranges
  | [number, string, string?] // [date, color, label?] for single dates
  | [number[], string, string?] // [dates array, color, label?] for multiple dates
  | (string | number)[]; // flexible array type for mixed content

// DOM Element Types
export interface DOMElements {
  configInput: HTMLTextAreaElement;
  saveButton: HTMLButtonElement;
  calendarContainer: HTMLDivElement;
  modal: HTMLDivElement;
  closeBtn: HTMLSpanElement;
  colorInput: HTMLInputElement;
  applyColorBtn: HTMLButtonElement;
}

// Calendar Generation Types
export interface CalendarGenerationOptions {
  years: number[];
  highlightPeriods: HighlightPeriod[];
}

export interface MonthTableOptions {
  year: number;
  month: number;
  periods: NormalizedPeriod[];
  usedPeriods: Set<number>;
}

// Color and Styling Types
export interface ColorGradient {
  colors: string[];
  gradient: string;
}

// URL Compression Types
export interface URLConfig {
  compressed: string;
  original: CalendarConfig;
}

// Utility Types
export type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type MonthName =
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

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DayName = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

// Error Types
export interface CalendarError {
  message: string;
  code: string;
  context?: Record<string, unknown>;
}

// Constants
export const MONTH_NAMES: MonthName[] = [
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

export const DAY_NAMES: DayName[] = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];

export const MONTH_ROWS: Month[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11]
];
