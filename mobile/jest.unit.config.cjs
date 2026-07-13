module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/lib/**/*.test.js"],
  transform: {
    "^.+\\.[jt]sx?$": ["babel-jest", { presets: ["babel-preset-expo"] }],
  },
};
