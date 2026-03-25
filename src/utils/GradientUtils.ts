/**
 * @fileoverview Utility functions for generating CSS gradients
 */

/**
 * Computes relative luminance of a hex color (0 = black, 1 = white)
 */
function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Returns an appropriate text color ('white' or '#222') for a given background color or set of colors.
 */
export function getTextColor(colors: string[]): string {
  const hexColors = colors.filter(c => /^#[0-9a-fA-F]{6}$/.test(c));
  if (hexColors.length === 0) { return 'white'; }
  const avgLuminance = hexColors.reduce((sum, c) => sum + getLuminance(c), 0) / hexColors.length;
  return avgLuminance > 0.179 ? '#222' : 'white';
}

/**
 * Generates a CSS linear gradient from multiple colors
 * @param colors - Array of CSS color values
 * @returns CSS linear-gradient string
 */
export function generateGradient(colors: string[]): string {
  if (colors.length === 0) {
    return '';
  }

  if (colors.length === 1) {
    return colors[0]!;
  }

  const percentage: number = 100 / colors.length;
  const colorStops: string[] = colors.map(
    (color: string, index: number): string => {
      const start: number = percentage * index;
      const end: number = percentage * (index + 1);
      return `${color} ${start}%, ${color} ${end}%`;
    }
  );
  return `linear-gradient(to bottom, ${colorStops.join(', ')})`;
}
