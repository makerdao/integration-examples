const leverage = require('../lib/leverage');
 
test("leveraged cdp should end up with more eth than it started with", async () => {
	const cdpState = await leverage(1, 400, 0.1);
	expect(cdpState.pethCollateral).toBeGreaterThan(cdpState.initialPethCollateral);
}, 180000);
