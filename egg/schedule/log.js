module.exports = {
	// cron 表达式
	interval: '*/3 * * * * *',
	handler() {
		console.log(new Date());
	}
};
