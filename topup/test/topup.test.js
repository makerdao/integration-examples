const cli = require('../src/cli');
const topup = require('../src/topup');

test("should not throw an error when accessing maker.js", () => {
  expect(async () => {
    await topup(26, { targetRatio: 2.5 });
  }).not.toThrow();
});

// final value -- add to bot & test
// test suite in integration-examples dir

// 1. Kovan -- test final value (timebox) (in this sprint)
// 2. Add deployment of test chain like lib (not in this sprint)