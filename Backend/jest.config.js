module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testTimeout: 10000,
  setupFiles: ["dotenv/config"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};
