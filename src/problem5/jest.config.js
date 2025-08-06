const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: [
    "**/tests/**/*.test.ts",
    "**/?(*.)+(spec|test).ts",
  ],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  globals: {
    "ts-jest": {
      isolatedModules: true,
      tsconfig: "tsconfig.json",
    },
  },
};
