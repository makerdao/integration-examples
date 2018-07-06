const topup = require('../src/topup');

test(
  'should use the library to define necessary values',
  async () => {
    const values = await topup(26, { targetRatio: 2.5 });
    expect.assertions(values.length);
    for (i = 0; i < values.length; i++) {
      expect(values[i]).toBeDefined();
    }
  },
  15000
);
