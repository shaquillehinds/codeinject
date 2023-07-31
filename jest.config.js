/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  verbose: true,
  preset: "ts-jest/presets/js-with-babel-esm", // needed to transpile esm node_modules
  testEnvironment: "node",
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@commands/(.*)$": "<rootDir>/src/commands/$1",
    "^@templates/(.*)$": "<rootDir>/src/templates/$1",
    "^@pipeline/(.*)$": "<rootDir>/src/pipeline/$1"
  }
};
