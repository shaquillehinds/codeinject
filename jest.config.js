/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  verbose: true,
  preset: "ts-jest/presets/js-with-babel",
  testEnvironment: "node",
  transformIgnorePatterns: ["node_modules/(?!chalk/.*)"]
};
