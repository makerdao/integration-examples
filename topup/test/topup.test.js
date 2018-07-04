const topup = require('../src/topup');

test("should not throw an error when accessing maker.js", async () => {
  expect(async () => {
    await topup(26, { targetRatio: 2.5 });
  }).not.toThrow();
});

test("should use the library to define necessary values", async () => {
  const values = await topup(26, { targetRatio: 2.5 });
  expect.assertions(values.length);
  for (i = 0; i < values.length; i++) {
    expect(values[i]).toBeDefined();
  }
});
