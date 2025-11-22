module.exports = {
  // Testing environment
  testEnvironment: 'jsdom',

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).js',
    '**/?(*.)+(spec|test).ts'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module name mapping for external dependencies and TypeScript .js imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },

  // Transform files
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest'
  },

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],

  // Global setup
  globals: {
    jsyaml: {},
    LZString: {}
  }
};
