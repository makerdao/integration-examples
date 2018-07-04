const leverage = require('../lib/leverage');

test(
  'leveraged cdp should end up with more eth than it started with',
  async () => {
    const state = await leverage(1, 399, 0.1);
    expect(state.pethCollateral).toBeGreaterThan(state.initialPethCollateral);
  },
  180000
);
