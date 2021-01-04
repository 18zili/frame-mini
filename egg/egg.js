const Koa = require('koa');
const { initRouter, initController } = require('./loader');

class Egg {
	constructor(conf) {
		this.$app = new Koa(conf);
		this.$ctrl = initController();
		this.$router = initRouter(this);
		this.$app.use(this.$router.routes());
	}

	start(port) {
		this.$app.listen(port);
	}
}

module.exports = Egg;
