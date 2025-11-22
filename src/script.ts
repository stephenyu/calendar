/**
 * @fileoverview Customizable Calendar Application (Refactored)
 * A web-based calendar application with YAML configuration support.
 * Features include multi-year view, color-coded periods, and URL sharing.
 *
 * @version 2.0.0
 * @author Stephen Yu
 */

import { CalendarApp, CalendarAppElements } from './CalendarApp.js';
import { ColorPickerElements } from './ui/ColorPicker.js';

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
  // Get DOM elements
  const configInput = document.getElementById(
    'config-input'
  ) as HTMLTextAreaElement;
  const saveButton = document.getElementById('save-button') as HTMLButtonElement;
  const calendarContainer = document.getElementById(
    'calendar-container'
  ) as HTMLDivElement;
  const timezoneSelect = document.getElementById(
    'timezone-select'
  ) as HTMLSelectElement;

  // Modal Elements
  const modal = document.getElementById('color-picker-modal') as HTMLDivElement;
  const closeBtn = modal?.querySelector('.close') as HTMLSpanElement;
  const colorInput = document.getElementById('color-input') as HTMLInputElement;
  const applyColorBtn = document.getElementById(
    'apply-color'
  ) as HTMLButtonElement;

  // Validate all elements exist
  if (
    !configInput ||
    !saveButton ||
    !calendarContainer ||
    !timezoneSelect ||
    !modal ||
    !closeBtn ||
    !colorInput ||
    !applyColorBtn
  ) {
    console.error('[Init] Missing required DOM elements');
    return;
  }

  // Create elements object
  const elements: CalendarAppElements = {
    configInput,
    saveButton,
    calendarContainer,
    timezoneSelect,
    colorPicker: {
      modal,
      closeBtn,
      colorInput,
      applyColorBtn
    }
  };

  // Initialize application
  const app = new CalendarApp(elements);
  app.init();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
