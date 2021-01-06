const Koa = require('koa');
const {
	initRouter,
	initController,
	initService,
	loadConfig,
} = require('./loader');

class Egg {
	constructor(conf) {
		this.$app = new Koa(conf);

		loadConfig(this);

		this.$ctrl = initController(this);
		this.$service = initService(this);
		this.$router = initRouter(this);
		this.$app.use(this.$router.routes());
	}

	start(port) {
		this.$app.listen(port);
	}
}

module.exports = Egg;
