/**
 * @fileoverview Customizable Calendar Application
 * A web-based calendar application with drag-to-select period creation.
 *
 * @version 3.0.0
 * @author Stephen Yu
 */

import { CalendarApp, CalendarAppElements } from './CalendarApp.js';

// External library declarations (loaded from CDN in browser)
declare const LZString: {
  compressToEncodedURIComponent(str: string): string;
  decompressFromEncodedURIComponent(str: string): string;
};

declare const jsyaml: {
  load(str: string): any;
  dump(obj: any): string;
};

declare const luxon: {
  DateTime: {
    local(): {
      zoneName: string;
    };
  };
};

/**
 * Gets DOM elements and initializes the calendar application
 */
function init(): void {
  const calendarContainer = document.getElementById('calendar-container') as HTMLDivElement;
  const periodEditor = document.getElementById('period-editor') as HTMLElement;
  const prevBtn = document.getElementById('prev-year-btn') as HTMLButtonElement;
  const nextBtn = document.getElementById('next-year-btn') as HTMLButtonElement;
  const addBtn = document.getElementById('add-year-btn') as HTMLButtonElement;
  const removeBtn = document.getElementById('remove-year-btn') as HTMLButtonElement;
  const shareBtn = document.getElementById('share-btn') as HTMLButtonElement;
  const label = document.getElementById('current-years-label') as HTMLSpanElement;

  if (
    !calendarContainer ||
    !periodEditor ||
    !prevBtn ||
    !nextBtn ||
    !addBtn ||
    !removeBtn ||
    !shareBtn ||
    !label
  ) {
    console.error('[Init] Missing required DOM elements');
    return;
  }

  const elements: CalendarAppElements = {
    calendarContainer,
    periodEditor,
    yearNav: { prevBtn, nextBtn, addBtn, removeBtn, shareBtn, label }
  };

  const app = new CalendarApp(elements);
  app.init();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
