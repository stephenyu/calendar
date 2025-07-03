/**
 * Jest setup file for calendar application tests
 * Configures the testing environment with necessary globals and mocks
 */

// Mock external libraries
global.jsyaml = {
  load: jest.fn(),
  dump: jest.fn()
};

global.LZString = {
  compressToEncodedURIComponent: jest.fn(),
  decompressFromEncodedURIComponent: jest.fn()
};

// Mock DOM APIs
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }
});

// Mock URL API
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com',
    search: '',
    hash: ''
  },
  writable: true
});

// Mock console methods for testing
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn()
};

// Setup fake timers
jest.useFakeTimers();

// Global test utilities
global.createMockElement = (tagName, attributes = {}) => {
  const element = document.createElement(tagName);
  Object.assign(element, attributes);
  return element;
};

global.mockDate = (dateString) => {
  const mockDate = new Date(dateString);
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  return mockDate;
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  document.body.innerHTML = '';
}); 