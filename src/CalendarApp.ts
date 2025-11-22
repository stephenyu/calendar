/**
 * @fileoverview Main calendar application orchestrator
 * Coordinates all modules and handles application lifecycle
 */

import { CalendarConfig } from './types.js';
import { parseAndValidateYAML, getDefaultConfig, configToYAML } from './services/ConfigManager.js';
import { getConfigFromURL, updateURLWithConfig } from './services/URLManager.js';
import { getCurrentTimezone } from './utils/DateUtils.js';
import { renderCalendar } from './ui/CalendarRenderer.js';
import { ColorPicker, ColorPickerElements } from './ui/ColorPicker.js';

export interface CalendarAppElements {
  configInput: HTMLTextAreaElement;
  saveButton: HTMLButtonElement;
  calendarContainer: HTMLDivElement;
  timezoneSelect: HTMLSelectElement;
  colorPicker: ColorPickerElements;
}

export class CalendarApp {
  private elements: CalendarAppElements;
  private colorPicker: ColorPicker;

  constructor(elements: CalendarAppElements) {
    this.elements = elements;
    this.colorPicker = new ColorPicker(
      elements.colorPicker,
      elements.configInput
    );
    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for the application
   */
  private setupEventListeners(): void {
    this.elements.saveButton.addEventListener('click', () => {
      this.handleSave();
    });
  }

  /**
   * Handles save button click - parses config and renders calendar
   */
  private handleSave(): void {
    const input: string = this.elements.configInput.value;
    const result = parseAndValidateYAML(input);

    if (!result.valid || !result.config) {
      const errorMessage = result.error || 'Invalid configuration format.';
      console.error('[CalendarApp] Error:', errorMessage);
      alert(`Error parsing configuration: ${errorMessage}`);
      return;
    }

    const config = result.config;
    const years: number[] = config.years;
    const highlightPeriods = config.highlightPeriods;
    const timezone: string = getCurrentTimezone(
      this.elements.timezoneSelect.value
    );

    // Render calendar
    renderCalendar(
      this.elements.calendarContainer,
      years,
      highlightPeriods,
      timezone
    );

    // Update URL with config (including timezone)
    const configWithTimezone: CalendarConfig = { ...config, timezone };
    updateURLWithConfig(configWithTimezone);
  }

  /**
   * Initializes the calendar application
   * Sets up default configuration or loads from URL parameters
   */
  init(): void {
    const configFromURL = getConfigFromURL();

    if (configFromURL) {
      // Load config from URL
      this.elements.configInput.value = configToYAML(configFromURL);

      // Set timezone if present
      if (configFromURL.timezone) {
        this.elements.timezoneSelect.value = configFromURL.timezone;
      }
    } else {
      // Use default configuration
      const defaultConfig = getDefaultConfig();
      this.elements.configInput.value = configToYAML(defaultConfig);
    }

    // Trigger initial render
    this.handleSave();
  }
}

