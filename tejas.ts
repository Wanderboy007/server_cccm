export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'], // Match test files
  moduleFileExtensions: ['ts', 'js', 'json'], // File extensions to process
  transform: {
    '^.+\\.ts$': 'ts-jest', // Transform TypeScript files
  },
  roots: ['<rootDir>/src', '<rootDir>/__tests__'], // Include src and __tests__ directories
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Optional: Map aliases (if you use them)
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // Use the tsconfig.json file
      isolatedModules: true, // Match tsconfig.json setting
    },
  },
}; 



