/**
 * @fileoverview Unit tests for GradientUtils module
 */

import { generateGradient, getTextColor } from '../src/utils/GradientUtils';

describe('GradientUtils', () => {
  describe('generateGradient', () => {
    it('should return empty string for empty array', () => {
      expect(generateGradient([])).toBe('');
    });

    it('should return single color for single color array', () => {
      expect(generateGradient(['#ff0000'])).toBe('#ff0000');
    });

    it('should generate gradient for two colors', () => {
      const result = generateGradient(['#ff0000', '#0000ff']);
      expect(result).toContain('linear-gradient');
      expect(result).toContain('#ff0000');
      expect(result).toContain('#0000ff');
    });

    it('should generate gradient for multiple colors', () => {
      const result = generateGradient(['#ff0000', '#00ff00', '#0000ff']);
      expect(result).toContain('linear-gradient');
      expect(result).toContain('#ff0000');
      expect(result).toContain('#00ff00');
      expect(result).toContain('#0000ff');
    });

    it('should include percentage stops', () => {
      const result = generateGradient(['#ff0000', '#0000ff']);
      expect(result).toMatch(/\d+%/);
    });

    it('should use "to bottom" direction', () => {
      const result = generateGradient(['#ff0000', '#0000ff']);
      expect(result).toContain('to bottom');
    });
  });

  describe('getTextColor', () => {
    it('should return white for dark colors', () => {
      expect(getTextColor(['#000000'])).toBe('white');
      expect(getTextColor(['#222222'])).toBe('white');
      expect(getTextColor(['#0000ff'])).toBe('white');
    });

    it('should return dark color for light backgrounds', () => {
      expect(getTextColor(['#ffffff'])).toBe('#222');
      expect(getTextColor(['#ffff00'])).toBe('#222');
      expect(getTextColor(['#cccccc'])).toBe('#222');
    });

    it('should return white for empty array', () => {
      expect(getTextColor([])).toBe('white');
    });

    it('should return white for non-hex colors', () => {
      expect(getTextColor(['red', 'blue'])).toBe('white');
    });

    it('should average luminance across multiple colors', () => {
      // white (#ffffff) + black (#000000) = avg luminance ~0.5 → light → '#222'
      expect(getTextColor(['#ffffff', '#000000'])).toBe('#222');
    });

    it('should ignore non-hex values when mixed with valid hex', () => {
      // only #ffffff counts → light → '#222'
      expect(getTextColor(['#ffffff', 'red'])).toBe('#222');
    });
  });
});

