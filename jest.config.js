/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  verbose: true,
  preset: "ts-jest/presets/js-with-babel",
  testEnvironment: "node",
  transformIgnorePatterns: ["node_modules/(?!chalk/.*)"],
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@commands/(.*)$": "<rootDir>/src/commands/$1",
    "^@templates/(.*)$": "<rootDir>/src/templates/$1",
    "^@pipeline/(.*)$": "<rootDir>/src/pipeline/$1"
  }
};
