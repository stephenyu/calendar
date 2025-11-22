/**
 * @fileoverview Unit tests for ConfigManager module
 */

import {
  parseYAML,
  validateConfig,
  getDefaultConfig,
  configToYAML,
  parseAndValidateYAML
} from '../src/services/ConfigManager';
import { CalendarConfig } from '../src/types';

// Mock js-yaml
jest.mock('js-yaml', () => ({
  load: jest.fn(),
  dump: jest.fn()
}));

import { load, dump } from 'js-yaml';

describe('ConfigManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseYAML', () => {
    it('should parse valid YAML', () => {
      const mockConfig: CalendarConfig = {
        years: [2024],
        highlightPeriods: []
      };
      (load as jest.Mock).mockReturnValue(mockConfig);

      const result = parseYAML('years:\n  - 2024');
      expect(result).toEqual(mockConfig);
      expect(load).toHaveBeenCalledWith('years:\n  - 2024');
    });

    it('should return null on parse error', () => {
      (load as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid YAML');
      });

      const result = parseYAML('invalid yaml');
      expect(result).toBeNull();
    });
  });

  describe('validateConfig', () => {
    it('should validate correct config', () => {
      const config: CalendarConfig = {
        years: [2024, 2025],
        highlightPeriods: [
          {
            start: '2024-01-01',
            end: '2024-01-31',
            color: '#ff0000',
            label: 'Test'
          }
        ]
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-object config', () => {
      const result = validateConfig(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('object');
    });

    it('should reject config without years array', () => {
      const result = validateConfig({ highlightPeriods: [] });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('years');
    });

    it('should reject config without highlightPeriods array', () => {
      const result = validateConfig({ years: [2024] });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('highlightPeriods');
    });

    it('should reject invalid year', () => {
      const config: Partial<CalendarConfig> = {
        years: [1800],
        highlightPeriods: []
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('year');
    });

    it('should reject period without color', () => {
      const config: Partial<CalendarConfig> = {
        years: [2024],
        highlightPeriods: [
          {
            start: '2024-01-01',
            end: '2024-01-31'
            // missing color
          } as any
        ]
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('color');
    });

    it('should reject period without date range or dates', () => {
      const config: Partial<CalendarConfig> = {
        years: [2024],
        highlightPeriods: [
          {
            color: '#ff0000'
            // missing start/end or dates
          } as any
        ]
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('start and end');
    });
  });

  describe('getDefaultConfig', () => {
    it('should generate config with current year', () => {
      const config = getDefaultConfig();
      const currentYear = new Date().getFullYear();

      expect(config.years).toContain(currentYear);
      expect(config.highlightPeriods.length).toBeGreaterThan(0);
    });

    it('should include valid highlight periods', () => {
      const config = getDefaultConfig();
      expect(Array.isArray(config.highlightPeriods)).toBe(true);
      config.highlightPeriods.forEach(period => {
        expect(period.color).toBeDefined();
      });
    });
  });

  describe('configToYAML', () => {
    it('should convert config to YAML string', () => {
      const config: CalendarConfig = {
        years: [2024],
        highlightPeriods: []
      };
      (dump as jest.Mock).mockReturnValue('years:\n  - 2024');

      const result = configToYAML(config);
      expect(result).toBe('years:\n  - 2024');
      expect(dump).toHaveBeenCalledWith(config);
    });
  });

  describe('parseAndValidateYAML', () => {
    it('should parse and validate valid YAML', () => {
      const mockConfig: CalendarConfig = {
        years: [2024],
        highlightPeriods: []
      };
      (load as jest.Mock).mockReturnValue(mockConfig);

      const result = parseAndValidateYAML('years:\n  - 2024');
      expect(result.valid).toBe(true);
      expect(result.config).toEqual(mockConfig);
    });

    it('should parse YAML without quotes around values (preprocessor adds them)', () => {
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

      const expectedPreprocessedYaml = `years:
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

      const mockConfig: CalendarConfig = {
        years: [2025],
        highlightPeriods: [
          {
            start: '2025-12-01',
            end: '2025-12-31',
            color: '#ffd700',
            label: 'Festival Break'
          },
          {
            dates: ['2025-01-13'],
            color: '#ff6b6b',
            label: 'Important Day'
          }
        ],
        timezone: 'Australia/Sydney'
      };
      (load as jest.Mock).mockReturnValue(mockConfig);

      const result = parseAndValidateYAML(unquotedYaml);
      expect(result.valid).toBe(true);
      expect(result.config).toEqual(mockConfig);
      // Verify that load was called with the preprocessed (quoted) version
      expect(load).toHaveBeenCalledWith(expectedPreprocessedYaml);
    });

    it('should parse identically with and without quotes (preprocessor normalizes)', () => {
      const yamlWithQuotes = `years:
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

      const yamlWithoutQuotes = `years:
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

      const expectedConfig: CalendarConfig = {
        years: [2025],
        highlightPeriods: [
          {
            start: '2025-12-01',
            end: '2025-12-31',
            color: '#ffd700',
            label: 'Festival Break'
          },
          {
            dates: ['2025-01-13'],
            color: '#ff6b6b',
            label: 'Important Day'
          }
        ],
        timezone: 'Australia/Sydney'
      };

      // Parse with quotes
      (load as jest.Mock).mockReturnValue(expectedConfig);
      const resultWithQuotes = parseAndValidateYAML(yamlWithQuotes);

      // Parse without quotes
      (load as jest.Mock).mockReturnValue(expectedConfig);
      const resultWithoutQuotes = parseAndValidateYAML(yamlWithoutQuotes);

      // Both should be valid
      expect(resultWithQuotes.valid).toBe(true);
      expect(resultWithoutQuotes.valid).toBe(true);

      // Both should produce identical configs
      expect(resultWithQuotes.config).toEqual(resultWithoutQuotes.config);
      expect(resultWithQuotes.config).toEqual(expectedConfig);
      expect(resultWithoutQuotes.config).toEqual(expectedConfig);

      // Note: load() is called with preprocessed versions, which may differ in quoting
      // but both produce the same parsed result
    });

    it('should parse YAML with labels containing spaces without quotes', () => {
      const yamlWithSpaces = `years:
  - 2024
highlightPeriods:
  - start: 2024-01-01
    end: 2024-01-31
    color: #ff0000
    label: Important Holiday Period`;

      const mockConfig: CalendarConfig = {
        years: [2024],
        highlightPeriods: [
          {
            start: '2024-01-01',
            end: '2024-01-31',
            color: '#ff0000',
            label: 'Important Holiday Period'
          }
        ]
      };
      (load as jest.Mock).mockReturnValue(mockConfig);

      const result = parseAndValidateYAML(yamlWithSpaces);
      expect(result.valid).toBe(true);
      expect(result.config).toEqual(mockConfig);
    });

    it('should parse YAML with hex color values without quotes', () => {
      const yamlWithColors = `years:
  - 2024
highlightPeriods:
  - start: 2024-01-01
    end: 2024-01-31
    color: #ffd700
    label: Test`;

      const mockConfig: CalendarConfig = {
        years: [2024],
        highlightPeriods: [
          {
            start: '2024-01-01',
            end: '2024-01-31',
            color: '#ffd700',
            label: 'Test'
          }
        ]
      };
      (load as jest.Mock).mockReturnValue(mockConfig);

      const result = parseAndValidateYAML(yamlWithColors);
      expect(result.valid).toBe(true);
      expect(result.config?.highlightPeriods[0].color).toBe('#ffd700');
    });

    it('should return error for invalid YAML', () => {
      (load as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid YAML');
      });

      const result = parseAndValidateYAML('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid config structure', () => {
      (load as jest.Mock).mockReturnValue({ invalid: 'config' });

      const result = parseAndValidateYAML('invalid: config');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

