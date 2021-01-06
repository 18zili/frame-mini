const fs = require('fs');
const path = require('path');
const Router = require('koa-router');

function loadFile(dir, cb) {
	const url = path.resolve(__dirname, dir);
	const files = fs.readdirSync(url);
	files.forEach((filename) => {
		filename = filename.replace('.js', '');
		const file = require(url + '/' + filename);
		cb(filename, file);
	});
}

function initRouter(app) {
	const router = new Router();
	loadFile('routes', (filename, routes) => {
		const prefix = filename === 'index' ? '' : `/${filename}`;

		routes = typeof routes === 'function' ? routes(app) : routes;

		Object.keys(routes).forEach((key) => {
			const [method, path] = key.split(' ');
			router[method](prefix + (path === '/' ? '' : path), async (ctx) => {
				app.ctx = ctx;
				await routes[key](app);
			});
		});
	});
	return router;
}

function initController(app) {
	const controllers = {};
	loadFile('controller', (filename, controller) => {
		controllers[filename] = controller(app);
	});
	return controllers;
}

function initService(app) {
	const services = {};
	loadFile('service', (filename, service) => {
		services[filename] = service(app);
	});
	return services;
}

const Sequelize = require('sequelize');
function loadConfig(app) {
	loadFile('config', (_, config) => {
		if (config.db) {
			app.$db = new Sequelize(config.db);
			app.$model = {};
			loadFile('model', (filename, { schema, options }) => {
				app.$model[filename] = app.$db.define(
					filename,
					schema,
					options
				);
				app.$db.sync();
			});
		}
	});
}

module.exports = {
	initRouter,
	initController,
	initService,
	loadConfig,
};
