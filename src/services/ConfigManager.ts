/**
 * @fileoverview Configuration management service
 * Handles YAML parsing, validation, and default configuration
 */

import { load, dump } from 'js-yaml';
import {
  CalendarConfig
} from '../types.js';
import { preprocessYAML } from '../utils/YAMLPreprocessor.js';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Parses YAML configuration string into CalendarConfig object
 * Automatically adds quotes where needed using preprocessor
 * @param yamlString - YAML configuration string (quoted or unquoted)
 * @returns Parsed CalendarConfig or null if parsing fails
 */
export function parseYAML(yamlString: string): CalendarConfig | null {
  try {
    // Preprocess to add quotes where needed
    const processedYaml = preprocessYAML(yamlString);
    const config = load(processedYaml) as CalendarConfig;
    return config;
  } catch (error) {
    const err = error as Error;
    console.error('[ConfigManager] Error parsing YAML:', err);
    return null;
  }
}

/**
 * Validates a CalendarConfig object
 * @param config - Configuration object to validate
 * @returns Validation result with error message if invalid
 */
export function validateConfig(config: unknown): ValidationResult {
  if (!config || typeof config !== 'object') {
    return { valid: false, error: 'Configuration must be an object' };
  }

  const cfg = config as Partial<CalendarConfig>;

  if (!Array.isArray(cfg.years)) {
    return { valid: false, error: 'years must be an array' };
  }

  if (!Array.isArray(cfg.highlightPeriods)) {
    return { valid: false, error: 'highlightPeriods must be an array' };
  }

  // Validate years
  for (const year of cfg.years) {
    if (typeof year !== 'number' || year < 1900 || year > 2100) {
      return {
        valid: false,
        error: `Invalid year: ${year}. Must be between 1900 and 2100`
      };
    }
  }

  // Validate highlight periods
  for (let i = 0; i < cfg.highlightPeriods.length; i++) {
    const period = cfg.highlightPeriods[i];
    if (!period || typeof period !== 'object') {
      return {
        valid: false,
        error: `highlightPeriods[${i}] must be an object`
      };
    }

    if (!period.color || typeof period.color !== 'string') {
      return {
        valid: false,
        error: `highlightPeriods[${i}].color is required and must be a string`
      };
    }

    // Must have either (start AND end) OR dates
    const hasRange = period.start && period.end;
    const hasDates = period.dates && Array.isArray(period.dates);

    if (!hasRange && !hasDates) {
      return {
        valid: false,
        error: `highlightPeriods[${i}] must have either (start and end) or dates`
      };
    }

    if (hasRange && hasDates) {
      return {
        valid: false,
        error: `highlightPeriods[${i}] cannot have both date range and dates array`
      };
    }
  }

  return { valid: true };
}

/**
 * Generates default configuration with current year
 * @returns Default CalendarConfig
 */
export function getDefaultConfig(): CalendarConfig {
  const currentYear: number = new Date().getFullYear();

  return {
    years: [currentYear],
    highlightPeriods: [
      {
        start: `${currentYear}-12-01`,
        end: `${currentYear}-12-31`,
        color: '#ffd700',
        label: 'Festival Break'
      },
      {
        dates: [`${currentYear}-01-13`],
        color: '#ff6b6b',
        label: 'Important Day'
      }
    ]
  };
}

/**
 * Converts CalendarConfig to YAML string
 * @param config - Configuration object
 * @returns YAML string representation
 */
export function configToYAML(config: CalendarConfig): string {
  return dump(config);
}

/**
 * Parses and validates YAML configuration
 * @param yamlString - YAML configuration string
 * @returns Validation result with parsed config if valid
 */
export function parseAndValidateYAML(
  yamlString: string
): ValidationResult & { config?: CalendarConfig } {
  const config = parseYAML(yamlString);
  if (!config) {
    return { valid: false, error: 'Failed to parse YAML' };
  }

  const validation = validateConfig(config);
  if (!validation.valid) {
    return validation;
  }

  return { valid: true, config };
}
