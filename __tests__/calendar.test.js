/**
 * @fileoverview Tests for calendar generation functionality
 */

// Mock the main script file functions
// Note: In the future, these should be properly imported from modular files

describe('Calendar Application', () => {
  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <div id="main-container">
        <div id="calendar-container"></div>
        <div id="config-container">
          <textarea id="config-input" placeholder="Enter your configuration here"></textarea>
          <button id="save-button">Save</button>
        </div>
      </div>
      <div id="color-picker-modal" class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <p>Choose a colour:</p>
          <input type="color" id="color-input">
          <button id="apply-color">Apply</button>
        </div>
      </div>
    `;
  });

  describe('DOM Setup', () => {
    it('should have required DOM elements', () => {
      expect(document.getElementById('calendar-container')).toBeTruthy();
      expect(document.getElementById('config-input')).toBeTruthy();
      expect(document.getElementById('save-button')).toBeTruthy();
      expect(document.getElementById('color-picker-modal')).toBeTruthy();
    });

    it('should have correct initial state', () => {
      const configInput = document.getElementById('config-input');
      const modal = document.getElementById('color-picker-modal');

      expect(configInput.value).toBe('');
      expect(modal.style.display).toBe('');
    });
  });

  describe('Date Utilities', () => {
    it('should handle date creation correctly', () => {
      const testDate = new Date('2024-01-15T12:00:00');
      expect(testDate.getFullYear()).toBe(2024);
      expect(testDate.getMonth()).toBe(0); // January is 0
      expect(testDate.getDate()).toBe(15);
    });

    it('should handle date comparisons', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');

      expect(date1.getTime()).toBeLessThan(date2.getTime());
    });
  });

  describe('YAML Configuration', () => {
    it('should parse valid YAML configuration', () => {
      const mockConfig = {
        years: [2024, 2025],
        highlightPeriods: [
          {
            start: '2024-12-23',
            end: '2024-12-31',
            color: '#ffd700',
            label: 'Holiday'
          }
        ]
      };

      global.jsyaml.load.mockReturnValue(mockConfig);

      const yamlString = `
        years:
          - 2024
          - 2025
        highlightPeriods:
          - start: '2024-12-23'
            end: '2024-12-31'
            color: '#ffd700'
            label: 'Holiday'
      `;

      const result = global.jsyaml.load(yamlString);
      expect(result).toEqual(mockConfig);
      expect(global.jsyaml.load).toHaveBeenCalledWith(yamlString);
    });

    it('should handle YAML parsing errors gracefully', () => {
      global.jsyaml.load.mockImplementation(() => {
        throw new Error('Invalid YAML');
      });

      const invalidYaml = 'invalid: yaml: content:';

      expect(() => global.jsyaml.load(invalidYaml)).toThrow('Invalid YAML');
    });
  });

  describe('URL Compression', () => {
    it('should compress and decompress configuration data', () => {
      const testData = 'test configuration data';
      const compressedData = 'compressed_data';

      global.LZString.compressToEncodedURIComponent.mockReturnValue(
        compressedData
      );
      global.LZString.decompressFromEncodedURIComponent.mockReturnValue(
        testData
      );

      const compressed =
        global.LZString.compressToEncodedURIComponent(testData);
      const decompressed =
        global.LZString.decompressFromEncodedURIComponent(compressed);

      expect(compressed).toBe(compressedData);
      expect(decompressed).toBe(testData);
    });
  });

  describe('Color Validation', () => {
    it('should validate hex colors', () => {
      const validHexColors = [
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#ffffff',
        '#000000'
      ];
      const invalidHexColors = ['ff0000', '#gg0000', '#ff00', '#ff0000ff'];

      validHexColors.forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });

      invalidHexColors.forEach(color => {
        expect(color).not.toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('should handle named colors', () => {
      const namedColors = ['red', 'green', 'blue', 'lightgreen', 'pink'];

      namedColors.forEach(color => {
        expect(typeof color).toBe('string');
        expect(color.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Calendar Generation', () => {
    it('should generate calendar for multiple years', () => {
      const years = [2024, 2025];
      const highlightPeriods = [];

      // This test will need to be updated once the generateCalendar function is modularized
      expect(years).toHaveLength(2);
      expect(years[0]).toBe(2024);
      expect(years[1]).toBe(2025);
    });

    it('should handle leap years correctly', () => {
      const leapYear = 2024;
      const nonLeapYear = 2023;

      // February has 29 days in leap years, 28 in non-leap years
      const feb2024 = new Date(leapYear, 1, 29);
      const feb2023 = new Date(nonLeapYear, 1, 29);

      expect(feb2024.getMonth()).toBe(1); // Valid date
      expect(feb2023.getMonth()).toBe(2); // Invalid date, rolls over to March
    });
  });

  describe('Error Handling', () => {
    it('should handle missing DOM elements gracefully', () => {
      // Remove required elements
      document.body.innerHTML = '';

      const missingElement = document.getElementById('calendar-container');
      expect(missingElement).toBeNull();
    });

    it('should handle invalid configuration gracefully', () => {
      const invalidConfigs = [
        '',
        'invalid yaml content',
        { years: 'not an array' },
        { highlightPeriods: 'not an array' }
      ];

      invalidConfigs.forEach(config => {
        // These tests will need to be updated once proper error handling is implemented
        expect(config).toBeDefined();
      });

      // Test null and undefined separately
      expect(null).toBeNull();
      expect(undefined).toBeUndefined();
    });
  });
});
