/**
 * @fileoverview Utility functions for generating CSS gradients
 */

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
