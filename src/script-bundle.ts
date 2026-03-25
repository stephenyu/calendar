/**
 * @fileoverview Customizable Calendar Application (Bundled)
 * Drag-to-select calendar with period management.
 *
 * @version 4.0.0
 * @author Stephen Yu
 */

// ============================================================================
// EXTERNAL LIBRARY IMPORTS
// ============================================================================

import LZString from 'lz-string';
import { DateTime } from 'luxon';

// ============================================================================
// TYPES
// ============================================================================

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

interface NormalizedPeriod extends HighlightPeriod {
  order: number;
  startDate?: Date;
  endDate?: Date;
  dateObjects?: Date[];
}


type CompressedData = [number[], CompressedPeriod[], string?];

type CompressedPeriod =
  | [number, number, string, string?]
  | [number, string, string?]
  | [number[], string, string?]
  | (string | number)[];

type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_ROWS: Month[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11]
];

// ============================================================================
// URL MANAGER
// ============================================================================

function compressConfig(config: CalendarConfig): string | null {
  try {
    const data: CompressedData = [[], []];
    data[0] = config.years.map(y => y - 2024);
    data[1] = config.highlightPeriods.map((p): CompressedPeriod => {
      if (p.start && p.end) {
        const s = Math.floor(new Date(p.start).getTime() / 100000);
        const diff = Math.ceil((new Date(p.end).getTime() - new Date(p.start).getTime()) / 86400000);
        const r: (number | string)[] = [s, diff, p.color];
        if (p.label) r.push(p.label);
        return r as CompressedPeriod;
      } else if (p.dates) {
        const sorted = p.dates.map(d => Math.floor(new Date(d).getTime() / 100000)).sort((a, b) => a - b);
        if (sorted.length === 1) {
          const r: (number | string)[] = [sorted[0]!, p.color];
          if (p.label) r.push(p.label);
          return r as CompressedPeriod;
        }
        const base = sorted[0]!;
        const diffs = sorted.slice(1).map(d => (d - base) / (86400000 / 100000));
        const r: ([number[], string] | [number[], string, string]) = [[base, ...diffs], p.color];
        if (p.label) (r as (number[] | string)[]).push(p.label);
        return r as CompressedPeriod;
      }
      return p as unknown as CompressedPeriod;
    });
    if (config.timezone && config.timezone !== 'local') data[2] = config.timezone;
    const json = JSON.stringify(data);
    return json.slice(1, -1);
  } catch (e) {
    return null;
  }
}

function decompressConfig(compressed: string): CalendarConfig | null {
  try {
    const parsed = JSON.parse(`[${compressed}]`) as CompressedData;
    const result: CalendarConfig = { years: [], highlightPeriods: [] };
    if (parsed[0]) result.years = parsed[0].map(y => y + 2024);
    if (parsed[1]) {
      result.highlightPeriods = parsed[1].map((p): HighlightPeriod => {
        if (Array.isArray(p)) {
          if (typeof p[0] === 'number' && typeof p[1] === 'number') {
            const e = (p[0] as number) * 100000;
            const hp: HighlightPeriod = {
              start: new Date(e).toISOString().split('T')[0]!,
              end: new Date(e + (p[1] as number) * 86400000).toISOString().split('T')[0]!,
              color: p[2] as string
            };
            if (p[3]) hp.label = p[3] as string;
            return hp;
          } else if (Array.isArray(p[0])) {
            const base = (p[0][0] as number) * 100000;
            const dates = [new Date(base).toISOString().split('T')[0]!];
            (p[0] as number[]).slice(1).forEach(d => dates.push(new Date(base + d * 86400000).toISOString().split('T')[0]!));
            const hp: HighlightPeriod = { dates, color: p[1] as string };
            if (p[2]) hp.label = p[2] as string;
            return hp;
          } else {
            const hp: HighlightPeriod = { dates: [new Date((p[0] as number) * 100000).toISOString().split('T')[0]!], color: p[1] as string };
            if (p[2]) hp.label = p[2] as string;
            return hp;
          }
        }
        return p as HighlightPeriod;
      });
    }
    if (parsed[2]) result.timezone = parsed[2];
    return result;
  } catch (e) {
    return null;
  }
}

function getConfigFromURL(): CalendarConfig | null {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  try {
    return decompressConfig(LZString.decompressFromEncodedURIComponent(hash));
  } catch (e) {
    return null;
  }
}

function updateURLWithConfig(config: CalendarConfig): void {
  const compressed = compressConfig(config);
  if (compressed) {
    window.history.replaceState(null, '', `#${LZString.compressToEncodedURIComponent(compressed)}`);
  }
}

// ============================================================================
// DATE / GRADIENT UTILS
// ============================================================================

function parseDateInTimezone(dateStr: string, timezone: string): Date {
  const tz = timezone === 'local' ? DateTime.local().zoneName : timezone;
  return DateTime.fromISO(dateStr, { zone: tz }).startOf('day').toJSDate();
}

function generateGradient(colors: string[]): string {
  if (colors.length === 1) return colors[0]!;
  const pct = 100 / colors.length;
  return `linear-gradient(to bottom, ${colors.map((c, i) => `${c} ${pct * i}%, ${c} ${pct * (i + 1)}%`).join(', ')})`;
}

function getTextColor(colors: string[]): string {
  const hexColors = colors.filter(c => /^#[0-9a-fA-F]{6}$/.test(c));
  if (hexColors.length === 0) return 'white';
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const luminance = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };
  const avg = hexColors.reduce((sum, c) => sum + luminance(c), 0) / hexColors.length;
  return avg > 0.179 ? '#222' : 'white';
}

// ============================================================================
// SELECTION STATS
// ============================================================================

function enumerateDates(lo: string, hi: string): string[] {
  const dates: string[] = [];
  const cur = new Date(lo + 'T12:00:00');
  const end = new Date(hi + 'T12:00:00');
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0]!);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function countSelectionStats(dates: string[]): { total: number; workdays: number; weekends: number } {
  let total = 0, workdays = 0, weekends = 0;
  for (const d of dates) {
    total++;
    const day = new Date(d + 'T12:00:00').getDay();
    (day === 0 || day === 6) ? weekends++ : workdays++;
  }
  return { total, workdays, weekends };
}

// ============================================================================
// CALENDAR GENERATOR (normalization + color lookup)
// ============================================================================

function normalizePeriods(periods: HighlightPeriod[], timezone: string): NormalizedPeriod[] {
  return periods.map((p, i) => {
    const np: NormalizedPeriod = { ...p, order: i };
    if (p.start) np.startDate = parseDateInTimezone(p.start, timezone);
    if (p.end) np.endDate = parseDateInTimezone(p.end, timezone);
    if (p.dates) np.dateObjects = p.dates.map(d => parseDateInTimezone(d, timezone));
    return np;
  });
}

function getColorsForDate(
  date: Date,
  periods: NormalizedPeriod[],
  usedPeriods: Set<number>
): { colors: string[]; matchingPeriods: NormalizedPeriod[] } {
  const colors: string[] = [];
  const matchingPeriods: NormalizedPeriod[] = [];
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i]!;
    const matches = p.startDate && p.endDate
      ? date >= p.startDate && date <= p.endDate
      : (p.dateObjects ?? []).some(d => d.getTime() === date.getTime());
    if (matches) {
      colors.push(p.color);
      matchingPeriods.push(p);
      usedPeriods.add(i);
    }
  }
  return { colors, matchingPeriods };
}

// ============================================================================
// CALENDAR RENDERER
// ============================================================================

interface DragCallbacks {
  onDragStart: (dateStr: string) => void;
  onDragMove: (dateStr: string) => void;
}

// Pre-compute today's date string once
const todayStr = (() => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
})();

function createMonthTable(
  year: number,
  month: Month,
  periods: NormalizedPeriod[],
  usedPeriods: Set<number>,
  timezone: string,
  dragCallbacks?: DragCallbacks
): HTMLTableElement {
  const table = document.createElement('table');
  table.className = 'month-table';

  // ── Header: month name ──
  const thead = document.createElement('thead');

  const nameRow = document.createElement('tr');
  nameRow.className = 'month-name-row';
  const nameTh = document.createElement('th');
  nameTh.colSpan = 7;
  nameTh.textContent = MONTH_NAMES[month]!;
  nameRow.appendChild(nameTh);
  thead.appendChild(nameRow);

  // ── Header: weekday labels (Monday first) ──
  const wdRow = document.createElement('tr');
  wdRow.className = 'weekday-row';
  // Mon=0 … Sat=5, Sun=6 in our layout
  const wdLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  wdLabels.forEach((lbl, i) => {
    const th = document.createElement('th');
    th.textContent = lbl;
    if (i >= 5) th.classList.add('weekend-header'); // Sat + Sun
    wdRow.appendChild(th);
  });
  thead.appendChild(wdRow);
  table.appendChild(thead);

  // ── Body ──
  const tbody = document.createElement('tbody');

  // Monday-based first day offset (0=Mon … 6=Sun)
  const firstDayMon = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate(); // last day of prev month
  const weeks = Math.ceil((firstDayMon + daysInMonth) / 7);

  let currentDay = 1;
  let nextMonthDay = 1;

  for (let w = 0; w < weeks; w++) {
    const tr = document.createElement('tr');

    for (let d = 0; d < 7; d++) {
      const td = document.createElement('td');
      const cellIndex = w * 7 + d;
      const isWeekend = d >= 5; // col 5=Sat, col 6=Sun

      if (cellIndex < firstDayMon) {
        // ── Previous month overflow ──
        td.textContent = String(prevMonthLastDay - (firstDayMon - 1 - cellIndex));
        td.classList.add('out-of-month');
        if (isWeekend) td.classList.add('weekend-day');

      } else if (currentDay <= daysInMonth) {
        // ── Current month day ──
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(currentDay).padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;
        const dateObj = parseDateInTimezone(dateStr, timezone);

        td.textContent = String(currentDay);
        td.classList.add('day-cell');
        td.dataset.date = dateStr;

        if (isWeekend) td.classList.add('weekend-day');
        if (dateStr === todayStr) td.classList.add('today');

        const { colors, matchingPeriods } = getColorsForDate(dateObj, periods, usedPeriods);
        if (colors.length > 0) {
          td.style.background = generateGradient(colors);
          td.style.color = getTextColor(colors);
          td.classList.add('has-highlight');
          const labels = matchingPeriods.map(p => p.label).filter(Boolean).join(', ');
          if (labels) td.dataset.labels = labels;
        }

        if (dragCallbacks) {
          td.addEventListener('mousedown', e => {
            e.preventDefault();
            dragCallbacks.onDragStart(dateStr);
          });
          td.addEventListener('mouseover', () => dragCallbacks.onDragMove(dateStr));
        }

        currentDay++;

      } else {
        // ── Next month overflow ──
        td.textContent = String(nextMonthDay++);
        td.classList.add('out-of-month');
        if (isWeekend) td.classList.add('weekend-day');
      }

      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  return table;
}

function renderCalendar(
  container: HTMLDivElement,
  years: number[],
  periods: HighlightPeriod[],
  timezone: string,
  dragCallbacks?: DragCallbacks,
  onDeletePeriod?: (index: number) => void,
  isDragging?: () => boolean
): void {
  container.innerHTML = '';
  const normalizedPeriods = normalizePeriods(periods, timezone);

  const layout = document.createElement('div');
  layout.className = 'calendar-layout';

  // Legend on the left (always rendered to keep calendar position stable)
  const legend = document.createElement('div');
  legend.className = 'legend';
  if (periods.length > 0 && onDeletePeriod) {
    const legendInner = document.createElement('div');
    legendInner.className = 'legend-inner';
    periods.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'legend-item';

      const swatch = document.createElement('div');
      swatch.className = 'legend-color';
      swatch.style.backgroundColor = p.color;

      const lbl = document.createElement('span');
      lbl.textContent = p.label ?? `Period ${i + 1}`;

      const del = document.createElement('button');
      del.className = 'legend-delete';
      del.textContent = '×';
      del.addEventListener('click', () => onDeletePeriod(i));

      item.append(swatch, lbl, del);
      legendInner.appendChild(item);
    });
    legend.appendChild(legendInner);
  }
  layout.appendChild(legend);

  // Calendar content on the right
  const content = document.createElement('div');
  content.className = 'calendar-content';

  for (const year of years) {
    const calDiv = document.createElement('div');
    calDiv.className = 'calendar';

    const yearTable = document.createElement('table');
    yearTable.className = 'year-table';
    const tbody = document.createElement('tbody');

    for (const rowMonths of MONTH_ROWS) {
      const tr = document.createElement('tr');
      for (const mi of rowMonths) {
        const td = document.createElement('td');
        const usedPeriods = new Set<number>();
        td.appendChild(createMonthTable(year, mi, normalizedPeriods, usedPeriods, timezone, dragCallbacks));
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    yearTable.appendChild(tbody);
    calDiv.appendChild(yearTable);
    content.appendChild(calDiv);
  }

  layout.appendChild(content);
  container.appendChild(layout);

  initializeTooltips(container, isDragging);
}

function initializeTooltips(container: HTMLDivElement, isDragging?: () => boolean): void {
  let tooltip = document.getElementById('calendar-tooltip') as HTMLDivElement | null;
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'calendar-tooltip';
    tooltip.className = 'calendar-tooltip';
    document.body.appendChild(tooltip);
  }
  container.querySelectorAll('td.has-highlight').forEach(cell => {
    const td = cell as HTMLTableCellElement;
    td.addEventListener('mouseenter', () => {
      if (isDragging && isDragging()) return;
      const labels = td.dataset.labels;
      if (labels && tooltip) {
        tooltip.textContent = labels;
        tooltip.style.display = 'block';
        const rect = td.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 5}px`;
      }
    });
    td.addEventListener('mouseleave', () => { if (tooltip) tooltip.style.display = 'none'; });
  });
}

// ============================================================================
// DRAG SELECTOR
// ============================================================================

class DragSelector {
  private _isDragging = false;
  private _mode: 'select' | 'erase' | 'exclude' = 'select';
  private startDate: string | null = null;
  private endDate: string | null = null;

  constructor(
    private container: HTMLElement,
    private callbacks: {
      onDragEnd: (start: string, end: string) => void;
      onDragMove: (start: string, end: string) => void;
      onDragCancel: () => void;
    }
  ) {
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('mouseleave', this.handleDocumentLeave.bind(this));
  }

  startDrag(dateStr: string, mode: 'select' | 'erase' | 'exclude' = 'select'): void {
    this._isDragging = true;
    this._mode = mode;
    this.startDate = dateStr;
    this.endDate = dateStr;
    this.updateClasses();
  }

  get isEraseMode(): boolean { return this._mode === 'erase'; }
  get isExcludeMode(): boolean { return this._mode === 'exclude'; }

  continueDrag(dateStr: string): void {
    if (!this._isDragging) return;
    this.endDate = dateStr;
    this.updateClasses();
    this.callbacks.onDragMove(this.startDate!, dateStr);
  }

  get dragging(): boolean { return this._isDragging; }

  clearSelection(): void {
    this._isDragging = false;
    this.startDate = null;
    this.endDate = null;
    this.clearClasses();
  }

  private handleMouseUp(): void {
    if (!this._isDragging) return;
    const start = this.startDate!;
    const end = this.endDate!;
    this._isDragging = false;
    // Keep selection highlighted — cleared by user action
    this.callbacks.onDragEnd(start, end);
  }

  private handleDocumentLeave(): void {
    if (!this._isDragging) return;
    this._isDragging = false;
    this.clearClasses();
    this.callbacks.onDragCancel();
  }

  private updateClasses(): void {
    if (!this.startDate || !this.endDate) return;
    const [lo, hi] = [this.startDate, this.endDate].sort();
    if (this._mode === 'exclude') {
      this.container.querySelectorAll<HTMLTableCellElement>('td.day-cell[data-date]').forEach(cell => {
        cell.classList.remove('drag-selecting', 'drag-erasing');
        const inRange = cell.dataset.date! >= lo && cell.dataset.date! <= hi;
        cell.classList.toggle('drag-excluding', inRange && cell.classList.contains('color-preview'));
      });
      return;
    }
    const cls = this._mode === 'erase' ? 'drag-erasing' : 'drag-selecting';
    const other = this._mode === 'erase' ? 'drag-selecting' : 'drag-erasing';
    this.container.querySelectorAll<HTMLTableCellElement>('td.day-cell[data-date]').forEach(cell => {
      cell.classList.remove(other);
      cell.classList.toggle(cls, cell.dataset.date! >= lo && cell.dataset.date! <= hi);
    });
  }

  private clearClasses(): void {
    this.container.querySelectorAll('td.drag-selecting,td.drag-erasing,td.drag-excluding').forEach(c => {
      c.classList.remove('drag-selecting', 'drag-erasing', 'drag-excluding');
    });
  }
}

// ============================================================================
// CALENDAR APP
// ============================================================================

class CalendarApp {
  private years: number[];
  private periods: HighlightPeriod[];
  private timezone: string;
  private dragSelector!: DragSelector;
  private selectedDates: Set<string> = new Set();

  // DOM refs
  private calendarContainer!: HTMLDivElement;
  private yearsLabel!: HTMLSpanElement;
  private selectionPanel!: HTMLElement;
  private selectionStats!: HTMLElement;
  private editorName!: HTMLInputElement;
  private editorColor!: HTMLInputElement;
  private editorConfirm!: HTMLButtonElement;
  private editorCancel!: HTMLButtonElement;
  private editorRemoveWeekends!: HTMLButtonElement;
  private prevBtn!: HTMLButtonElement;
  private nextBtn!: HTMLButtonElement;

  constructor() {
    this.years = [new Date().getFullYear()];
    this.periods = [];
    this.timezone = 'local';
    this.queryDOM();
    this.setupDragSelector();
    this.setupEventListeners();
  }

  private queryDOM(): void {
    this.calendarContainer = document.getElementById('calendar-container') as HTMLDivElement;
    this.yearsLabel = document.getElementById('current-years-label') as HTMLSpanElement;
    this.selectionPanel = document.getElementById('selection-panel') as HTMLElement;
    this.selectionStats = document.getElementById('selection-stats') as HTMLElement;
    this.editorName = document.getElementById('editor-name') as HTMLInputElement;
    this.editorColor = document.getElementById('editor-color') as HTMLInputElement;
    this.editorConfirm = document.getElementById('editor-confirm') as HTMLButtonElement;
    this.editorCancel = document.getElementById('editor-cancel') as HTMLButtonElement;
    this.editorRemoveWeekends = document.getElementById('editor-remove-weekends') as HTMLButtonElement;
    this.prevBtn = document.getElementById('prev-year-btn') as HTMLButtonElement;
    this.nextBtn = document.getElementById('next-year-btn') as HTMLButtonElement;
  }

  private setupDragSelector(): void {
    this.dragSelector = new DragSelector(this.calendarContainer, {
      onDragEnd: (start, end) => {
        if (this.dragSelector.isExcludeMode) {
          const [lo, hi] = [start, end].sort();
          enumerateDates(lo, hi).forEach(d => this.selectedDates.delete(d));
          this.dragSelector.clearSelection();
          this.applyColorPreview();
          this.updateSelectionStats();
          if (this.selectedDates.size === 0) {
            this.selectionPanel.setAttribute('hidden', '');
          } else {
            this.selectionPanel.removeAttribute('hidden');
          }
        } else if (this.dragSelector.isEraseMode) {
          this.handleErasePeriods(start, end);
        } else {
          const [lo, hi] = [start, end].sort();
          enumerateDates(lo, hi).forEach(d => this.selectedDates.add(d));
          this.applyColorPreview();
          this.updateSelectionStats();
          this.selectionPanel.removeAttribute('hidden');
        }
      },
      onDragMove: (start, end) => {
        if (!this.dragSelector.isEraseMode && !this.dragSelector.isExcludeMode) {
          const [lo, hi] = [start, end].sort();
          const dragDates = enumerateDates(lo, hi);
          const combined = new Set([...this.selectedDates, ...dragDates]);
          this.updateSelectionStatsFromDates(combined);
          this.selectionPanel.removeAttribute('hidden');
        }
      },
      onDragCancel: () => {
        if (!this.dragSelector.isExcludeMode) {
          this.clearSelection();
        }
      }
    });
  }

  private setupEventListeners(): void {
    this.editorConfirm.addEventListener('click', () => this.handleAddPeriod());
    this.editorCancel.addEventListener('click', () => this.clearSelection());
    this.editorColor.addEventListener('input', () => this.applyColorPreview());
    this.editorRemoveWeekends.addEventListener('click', () => this.handleRemoveWeekends());

    this.prevBtn.addEventListener('click', () => { this.years = this.years.map(y => y - 1); this.render(); });
    this.nextBtn.addEventListener('click', () => { this.years = this.years.map(y => y + 1); this.render(); });
  }

  private applyColorPreview(): void {
    const color = this.editorColor.value;
    this.calendarContainer.querySelectorAll<HTMLTableCellElement>(
      'td.color-preview,td.drag-selecting,td.drag-excluding'
    ).forEach(cell => {
      cell.style.background = '';
      cell.style.color = '';
      cell.classList.remove('color-preview', 'drag-selecting', 'drag-excluding');
    });
    this.calendarContainer.querySelectorAll<HTMLTableCellElement>('td.day-cell[data-date]').forEach(cell => {
      if (this.selectedDates.has(cell.dataset.date!)) {
        cell.classList.add('color-preview');
        cell.style.background = color;
        cell.style.color = getTextColor([color]);
      }
    });
  }

  private updateSelectionStats(): void {
    this.updateSelectionStatsFromDates(this.selectedDates);
  }

  private updateSelectionStatsFromDates(dates: Set<string>): void {
    const s = countSelectionStats([...dates]);
    this.selectionStats.textContent =
      `${s.total} day${s.total !== 1 ? 's' : ''} | ${s.workdays} Workday${s.workdays !== 1 ? 's' : ''} | ${s.weekends} Weekend${s.weekends !== 1 ? 's' : ''}`;
  }

  private handleRemoveWeekends(): void {
    this.selectedDates.forEach(d => {
      const day = new Date(d + 'T12:00:00').getDay();
      if (day === 0 || day === 6) this.selectedDates.delete(d);
    });
    this.applyColorPreview();
    this.updateSelectionStats();
    if (this.selectedDates.size === 0) this.selectionPanel.setAttribute('hidden', '');
  }

  private clearSelection(): void {
    this.selectedDates.clear();
    this.calendarContainer.querySelectorAll<HTMLTableCellElement>('td.color-preview').forEach(cell => {
      cell.style.background = '';
      cell.style.color = '';
      cell.classList.remove('color-preview');
    });
    this.dragSelector.clearSelection();
    this.selectionPanel.setAttribute('hidden', '');
    this.editorName.value = '';
  }

  private handleAddPeriod(): void {
    if (this.selectedDates.size === 0) return;
    const dates = [...this.selectedDates].sort();
    const color = this.editorColor.value;
    const label = this.editorName.value.trim() || undefined;
    let period: HighlightPeriod;
    if (dates.length === 1) {
      period = { dates, color, label };
    } else {
      const contiguous = enumerateDates(dates[0]!, dates[dates.length - 1]!);
      period = contiguous.length === dates.length
        ? { start: dates[0]!, end: dates[dates.length - 1]!, color, label }
        : { dates, color, label };
    }
    this.periods.push(period);
    this.clearSelection();
    this.render();
  }

  private isDateHighlighted(dateStr: string): boolean {
    return this.periods.some(p => {
      if (p.start && p.end) return dateStr >= p.start && dateStr <= p.end;
      if (p.dates) return p.dates.includes(dateStr);
      return false;
    });
  }

  private handleErasePeriods(start: string, end: string): void {
    const [lo, hi] = [start, end].sort();
    const addDays = (dateStr: string, n: number): string => {
      const d = new Date(dateStr + 'T12:00:00');
      d.setDate(d.getDate() + n);
      return d.toISOString().split('T')[0]!;
    };
    const newPeriods: HighlightPeriod[] = [];
    for (const p of this.periods) {
      if (p.start && p.end) {
        if (p.end < lo || p.start > hi) {
          newPeriods.push(p);
        } else {
          if (p.start < lo) newPeriods.push({ ...p, end: addDays(lo, -1) });
          if (p.end > hi) newPeriods.push({ ...p, start: addDays(hi, 1) });
        }
      } else if (p.dates) {
        const remaining = p.dates.filter(d => d < lo || d > hi);
        if (remaining.length > 0) newPeriods.push({ ...p, dates: remaining });
      } else {
        newPeriods.push(p);
      }
    }
    this.periods = newPeriods;
    this.dragSelector.clearSelection();
    this.render();
  }

  init(): void {
    const fromURL = getConfigFromURL();
    if (fromURL) {
      this.years = fromURL.years;
      this.periods = fromURL.highlightPeriods;
      this.timezone = fromURL.timezone ?? 'local';
    }
    this.render();
  }

  private render(): void {
    const min = Math.min(...this.years);
    const max = Math.max(...this.years);
    this.yearsLabel.textContent = min === max ? String(min) : `${min}–${max}`;

    const dragCallbacks: DragCallbacks = {
      onDragStart: (dateStr) => {
        const cell = this.calendarContainer.querySelector<HTMLTableCellElement>(`td.day-cell[data-date="${dateStr}"]`);
        const isInSelection = cell?.classList.contains('color-preview') ?? false;
        if (isInSelection) {
          this.dragSelector.startDrag(dateStr, 'exclude');
        } else {
          const erase = this.isDateHighlighted(dateStr);
          this.dragSelector.startDrag(dateStr, erase ? 'erase' : 'select');
        }
      },
      onDragMove: (dateStr) => this.dragSelector.continueDrag(dateStr)
    };

    renderCalendar(
      this.calendarContainer,
      this.years,
      this.periods,
      this.timezone,
      dragCallbacks,
      i => { this.periods.splice(i, 1); this.render(); },
      () => this.dragSelector.dragging
    );

    updateURLWithConfig({ years: this.years, highlightPeriods: this.periods, timezone: this.timezone });
  }
}

// ============================================================================
// INIT
// ============================================================================

function init(): void {
  const app = new CalendarApp();
  app.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
