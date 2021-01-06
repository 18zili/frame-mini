module.exports = (app) => ({
	index: async () => {
		// app.ctx.body = '首页Ctrl';
		app.ctx.body = await app.$model.user.findAll();
	},
	detail: async () => {
		app.ctx.body = 'detail Ctrl';
	},
});
