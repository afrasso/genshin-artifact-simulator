/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  globals: {
    "ts-jest": {
      compiler: "ttypescript",
    },
  },
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "node",
};
