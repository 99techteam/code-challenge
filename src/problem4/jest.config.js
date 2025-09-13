const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: [
    "**/*.test.ts",
    "**/*.spec.ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/test\\.ts$",
    "/test\\.js$"
  ],
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  // Problem 4 specific configuration
  rootDir: ".",
  testTimeout: 10000,
  collectCoverageFrom: [
    "*.ts",
    "!*.test.ts",
    "!test.ts"
  ]
};