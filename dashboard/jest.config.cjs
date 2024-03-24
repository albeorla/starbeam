// jest.config.cjs or jest.config.js - Choose the right extension based on your project setup.
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json', // Reference your specific tsconfig for tests
        useESM: true, // Enable this if your project uses ES Modules
      },
    ],
  },
  // Ensure correct handling of ESM imports
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // Adjust as necessary for your project's structure
  },
  extensionsToTreatAsEsm: ['.ts'],
  globals: {}, // Ensure any deprecated configuration here is moved or removed
};