const cli = require('../src/cli');
const topup = require('../src/topup');

test("should throw error when CDP ID is missing", async () => {
  expect(async () => {
    await topup(26);
  }).toThrow();
});