export default {
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
