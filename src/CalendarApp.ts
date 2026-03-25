/**
 * @fileoverview Main calendar application orchestrator
 * Coordinates all modules and handles application lifecycle
 */

import { HighlightPeriod } from './types.js';
import { getDefaultConfig } from './services/ConfigManager.js';
import { getConfigFromURL, updateURLWithConfig } from './services/URLManager.js';
import { renderCalendar, DragCallbacks } from './ui/CalendarRenderer.js';
import { DragSelector } from './ui/DragSelector.js';
import { PeriodEditor } from './ui/PeriodEditor.js';

export interface CalendarAppElements {
  calendarContainer: HTMLDivElement;
  periodEditor: HTMLElement;
  yearNav: {
    prevBtn: HTMLButtonElement;
    nextBtn: HTMLButtonElement;
    addBtn: HTMLButtonElement;
    removeBtn: HTMLButtonElement;
    shareBtn: HTMLButtonElement;
    label: HTMLSpanElement;
  };
}

export class CalendarApp {
  private years: number[];
  private periods: HighlightPeriod[];
  private timezone: string;
  private dragSelector: DragSelector;
  private periodEditor: PeriodEditor;

  constructor(private elements: CalendarAppElements) {
    this.years = [new Date().getFullYear()];
    this.periods = [];
    this.timezone = 'local';

    this.dragSelector = new DragSelector(elements.calendarContainer, {
      onDragStart: (_dateStr) => { /* visual handled by DragSelector */ },
      onDragMove: (_dateStr) => { /* visual handled by DragSelector */ },
      onDragEnd: (dateStr) => {
        // dragSelector already cleared classes; show the editor
        // startDate is stored in DragSelector; we get the range via the last move/end
        // We need to track start separately — see startDate field below
        this.periodEditor.show({ start: this.dragStartDate!, end: dateStr });
      },
      onDragCancel: () => { /* nothing extra needed */ }
    });

    this.periodEditor = new PeriodEditor(
      elements.periodEditor,
      (period) => this.addPeriod(period),
      () => this.dragSelector.clearSelection()
    );

    this.setupYearNav();
  }

  private dragStartDate: string | null = null;

  init(): void {
    const configFromURL = getConfigFromURL();

    if (configFromURL) {
      this.years = configFromURL.years;
      this.periods = configFromURL.highlightPeriods;
      this.timezone = configFromURL.timezone ?? 'local';
    } else {
      const defaultConfig = getDefaultConfig();
      this.years = defaultConfig.years;
      this.periods = defaultConfig.highlightPeriods;
    }

    this.render();
  }

  private render(): void {
    this.updateYearLabel();

    const dragCallbacks: DragCallbacks = {
      onDragStart: (dateStr) => {
        this.dragStartDate = dateStr;
        this.dragSelector.startDrag(dateStr);
      },
      onDragMove: (dateStr) => {
        this.dragSelector.continueDrag(dateStr);
      }
    };

    renderCalendar(
      this.elements.calendarContainer,
      this.years,
      this.periods,
      this.timezone,
      dragCallbacks,
      (order) => this.deletePeriod(order),
      () => this.dragSelector.dragging
    );

    updateURLWithConfig({
      years: this.years,
      highlightPeriods: this.periods,
      timezone: this.timezone
    });
  }

  private addPeriod(period: HighlightPeriod): void {
    this.periods.push(period);
    this.render();
  }

  private deletePeriod(order: number): void {
    this.periods.splice(order, 1);
    this.render();
  }

  private updateYearLabel(): void {
    const min = Math.min(...this.years);
    const max = Math.max(...this.years);
    this.elements.yearNav.label.textContent = min === max ? `${min}` : `${min} – ${max}`;
  }

  private setupYearNav(): void {
    const { prevBtn, nextBtn, addBtn, removeBtn, shareBtn } = this.elements.yearNav;

    prevBtn.addEventListener('click', () => {
      this.years = this.years.map(y => y - 1);
      this.render();
    });

    nextBtn.addEventListener('click', () => {
      this.years = this.years.map(y => y + 1);
      this.render();
    });

    addBtn.addEventListener('click', () => {
      const max = Math.max(...this.years);
      this.years = [...this.years, max + 1];
      this.render();
    });

    removeBtn.addEventListener('click', () => {
      if (this.years.length <= 1) return;
      this.years = this.years.slice(0, -1);
      this.render();
    });

    shareBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const orig = shareBtn.textContent;
        shareBtn.textContent = 'Copied!';
        setTimeout(() => { shareBtn.textContent = orig; }, 1500);
      });
    });
  }
}
