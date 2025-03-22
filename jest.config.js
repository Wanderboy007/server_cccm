/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json', // Path to your tsconfig file
        isolatedModules: true,
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/", // Ignore node_modules by default
    "<rootDir>/dist/", // Ignore compiled files in dist
  ],
};



