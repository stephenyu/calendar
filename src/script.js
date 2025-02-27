// Use let and const for better code style
// DOM Elements
const configInput = document.getElementById('config-input');
const saveButton = document.getElementById('save-button');
const calendarContainer = document.getElementById('calendar-container');

// Modal Elements
const modal = document.getElementById('color-picker-modal');
const closeBtn = modal.querySelector('.close');
const colorInput = document.getElementById('color-input');
const applyColorBtn = document.getElementById('apply-color');

// State
let lastHashPosition = null; // Remember where '#' was typed

// Event: Show modal when '#' is typed in config input
configInput.addEventListener('keydown', (e) => {
    if (e.key === '#') {
        // Wait until character is inserted
        setTimeout(() => {
            lastHashPosition = configInput.selectionStart - 1;
            openModal();
        }, 0);
    }
});

function openModal() {
    modal.style.display = 'block';
    colorInput.focus();
}

function closeModal() {
    modal.style.display = 'none';
}

closeBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

applyColorBtn.addEventListener('click', () => {
    const chosenColor = colorInput.value; // e.g. #ff0000
    if (lastHashPosition !== null) {
        insertColorAtPosition(chosenColor);
    }
    closeModal();
});

function insertColorAtPosition(color) {
    const text = configInput.value;
    const before = text.slice(0, lastHashPosition);
    const after = text.slice(lastHashPosition + 1); // remove the '#'
    const newText = before + color + after;
    configInput.value = newText;

    // Move the cursor after the inserted color
    const cursorPos = before.length + color.length;
    configInput.selectionStart = cursorPos;
    configInput.selectionEnd = cursorPos;
    configInput.focus();
    lastHashPosition = null;
}

function generateCalendar(years, highlightPeriods) {
    calendarContainer.innerHTML = '';

    // Normalize highlight periods
    const normalizedPeriods = highlightPeriods.map((period, index) => {
        const newPeriod = { ...period, order: index };
        if (period.start) {
            newPeriod.startDate = new Date(period.start);
            newPeriod.startDate.setHours(0, 0, 0, 0);
        }
        if (period.end) {
            newPeriod.endDate = new Date(period.end);
            newPeriod.endDate.setHours(0, 0, 0, 0);
        }
        if (period.dates) {
            newPeriod.dateObjects = period.dates.map((dateStr) => {
                const d = new Date(dateStr);
                d.setHours(0, 0, 0, 0);
                return d;
            });
        }
        return newPeriod;
    });

    const monthRows = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [9, 10, 11]
    ];

    for (const year of years) {
        const calendarDiv = document.createElement('div');
        calendarDiv.className = 'calendar';

        const yearHeader = document.createElement('h2');
        yearHeader.textContent = year;
        calendarDiv.appendChild(yearHeader);

        // Track which highlight periods are used this year
        const usedPeriods = new Set();

        // Create the year table
        const yearTable = document.createElement('table');
        yearTable.className = 'year-table';

        const tbody = document.createElement('tbody');

        for (const rowMonths of monthRows) {
            const tr = document.createElement('tr');

            for (const monthIndex of rowMonths) {
                const td = document.createElement('td');
                td.appendChild(createMonthTable(year, monthIndex, normalizedPeriods, usedPeriods));
                tr.appendChild(td);
            }

            tbody.appendChild(tr);
        }

        yearTable.appendChild(tbody);
        calendarDiv.appendChild(yearTable);

        // Add legend for labeled periods used this year
        const labeledPeriods = Array.from(usedPeriods)
            .map(i => normalizedPeriods[i])
            .filter(p => p.label);

        if (labeledPeriods.length > 0) {
            const legendDiv = document.createElement('div');
            legendDiv.className = 'legend';

            for (const p of labeledPeriods) {
                const legendItem = document.createElement('div');
                legendItem.className = 'legend-item';

                const legendColor = document.createElement('div');
                legendColor.className = 'legend-color';
                legendColor.style.backgroundColor = p.color;

                const legendLabel = document.createElement('span');
                legendLabel.textContent = p.label;

                legendItem.appendChild(legendColor);
                legendItem.appendChild(legendLabel);
                legendDiv.appendChild(legendItem);
            }

            calendarDiv.appendChild(legendDiv);
        }

        calendarContainer.appendChild(calendarDiv);
    }
}

function createMonthTable(year, month, periods, usedPeriods) {
    const monthTable = document.createElement('table');
    monthTable.className = 'month-table';

    const thead = document.createElement('thead');
    const monthNameRow = document.createElement('tr');
    monthNameRow.className = 'month-name-row';
    const monthNameTh = document.createElement('th');
    monthNameTh.colSpan = 7;
    monthNameTh.textContent = new Date(year, month).toLocaleString('default', { month: 'long' }) + ' ' + year;
    monthNameRow.appendChild(monthNameTh);
    thead.appendChild(monthNameRow);

    const weekdayRow = document.createElement('tr');
    weekdayRow.className = 'weekday-row';
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    for (const wday of weekdays) {
        const th = document.createElement('th');
        th.textContent = wday;
        weekdayRow.appendChild(th);
    }
    thead.appendChild(weekdayRow);

    monthTable.appendChild(thead);

    const tbody = document.createElement('tbody');

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Total cells needed
    const totalCells = firstDay + daysInMonth;
    const weeks = Math.ceil(totalCells / 7);

    let currentDay = 1;

    for (let w = 0; w < weeks; w++) {
        const tr = document.createElement('tr');

        for (let d = 0; d < 7; d++) {
            const td = document.createElement('td');

            const cellIndex = w * 7 + d;
            if (cellIndex >= firstDay && currentDay <= daysInMonth) {
                // Valid day
                td.textContent = currentDay;
                const dateObj = new Date(year, month, currentDay);
                dateObj.setHours(0, 0, 0, 0);

                const colors = [];
                for (let i = 0; i < periods.length; i++) {
                    const period = periods[i];
                    if (period.startDate && period.endDate) {
                        if (dateObj >= period.startDate && dateObj <= period.endDate) {
                            colors.push(period.color);
                            usedPeriods.add(i);
                        }
                    } else if (period.dateObjects) {
                        for (const dObj of period.dateObjects) {
                            if (dateObj.getTime() === dObj.getTime()) {
                                colors.push(period.color);
                                usedPeriods.add(i);
                            }
                        }
                    }
                }

                if (colors.length > 0) {
                    td.style.background = generateGradient(colors);
                }

                currentDay++;
            } else {
                // Blank cell
                td.textContent = '';
            }

            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }

    monthTable.appendChild(tbody);
    return monthTable;
}

function generateGradient(colors) {
    const percentage = 100 / colors.length;
    const colorStops = colors.map((color, index) => {
        const start = percentage * index;
        const end = percentage * (index + 1);
        return `${color} ${start}%, ${color} ${end}%`;
    });
    return `linear-gradient(to bottom, ${colorStops.join(', ')})`;
}

// Compress

// Decompress

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

function getConfigFromURL() {
    const params = new URLSearchParams(window.location.search);
    const configParam = params.get('config');
    if (configParam) {
        try {
            const compressedJSON = LZString.decompressFromEncodedURIComponent(configParam);
            decompressed = decompressJSON(compressedJSON);
            return decompressed;
        } catch (e) {
            alert('Error decoding configuration from URL: ' + e.message);
        }
    }
    return null;
}

function updateURLWithConfig(config) {
    const compressedJSON = compressYAML(config);
    const compressed = LZString.compressToEncodedURIComponent(compressedJSON);
    const newURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}?config=${compressed}`;
    window.history.replaceState({ path: newURL }, '', newURL);
}

// Save button event
saveButton.addEventListener('click', () => {
    const input = configInput.value;
    try {
        const config = jsyaml.load(input);
        const years = config.years;
        const highlightPeriods = config.highlightPeriods;

        if (!Array.isArray(years) || !Array.isArray(highlightPeriods)) {
            throw new Error('Invalid configuration format.');
        }

        generateCalendar(years, highlightPeriods);
        updateURLWithConfig(input);
    } catch (e) {
        alert('Error parsing configuration: ' + e.message);
    }
});

// Initialize application
function init() {
    const configFromURL = getConfigFromURL();
    if (configFromURL) {
        configInput.value = configFromURL;
    } else {
        // Default configuration including a labeled period
        configInput.value =
`years:
  - 2024
highlightPeriods:
  - start: '2024-12-23'
    end: '2024-12-31'
    color: '#ffd700'  # gold
    label: 'Holiday Break'
  - dates:
      - '2024-12-25'
    color: '#ff0000'  # red
    label: 'Christmas Day'
  - dates:
      - '2024-12-25'
    color: '#0000ff'  # blue
  - dates:
      - '2024-12-25'
    color: '#008000'  # green
`;
    }
    // Trigger a save to render the initial calendar
    saveButton.click();
}

init();
