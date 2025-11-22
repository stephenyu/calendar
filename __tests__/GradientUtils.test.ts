/**
 * @fileoverview Unit tests for GradientUtils module
 */

import { generateGradient } from '../src/utils/GradientUtils';

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
});

