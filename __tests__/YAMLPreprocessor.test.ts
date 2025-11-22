/**
 * @fileoverview Unit tests for YAML Preprocessor
 * Tests that unquoted values get properly quoted
 */

import { preprocessYAML, normalizeYAML } from '../src/utils/YAMLPreprocessor';

describe('YAMLPreprocessor', () => {
  describe('preprocessYAML', () => {
    it('should add quotes around hex colors', () => {
      const input = 'color: #ffd700';
      const output = preprocessYAML(input);
      expect(output).toBe('color: "#ffd700"');
    });

    it('should add quotes around dates', () => {
      const input = 'start: 2025-12-01';
      const output = preprocessYAML(input);
      expect(output).toBe('start: "2025-12-01"');
    });

    it('should not modify already quoted values', () => {
      const input = 'color: "#ffd700"';
      const output = preprocessYAML(input);
      expect(output).toBe('color: "#ffd700"');
    });

    it('should handle labels without quotes', () => {
      const input = 'label: Festival Break';
      const output = preprocessYAML(input);
      expect(output).toBe('label: Festival Break');
    });

    it('should handle years without adding quotes', () => {
      const input = `years:
  - 2025
  - 2026`;
      const output = preprocessYAML(input);
      expect(output).toBe(`years:
  - 2025
  - 2026`);
    });

    it('should add quotes to date array items', () => {
      const input = `dates:
  - 2025-01-13
  - 2025-02-14`;
      const output = preprocessYAML(input);
      expect(output).toBe(`dates:
  - "2025-01-13"
  - "2025-02-14"`);
    });

    it('should handle complete unquoted configuration', () => {
      const input = `years:
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

      const expected = `years:
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

      const output = preprocessYAML(input);
      expect(output).toBe(expected);
    });

    it('should handle mixed quoted and unquoted values', () => {
      const input = `color: #ffd700
label: "Already Quoted"
start: 2025-12-01`;

      const expected = `color: "#ffd700"
label: "Already Quoted"
start: "2025-12-01"`;

      const output = preprocessYAML(input);
      expect(output).toBe(expected);
    });

    it('should preserve empty lines', () => {
      const input = `color: #ffd700

label: Test`;

      const expected = `color: "#ffd700"

label: Test`;

      const output = preprocessYAML(input);
      expect(output).toBe(expected);
    });

    it('should preserve comments', () => {
      const input = `# This is a comment
color: #ffd700`;

      const expected = `# This is a comment
color: "#ffd700"`;

      const output = preprocessYAML(input);
      expect(output).toBe(expected);
    });

    it('should handle nested structures', () => {
      const input = `highlightPeriods:
  - start: 2025-12-01
    color: #ffd700`;

      const expected = `highlightPeriods:
  - start: "2025-12-01"
    color: "#ffd700"`;

      const output = preprocessYAML(input);
      expect(output).toBe(expected);
    });

    it('should handle various hex color formats', () => {
      const input = `color1: #fff
color2: #ffd700
color3: #ff6b6bff`;

      const expected = `color1: "#fff"
color2: "#ffd700"
color3: "#ff6b6bff"`;

      const output = preprocessYAML(input);
      expect(output).toBe(expected);
    });

    it('should not quote timezone values', () => {
      const input = 'timezone: Australia/Sydney';
      const output = preprocessYAML(input);
      expect(output).toBe('timezone: Australia/Sydney');
    });

    it('should handle single quotes as already quoted', () => {
      const input = "color: '#ffd700'";
      const output = preprocessYAML(input);
      expect(output).toBe("color: '#ffd700'");
    });

    it('should handle indented array items with dates', () => {
      const input = `  dates:
    - 2025-01-13
    - 2025-02-14`;

      const expected = `  dates:
    - "2025-01-13"
    - "2025-02-14"`;

      const output = preprocessYAML(input);
      expect(output).toBe(expected);
    });
  });

  describe('normalizeYAML', () => {
    it('should be an alias for preprocessYAML', () => {
      const input = 'color: #ffd700';
      expect(normalizeYAML(input)).toBe(preprocessYAML(input));
    });
  });
});


