const leverage = require('../lib/leverage');

test(
  'leveraged cdp should end up with more eth than it started with',
  async () => {
    const state = await leverage(1, 199, 0.01);
    expect(state.pethCollateral.gt(state.initialPethCollateral)).toBeTruthy();
  },
  240000
);
