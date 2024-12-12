// Function to generate the calendar
function generateCalendar(years, highlightPeriods) {
    // Clear any existing calendar
    var calendarContainer = document.getElementById('calendar-container');
    calendarContainer.innerHTML = '';

    // Parse and normalize the date strings into Date objects
    highlightPeriods = highlightPeriods.map(function(period) {
        var newPeriod = Object.assign({}, period);
        if (period.start) {
            newPeriod.startDate = new Date(period.start);
            newPeriod.startDate.setHours(0, 0, 0, 0); // Normalize to midnight
        }
        if (period.end) {
            newPeriod.endDate = new Date(period.end);
            newPeriod.endDate.setHours(0, 0, 0, 0); // Normalize to midnight
        }
        if (period.dates) {
            newPeriod.dateObjects = period.dates.map(function(dateStr) {
                var date = new Date(dateStr);
                date.setHours(0, 0, 0, 0); // Normalize to midnight
                return date;
            });
        }
        return newPeriod;
    });

    // Generate the calendar for each year
    years.forEach(function(year) {
        var calendar = document.createElement('div');
        calendar.className = 'calendar';

        // Create a header for the year
        var yearHeader = document.createElement('h2');
        yearHeader.textContent = year;
        calendar.appendChild(yearHeader);

        var monthsContainer = document.createElement('div');
        monthsContainer.className = 'months-container';

        for (var month = 0; month < 12; month++) {
            var monthDiv = document.createElement('div');
            monthDiv.className = 'month';

            // Month name
            var monthNameDiv = document.createElement('div');
            monthNameDiv.className = 'month-name';
            monthNameDiv.textContent = new Date(year, month).toLocaleString('default', { month: 'long' });
            monthDiv.appendChild(monthNameDiv);

            // Weekday headers
            var weekdayHeaderDiv = document.createElement('div');
            weekdayHeaderDiv.className = 'weekday-header';
            var weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
            weekdays.forEach(function(weekday) {
                var weekdayDiv = document.createElement('div');
                weekdayDiv.className = 'weekday';
                weekdayDiv.textContent = weekday;
                weekdayHeaderDiv.appendChild(weekdayDiv);
            });
            monthDiv.appendChild(weekdayHeaderDiv);

            // Dates
            var datesDiv = document.createElement('div');
            datesDiv.className = 'dates';

            // Get the first day of the month
            var firstDay = new Date(year, month, 1).getDay();
            // Get the number of days in the month
            var daysInMonth = new Date(year, month + 1, 0).getDate();

            // Fill in the blanks before the first day
            for (var i = 0; i < firstDay; i++) {
                var blankDiv = document.createElement('div');
                blankDiv.className = 'date';
                datesDiv.appendChild(blankDiv);
            }

            // Create date elements
            for (var day = 1; day <= daysInMonth; day++) {
                var dateDiv = document.createElement('div');
                dateDiv.className = 'date';
                dateDiv.textContent = day;

                // Get the date object and normalize it
                var dateObj = new Date(year, month, day);
                dateObj.setHours(0, 0, 0, 0); // Normalize to midnight

                // Check if this date is in any of the highlight periods
                highlightPeriods.forEach(function(period) {
                    if (period.startDate && period.endDate) {
                        if (dateObj >= period.startDate && dateObj <= period.endDate) {
                            dateDiv.style.backgroundColor = period.color;
                        }
                    } else if (period.dateObjects) {
                        period.dateObjects.forEach(function(d) {
                            if (dateObj.getTime() === d.getTime()) {
                                dateDiv.style.backgroundColor = period.color;
                            }
                        });
                    }
                });

                datesDiv.appendChild(dateDiv);
            }

            monthDiv.appendChild(datesDiv);
            monthsContainer.appendChild(monthDiv);
        }

        calendar.appendChild(monthsContainer);
        calendarContainer.appendChild(calendar);
    });
}

// Function to get configuration from URL parameter
function getConfigFromURL() {
    var params = new URLSearchParams(window.location.search);
    var configParam = params.get('config');
    if (configParam) {
        try {
            // Decode the base64 encoded configuration
            var decodedConfig = atob(configParam);
            return decodedConfig;
        } catch (e) {
            alert('Error decoding configuration from URL: ' + e.message);
        }
    }
    return null;
}

// Function to update URL with current configuration
function updateURLWithConfig(config) {
    var encodedConfig = btoa(config);
    var newURL = window.location.protocol + '//' + window.location.host + window.location.pathname + '?config=' + encodedConfig;
    window.history.replaceState({ path: newURL }, '', newURL);
}

// Event listener for the Save button
document.getElementById('save-button').addEventListener('click', function() {
    var input = document.getElementById('config-input').value;
    try {
        // Parse the YAML input
        var config = jsyaml.load(input);

        var years = config.years;
        var highlightPeriods = config.highlightPeriods;

        // Validate years and highlightPeriods
        if (!Array.isArray(years) || !Array.isArray(highlightPeriods)) {
            throw new Error('Invalid configuration format.');
        }

        generateCalendar(years, highlightPeriods);

        // Update URL with the current configuration
        updateURLWithConfig(input);
    } catch (e) {
        alert('Error parsing configuration: ' + e.message);
    }
});

// Initialize the application
function init() {
    var configFromURL = getConfigFromURL();
    var configInputElement = document.getElementById('config-input');
    if (configFromURL) {
        configInputElement.value = configFromURL;
    } else {
        // Set default configuration in the textarea
        configInputElement.value =
`years:
  - 2024
  - 2025
highlightPeriods:
  - start: '2024-12-10'
    end: '2024-12-15'
    color: '#90ee90'  # lightgreen
  - dates:
      - '2024-12-25'
      - '2025-01-01'
    color: 'pink'
  - start: '2025-02-14'
    end: '2025-02-14'
    color: '#ff0000'  # red
  - start: '2025-03-01'
    end: '2025-03-05'
    color: '#add8e6'  # lightblue
  - start: '2024-12-23'
    end: '2024-12-31'
    color: '#ffd700'  # gold
`;
    }
    // Trigger the Save button to generate the calendar
    document.getElementById('save-button').click();
}

init();
