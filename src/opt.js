const jsyaml = require('js-yaml'); // Load the js-yaml library

function compressYAML(yamlString) {
  try {
    const parsedData = jsyaml.load(yamlString); // Parse YAML to JavaScript object

    const compressedData = [];

    // Compress years (assume it's the first element in the array)
    if (parsedData.years) {
      const compressedYears = parsedData.years.map(year => year - 2024); // Optimise year distances
      compressedData.push(compressedYears);
    }

    // Compress highlightPeriods (assume it's the second element in the array)
    if (parsedData.highlightPeriods) {
      const compressedHighlightPeriods = parsedData.highlightPeriods.map(period => {
        if (period.start && period.end && period.color) {
          // Compress date range
          const start = Math.floor(new Date(period.start).getTime() / 100000);
          const startDate = new Date(period.start);
          const endDate = new Date(period.end);
          const dayDifference = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          const result = [start, dayDifference, period.color];
          if (period.label) result.push(period.label);
          return result;
        } else if (period.dates && period.color) {
          // Optimise multiple dates
          const sortedDates = period.dates
            .map(date => Math.floor(new Date(date).getTime() / 100000)) // Convert to reduced epoch
            .sort((a, b) => a - b); // Sort dates

          if (sortedDates.length === 1) {
            // Single date: store directly
            const result = [sortedDates[0], period.color];
            if (period.label) result.push(period.label);
            return result;
          } else {
            // Multiple dates: store as [base, diff1, diff2, ...]
            const baseDate = sortedDates[0];
            const differences = sortedDates.slice(1).map(date => (date - baseDate) / (86400000 / 100000)); // Day differences
            const result = [[baseDate, ...differences], period.color];
            if (period.label) result.push(period.label);
            return result;
          }
        }
        return period; // If it doesn't match any pattern, return as is
      });
      compressedData.push(compressedHighlightPeriods);
    }

    const jsonString = JSON.stringify(compressedData);
    return jsonString.slice(1, -1); // Remove the outer square brackets
  } catch (error) {
    console.error('Error compressing YAML:', error);
    return null;
  }
}

function decompressJSON(compressedYamlString) {
  try {
    // Wrap the string in square brackets before parsing
    const jsonString = `[${compressedYamlString}]`;
    const parsedData = JSON.parse(jsonString); // Parse JSON string to JavaScript object

    const decompressedData = {};

    // Decompress years (assume it's the first element in the array)
    if (parsedData[0]) {
      decompressedData.years = parsedData[0].map(yearDistance => yearDistance + 2024);
    }

    // Decompress highlightPeriods (assume it's the second element in the array)
    if (parsedData[1]) {
      decompressedData.highlightPeriods = parsedData[1].map(period => {
        if (Array.isArray(period)) {
          // Detect a date range (start + dayDifference + color [+ label])
          if (typeof period[0] === "number" && typeof period[1] === "number") {
            const startEpoch = period[0] * 100000; // Restore full epoch
            const startDate = new Date(startEpoch).toISOString().split("T")[0];
            const dayDifference = period[1];
            const endDate = new Date(startEpoch + dayDifference * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
            const result = { start: startDate, end: endDate, color: period[2] };
            if (period[3]) result.label = period[3];
            return result;

          // Detect single or multiple dates
          } else if (Array.isArray(period[0])) {
            // Multiple dates
            const baseDate = period[0][0] * 100000; // Base date in epoch
            const differences = period[0].slice(1); // Day differences
            const dates = [new Date(baseDate).toISOString().split("T")[0]]; // Start with base date
            differences.forEach(diff => {
              const previousDate = new Date(new Date(dates[dates.length - 1]).getTime() + diff * 86400000);
              dates.push(previousDate.toISOString().split("T")[0]);
            });
            const result = { dates, color: period[1] };
            if (period[2]) result.label = period[2];
            return result;
          } else {
            // Single date
            const date = new Date(period[0] * 100000).toISOString().split("T")[0];
            const result = { dates: [date], color: period[1] };
            if (period[2]) result.label = period[2];
            return result;
          }
        }
        return period; // If it's not an array, return as is
      });
    }

    return jsyaml.dump(decompressedData); // Convert back to YAML string
  } catch (error) {
    console.error('Error decompressing JSON:', error);
    return null;
  }
}

// Usage

const yamlString = `
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

const compressedString = compressYAML(yamlString);
console.log('Compressed:');
console.log(compressedString);

const decompressedYaml = decompressJSON(compressedString);
console.log('Decompressed YAML:');
console.log(decompressedYaml);

console.log('Performance', yamlString.length, compressedString.length, (100-(compressedString.length / yamlString.length) * 100));
