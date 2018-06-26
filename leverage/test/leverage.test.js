const leverage = require('../lib/index');
 
test("test leverage bot", async () => {
	await leverage(1, 400, 0.1);
	console.log('done');
}, 180000);