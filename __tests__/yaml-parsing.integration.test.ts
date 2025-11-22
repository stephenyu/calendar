/**
 * @fileoverview Integration tests for YAML parsing with and without quotes
 * Tests that quoted and unquoted YAML produce identical results
 * Uses real js-yaml library without mocks
 * 
 * IMPORTANT YAML RULES (without preprocessor):
 * - Colors starting with # MUST be quoted (# is a comment character in YAML)
 * - Dates MUST be quoted to stay as strings (unquoted become Date objects)
 * - Labels with spaces are optional (YAML handles them fine)
 * - Numbers (years) should NOT be quoted
 * 
 * With the YAMLPreprocessor, these rules are handled automatically!
 */

import { load } from 'js-yaml';
import { CalendarConfig } from '../src/types';
import { preprocessYAML } from '../src/utils/YAMLPreprocessor';
import { parseAndValidateYAML } from '../src/services/ConfigManager';

describe('YAML Parsing Integration Tests', () => {
  it('should parse identically when properly quoted', () => {
    // All values with explicit quotes
    const yamlAllQuoted = `years:
  - 2025
  - 2026
highlightPeriods:
  - start: "2025-12-01"
    end: "2025-12-31"
    color: "#ffd700"
    label: "Festival Break"
  - dates:
      - "2025-01-13"
      - "2025-02-14"
    color: "#ff6b6b"
    label: "Important Day"
  - start: "2026-06-01"
    end: "2026-06-15"
    color: "#00ff00"
    label: "Summer Vacation"
timezone: "Australia/Sydney"`;

    // Minimal quotes (only where required: colors and dates)
    const yamlMinimalQuotes = `years:
  - 2025
  - 2026
highlightPeriods:
  - start: "2025-12-01"
    end: "2025-12-31"
    color: "#ffd700"
    label: Festival Break
  - dates:
      - "2025-01-13"
      - "2025-02-14"
    color: "#ff6b6b"
    label: Important Day
  - start: "2026-06-01"
    end: "2026-06-15"
    color: "#00ff00"
    label: Summer Vacation
timezone: Australia/Sydney`;

    // Parse both using js-yaml
    const configAllQuoted = load(yamlAllQuoted) as CalendarConfig;
    const configMinimalQuotes = load(yamlMinimalQuotes) as CalendarConfig;

    // Verify both produce identical results
    expect(configAllQuoted).toEqual(configMinimalQuotes);

    // Verify structure
    expect(configAllQuoted.years).toEqual([2025, 2026]);
    expect(configAllQuoted.highlightPeriods).toHaveLength(3);
    expect(configAllQuoted.timezone).toBe('Australia/Sydney');
  });

  it('should parse years as numbers when unquoted', () => {
    const yamlUnquoted = `years:
  - 2025`;

    const config = load(yamlUnquoted) as any;

    // Unquoted years should be numbers
    expect(config.years).toEqual([2025]);
    expect(typeof config.years[0]).toBe('number');
  });

  it('should require quotes for hex colors (# is a comment character)', () => {
    const yamlWithQuotes = `color: "#ffd700"`;
    const yamlWithoutQuotes = `color: #ffd700`;

    const configWithQuotes = load(yamlWithQuotes) as any;
    const configWithoutQuotes = load(yamlWithoutQuotes) as any;

    // Quoted version should parse correctly
    expect(configWithQuotes.color).toBe('#ffd700');
    
    // Unquoted version will be null (# starts a comment!)
    expect(configWithoutQuotes.color).toBeNull();
  });

  it('should require quotes for dates to keep them as strings', () => {
    const yamlWithQuotes = `start: "2025-12-01"
end: "2025-12-31"`;

    const yamlWithoutQuotes = `start: 2025-12-01
end: 2025-12-31`;

    const configWithQuotes = load(yamlWithQuotes) as any;
    const configWithoutQuotes = load(yamlWithoutQuotes) as any;

    // Quoted version stays as string
    expect(configWithQuotes.start).toBe('2025-12-01');
    expect(configWithQuotes.end).toBe('2025-12-31');
    expect(typeof configWithQuotes.start).toBe('string');
    
    // Unquoted version becomes Date object
    expect(configWithoutQuotes.start).toBeInstanceOf(Date);
    expect(configWithoutQuotes.end).toBeInstanceOf(Date);
  });

  it('should parse labels with spaces identically with and without quotes', () => {
    const yamlWithQuotes = `label: "Festival Break"`;
    const yamlWithoutQuotes = `label: Festival Break`;

    const configWithQuotes = load(yamlWithQuotes) as any;
    const configWithoutQuotes = load(yamlWithoutQuotes) as any;

    expect(configWithQuotes.label).toBe('Festival Break');
    expect(configWithoutQuotes.label).toBe('Festival Break');
    expect(configWithQuotes).toEqual(configWithoutQuotes);
  });

  it('should parse timezone identically with and without quotes', () => {
    const yamlWithQuotes = `timezone: "Australia/Sydney"`;
    const yamlWithoutQuotes = `timezone: Australia/Sydney`;

    const configWithQuotes = load(yamlWithQuotes) as any;
    const configWithoutQuotes = load(yamlWithoutQuotes) as any;

    expect(configWithQuotes.timezone).toBe('Australia/Sydney');
    expect(configWithoutQuotes.timezone).toBe('Australia/Sydney');
    expect(configWithQuotes).toEqual(configWithoutQuotes);
  });

  it('should parse complete user example with all required and optional quotes', () => {
    // All values quoted (safest approach)
    const yamlAllQuoted = `years:
  - 2025
highlightPeriods:
  - start: "2025-12-01"
    end: "2025-12-31"
    color: "#ffd700"
    label: "Festival Break"
  - dates:
      - "2025-01-13"
    color: "#ff6b6b"
    label: "Important Day"
timezone: "Australia/Sydney"`;

    // Minimal quotes (only where required)
    const yamlMinimalQuotes = `years:
  - 2025
highlightPeriods:
  - start: "2025-12-01"
    end: "2025-12-31"
    color: "#ffd700"
    label: Festival Break
  - dates:
      - "2025-01-13"
    color: "#ff6b6b"
    label: Important Day
timezone: Australia/Sydney`;

    const configAllQuoted = load(yamlAllQuoted) as CalendarConfig;
    const configMinimalQuotes = load(yamlMinimalQuotes) as CalendarConfig;

    // Verify both produce identical results
    expect(configAllQuoted).toEqual(configMinimalQuotes);

    // Verify structure
    expect(configAllQuoted.years).toEqual([2025]);
    expect(configAllQuoted.highlightPeriods).toHaveLength(2);
    expect(configAllQuoted.timezone).toBe('Australia/Sydney');

    // Verify first period (date range)
    expect(configAllQuoted.highlightPeriods[0]).toEqual({
      start: '2025-12-01',
      end: '2025-12-31',
      color: '#ffd700',
      label: 'Festival Break'
    });

    // Verify second period (specific dates)
    expect(configAllQuoted.highlightPeriods[1]).toEqual({
      dates: ['2025-01-13'],
      color: '#ff6b6b',
      label: 'Important Day'
    });
  });

  it('should require quotes for date arrays to keep them as strings', () => {
    const yamlWithQuotes = `dates:
  - "2025-01-13"
  - "2025-02-14"
  - "2025-03-15"`;

    const yamlWithoutQuotes = `dates:
  - 2025-01-13
  - 2025-02-14
  - 2025-03-15`;

    const configWithQuotes = load(yamlWithQuotes) as any;
    const configWithoutQuotes = load(yamlWithoutQuotes) as any;

    // Quoted version stays as strings
    expect(configWithQuotes.dates).toEqual(['2025-01-13', '2025-02-14', '2025-03-15']);
    expect(typeof configWithQuotes.dates[0]).toBe('string');
    
    // Unquoted version becomes Date objects
    expect(configWithoutQuotes.dates[0]).toBeInstanceOf(Date);
    expect(configWithoutQuotes.dates[1]).toBeInstanceOf(Date);
    expect(configWithoutQuotes.dates[2]).toBeInstanceOf(Date);
  });

  describe('End-to-End with Preprocessor', () => {
    it('should produce IDENTICAL results with and without quotes', () => {
      // Version 1: WITH quotes (traditional YAML)
      const yamlWithQuotes = `years:
  - 2025
highlightPeriods:
  - start: "2025-12-01"
    end: "2025-12-31"
    color: "#ffd700"
    label: "Festival Break"
  - dates:
      - "2025-01-13"
      - "2025-02-14"
    color: "#ff6b6b"
    label: "Important Day"
timezone: "Australia/Sydney"`;

      // Version 2: WITHOUT quotes (our custom format)
      const yamlWithoutQuotes = `years:
  - 2025
highlightPeriods:
  - start: 2025-12-01
    end: 2025-12-31
    color: #ffd700
    label: Festival Break
  - dates:
      - 2025-01-13
      - 2025-02-14
    color: #ff6b6b
    label: Important Day
timezone: Australia/Sydney`;

      // Parse both through the full ConfigManager pipeline (with preprocessor)
      const resultWithQuotes = parseAndValidateYAML(yamlWithQuotes);
      const resultWithoutQuotes = parseAndValidateYAML(yamlWithoutQuotes);

      // Both should be valid
      expect(resultWithQuotes.valid).toBe(true);
      expect(resultWithoutQuotes.valid).toBe(true);

      // CRITICAL TEST: Both should produce EXACTLY the same config
      expect(resultWithQuotes.config).toEqual(resultWithoutQuotes.config);

      // Verify the structure is correct
      const expectedConfig = {
        years: [2025],
        highlightPeriods: [
          {
            start: '2025-12-01',
            end: '2025-12-31',
            color: '#ffd700',
            label: 'Festival Break'
          },
          {
            dates: ['2025-01-13', '2025-02-14'],
            color: '#ff6b6b',
            label: 'Important Day'
          }
        ],
        timezone: 'Australia/Sydney'
      };

      expect(resultWithQuotes.config).toEqual(expectedConfig);
      expect(resultWithoutQuotes.config).toEqual(expectedConfig);

      // Verify specific values match exactly
      expect(resultWithQuotes.config?.years).toEqual(resultWithoutQuotes.config?.years);
      expect(resultWithQuotes.config?.highlightPeriods).toEqual(resultWithoutQuotes.config?.highlightPeriods);
      expect(resultWithQuotes.config?.timezone).toEqual(resultWithoutQuotes.config?.timezone);
    });

    it('should parse unquoted YAML correctly with preprocessor', () => {
      const unquotedYaml = `years:
  - 2025
highlightPeriods:
  - start: 2025-12-01
    end: 2025-12-31
    color: #ffd700
    label: Festival Break
  - dates:
      - 2025-01-13
    color: #ff6b6b
    label: Important Day
timezone: Australia/Sydney`;

      // Use the preprocessor
      const processedYaml = preprocessYAML(unquotedYaml);
      const config = load(processedYaml) as CalendarConfig;

      // Verify it parsed correctly
      expect(config.years).toEqual([2025]);
      expect(config.highlightPeriods).toHaveLength(2);
      expect(config.highlightPeriods[0].color).toBe('#ffd700');
      expect(config.highlightPeriods[0].start).toBe('2025-12-01');
      expect(config.highlightPeriods[0].end).toBe('2025-12-31');
      expect(config.highlightPeriods[1].dates).toEqual(['2025-01-13']);
      expect(config.timezone).toBe('Australia/Sydney');
    });

    it('should work through the full ConfigManager flow', () => {
      const unquotedYaml = `years:
  - 2025
highlightPeriods:
  - start: 2025-12-01
    end: 2025-12-31
    color: #ffd700
    label: Festival Break
timezone: Australia/Sydney`;

      // This uses the full ConfigManager which includes preprocessing
      const result = parseAndValidateYAML(unquotedYaml);

      expect(result.valid).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.config?.years).toEqual([2025]);
      expect(result.config?.highlightPeriods[0].color).toBe('#ffd700');
      expect(result.config?.highlightPeriods[0].start).toBe('2025-12-01');
      expect(result.config?.timezone).toBe('Australia/Sydney');
    });

    it('should handle the exact user example without any quotes', () => {
      const userYaml = `years:
  - 2025
highlightPeriods:
  - start: 2025-12-01
    end: 2025-12-31
    color: #ffd700
    label: Festival Break
  - dates:
      - 2025-01-13
    color: #ff6b6b
    label: Important Day
timezone: Australia/Sydney`;

      const result = parseAndValidateYAML(userYaml);

      expect(result.valid).toBe(true);
      expect(result.config?.years).toEqual([2025]);
      expect(result.config?.highlightPeriods).toHaveLength(2);
      
      // First period
      expect(result.config?.highlightPeriods[0]).toEqual({
        start: '2025-12-01',
        end: '2025-12-31',
        color: '#ffd700',
        label: 'Festival Break'
      });
      
      // Second period
      expect(result.config?.highlightPeriods[1]).toEqual({
        dates: ['2025-01-13'],
        color: '#ff6b6b',
        label: 'Important Day'
      });
      
      expect(result.config?.timezone).toBe('Australia/Sydney');
    });
  });
});

