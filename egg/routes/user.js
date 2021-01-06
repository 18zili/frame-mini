module.exports = {
	'get /': async (app) => {
		const name = await app.$service.user.getName();
		app.ctx.body = name;
	},
	'get /info': async (app) => {
		app.ctx.body = app.$service.user.getAge();
	},
};
