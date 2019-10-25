const leverage = require('../lib/leverage');

test(
  'leveraged cdp should end up with more eth than it started with',
  async () => {
    const state = await leverage(0.1, 50, 0.01);
    console.log(state.pethCollateral.gt(state.initialPethCollateral));
    expect(state.pethCollateral.gt(state.initialPethCollateral)).toBeTruthy();
  },
  240000
);
