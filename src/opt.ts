/**
 * @fileoverview YAML Compression Utilities
 * Utilities for compressing and decompressing YAML configuration data
 * for efficient URL sharing and storage.
 */

import { load, dump } from 'js-yaml';
import {
  CalendarConfig,
  HighlightPeriod,
  CompressedData,
  CompressedPeriod
} from './types.js';

/**
 * Compresses YAML configuration data into a more compact JSON format
 * @param yamlString - The YAML configuration string to compress
 * @returns Compressed JSON string or null if compression fails
 */
export function compressYAML(yamlString: string): string | null {
  try {
    const parsedData = load(yamlString) as CalendarConfig;

    const compressedData: CompressedData = [[], []];

    // Compress years (assume it's the first element in the array)
    if (parsedData.years) {
      const compressedYears: number[] = parsedData.years.map(
        (year: number) => year - 2024
      );
      compressedData[0] = compressedYears;
    }

    // Compress highlightPeriods (assume it's the second element in the array)
    if (parsedData.highlightPeriods) {
      const compressedHighlightPeriods: CompressedPeriod[] =
        parsedData.highlightPeriods.map(
          (period: HighlightPeriod): CompressedPeriod => {
            if (period.start && period.end && period.color) {
              // Compress date range
              const start: number = Math.floor(
                new Date(period.start).getTime() / 100000
              );
              const startDate: Date = new Date(period.start);
              const endDate: Date = new Date(period.end);
              const dayDifference: number = Math.ceil(
                (endDate.getTime() - startDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              const result: CompressedPeriod = [
                start,
                dayDifference,
                period.color
              ];
              if (period.label) { (result as [number, number, string, string]).push(period.label); }
              return result;
            } else if (period.dates && period.color) {
              // Optimize multiple dates
              const sortedDates: number[] = period.dates
                .map((date: string) =>
                  Math.floor(new Date(date).getTime() / 100000)
                )
                .sort((a: number, b: number) => a - b);

              if (sortedDates.length === 1) {
                // Single date: store directly
                const result: CompressedPeriod = [
                  sortedDates[0]!,
                  period.color
                ];
                if (period.label) { (result as [number, string, string]).push(period.label); }
                return result;
              } else {
                // Multiple dates: store as [base, diff1, diff2, ...]
                const baseDate: number = sortedDates[0]!;
                const differences: number[] = sortedDates
                  .slice(1)
                  .map(
                    (date: number) => (date - baseDate) / (86400000 / 100000)
                  );
                const result: CompressedPeriod = [
                  [baseDate, ...differences],
                  period.color
                ];
                if (period.label) { (result as [number[], string, string]).push(period.label); }
                return result;
              }
            }
            return period as unknown as CompressedPeriod;
          }
        );
      compressedData[1] = compressedHighlightPeriods;
    }

    const jsonString: string = JSON.stringify(compressedData);
    return jsonString.slice(1, -1); // Remove the outer square brackets
  } catch (error) {
    console.error('Error compressing YAML:', error);
    return null;
  }
}

/**
 * Decompresses JSON data back to YAML configuration format
 * @param compressedYamlString - The compressed JSON string to decompress
 * @returns YAML configuration string or null if decompression fails
 */
export function decompressJSON(compressedYamlString: string): string | null {
  try {
    // Wrap the string in square brackets before parsing
    const jsonString: string = `[${compressedYamlString}]`;
    const parsedData = JSON.parse(jsonString) as CompressedData;

    const decompressedData: Partial<CalendarConfig> = {};

    // Decompress years (assume it's the first element in the array)
    if (parsedData[0]) {
      decompressedData.years = parsedData[0].map(
        (yearDistance: number) => yearDistance + 2024
      );
    }

    // Decompress highlightPeriods (assume it's the second element in the array)
    if (parsedData[1]) {
      decompressedData.highlightPeriods = parsedData[1].map(
        (period: CompressedPeriod): HighlightPeriod => {
          if (Array.isArray(period)) {
            // Detect a date range (start + dayDifference + color [+ label])
            if (
              typeof period[0] === 'number' &&
              typeof period[1] === 'number'
            ) {
              const startEpoch: number = period[0] * 100000;
              const startDate: string =
                new Date(startEpoch).toISOString().split('T')[0] || '';
              const dayDifference: number = period[1];
              const endDate: string =
                new Date(startEpoch + dayDifference * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0] || '';
              const result: HighlightPeriod = {
                start: startDate,
                end: endDate,
                color: period[2] as string
              };
              if (period[3]) { result.label = period[3] as string; }
              return result;

              // Detect single or multiple dates
            } else if (Array.isArray(period[0])) {
              // Multiple dates
              const baseDate: number = period[0][0]! * 100000;
              const differences: number[] = period[0].slice(1);
              const dates: string[] = [
                new Date(baseDate).toISOString().split('T')[0] || ''
              ];
              differences.forEach((diff: number) => {
                const previousDate: Date = new Date(
                  new Date(dates[dates.length - 1]!).getTime() + diff * 86400000
                );
                dates.push(previousDate.toISOString().split('T')[0] || '');
              });
              const result: HighlightPeriod = {
                dates,
                color: period[1] as string
              };
              if (period[2]) { result.label = period[2] as string; }
              return result;
            } else {
              // Single date
              const date: string =
                new Date((period[0] as number) * 100000)
                  .toISOString()
                  .split('T')[0] || '';
              const result: HighlightPeriod = {
                dates: [date],
                color: period[1] as string
              };
              if (period[2]) { result.label = period[2] as string; }
              return result;
            }
          }
          return period as HighlightPeriod;
        }
      );
    }

    return dump(decompressedData);
  } catch (error) {
    console.error('Error decompressing JSON:', error);
    return null;
  }
}

// Example usage and testing code (for development purposes)
if (require.main === module) {
  const yamlString: string = `
years:
  - 2024
  - 2025
highlightPeriods:
  - start: '2024-12-23'
    end: '2024-12-31'
    color: '#ffd700'
    label: "Stephen's Leave"
  - start: '2024-12-30'
    end: '2025-01-01'
    color: 'lightgreen'
    label: "Rachel and Liam Visit"
  - start: '2025-01-11'
    end: '2025-01-15'
    color: 'pink'
    label: "Travel to Melbourne"
  - dates:
     - '2025-02-01'
    color: '#c8a6ff'
    label: "House Warming"
  - start: '2025-03-01'
    end: '2025-03-14'
    color: 'orange'
    label: "Travel to UK"
  - start: '2025-04-07'
    end: '2025-04-11'
    color: '#ffd95e'
    label: "Canva Create"
  - dates:
     - '2025-08-09'
    color: "#6bdaff"
    label: "Rachel's Wedding"
  - dates:
     - '2025-09-06'
    color: "#abffb6"
    label: "Another Wedding"
`;

  const compressedString: string | null = compressYAML(yamlString);
  if (compressedString) {
    console.log('Compressed:');
    console.log(compressedString);

    const decompressedYaml: string | null = decompressJSON(compressedString);
    if (decompressedYaml) {
      console.log('Decompressed YAML:');
      console.log(decompressedYaml);

      console.log(
        'Performance',
        yamlString.length,
        compressedString.length,
        100 - (compressedString.length / yamlString.length) * 100
      );
    }
  }
}
